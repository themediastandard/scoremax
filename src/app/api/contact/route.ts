import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'
import { cleanEmail, cleanString, isHoneypotTripped, MAX_TEXT_LENGTH } from '@/lib/form-validation'
import { getClientIp, withinRateLimit, RATE_LIMITED_MESSAGE } from '@/lib/rate-limit'

/**
 * Public contact form. Unauthenticated by necessity — it is how prospective
 * customers first reach ScoreMax — so everything it accepts is untrusted.
 *
 * Three layers, cheapest first: a honeypot field that costs nothing and stops
 * naive bots, then per-IP and per-email rate limits held in Postgres, then
 * strict field validation. Values are escaped inside detailRow() before they
 * reach an admin's inbox.
 */

/** Per IP. Generous enough for a family enquiring about two children. */
const MAX_PER_IP = 5
/** Per email address, to blunt a distributed attempt at one target. */
const MAX_PER_EMAIL = 3
const WINDOW = '1 hour'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Hidden field. A real user never sees it, so anything in it is a bot.
    // Answer 200 rather than an error: telling a bot it was detected only
    // invites it to try again without the giveaway.
    if (isHoneypotTripped(body.company)) {
      return NextResponse.json({ success: true })
    }

    const email = cleanEmail(body.email)
    if (!email) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
    }

    const ip = getClientIp(req)
    const [ipOk, emailOk] = await Promise.all([
      withinRateLimit('contact:ip', ip, MAX_PER_IP, WINDOW),
      withinRateLimit('contact:email', email, MAX_PER_EMAIL, WINDOW),
    ])
    if (!ipOk || !emailOk) {
      return NextResponse.json({ error: RATE_LIMITED_MESSAGE }, { status: 429 })
    }

    const studentName = cleanString(body.studentName)
    const phone = cleanString(body.phone)
    const currentCourses = cleanString(body.currentCourses, MAX_TEXT_LENGTH)
    const psatScores = cleanString(body.psatScores)
    const satScores = cleanString(body.satScores)
    const actScores = cleanString(body.actScores)
    const strengths = cleanString(body.strengths, MAX_TEXT_LENGTH)
    const weaknesses = cleanString(body.weaknesses, MAX_TEXT_LENGTH)
    const helpNeeded = cleanString(body.helpNeeded, MAX_TEXT_LENGTH)

    const { data: adminSettings } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .single()
    const adminEmails = adminSettings?.value?.split(',').map((e: string) => e.trim()) || []

    const detailRows = [
      studentName && detailRow('Student / School:', studentName),
      detailRow('Email:', email),
      phone && detailRow('Phone:', phone),
      currentCourses && detailRow('Current Courses:', currentCourses),
      psatScores && detailRow('PSAT Scores:', psatScores),
      satScores && detailRow('SAT Scores:', satScores),
      actScores && detailRow('ACT Scores:', actScores),
      strengths && detailRow('Strengths:', strengths),
      weaknesses && detailRow('Weaknesses:', weaknesses),
      helpNeeded && detailRow('Help Needed:', helpNeeded),
    ].filter(Boolean)

    if (adminEmails.length > 0) {
      await resend.emails.send({
        ...getEmailDefaults(),
        to: adminEmails,
        replyTo: email,
        subject: 'New Contact Form Submission',
        html: emailLayout({
          title: 'New Contact Form Submission',
          body: detailRows.join(''),
          ctaText: 'View Dashboard',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
      })
    }

    await resend.emails.send({
      ...getEmailDefaults(),
      to: email,
      subject: "We've received your message",
      html: emailLayout({
        title: "We've Received Your Message",
        greeting: 'Hi,',
        body: '<p style="margin: 0;">Thank you for reaching out to ScoreMax. We review every inquiry personally and will get back to you shortly.</p>',
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
