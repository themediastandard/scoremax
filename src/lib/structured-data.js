/**
 * JSON-LD builders for the public marketing pages.
 *
 * Structured data is a set of machine-readable factual assertions about a real
 * business. Search engines and AI answer engines quote it verbatim, so a wrong
 * property is worse than a missing one. Two rules follow from that, and both
 * are load-bearing:
 *
 *   1. Every value emitted here must be sourced from the page that renders it,
 *      from the `pricing` table, or from a fact stated in the site's own copy.
 *   2. There is deliberately no `aggregateRating`, `review` or `ratingValue`
 *      builder. No review data exists anywhere in this codebase or database —
 *      the homepage "Google Review" cards carry first-name-and-initial quotes
 *      with no rating, no author identity and no source record. Marking those
 *      up would be fabricated review markup, which is both dishonest and a
 *      Google manual-action offence. Do not add one.
 *
 * Plain JavaScript with a .d.ts alongside so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

/** Matches src/app/sitemap.ts. `www` is canonical and carries no trailing slash. */
const DEFAULT_SITE_URL = 'https://www.scoremaxtutoring.com'

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL
}

/**
 * Absolute URL for a site-relative path.
 *
 * '/' resolves to the bare origin rather than origin + '/', matching the
 * homepage's existing `alternates.canonical`.
 */
function absoluteUrl(path) {
  const base = siteUrl()
  if (!path || path === '/') return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Stable node identity for the organisation, so every `provider` on every page
 * points at the same entity rather than minting a new one per page.
 */
function organizationId() {
  return `${siteUrl()}/#organization`
}

/**
 * Compact organisation node for embedding as `provider`.
 *
 * It carries `@id` *and* enough properties to stand on its own. A bare `@id`
 * reference would dangle on every page except the homepage, which is the only
 * page that defines the full node.
 */
function organizationRef() {
  return {
    '@type': 'EducationalOrganization',
    '@id': organizationId(),
    name: 'ScoreMax',
    url: siteUrl(),
  }
}

/**
 * "United States" is sourced from the site's own copy — the homepage says
 * "nationwide reach" and "anywhere in the country", and the pre-existing
 * homepage schema already asserted it.
 */
function areaServed() {
  return { '@type': 'Country', name: 'United States' }
}

/** The site-wide WebSite node rendered from the root layout. */
function webSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl()}/#website`,
    name: 'ScoreMax Tutoring',
    url: siteUrl(),
    publisher: organizationRef(),
  }
}

/**
 * The full organisation node. Rendered once, on the homepage.
 *
 * The wording is carried over verbatim from the node that has been live on the
 * homepage since before this module existed; this is a refactor of where it
 * lives, not a rewrite of what it claims.
 */
function educationalOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': organizationId(),
    name: 'ScoreMax',
    description:
      'Fully remote SAT and ACT tutoring delivered online over video conferencing, with expert tutors. Help students improve test scores by 260+ points.',
    url: siteUrl(),
    logo: absoluteUrl('/logo.avif'),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      url: absoluteUrl('/contact'),
    },
    // Country only. ScoreMax is fully remote and publishes no street address on
    // the site, so a locality or postal code would be invented.
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    offers: {
      '@type': 'Offer',
      description: 'SAT and ACT tutoring services',
      category: 'Educational Services',
    },
    serviceType: ['SAT Tutoring', 'ACT Tutoring', 'Test Preparation', 'Academic Tutoring'],
    areaServed: areaServed(),
  }
}

/**
 * A tutoring offering on one of the nine commercial landing pages.
 *
 * `Service`, not `Course`, and the distinction is deliberate. Google's Course
 * rich results want `hasCourseInstance` carrying a `courseMode`, a schedule and
 * a workload. ScoreMax 1:1 tutoring has none of those: there is no cohort, no
 * start date and no fixed length — sessions are booked one at a time against
 * the student's own availability (see /book). Filling `hasCourseInstance` would
 * mean inventing every value in it. `Service` describes what is actually sold.
 *
 * `offers` is deliberately absent: these pages render no prices, so any number
 * here would come from somewhere the reader cannot see. Prices are asserted
 * only on /pricing, from the same rows that page renders.
 */
