import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import {
  REFUNDS_EMAIL,
  GOVERNING_LAW,
  REFUND_RESPONSE_BUSINESS_DAYS,
} from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Refund Policy | ScoreMax',
  description:
    'ScoreMax refund policy: unused tutoring credit is refundable within 14 days of purchase.',
  robots: { index: true, follow: true },
  // See /privacy: without its own og:url and og:title this previewed as the homepage.
  openGraph: {
    type: 'website',
    url: 'https://www.scoremaxtutoring.com/refund-policy',
    siteName: 'ScoreMax',
    title: 'Refund Policy | ScoreMax',
    description:
      'ScoreMax refund policy: unused tutoring credit is refundable within 14 days of purchase.',
  },
  alternates: { canonical: 'https://www.scoremaxtutoring.com/refund-policy' },
}

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="28 July 2026">
      <section>
        <h2>The short version</h2>
        <p>
          If you have bought tutoring hours or sessions and have not used them, you can
          have your money back within 14 days of purchase. Sessions we have already
          delivered are not refundable.
        </p>
      </section>

      <section>
        <h2>Packages and course enrolments</h2>
        <ul>
          <li>
            <strong>Within 14 days of purchase:</strong> we refund any hours or
            sessions you have not yet used, in full.
          </li>
          <li>
            <strong>After 14 days:</strong> unused hours remain on your account and can
            still be booked, but are no longer refundable.
          </li>
          <li>
            <strong>Prepaid hours expire one year after purchase.</strong> Your account
            shows the expiry date for each package. Hours that expire unused are not
            refundable, so book them before then. If you are close to the deadline and
            need more time, contact us.
          </li>
          <li>
            <strong>Sessions already delivered</strong> are not refundable. If you cancel
            a booked session before it takes place, the credit returns to your account
            rather than being lost.
          </li>
        </ul>
      </section>

      <section>
        <h2>Memberships</h2>
        <p>
          You can cancel a recurring membership at any time. Cancelling stops future
          billing; the period you have already paid for runs to its end, and the hours
          included in that period stay available until it does. We do not part-refund a
          period that has already begun.
        </p>
        <p>
          Manage or cancel a membership from your{' '}
          <Link href="/dashboard/subscription">account dashboard</Link>.
        </p>
      </section>

      <section>
        <h2>Sessions we cancel</h2>
        <p>
          If we cancel a session and cannot offer a reasonable alternative time, the
          credit returns to your account, or we refund it on request, regardless of the
          14-day window.
        </p>
      </section>

      <section>
        <h2>How to request a refund</h2>
        <p>
          Email {REFUNDS_EMAIL} from the address on your account, or
          use our <Link href="/contact">contact form</Link>, telling us which purchase
          you would like refunded. We aim to respond within{' '}
          {REFUND_RESPONSE_BUSINESS_DAYS} business days.
        </p>
        <p>
          Approved refunds are returned to the original payment method through Stripe.
          Your bank typically takes a further 5 to 10 business days to post the funds.
        </p>
      </section>

      <section>
        <h2>Statutory rights</h2>
        <p>
          Nothing in this policy limits any rights you have under applicable consumer
          protection law in {GOVERNING_LAW}.
        </p>
      </section>
    </LegalPage>
  )
}
