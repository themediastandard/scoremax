import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import {
  LEGAL_ENTITY_NAME,
  BUSINESS_ADDRESS,
  PRIVACY_EMAIL,
  RECORD_RETENTION_YEARS,
  PRIVACY_RESPONSE_DAYS,
} from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Privacy Policy | ScoreMax',
  description:
    'How ScoreMax collects, uses, stores and shares personal information, including information about students under 18.',
  robots: { index: true, follow: true },
  // Only the fields that read wrong when inherited. Without an og:url and
  // og:title of its own, a link to this page previewed as the homepage.
  openGraph: {
    type: 'website',
    url: 'https://www.scoremaxtutoring.com/privacy',
    siteName: 'ScoreMax',
    title: 'Privacy Policy | ScoreMax',
    description:
      'How ScoreMax collects, uses, stores and shares personal information, including information about students under 18.',
  },
  alternates: { canonical: 'https://www.scoremaxtutoring.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="4 August 2026">
      <section>
        <p>
          This policy explains what {LEGAL_ENTITY_NAME} (&ldquo;ScoreMax&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;) does with personal information when you use{' '}
          <Link href="/">scoremaxtutoring.com</Link> and our tutoring services.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Account and contact details.</strong> Name, email address, phone
            number, and the password you set (stored only as a cryptographic hash; we
            never see it).
          </li>
          <li>
            <strong>Student details.</strong> The student&rsquo;s name, grade level, the
            subjects they need help with, and any notes you choose to give us.
          </li>
          <li>
            <strong>Scheduling information.</strong> The days and times you are
            available and your timezone.
          </li>
          <li>
            <strong>Purchase records.</strong> What you bought, the amount, and the
            resulting credit balance. <strong>We never receive or store your card
            number</strong>; card details are entered directly with Stripe.
          </li>
          <li>
            <strong>Messages.</strong> Anything you send us through the contact form or
            by email.
          </li>
        </ul>
      </section>

      <section>
        <h2>Signing in with Google</h2>
        <p>
          You can create your account with an email and password, or by choosing
          &ldquo;Sign in with Google&rdquo;. If you choose Google, Google shares your name
          and email address with us so that we can create and identify your account. That
          is all we ask for and all we receive.
        </p>
        <p>
          We never receive your Google password, and we do not read your Gmail, contacts,
          files, photos, or anything else in your Google account. We use your name and
          email address only to run your ScoreMax account &mdash; signing you in,
          confirming bookings, and sending session reminders. We do not use them for
          advertising and we do not sell them.
        </p>
        <p>
          Booking an online session creates a Google Calendar event with a Google Meet
          link, described under Google below. That is a separate thing from signing in,
          and it happens whichever way you created your account.
        </p>
      </section>

      <section>
        <h2>Students under 18</h2>
        <p>
          Our services are bought by parents and guardians, and the student is often a
          minor. We ask that an adult creates the account and provides the student&rsquo;s
          details. We collect only what we need to deliver tutoring: name, grade,
          subjects and availability. We do not use a student&rsquo;s information for
          advertising or sell it to anyone.
        </p>
        <p>
          A parent or guardian may review, correct or delete their child&rsquo;s
          information at any time by contacting {PRIVACY_EMAIL}.
        </p>
        <p>
          <strong>Children under 13.</strong> Our website and accounts are
          intended for adults. We do not knowingly allow a child under 13 to
          create an account or provide us with personal information directly. When
          a student under 13 receives tutoring, it is the parent or guardian who
          creates the account and provides the limited details we need, and that
          adult&rsquo;s consent covers our collection and use of them. If we learn
          that we have collected personal information directly from a child under
          13 without that consent, we will delete it promptly. A parent or
          guardian who believes we hold such information can email{' '}
          {PRIVACY_EMAIL} and we will confirm what we have, delete it on request,
          and stop any further collection.
        </p>
        <p>
          <strong>Student records.</strong> We are a private tutoring business
          engaged directly by families. We are not a school, and we do not receive
          education records from a school district, so we do not act as a
          &ldquo;school official&rdquo; under FERPA. If we are ever engaged by a
          school or district, we will enter into a written agreement covering
          student data before any records are shared.
        </p>
        <p>
          <strong>We never sell or advertise to students.</strong> We do not sell
          or rent student information, use it for targeted advertising, or build
          advertising profiles from it. We do not use it to train third-party
          advertising or recommendation systems. We use it to deliver tutoring, to
          communicate with the family about it, and to keep the records the law
          requires — nothing else.
        </p>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To match a student with a tutor and schedule sessions.</li>
          <li>To take payment and keep track of the credit on your account.</li>
          <li>
            To send you service email such as booking confirmations, session times, receipts,
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
            <strong>Supabase</strong> hosts our database and handles sign-in. Your
            account and booking records are stored here, on servers in the United States.
          </li>
          <li>
            <strong>Stripe</strong> processes payments. Stripe receives your name,
            email and payment details directly.
          </li>
          <li>
            <strong>Resend</strong> delivers our transactional email, and therefore
            receives your email address and the message content.
          </li>
          <li>
            <strong>Google.</strong> We create Google Calendar events for booked
            sessions and, for online sessions, a Google Meet link. The tutor and the
            student are invited to that event, so each can see the other&rsquo;s name and
            the email address on the invitation.
          </li>
          <li>
            <strong>Netlify</strong> hosts the website.
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
          afterwards for as long as we need them for tax, accounting and legal purposes,
          ordinarily {RECORD_RETENTION_YEARS} years. You can ask us to delete your account
          sooner; see below.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to give you a copy of your information, correct it, or delete
          it. You can also ask us to stop sending non-essential email, though we still
          need to send service messages such as booking confirmations while your account
          is open.
        </p>
        <p>
          Email {PRIVACY_EMAIL} and we will respond within{' '}
          {PRIVACY_RESPONSE_DAYS} days. Depending on where you live you may have further
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
          is not used for advertising.
        </p>
        <p>
          We also use Google Analytics to understand how people find and use the site,
          such as how many visitors we get and which pages they read. Google Analytics
          sets its own cookies to do this. It is analytics, not advertising: we do not
          use it to build advertising profiles or to show you ads, and we do not run
          advertising trackers. We switch it off on the pages you reach from a password
          reset email, so those links are never sent to Google.
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
          {LEGAL_ENTITY_NAME}
          <br />
          {BUSINESS_ADDRESS}
          <br />
          {PRIVACY_EMAIL}
        </p>
      </section>
    </LegalPage>
  )
}
