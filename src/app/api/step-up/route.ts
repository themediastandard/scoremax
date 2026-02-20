import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resend, getEmailDefaults } from '@/lib/resend'
import { emailLayout, detailRow } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

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

    if (adminEmails.length > 0) {
      await resend.emails.send({
        ...getEmailDefaults(),
        to: adminEmails,
        subject: 'New Step Up For Students Registration',
        html: emailLayout({
          title: 'New Step Up For Students Registration',
          body: detailRows.join(''),
          ctaText: 'View Dashboard',
          ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        }),
      })
    }

    await resend.emails.send({
      ...getEmailDefaults(),
      to: email,
      subject: "We've received your Step Up registration",
      html: emailLayout({
        title: "We've Received Your Registration",
        greeting: `Hi ${firstName || 'there'},`,
        body: '<p style="margin: 0;">Thank you for registering for Step Up For Students tutoring with ScoreMax. We will be in touch shortly to schedule your sessions.</p>',
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Step Up form error:', error)
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 })
  }
}
