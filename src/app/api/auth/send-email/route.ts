import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout } from '@/lib/email-templates'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://scoremaxtutor.netlify.app'

function buildVerifyUrl(tokenHash: string, type: string): string {
  const params = new URLSearchParams({ token_hash: tokenHash, type })
  return `${APP_URL}/auth/callback?${params.toString()}`
}

const EMAIL_CONFIG: Record<
  string,
  { subject: string; title: string; body: string; ctaText: string }
> = {
  invite: {
    subject: 'Set up your ScoreMax account',
    title: 'You\'re invited to ScoreMax',
    body: 'You\'ve been invited to join ScoreMax. Click below to set your password and sign in.',
    ctaText: 'Set your password & sign in',
  },
  signup: {
    subject: 'Confirm your ScoreMax signup',
    title: 'Confirm your email',
    body: 'Click the button below to confirm your email and finish creating your account.',
    ctaText: 'Confirm email',
  },
  recovery: {
    subject: 'Reset your ScoreMax password',
    title: 'Reset your password',
    body: 'You requested a password reset. Click the button below to choose a new password.',
    ctaText: 'Reset password',
  },
  magic_link: {
    subject: 'Your ScoreMax login link',
    title: 'Sign in to ScoreMax',
    body: 'Click the button below to sign in to your account.',
    ctaText: 'Sign in',
  },
  email_change: {
    subject: 'Confirm your new email address',
    title: 'Confirm email change',
    body: 'You requested to change your email. Click the button below to confirm your new address.',
    ctaText: 'Confirm new email',
  },
}

export async function POST(req: NextRequest) {
  const hookSecretRaw = process.env.SEND_EMAIL_HOOK_SECRET
  if (!hookSecretRaw || !process.env.RESEND_API_KEY) {
    console.error('Send email hook: missing SEND_EMAIL_HOOK_SECRET or RESEND_API_KEY')
    return NextResponse.json({ error: 'Send email hook not configured' }, { status: 500 })
  }

  const hookSecret = hookSecretRaw.replace(/^v1,whsec_/, '')
  const payload = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k.toLowerCase()] = v })

  let user: { email: string; user_metadata?: { full_name?: string } }
  let emailData: { token_hash: string; redirect_to: string; email_action_type: string }

  try {
    const wh = new Webhook(hookSecret)
    const verified = wh.verify(payload, headers) as {
      user: { email: string; user_metadata?: { full_name?: string } }
      email_data: { token_hash: string; redirect_to: string; email_action_type: string }
    }
    user = verified.user
    emailData = verified.email_data
  } catch (err) {
    console.error('Send email hook: verification failed', err)
    return NextResponse.json(
      { error: { message: 'Webhook verification failed' } },
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const actionType = emailData.email_action_type || 'signup'
  const config = EMAIL_CONFIG[actionType] || EMAIL_CONFIG.signup
  const verifyType = actionType === 'magic_link' ? 'magiclink' : actionType
  const verifyUrl = buildVerifyUrl(emailData.token_hash, verifyType)

  const fullName = user.user_metadata?.full_name
  const greeting = fullName ? `Hi ${fullName},` : undefined

  const html = emailLayout({
    title: config.title,
    body: config.body,
    ctaText: config.ctaText,
    ctaUrl: verifyUrl,
    greeting,
  })

  const { from } = getEmailDefaults()
  const { error } = await resend.emails.send({
    from,
    to: user.email,
    subject: config.subject,
    html,
  })

  if (error) {
    console.error('Send email hook: Resend error', error)
    return NextResponse.json(
      { error: { http_code: error.message, message: error.message } },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new NextResponse(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
