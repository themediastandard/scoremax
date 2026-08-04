import type { Metadata } from 'next'

/**
 * Metadata for /book.
 *
 * It lives in a layout because src/app/book/page.tsx is a "use client"
 * component — a client page cannot export `metadata`, which is why /book was
 * the one public page on the site with no title, description or canonical of
 * its own, silently inheriting the root layout's homepage-specific tags.
 *
 * This layout also wraps /book/confirmation, so that route overrides both the
 * canonical and `robots` in its own layout. Metadata is inherited literally —
 * an absolute canonical set here would otherwise claim the confirmation page
 * *is* /book.
 */
export const metadata: Metadata = {
  title: 'Book a Tutoring Session | ScoreMax',
  description:
    'Book online 1:1 tutoring with ScoreMax. Choose your subject, share your availability, and pick a membership, prepaid package, or single session.',
  keywords: 'book tutoring, schedule tutoring session, online tutoring booking, SAT tutoring booking, ACT tutoring booking',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.scoremaxtutoring.com/book',
    siteName: 'ScoreMax',
    title: 'Book a Tutoring Session | ScoreMax',
    description:
      'Choose your subject, share your availability, and pick a membership, prepaid package, or single session.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Tutoring Session | ScoreMax',
    description:
      'Choose your subject, share your availability, and pick a membership, prepaid package, or single session.',
  },
  alternates: {
    canonical: 'https://www.scoremaxtutoring.com/book',
  },
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children
}
