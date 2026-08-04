import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  DEFAULT_SITE_URL,
  siteUrl,
  absoluteUrl,
  organizationId,
  organizationRef,
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
} = require('../src/lib/structured-data.js')

// ---------------------------------------------------------------------------
// The point of the whole module: every node must survive JSON.stringify as
// valid JSON, and every @type must be a real schema.org type. A typo in either
// is invisible in review and silently kills the rich result.
// ---------------------------------------------------------------------------

/** Types this codebase is allowed to emit. Extend deliberately, not reflexively. */
const KNOWN_TYPES = new Set([
  'AggregateOffer',
  'Answer',
  'BreadcrumbList',
  'ContactPoint',
  'Country',
  'EducationalAudience',
  'EducationalOrganization',
  'FAQPage',
  'ItemList',
  'ListItem',
  'Offer',
  'OfferCatalog',
  'Organization',
  'Person',
  'PostalAddress',
  'Question',
  'Service',
  'ServiceChannel',
  'WebSite',
])

/** Every @type anywhere in a node tree, however deeply nested. */
function collectTypes(value, found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectTypes(entry, found))
    return found
  }
  if (value && typeof value === 'object') {
    if (typeof value['@type'] === 'string') found.push(value['@type'])
    Object.values(value).forEach((entry) => collectTypes(entry, found))
  }
  return found
}

/** Round-trip through the exact serialisation the JsonLd component performs. */
function roundTrip(node) {
  const json = JSON.stringify(node)
  assert.equal(typeof json, 'string', 'node must serialise')
  return JSON.parse(json)
}

function assertValidNode(node) {
  const parsed = roundTrip(node)
  const types = collectTypes(parsed)
  assert.ok(types.length > 0, 'node must declare at least one @type')
  for (const type of types) {
    assert.ok(KNOWN_TYPES.has(type), `unknown schema.org @type: ${type}`)
  }
  return parsed
}

/** Every builder that produces a top-level page node, with valid arguments. */
const TOP_LEVEL_NODES = [
  ['webSite', webSite()],
  ['educationalOrganization', educationalOrganization()],
  [
    'tutoringService',
    tutoringService({
      path: '/test-prep/sat',
      name: 'SAT Tutoring',
      serviceType: 'Online 1:1 SAT test preparation tutoring',
      description: 'Expert tutors provide personalized SAT preparation.',
      audienceType: 'High school students',
    }),
  ],
  [
    'pricedTutoringService',
    pricedTutoringService({
      path: '/pricing',
      name: 'ScoreMax Tutoring',
      description: 'Memberships, packages and course programs.',
      offers: [priceOffer({ name: 'Core Membership', price: 549 })],
    }),
  ],
  [
    'breadcrumbList',
    breadcrumbList([
      { name: 'Home', path: '/' },
      { name: 'SAT Tutoring', path: '/test-prep/sat' },
    ]),
  ],
  ['faqPage', faqPage([{ question: 'Is tutoring online?', answer: 'Yes, every session.' }])],
]

for (const [name, node] of TOP_LEVEL_NODES) {
  test(`${name}() emits valid JSON with only known schema.org types`, () => {
    const parsed = assertValidNode(node)
    assert.equal(
      parsed['@context'],
      'https://schema.org',
      'a top-level node must carry @context'
    )
  })
}

// ---------------------------------------------------------------------------
// URLs. `www` is canonical and carries no trailing slash; a dozen call sites
// append paths directly, so absoluteUrl must never double or drop a slash.
// ---------------------------------------------------------------------------

test('absoluteUrl joins paths without doubling or dropping the slash', () => {
  assert.equal(absoluteUrl('/pricing'), `${DEFAULT_SITE_URL}/pricing`)
  assert.equal(absoluteUrl('pricing'), `${DEFAULT_SITE_URL}/pricing`)
  assert.equal(absoluteUrl('/test-prep/sat'), `${DEFAULT_SITE_URL}/test-prep/sat`)
})

test('absoluteUrl resolves the site root to the bare origin', () => {
  // Matching the homepage's existing alternates.canonical, which has no
  // trailing slash.
  assert.equal(absoluteUrl('/'), DEFAULT_SITE_URL)
  assert.equal(absoluteUrl(''), DEFAULT_SITE_URL)
})

test('siteUrl honours NEXT_PUBLIC_APP_URL when it is set', () => {
  const previous = process.env.NEXT_PUBLIC_APP_URL
  process.env.NEXT_PUBLIC_APP_URL = 'https://staging.example.com'
  try {
    assert.equal(siteUrl(), 'https://staging.example.com')
    assert.equal(absoluteUrl('/book'), 'https://staging.example.com/book')
    // The organisation @id has to follow the origin too, or a staging deploy
    // would claim to be the production entity.
    assert.equal(organizationId(), 'https://staging.example.com/#organization')
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_APP_URL
    else process.env.NEXT_PUBLIC_APP_URL = previous
  }
})

