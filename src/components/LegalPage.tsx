import type { ReactNode } from 'react'

/**
 * Shared shell for the privacy policy, terms of service, refund policy and
 * accessibility statement.
 *
 * These pages are drafted from what the application actually does — the
 * processors it calls, the fields it stores, the refund rule implemented in
 * `refund_booking()` — with the business details coming from
 * src/lib/legal-entity.ts so the entity name, address and contact address
 * cannot drift apart between pages.
 *
 * The liability, indemnity and dispute-resolution clauses in the terms, and the
 * children's-privacy section in the privacy policy, are conventional drafting
 * for a US consumer tutoring business. They have not been reviewed by a lawyer.
 * Anyone revisiting these should treat the governing-law and jurisdiction
 * values as the load-bearing assumption: they default to the state and county
 * of the registered address, which is a guess the business has not confirmed.
 */
export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-2">
          {title}
        </h1>
        <div className="w-10 h-[2px] bg-[#b08a30] mb-4" />
        <p className="text-xs text-gray-500 mb-10">Last updated: {lastUpdated}</p>

        {/*
          Body links are the one place the "enlarge, keep the gold" rule cannot
          apply. Gold on white is 3.22:1, which clears the 3:1 large-text bar but
          not the 4.5:1 normal-text bar, and these links sit inline inside 14px
          paragraphs — bumping just the links to 19px would break the line box
          around them. So legal body links are set in the body colour with a
          permanent underline instead, which passes contrast and still marks them
          as links without relying on colour (WCAG 1.4.1 and 1.4.3).

          Gold is untouched everywhere else on these pages.
        */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-600 [&_h2]:font-[family-name:var(--font-playfair)] [&_h2]:text-xl [&_h2]:text-gray-900 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-gray-600 [&_a]:text-gray-900 [&_a]:font-medium [&_a]:underline">
          {children}
        </div>
      </section>
    </div>
  )
}
