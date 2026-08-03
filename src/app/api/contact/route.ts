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
 *
 * Two intents share this endpoint, distinguished by `inquiryType`: a short
 * "general" question, and a "consultation" request carrying the full academic
 * intake. The client sends only the fields belonging to the active intent, but
 * that is a UX guarantee, not a security one — an unrecognised value falls back
 * to 'general', and each branch reads only the fields it expects, so a caller
 * cannot mix the two to get consultation answers onto a general enquiry.
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

    const isConsultation = body.inquiryType === 'consultation'

    const studentName = cleanString(body.studentName)
    const phone = cleanString(body.phone)

    let detailRows: string[]

    if (isConsultation) {
      const currentCourses = cleanString(body.currentCourses, MAX_TEXT_LENGTH)
      const psatScores = cleanString(body.psatScores)
      const satScores = cleanString(body.satScores)
      const actScores = cleanString(body.actScores)
      const goals = cleanString(body.goals, MAX_TEXT_LENGTH)

      // The three score boxes share one row on the form, so they read better as
      // one line here too — and an admin scanning on a phone sees "PSAT 1320 ·
      // SAT — · ACT 28" rather than three rows, two of them blank.
      const scores = [
        psatScores && `PSAT ${psatScores}`,
        satScores && `SAT ${satScores}`,
        actScores && `ACT ${actScores}`,
      ].filter(Boolean).join(' · ')

      detailRows = [
        studentName && detailRow('Student / School:', studentName),
        detailRow('Email:', email),
        phone && detailRow('Phone:', phone),
        currentCourses && detailRow('Current Courses:', currentCourses),
        scores && detailRow('Past Scores:', scores),
        goals && detailRow('Goals / Needs:', goals),
      ].filter(Boolean) as string[]
    } else {
      // The general tab is four fields; without the message there is nothing to
      // answer, so unlike every other field it is genuinely required.
      const message = cleanString(body.message, MAX_TEXT_LENGTH)
      if (!message) {
        return NextResponse.json(
          { error: 'Please include a message so we know how to help' },
          { status: 400 }
        )
      }

      detailRows = [
        studentName && detailRow('Name:', studentName),
        detailRow('Email:', email),
        phone && detailRow('Phone:', phone),
        detailRow('Message:', message),
      ].filter(Boolean) as string[]
    }

    const { data: adminSettings } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .single()
    const adminEmails = adminSettings?.value?.split(',').map((e: string) => e.trim()) || []

    const adminSubject = isConsultation ? 'New Consultation Inquiry' : 'New Inquiry'

    if (adminEmails.length > 0) {
      await resend.emails.send({
        ...getEmailDefaults(),
        to: adminEmails,
        replyTo: email,
        subject: adminSubject,
        html: emailLayout({
          title: adminSubject,
          body: detailRows.join(''),
          ctaText: 'View Dashboard',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
      })
    }

    await resend.emails.send({
      ...getEmailDefaults(),
      to: email,
      subject: isConsultation
        ? "We've received your consultation inquiry"
        : "We've received your inquiry",
      html: emailLayout({
        title: isConsultation
          ? "We've Received Your Consultation Inquiry"
          : "We've Received Your Inquiry",
        greeting: 'Hi,',
        body: isConsultation
          ? '<p style="margin: 0;">Thank you for reaching out to ScoreMax. We review every inquiry personally and will be in touch shortly to schedule your free consultation.</p>'
          : '<p style="margin: 0;">Thank you for reaching out to ScoreMax. We review every inquiry personally and will get back to you shortly.</p>',
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
