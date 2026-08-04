import type { MetadataRoute } from 'next'

/**
 * Generates /sitemap.xml for Search Console.
 *
 * Only public, indexable, canonical URLs belong here. Three groups are
 * deliberately absent:
 *
 * - Everything under /dashboard, plus /login, /register, /forgot-password,
 *   /reset-password and /auth/*. They are behind auth or carry single-use
 *   tokens; submitting them asks Google to crawl pages it can only ever see as
 *   a redirect or an error.
 * - /book/confirmation, which is only meaningful immediately after a purchase.
 * - Any URL that only redirects: the legacy /college-high-school/* paths, which
 *   are `permanentRedirect`s to the short URLs listed below, and
 *   /test-prep/in-person-classes. A sitemap should carry the destination of a
 *   redirect, never the source.
 *
 * This replaces a hand-maintained public/sitemap.xml that had drifted: its
 * lastmod was frozen at 2026-07-10 and it never listed the GRE, GMAT or LSAT
 * pages. Generating it from a route list here is the point — the two cannot
 * disagree about what exists. A file at public/sitemap.xml would take
 * precedence over this route and Next dev-errors on the conflict, so it must
 * stay deleted.
 *
 * `changeFrequency` and `priority` are hints Google has said it largely
 * ignores; they are set for the benefit of other crawlers and cost nothing.
 */

// Same resolution as src/lib/email-templates.ts. `www` is canonical and the
// value carries no trailing slash — a dozen call sites append paths directly.
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoremaxtutoring.com'
}

type Entry = {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}

const ROUTES: Entry[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },

  // Conversion paths.
  { path: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/book', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },

  // Test prep — the primary commercial landing pages.
  { path: '/test-prep/sat', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/test-prep/act', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/test-prep/gre', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/test-prep/gmat', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/test-prep/lsat', changeFrequency: 'monthly', priority: 0.8 },
  // Deliberately NOT /test-prep/in-person-classes. In-person tutoring was
  // withdrawn as a service in 84b3394; that page is now a redirect to
  // /test-prep/sat, and the same commit removed it from the old static sitemap
  // rather than leave a redirect-only URL to be crawled. Do not re-add it.

  // Academic tutoring by level. These are the canonical short URLs; the
  // /college-high-school/* equivalents 301 here.
  { path: '/college-tutoring', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/high-school-tutoring', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/middle-school-tutoring', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/elementary-tutoring', changeFrequency: 'monthly', priority: 0.8 },

  { path: '/subjects', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/tutors', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/step-up-for-students', changeFrequency: 'monthly', priority: 0.6 },

  // Legal and policy. Indexable, but never the page you want ranked.
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/refund-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/accessibility', changeFrequency: 'yearly', priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl()
  // Build time, not request time — this route is static, so every URL shares
  // one honest "as of the last deploy" stamp rather than a per-request `now`
  // that would claim the whole site changed on every crawl.
  const lastModified = new Date()

  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    // `path` always starts with '/', so the homepage comes out as
    // `https://www.scoremaxtutoring.com/` — with the trailing slash, matching
    // what the site actually serves and what the previous sitemap declared.
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
