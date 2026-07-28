import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage, Fill } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy | ScoreMax',
  description:
    'How ScoreMax collects, uses, stores and shares personal information, including information about students under 18.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.scoremaxtutoring.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="28 July 2026">
      <section>
        <p>
          This policy explains what <Fill>LEGAL ENTITY NAME</Fill> (&ldquo;ScoreMax&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) does with personal information when you use{' '}
          <Link href="/">scoremaxtutoring.com</Link> and our tutoring services.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Account and contact details</strong> — name, email address, phone
            number, and the password you set (stored only as a cryptographic hash; we
            never see it).
          </li>
          <li>
            <strong>Student details</strong> — the student&rsquo;s name, grade level, the
            subjects they need help with, and any notes you choose to give us.
          </li>
          <li>
            <strong>Scheduling information</strong> — the days and times you are
            available, your timezone, and whether you want online or in-person sessions.
          </li>
          <li>
            <strong>Purchase records</strong> — what you bought, the amount, and the
            resulting credit balance. <strong>We never receive or store your card
            number</strong>; card details are entered directly with Stripe.
          </li>
          <li>
            <strong>Messages</strong> — anything you send us through the contact form or
            by email.
          </li>
        </ul>
      </section>

      <section>
        <h2>Students under 18</h2>
        <p>
          Our services are bought by parents and guardians, and the student is often a
          minor. We ask that an adult creates the account and provides the student&rsquo;s
          details. We collect only what we need to deliver tutoring — name, grade,
          subjects and availability — and we do not use a student&rsquo;s information for
          advertising or sell it to anyone.
        </p>
        <p>
          A parent or guardian may review, correct or delete their child&rsquo;s
          information at any time by contacting <Fill>PRIVACY EMAIL ADDRESS</Fill>.
        </p>
        <p className="text-amber-900">
          <Fill>
            LEGAL REVIEW: confirm obligations under COPPA and any applicable state
            student-privacy law before publishing
          </Fill>
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To match a student with a tutor and schedule sessions.</li>
          <li>To take payment and keep track of the credit on your account.</li>
          <li>
            To send you service email — booking confirmations, session times, receipts,
            password resets.
          </li>
          <li>To respond when you contact us.</li>
          <li>To keep records we are required to keep, and to prevent fraud.</li>
        </ul>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>
          We do not sell personal information. We share it only with the service
          providers that make the product work:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> — hosts our database and handles sign-in. Your
            account and booking records are stored here, on servers in the United States.
          </li>
          <li>
            <strong>Stripe</strong> — processes payments. Stripe receives your name,
            email and payment details directly.
          </li>
          <li>
            <strong>Resend</strong> — delivers our transactional email, and therefore
            receives your email address and the message content.
          </li>
          <li>
            <strong>Google</strong> — we create Google Calendar events for booked
            sessions and, for online sessions, a Google Meet link. The tutor and the
            student are invited to that event, so each can see the other&rsquo;s name and
            the email address on the invitation.
          </li>
          <li>
            <strong>Netlify</strong> — hosts the website.
          </li>
        </ul>
        <p>
          We may also disclose information where the law requires it, or to establish or
          defend legal claims.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep account and booking records for as long as your account is open, and
          afterwards for as long as we need them for tax, accounting and legal purposes —
          ordinarily <Fill>NUMBER</Fill> years. You can ask us to delete your account
          sooner; see below.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to give you a copy of your information, correct it, or delete
          it. You can also ask us to stop sending non-essential email — though we still
          need to send service messages such as booking confirmations while your account
          is open.
        </p>
        <p>
          Email <Fill>PRIVACY EMAIL ADDRESS</Fill> and we will respond within{' '}
          <Fill>NUMBER</Fill> days. Depending on where you live you may have further
          rights under laws such as the CCPA or GDPR.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>
          Traffic to the site is encrypted in transit. Passwords are stored hashed.
          Access to customer records is restricted to staff who need it. No system is
          perfectly secure, but we take reasonable measures to protect your information
          and will notify you as required by law if a breach affects you.
        </p>
      </section>

      <section>
        <h2>Cookies</h2>
        <p>
          We set a cookie to keep you signed in. It is required for the site to work and
          is not used for advertising. We do not currently run third-party analytics or
          advertising trackers.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we change this policy we will update the date at the top of this page and,
          where the change is significant, tell you by email.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          <Fill>LEGAL ENTITY NAME</Fill>
          <br />
          <Fill>BUSINESS ADDRESS</Fill>
          <br />
          <Fill>PRIVACY EMAIL ADDRESS</Fill>
        </p>
      </section>
    </LegalPage>
  )
}
