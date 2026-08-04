import type { Metadata } from 'next'

/**
 * The confirmation page is only meaningful immediately after a purchase, keyed
 * to a Stripe session id or booking id in the query string. It is deliberately
 * absent from the sitemap for that reason, and it is noindex here for the same
 * one — there is nothing at this URL for a crawler that arrives without those
 * parameters.
 *
 * The canonical is restated rather than inherited: src/app/book/layout.tsx sets
 * an absolute canonical for /book, and Next passes inherited metadata down
 * verbatim, so without this the confirmation page would tell Google it is /book.
 */
export const metadata: Metadata = {
  title: 'Booking Confirmed | ScoreMax',
  description: 'Your ScoreMax tutoring booking has been received.',
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://www.scoremaxtutoring.com/book/confirmation',
  },
}

export default function ConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children
}
