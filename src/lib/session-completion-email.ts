import 'server-only'

import { emailLayout } from '@/lib/email-templates'
import { getEmailDefaults, sendEmail } from '@/lib/resend'

export const GOOGLE_REVIEW_URL = 'https://g.page/r/CaKfA31jvIHhEAE/review'

type CompletedSessionEmailInput = {
  id: string
  customer: {
    email: string
    full_name: string
  }
}

export async function sendSessionCompletionEmail(
  session: CompletedSessionEmailInput
): Promise<boolean> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoremaxtutoring.com').replace(/\/+$/, '')

  return sendEmail(
    {
      ...getEmailDefaults(),
      to: session.customer.email,
      subject: 'Thank you for choosing ScoreMax',
      html: emailLayout({
        title: 'Session Complete',
        greeting: `Hi ${session.customer.full_name},`,
        body: [
          '<p style="margin: 0 0 16px 0;">We appreciate the opportunity to support your learning goals and hope your session was helpful and left you feeling more confident.</p>',
          '<p style="margin: 0;">If you had a positive experience, we would be grateful if you took a moment to leave us a Google review. Your feedback helps other families find the right tutoring support and helps us continue improving.</p>',
        ].join(''),
        ctaText: 'Leave a Google Review',
        ctaUrl: GOOGLE_REVIEW_URL,
        secondaryCtaText: 'Book Another Session',
        secondaryCtaUrl: `${appUrl}/book`,
      }),
    },
    `session:completed:${session.id}`,
    `session-completed-${session.id}`
  )
}
