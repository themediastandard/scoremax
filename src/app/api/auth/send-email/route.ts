import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout } from '@/lib/email-templates'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://scoremaxtutor.netlify.app'

function buildVerifyUrl(tokenHash: string, type: string, redirectTo: string): string {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    redirect_to: redirectTo,
  })
  return `${SUPABASE_URL}/auth/v1/verify?${params.toString()}`
}

const EMAIL_CONFIG: Record<
  string,
  { subject: string; title: string; body: string; ctaText: string }
> = {
  invite: {
    subject: 'Set up your ScoreMax account',
    title: 'You\'re invited to ScoreMax',
    body: `Thanks for your purchase. Create your account to access your dashboard, view sessions, and manage your tutoring.`,
    ctaText: 'Set your password & sign in',
  },
  signup: {
    subject: 'Confirm your ScoreMax signup',
    title: 'Confirm your email',
    body: `Click the button below to confirm your email and finish creating your account.`,
    ctaText: 'Confirm email',
  },
  recovery: {
    subject: 'Reset your ScoreMax password',
    title: 'Reset your password',
    body: `You requested a password reset. Click the button below to choose a new password.`,
    ctaText: 'Reset password',
  },
  magic_link: {
    subject: 'Your ScoreMax login link',
    title: 'Sign in to ScoreMax',
    body: `Click the button below to sign in to your account.`,
    ctaText: 'Sign in',
  },
  email_change: {
    subject: 'Confirm your new email address',
    title: 'Confirm email change',
    body: `You requested to change your email. Click the button below to confirm your new address.`,
    ctaText: 'Confirm new email',
  },
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }

  const hookSecretRaw = process.env.SEND_EMAIL_HOOK_SECRET
  if (!hookSecretRaw || !process.env.RESEND_API_KEY) {
    console.error('Send email hook: missing SEND_EMAIL_HOOK_SECRET or RESEND_API_KEY')
    return NextResponse.json(
      { error: 'Send email hook not configured' },
      { status: 500 }
    )
  }

  const hookSecret = hookSecretRaw.replace(/^v1,whsec_/, '')
  const payload = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v
  })

  let user: {
    email: string
    user_metadata?: {
      full_name?: string
      invite_context?: string
      plan_type?: string
      plan_name?: string
      amount_cents?: number
    }
  }
  let emailData: {
    token_hash: string
    redirect_to: string
    email_action_type: string
  }

  try {
    const wh = new Webhook(hookSecret)
    const verified = wh.verify(payload, headers) as {
      user: {
        email: string
        user_metadata?: {
          full_name?: string
          invite_context?: string
          plan_type?: string
          plan_name?: string
          amount_cents?: number
        }
      }
      email_data: {
        token_hash: string
        redirect_to: string
        email_action_type: string
      }
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

  const { token_hash, redirect_to, email_action_type } = emailData
  const actionType = email_action_type || 'signup'
  const verifyType = actionType === 'magic_link' ? 'magiclink' : actionType
  const verifyUrl = buildVerifyUrl(
    token_hash,
    verifyType,
    redirect_to || `${APP_URL}/dashboard`
  )

  const fullName = user.user_metadata?.full_name
  const greeting = fullName ? `Hi ${fullName},` : undefined

  const isGuestCheckout =
    actionType === 'invite' && user.user_metadata?.invite_context === 'guest_checkout'

  let subject: string
  let title: string
  let body: string
  let ctaText: string
  let ctaUrl: string

  if (isGuestCheckout) {
    const planLabel =
      user.user_metadata?.plan_name ||
      (user.user_metadata?.plan_type === 'membership'
        ? 'membership'
        : user.user_metadata?.plan_type === 'package'
          ? 'tutoring package'
          : 'course')
    const amount =
      user.user_metadata?.amount_cents != null
        ? `$${(user.user_metadata.amount_cents / 100).toLocaleString()}`
        : ''
    subject = 'Thank you for your purchase'
    title = 'Thank You for Your Purchase'
    body = [
      `<p style="margin: 0 0 16px 0;">Your payment has been received. You've purchased a ${planLabel}${amount ? ` (${amount})` : ''}.</p>`,
      '<p style="margin: 0 0 16px 0;">We have created an account for you. Set your password below to access your dashboard, view sessions, and manage your tutoring.</p>',
      '<p style="margin: 0;">We will assign a tutor and confirm your session time shortly. You will receive another email once your booking is confirmed.</p>',
    ].join('')
    ctaText = 'Set your password & sign in'
    ctaUrl = verifyUrl
  } else {
    const config = EMAIL_CONFIG[actionType] || EMAIL_CONFIG.signup
    subject = config.subject
    title = config.title
    body = config.body
    ctaText = config.ctaText
    ctaUrl = verifyUrl
  }

  const html = emailLayout({
    title,
    body,
    ctaText,
    ctaUrl,
    greeting,
  })

  const { from } = getEmailDefaults()
  const { error } = await resend.emails.send({
    from,
    to: user.email,
    subject,
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
