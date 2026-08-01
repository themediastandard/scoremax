import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, Fill } from '@/components/LegalPage'
import {
  LEGAL_ENTITY_NAME,
  BUSINESS_ADDRESS,
  CONTACT_EMAIL,
  GOVERNING_LAW,
  JURISDICTION,
  CANCELLATION_NOTICE_HOURS,
} from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Terms of Service | ScoreMax',
  description:
    'The terms governing use of ScoreMax tutoring services, including booking, payment, cancellation and credit.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.scoremaxtutoring.com/terms' },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="28 July 2026">
      <section>
        <p>
          These terms govern your use of the ScoreMax website and tutoring services,
          provided by {LEGAL_ENTITY_NAME}. By creating an account or booking a
          session you agree to them.
        </p>
      </section>

      <section>
        <h2>Who may use the service</h2>
        <p>
          You must be 18 or older to create an account and purchase services. If the
          student is under 18, a parent or guardian must hold the account and is
          responsible for it, including all charges made through it.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          Keep your password confidential and tell us promptly if you believe someone
          else is using your account. You are responsible for activity that takes place
          under it. Give us accurate information and keep it up to date.
        </p>
      </section>

      <section>
        <h2>Booking and credit</h2>
        <ul>
          <li>
            Buying a package, course or membership adds <strong>credit</strong> to your
            account — hours or sessions you can spend on bookings.
          </li>
          <li>
            A booking request reserves credit at the moment you submit it. We then match
            a tutor and confirm a time with you.
          </li>
          <li>
            Membership hours are allocated per billing period. Unused hours carry into
            the following period up to the number included in your plan; anything beyond
            that is not carried over.
          </li>
          <li>
            Prepaid package hours expire one year after purchase. Your account shows
            the expiry date for each package, and unused hours are not refundable
            once they expire.
          </li>
        </ul>
      </section>

      <section>
        <h2>Payment</h2>
        <p>
          Prices are shown in US dollars and are charged through Stripe. Memberships
          renew automatically each period until cancelled. You authorise us to charge
          your payment method for the plan you select until you cancel it.
        </p>
      </section>

      <section>
        <h2>Cancellation, rescheduling and refunds</h2>
        <p>
          Cancelling a booked session before it takes place returns the credit to your
          account. Refunds of money are governed by our{' '}
          <Link href="/refund-policy">Refund Policy</Link>: unused credit is refundable
          within 14 days of purchase, and delivered sessions are not refundable.
        </p>
        <p>
          We ask for at least {CANCELLATION_NOTICE_HOURS} hours&rsquo; notice to cancel or
          reschedule. Sessions missed without notice may be treated as delivered.
        </p>
      </section>

      <section>
        <h2>What we provide — and what we do not promise</h2>
        <p>
          We provide tutoring by people we select for the subjects they teach. Academic
          outcomes depend on many factors outside our control, including the
          student&rsquo;s own effort. <strong>We do not guarantee any particular grade,
          test score, score improvement, or admission outcome.</strong>
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not use the service unlawfully, attempt to gain unauthorised access to it,
          disrupt it, or use it to harass anyone. Do not ask a tutor to complete graded
          work, assessments or examinations on a student&rsquo;s behalf — we help students
          learn, and we may end sessions and close accounts used for academic dishonesty.
        </p>
      </section>

      <section>
        <h2>Sessions and recordings</h2>
        <p>
          Online sessions run over Google Meet. Do not record a session without the
          agreement of everyone taking part.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          Materials we provide remain ours or our licensors&rsquo;. You may use them for
          the student&rsquo;s own learning, but not redistribute or resell them.
        </p>
      </section>

      <section>
        <h2>Suspension and termination</h2>
        <p>
          You may stop using the service and close your account at any time. We may
          suspend or close an account that breaches these terms or that we reasonably
          believe is being used fraudulently. Where we close an account and you hold
          unused credit that is not connected to the breach, we will refund it.
        </p>
      </section>

      <section>
        <h2>Liability</h2>
        <p className="text-amber-900">
          <Fill>
            LEGAL REVIEW REQUIRED: limitation of liability, warranty disclaimer,
            indemnity and dispute-resolution clauses must be drafted or approved by a
            lawyer for your jurisdiction — placeholder text is not sufficient
          </Fill>
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms. We will change the date at the top of this page and,
          where the change is significant, tell you by email before it takes effect.
        </p>
      </section>

      <section>
        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of {GOVERNING_LAW}, and the
          courts of {JURISDICTION} have exclusive jurisdiction over any
          dispute.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          {LEGAL_ENTITY_NAME}
          <br />
          {BUSINESS_ADDRESS}
          <br />
          {CONTACT_EMAIL}
        </p>
      </section>
    </LegalPage>
  )
}