// ---------------------------------------------------------------------------
// Node identity. Every page's `provider` must resolve to one entity.
// ---------------------------------------------------------------------------

test('every provider reference shares the organisation @id', () => {
  const org = educationalOrganization()
  const service = tutoringService({
    path: '/college-tutoring',
    name: 'College Tutoring',
    serviceType: 'Online 1:1 college tutoring',
    description: 'Advanced mathematics and science support.',
  })

  assert.equal(org['@id'], organizationId())
  assert.equal(service.provider['@id'], organizationId())
  assert.equal(webSite().publisher['@id'], organizationId())
})

test('the provider reference stands alone rather than dangling on an @id', () => {
  // Only the homepage defines the full organisation node. On every other page
  // the reference has to carry enough to be a node in its own right.
  const ref = organizationRef()
  assert.equal(ref['@type'], 'EducationalOrganization')
  assert.equal(ref.name, 'ScoreMax')
  assert.equal(ref.url, DEFAULT_SITE_URL)
})

// ---------------------------------------------------------------------------
// Service — required properties, and the ones deliberately absent.
// ---------------------------------------------------------------------------

test('tutoringService carries the properties a Service result needs', () => {
  const node = tutoringService({
    path: '/test-prep/gre',
    name: 'GRE Tutoring',
    serviceType: 'Online 1:1 GRE General Test preparation tutoring',
    description: 'One-on-one GRE preparation.',
    audienceType: 'Graduate school applicants',
  })

  assert.equal(node['@type'], 'Service')
  assert.equal(node.name, 'GRE Tutoring')
  assert.equal(node.url, `${DEFAULT_SITE_URL}/test-prep/gre`)
  assert.equal(node['@id'], `${DEFAULT_SITE_URL}/test-prep/gre#service`)
  assert.equal(node.areaServed.name, 'United States')
  assert.equal(node.availableChannel.serviceUrl, `${DEFAULT_SITE_URL}/book`)
  assert.equal(node.audience.audienceType, 'Graduate school applicants')
})

test('tutoringService omits audience entirely when the page states none', () => {
  const node = tutoringService({
    path: '/test-prep/lsat',
    name: 'LSAT Tutoring',
    serviceType: 'Online 1:1 LSAT preparation tutoring',
    description: 'One-on-one LSAT preparation.',
  })
  assert.ok(!('audience' in node), 'an unsourced audience must be absent, not empty')
})

test('landing-page services assert no price', () => {
  // The nine landing pages render no prices. A number here would come from
  // somewhere the reader cannot see; /pricing is the only page that quotes.
  const node = tutoringService({
    path: '/test-prep/sat',
    name: 'SAT Tutoring',
    serviceType: 'Online 1:1 SAT test preparation tutoring',
    description: 'One-on-one SAT preparation.',
  })
  const json = JSON.stringify(node)
  assert.ok(!json.includes('"offers"'), 'landing pages must not carry offers')
  assert.ok(!json.includes('"price"'), 'landing pages must not carry a price')
})

// ---------------------------------------------------------------------------
// The rule the whole module exists to enforce.
// ---------------------------------------------------------------------------

test('no builder can emit review or rating markup', () => {
  // No review data exists in this codebase or database. Fabricated review
  // markup is a Google manual-action offence; this test is the tripwire for
  // anyone adding one without finding a real source first.
  const everything = JSON.stringify(TOP_LEVEL_NODES.map(([, node]) => node))
  for (const forbidden of ['aggregateRating', 'ratingValue', 'reviewCount', '"review"']) {
    assert.ok(!everything.includes(forbidden), `${forbidden} must never be emitted`)
  }
})

// ---------------------------------------------------------------------------
// Offers. Prices are money — the format is not cosmetic.
// ---------------------------------------------------------------------------

test('formatPrice emits a bare decimal with no symbol or separator', () => {
  assert.equal(formatPrice(549), '549.00')
  assert.equal(formatPrice(1200), '1200.00')
  assert.equal(formatPrice(2500), '2500.00')
})

test('priceOffer states the currency alongside the number', () => {
  const offer = priceOffer({
    name: 'Core Membership',
    description: '4 hours of 1:1 tutoring per month',
    price: 549,
    url: '/book',
    category: 'Membership',
  })

  assert.equal(offer['@type'], 'Offer')
  assert.equal(offer.price, '549.00')
  assert.equal(offer.priceCurrency, 'USD')
  assert.equal(offer.url, `${DEFAULT_SITE_URL}/book`)
})

test('priceOffer drops optional fields rather than emitting empty ones', () => {
  const offer = priceOffer({ name: 'Starter Membership', price: 299 })
  assert.ok(!('description' in offer))
  assert.ok(!('url' in offer))
  assert.ok(!('category' in offer))
})

