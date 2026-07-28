import type { ReactNode } from 'react'

/**
 * Shared shell for the privacy policy, terms of service and refund policy.
 *
 * These pages were drafted from what the application actually does — the
 * processors it calls, the fields it stores, the refund rule implemented in
 * `refund_booking()` — but they have NOT been reviewed by a lawyer. The draft
 * banner is deliberate and should be removed only once they have been.
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
            <strong>Draft — pending legal review.</strong> This page is a working
            draft. Placeholders in brackets must be completed and the text reviewed
            by a qualified lawyer before launch.
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
