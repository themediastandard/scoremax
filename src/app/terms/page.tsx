import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
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
            account: hours or sessions you can spend on bookings.
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
        <h2>What we provide, and what we do not promise</h2>
        <p>
          We provide tutoring by people we select for the subjects they teach. Academic
          outcomes depend on many factors outside our control, including the
          student&rsquo;s own effort. <strong>We do not guarantee any particular grade,
          test score, score improvement, or admission outcome.</strong> Nothing on
          our website, in our marketing, or in conversation with a tutor should be
          read as such a guarantee. Score improvements we describe are past results
          for other students, not a prediction for any individual.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>
          Do not use the service unlawfully, attempt to gain unauthorised access to it,
          disrupt it, or use it to harass anyone. Do not ask a tutor to complete graded
          work, assessments or examinations on a student&rsquo;s behalf. We help students
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
        <h2>Warranties</h2>
        <p>
          We will provide tutoring with reasonable care and skill, using tutors we
          have selected for the subjects they teach.
        </p>
        <p>
          Except for that commitment, and to the fullest extent permitted by law,
          the service is provided &ldquo;as is&rdquo; and we disclaim all other
          warranties, whether express or implied, including any implied warranties
          of merchantability, fitness for a particular purpose and
          non-infringement. We do not warrant that the website will be
          uninterrupted or error-free.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, neither {LEGAL_ENTITY_NAME} nor
          its owners, employees or tutors will be liable for indirect, incidental,
          special, consequential or punitive damages, or for lost profits,
          opportunities, or academic or career outcomes, arising out of or
          connected with the service — even if we have been advised that such
          damages are possible.
        </p>
        <p>
          Our total liability to you for all claims arising out of or connected
          with the service, in aggregate, will not exceed the greater of (a) the
          total amount you paid us in the twelve months before the event giving
          rise to the claim, or (b) one hundred US dollars (US$100).
        </p>
        <p>
          Nothing in these terms limits or excludes liability that cannot be
          limited or excluded by law — including liability for death or personal
          injury caused by negligence, or for fraud or fraudulent
          misrepresentation. Some states do not allow the exclusion of certain
          warranties or the limitation of incidental or consequential damages, so
          some of the above may not apply to you; in that case our liability is
          limited to the smallest extent permitted by law.
        </p>
      </section>

      <section>
        <h2>Indemnity</h2>
        <p>
          You agree to indemnify and hold harmless {LEGAL_ENTITY_NAME}, its
          owners, employees and tutors from any claim, loss, liability or expense
          (including reasonable legal fees) arising out of your breach of these
          terms, your misuse of the service, or content you submit to us that
          infringes someone else&rsquo;s rights. This does not apply to the extent
          the claim arises from our own negligence or wilful misconduct.
        </p>
      </section>

      <section>
        <h2>Resolving a dispute</h2>
        <p>
          <strong>Talk to us first.</strong> If something goes wrong, contact us
          at {CONTACT_EMAIL} and give us a fair chance to put it right. Most
          problems are resolved this way. Please allow us 30 days from the date we
          receive your written notice before starting formal proceedings.
        </p>
        <p>
          If we cannot resolve it, any dispute arising out of or relating to these
          terms or the service will be brought exclusively in the state or federal
          courts located in {JURISDICTION}, and you and we each consent to the
          personal jurisdiction of those courts. This does not prevent either of
          us from bringing a claim in small claims court where it qualifies.
        </p>
        <p>
          Any claim must be brought within one year after it arises, to the extent
          that limit is permitted by law.
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