test('aggregatePriceOffer omits offerCount when there is nothing to count', () => {
  // /pricing falls back to hardcoded course bullets when the pricing query
  // returns nothing. Asserting a count in that state would be a guess.
  const withRows = aggregatePriceOffer({
    name: 'SAT & ACT course programs',
    lowPrice: 2500,
    offerCount: 3,
  })
  assert.equal(withRows.offerCount, 3)
  assert.equal(withRows.lowPrice, '2500.00')

  const withoutRows = aggregatePriceOffer({
    name: 'SAT & ACT course programs',
    lowPrice: 2500,
    offerCount: 0,
  })
  assert.ok(!('offerCount' in withoutRows))
})

test('pricedTutoringService hangs its offers off an OfferCatalog', () => {
  const node = pricedTutoringService({
    path: '/pricing',
    name: 'ScoreMax Tutoring',
    description: 'Memberships, packages and course programs.',
    offers: [
      priceOffer({ name: 'Core Membership', price: 549 }),
      aggregatePriceOffer({ name: 'Courses', lowPrice: 2500, offerCount: 2 }),
    ],
  })

  assert.equal(node.hasOfferCatalog['@type'], 'OfferCatalog')
  assert.equal(node.hasOfferCatalog.itemListElement.length, 2)
  assertValidNode(node)
})

// ---------------------------------------------------------------------------
// Breadcrumbs and FAQ.
// ---------------------------------------------------------------------------

test('breadcrumbList numbers items from 1 and resolves every item URL', () => {
  const node = breadcrumbList([
    { name: 'Home', path: '/' },
    { name: 'SAT Tutoring', path: '/test-prep/sat' },
  ])

  assert.equal(node.itemListElement.length, 2)
  assert.deepEqual(
    node.itemListElement.map((entry) => entry.position),
    [1, 2]
  )
  assert.equal(node.itemListElement[0].item, DEFAULT_SITE_URL)
  assert.equal(node.itemListElement[1].item, `${DEFAULT_SITE_URL}/test-prep/sat`)
  // Every rung points somewhere real — /test-prep itself is a 404, which is why
  // the trails are two rungs rather than three.
  for (const entry of node.itemListElement) {
    assert.ok(typeof entry.item === 'string' && entry.item.startsWith('http'))
    assert.ok(entry.name.length > 0)
  }
})

test('faqPage nests each answer inside acceptedAnswer', () => {
  const node = faqPage([
    { question: 'Are sessions online?', answer: 'All ScoreMax tutoring is 100% online.' },
    { question: 'How do I start?', answer: 'Book a free consultation.' },
  ])

  assert.equal(node['@type'], 'FAQPage')
  assert.equal(node.mainEntity.length, 2)
  assert.equal(node.mainEntity[0]['@type'], 'Question')
  assert.equal(node.mainEntity[0].name, 'Are sessions online?')
  assert.equal(node.mainEntity[0].acceptedAnswer['@type'], 'Answer')
  assert.equal(
    node.mainEntity[0].acceptedAnswer.text,
    'All ScoreMax tutoring is 100% online.'
  )
})

test('faqPage answers survive serialisation with their punctuation intact', () => {
  // The homepage FAQ shipped "We&apos;ll" for months: an HTML entity written
  // into a JSON string, which JSON.stringify has no reason to decode, so every
  // assistant quoting the answer quoted the entity. Apostrophes and quotes must
  // come back out of the round trip exactly as they went in.
  const answer = 'We’ll assess your needs — "free of charge" — and match a tutor.'
  const parsed = roundTrip(faqPage([{ question: 'What next?', answer }]))

  assert.equal(parsed.mainEntity[0].acceptedAnswer.text, answer)
  assert.ok(!parsed.mainEntity[0].acceptedAnswer.text.includes('&apos;'))
  assert.ok(!parsed.mainEntity[0].acceptedAnswer.text.includes('&quot;'))
})

test('a script-closing sequence cannot break out of the <script> tag', () => {
  // JSON.stringify alone does NOT close this: it leaves `<` untouched, and an
  // HTML parser ends a <script> at the first `</script>` in the text whatever
  // the JSON quoting around it. Tutor bios reach JSON-LD from the database, so
  // this is a live input path, not a hypothetical one.
  const hostile = 'a </script><script>alert(1)</script> b'
  const node = faqPage([{ question: 'Q', answer: hostile }])

  assert.ok(
    JSON.stringify(node).includes('</script>'),
    'precondition: plain JSON.stringify leaves the sequence intact'
  )

  const serialized = serializeJsonLd(node)
  assert.ok(!serialized.includes('<'), 'no raw < may reach the HTML parser')
  // Escaped, not mangled: a crawler still reads back exactly what was written.
  assert.equal(JSON.parse(serialized).mainEntity[0].acceptedAnswer.text, hostile)
})

test('serializeJsonLd leaves ordinary content byte-identical after parsing', () => {
  const node = educationalOrganization()
  assert.deepEqual(JSON.parse(serializeJsonLd(node)), JSON.parse(JSON.stringify(node)))
})
