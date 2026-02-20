import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      studentName,
      email,
      phone,
      currentCourses,
      psatScores,
      satScores,
      actScores,
      strengths,
      weaknesses,
      helpNeeded,
    } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: adminSettings } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'notification_emails')
      .single()
    const adminEmails = adminSettings?.value?.split(',').map((e: string) => e.trim()) || []

    const detailRows = [
      studentName && detailRow('Student / School:', studentName),
      email && detailRow('Email:', email),
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
