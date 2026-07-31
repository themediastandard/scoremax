import type { ReactNode } from 'react'

/**
 * Shared shell for the privacy policy, terms of service and refund policy.
 *
 * These pages were drafted from what the application actually does — the
 * processors it calls, the fields it stores, the refund rule implemented in
 * `refund_booking()` — but they have NOT been reviewed by a lawyer. The draft
 * banner is deliberate and should be removed only once they have been.
 *
 * As of 2026-07-31 every factual gap is filled from the client's answers (see
 * src/lib/legal-entity.ts). What remains is two sections a lawyer has to write
 * or approve, both still wrapped in <Fill>: the limitation of liability and
 * dispute-resolution clauses in the terms, and confirmation of COPPA and state
 * student-privacy obligations in the privacy policy. The client has said they
 * do not currently have a lawyer, so this is a business decision, not a
 * remaining piece of work here.
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
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            <strong>Draft — pending legal review.</strong> The business details on
            this page are complete. Any remaining highlighted section needs a
            qualified lawyer before publication.
          </p>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-gray-900 mb-2">
          {title}
        </h1>
        <div className="w-10 h-[2px] bg-[#b08a30] mb-4" />
        <p className="text-xs text-gray-500 mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-600 [&_h2]:font-[family-name:var(--font-playfair)] [&_h2]:text-xl [&_h2]:text-gray-900 [&_h2]:mb-3 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-gray-600 [&_a]:text-[#b08a30] [&_a]:underline">
          {children}
        </div>
      </section>
    </div>
  )
}

/** Bracketed value the business still needs to supply. */
export function Fill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-amber-100 px-1 text-amber-900">[{children}]</span>
  )
}