function tutoringService({ path, name, serviceType, description, audienceType }) {
  const url = absoluteUrl(path)

  const node = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    serviceType,
    description,
    url,
    provider: organizationRef(),
    areaServed: areaServed(),
    availableChannel: {
      '@type': 'ServiceChannel',
      name: 'Online tutoring session',
      serviceUrl: absoluteUrl('/book'),
    },
  }

  if (audienceType) {
    node.audience = {
      '@type': 'EducationalAudience',
      educationalRole: 'student',
      audienceType,
    }
  }

  return node
}

/**
 * The tutoring service as sold, with the plans /pricing renders attached.
 *
 * `offers` must be built from the same resolved arrays the page renders, never
 * from numbers hardcoded here — the `pricing` table is the authority checkout
 * resolves against, and the page can never quote a number checkout won't charge.
 */
function pricedTutoringService({ path, name, description, offers }) {
  const url = absoluteUrl(path)

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    serviceType: 'Online 1:1 tutoring and test preparation',
    description,
    url,
    provider: organizationRef(),
    areaServed: areaServed(),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'ScoreMax tutoring plans',
      itemListElement: offers,
    },
  }
}

/**
 * Google asks for prices as a plain number with no currency symbol or
 * thousands separator; the currency travels in `priceCurrency`.
 */
function formatPrice(amount) {
  return Number(amount).toFixed(2)
}

/** A single plan at a known price. */
function priceOffer({ name, description, price, priceCurrency = 'USD', url, category }) {
  const node = {
    '@type': 'Offer',
    name,
    price: formatPrice(price),
    priceCurrency,
  }
  if (description) node.description = description
  if (url) node.url = absoluteUrl(url)
  if (category) node.category = category
  return node
}

/**
 * A group of plans quoted as "from $X".
 *
 * `offerCount` is omitted unless the caller knows the real count — asserting a
 * count derived from a hardcoded fallback would be a guess.
 */
function aggregatePriceOffer({ name, description, lowPrice, offerCount, priceCurrency = 'USD', url }) {
  const node = {
    '@type': 'AggregateOffer',
    name,
    lowPrice: formatPrice(lowPrice),
    priceCurrency,
  }
  if (description) node.description = description
  if (typeof offerCount === 'number' && offerCount > 0) node.offerCount = offerCount
  if (url) node.url = absoluteUrl(url)
  return node
}

/**
 * Breadcrumb trail for a nested page.
 *
 * Every entry gets a real `item` URL, so a trail may only name paths that
 * actually resolve. /test-prep has no index page — it is a 404 — which is why
 * the test-prep trails run Home → <test> rather than inserting a "Test Prep"
 * rung pointing at nothing.
 */
function breadcrumbList(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  }
}

/**
 * Serialise a node for `dangerouslySetInnerHTML` on a `<script>` element.
 *
 * JSON.stringify alone is *not* enough here, which is the trap this function
 * exists to close. It escapes quotes, backslashes and control characters, but
 * it leaves `<` untouched — and an HTML parser ends a `<script>` at the first
 * `</script>` in the text regardless of the JSON quoting around it. A tutor bio
 * or subject name containing that sequence would break out of the tag.
 *
 * The < escape is valid JSON and parses straight back to `<`, so the data
 * a crawler reads is identical while the HTML parser sees nothing that can
 * close the element early.
 */
function serializeJsonLd(node) {
  return JSON.stringify(node).replace(/</g, '\\u003c')
}

/**
 * FAQ markup.
 *
 * Only ever call this with question-and-answer text that is visible on the
 * page. An FAQ answer that contradicts the site is worse than no FAQ at all —
 * assistants quote these verbatim, and Google requires the same content to be
 * present on the page for the rich result to be eligible.
 */
function faqPage(entries) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer,
      },
    })),
  }
}

module.exports = {
  DEFAULT_SITE_URL,
  siteUrl,
  absoluteUrl,
  organizationId,
  organizationRef,
  areaServed,
  webSite,
  educationalOrganization,
  tutoringService,
  pricedTutoringService,
  formatPrice,
  priceOffer,
  aggregatePriceOffer,
  breadcrumbList,
  faqPage,
  serializeJsonLd,
}
