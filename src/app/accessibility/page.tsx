import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalPage } from '@/components/LegalPage'
import {
  LEGAL_ENTITY_NAME,
  BUSINESS_ADDRESS,
  ACCESSIBILITY_EMAIL,
} from '@/lib/legal-entity'

export const metadata: Metadata = {
  title: 'Accessibility Statement | ScoreMax',
  description:
    'ScoreMax’s commitment to making its website and tutoring services usable by people with disabilities, how to report a barrier, and how to request an accommodation.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.scoremaxtutoring.com/accessibility' },
}

/**
 * Accessibility statement.
 *
 * Deliberately written as "partially conformant" rather than claiming WCAG 2.1
 * AA conformance. No audit has been run against this site, and an unsupported
 * conformance claim is itself an ADA exposure — plaintiffs' firms routinely
 * cite overstated statements as evidence of knowledge. The known-limitations
 * list below reflects issues visible in the code today; keep it current, and
 * upgrade the conformance language only once an actual audit supports it.
 */
export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility Statement" lastUpdated="1 August 2026">
      <section>
        <p>
          {LEGAL_ENTITY_NAME} (&ldquo;ScoreMax&rdquo;) is committed to making our
          website and our tutoring services usable by everyone, including people
          with disabilities. Accessibility is part of how we build and how we
          teach, not an afterthought, and we treat every barrier report as a
          problem to fix.
        </p>
      </section>

      <section>
        <h2>The standard we hold ourselves to</h2>
        <p>
          We measure this site against the{' '}
          <a
            href="https://www.w3.org/TR/WCAG21/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Web Content Accessibility Guidelines (WCAG) 2.1, Level AA
          </a>
          . These guidelines are the standard referenced by the Americans with
          Disabilities Act (ADA), and they are what makes web content usable by
          people with visual, hearing, motor and cognitive disabilities.
        </p>
      </section>

      <section>
        {/*
          Deliberately an effort statement, not a conformance claim. Saying we
          work toward WCAG 2.1 AA is accurate and is what the business wants to
          convey. Saying the site "meets" or "complies with" WCAG 2.1 AA would be
          a representation to consumers that no audit currently supports — and an
          overstated claim is the thing plaintiffs cite, so do not upgrade this
          wording without an audit behind it.
        */}
        <h2>Our commitment</h2>
        <p>
          We take active strides to meet WCAG 2.1 Level AA across this site.
          Accessibility is built into how we design, review and test our
          pages rather than checked at the end, and we keep working at it as the
          site grows. We are never finished with this, and we treat anything that
          falls short of the standard as a problem to fix rather than a box to
          argue about.
        </p>
        <p>
          If something here does not work for you, that matters more to us than
          any checklist. Tell us and we will fix it and get you what you needed in
          the meantime.
        </p>
      </section>

      <section>
        <h2>What we have done</h2>
        <ul>
          <li>
            A &ldquo;skip to main content&rdquo; link on every page, and a single
            <code> main</code> landmark, so you are not tabbed through the whole
            header before reaching the page.
          </li>
          <li>
            A keyboard-operable Tutoring menu. It previously opened on mouse
            hover only, which put its seven destinations out of reach of anyone
            navigating by keyboard. It now opens with Enter or Space, closes with
            Escape, and reports its state to screen readers.
          </li>
          <li>
            A mobile menu that behaves as a dialog: focus stays inside it while
            it is open, Escape closes it, and focus returns to the button that
            opened it. Collapsed submenus are no longer reachable while hidden.
          </li>
          <li>
            A visible focus outline on every interactive element, drawn in a tone
            that meets the 3:1 contrast the standard requires of focus
            indicators.
          </li>
          <li>
            Respect for your system&rsquo;s &ldquo;reduce motion&rdquo; setting.
            If you have it switched on, the homepage video stays on a still frame
            and animations across the site are reduced to near-zero.
          </li>
          <li>
            Text alternatives for images that convey information, and decorative
            graphics hidden from screen readers so they are not announced as
            noise.
          </li>
          <li>
            Form fields with associated labels, and submission results announced
            to screen readers rather than only appearing on screen.
          </li>
          <li>
            Semantic headings and lists, and layouts that reflow on small screens
            and under zoom.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where you may still hit friction</h2>
        <p>
          Parts of our service run on platforms we do not build. If any of the
          following gets in your way, contact us and we will get you the same
          outcome another way.
        </p>
        <ul>
          <li>
            <strong>Third-party checkout.</strong> Payment is handled on Stripe&rsquo;s
            hosted checkout page. We do not control its accessibility. If you have
            difficulty completing payment, email us and we will take your booking
            and arrange payment another way.
          </li>
          <li>
            <strong>Online sessions.</strong> Live sessions run on Google Meet,
            whose accessibility features (including live captions) are provided by
            Google. Tell us what you need and we will configure sessions
            accordingly.
          </li>
          <li>
            <strong>Older documents.</strong> Some worksheets and practice
            materials shared by tutors may not yet be tagged for screen readers.
            We will provide an accessible version on request.
          </li>
        </ul>
      </section>

      <section>
        <h2>Accommodations for students</h2>
        <p>
          Accessibility is not only about this website. Tell us what a student
          needs and we will adapt the tutoring itself — extended time, materials
          in large print or a screen-reader-friendly format, captioned sessions,
          a tutor experienced with a particular learning difference, or a
          different session length or pace. Ask at any point, including before
          you book; there is no extra charge for an accommodation.
        </p>
      </section>

      <section>
        <h2>Tell us about a barrier</h2>
        <p>
          If you cannot access part of this site or our services, we want to hear
          about it. Email{' '}
          <a href={`mailto:${ACCESSIBILITY_EMAIL}`}>{ACCESSIBILITY_EMAIL}</a> with
          the page address, what you were trying to do, and the browser or
          assistive technology you were using. You can also reach us through our{' '}
          <Link href="/contact">contact page</Link>.
        </p>
        <p>
          We aim to acknowledge accessibility reports within{' '}
          <strong>2 business days</strong> and to tell you within{' '}
          <strong>10 business days</strong> either that it is fixed or when it
          will be. While we work on a fix, we will give you another way to get
          what you needed.
        </p>
      </section>

      <section>
        <h2>How we assess this site</h2>
        <p>
          We review pages against WCAG 2.1 Level AA using a combination of
          automated checks and manual testing — navigating by keyboard alone and
          checking what a screen reader announces. Accessibility is part of the
          review before a change ships.
        </p>
        <p>
          We do not use an accessibility overlay or widget, and we do not intend
          to. Overlays sit on top of a site and leave the underlying problems in
          place; we would rather fix the page.
        </p>
      </section>

      <section>
        <h2>If we have not got it right</h2>
        <p>
          If you have contacted us and you are not satisfied with how we handled
          it, tell us again and ask for it to be escalated. Email{' '}
          <a href={`mailto:${ACCESSIBILITY_EMAIL}`}>{ACCESSIBILITY_EMAIL}</a> with
          &ldquo;escalation&rdquo; in the subject line and it will be looked at
          directly by the owners rather than by whoever answered first. We would
          always rather hear that we fell short than have you give up on us.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          {LEGAL_ENTITY_NAME}
          <br />
          {BUSINESS_ADDRESS}
          <br />
          <a href={`mailto:${ACCESSIBILITY_EMAIL}`}>{ACCESSIBILITY_EMAIL}</a>
        </p>
      </section>
    </LegalPage>
  )
}
