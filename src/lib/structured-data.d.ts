/**
 * Types for src/lib/structured-data.js.
 *
 * The nodes are typed loosely on purpose: JSON-LD is an open vocabulary and the
 * builders are the place where correctness is enforced, not the type system.
 * What the types do buy is that call sites cannot misspell a builder's options.
 */

export type JsonLdNode = Record<string, unknown>

export type BreadcrumbEntry = {
  name: string
  /** Site-relative path. Must resolve — a breadcrumb may not point at a 404. */
  path: string
}

export type FaqEntry = {
  question: string
  /** Must also be visible on the page that renders the markup. */
  answer: string
}

export type TutoringServiceOptions = {
  /** Site-relative canonical path of the page carrying this node. */
  path: string
  name: string
  serviceType: string
  description: string
  /** e.g. 'High school students'. Omitted when the page does not state one. */
  audienceType?: string
}

export type PricedTutoringServiceOptions = {
  path: string
  name: string
  description: string
  offers: JsonLdNode[]
}

export type PriceOfferOptions = {
  name: string
  description?: string
  price: number
  priceCurrency?: string
  /** Site-relative path. */
  url?: string
  category?: string
}

export type AggregatePriceOfferOptions = {
  name: string
  description?: string
  lowPrice: number
  offerCount?: number
  priceCurrency?: string
  /** Site-relative path. */
  url?: string
}

export const DEFAULT_SITE_URL: string
export function siteUrl(): string
export function absoluteUrl(path: string): string
export function organizationId(): string
export function organizationRef(): JsonLdNode
export function areaServed(): JsonLdNode
export function webSite(): JsonLdNode
export function educationalOrganization(): JsonLdNode
export function tutoringService(options: TutoringServiceOptions): JsonLdNode
export function pricedTutoringService(options: PricedTutoringServiceOptions): JsonLdNode
export function formatPrice(amount: number): string
export function priceOffer(options: PriceOfferOptions): JsonLdNode
export function aggregatePriceOffer(options: AggregatePriceOfferOptions): JsonLdNode
export function breadcrumbList(items: BreadcrumbEntry[]): JsonLdNode
export function faqPage(entries: FaqEntry[]): JsonLdNode
/** JSON for dangerouslySetInnerHTML on a <script>. Escapes `<`; JSON.stringify does not. */
export function serializeJsonLd(node: unknown): string
