import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { cleanEmail, cleanString, isHoneypotTripped } from '@/lib/form-validation'
import { getClientIp, withinRateLimit, RATE_LIMITED_MESSAGE } from '@/lib/rate-limit'

/**
 * Step Up For Students registration. Same threat model as /api/contact — public,
 * unauthenticated, and it sends mail from the verified sending domain — so it
 * gets the same honeypot, rate limits and validation.
 */

const MAX_PER_IP = 5
const MAX_PER_EMAIL = 3
const WINDOW = '1 hour'

/** Shown when the registration could not be put in front of anyone. */
const UNDELIVERABLE =
  "We couldn't submit your registration just now. Please try again in a moment, or call us at (954) 214-8880."

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (isHoneypotTripped(body.company)) {
      return NextResponse.json({ success: true })
    }

    const email = cleanEmail(body.email)
    if (!email) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }

    const ip = getClientIp(req)
    const [ipOk, emailOk] = await Promise.all([
      withinRateLimit('step-up:ip', ip, MAX_PER_IP, WINDOW),
      withinRateLimit('step-up:email', email, MAX_PER_EMAIL, WINDOW),
    ])
    if (!ipOk || !emailOk) {
      return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 })
    }

    const firstName = cleanString(body.firstName)
    const lastName = cleanString(body.lastName)
    const phone = cleanString(body.phone)
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Not provided'

    const { data: adminSettings } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .single()
    const adminEmails = adminSettings?.value?.split(',').map((e: string) => e.trim()) || []

    const detailRows = [
      detailRow('Name:', fullName),
      detailRow('Email:', email),
      phone && detailRow('Phone:', phone),
    ].filter(Boolean)

    /*
     * Like the contact route, this persists nothing — the notification email is
     * the only record the registration ever existed. A failed send, or an empty
     * notification list, loses it outright, so neither can report success.
     */
    if (adminEmails.length === 0) {
      console.error(
        '[email:step-up:admin] admin_settings.notification_emails is empty — nobody would receive this registration'
      )
      return NextResponse.json({ error: UNDELIVERABLE }, { status: 502 })
    }

    const adminNotified = await sendEmail(
      {
        ...getEmailDefaults(),
        to: adminEmails,
        replyTo: email,
        subject: 'New Step Up For Students Registration',
        html: emailLayout({
          title: 'New Step Up For Students Registration',
          body: detailRows.join(''),
          ctaText: 'View Dashboard',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
      },
      'step-up:admin'
    )

    if (!adminNotified) {
      return NextResponse.json({ error: UNDELIVERABLE }, { status: 502 })
    }

    // Best effort — the registration is safely with the team by now.
    await sendEmail(
      {
        ...getEmailDefaults(),
        to: email,
        subject: "We've received your Step Up registration",
        html: emailLayout({
          title: "We've Received Your Registration",
          greeting: `Hi ${firstName || 'there'},`,
          body: '<p style="margin: 0;">Thank you for registering for Step Up For Students tutoring with ScoreMax. We will be in touch shortly to schedule your sessions.</p>',
        }),
      },
      'step-up:auto-reply'
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Step Up form error:', error)
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 })
  }
}
