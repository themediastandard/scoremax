/**
 * The business details published on /privacy, /terms and /refund-policy.
 *
 * Kept in one place because the same entity name, address and contact address
 * appear on all three pages, and an inconsistency between them is exactly the
 * kind of thing that undermines the documents they appear in.
 *
 * Supplied by the client on 2026-07-31, except where noted below.
 */

export const LEGAL_ENTITY_NAME = 'Scoremax, LLC'

export const BUSINESS_ADDRESS = '490 SW 63rd Avenue, Plantation, FL 33317'

/**
 * The client named this address for refunds and general contact. They did not
 * answer which address should receive privacy requests, so it defaults here —
 * confirm before launch, and split it out if they would rather those went
 * somewhere else.
 */
export const PRIVACY_EMAIL = 'taimir.scoremax@gmail.com'
export const REFUNDS_EMAIL = 'taimir.scoremax@gmail.com'
export const CONTACT_EMAIL = 'taimir.scoremax@gmail.com'

/**
 * Asked which state governs the terms and which court hears disputes, the
 * client answered "Nationwide" — which is not a jurisdiction. Defaulted to the
 * state and county of the registered address in Plantation. Needs confirming;
 * a governing-law clause naming the wrong forum is worse than none.
 */
export const GOVERNING_LAW = 'the State of Florida, United States'
export const JURISDICTION = 'Broward County, Florida'

/** Years account and booking records are kept after an account closes. */
export const RECORD_RETENTION_YEARS = 7

/** Days to respond to a privacy or data-subject request. */
export const PRIVACY_RESPONSE_DAYS = 30

/** Hours' notice required to cancel or reschedule without losing the session. */
export const CANCELLATION_NOTICE_HOURS = 24

/**
 * Business days to respond to a refund request. The client answered "14 days"
 * to a question that asked in business days; the longer reading is used, since
 * publishing a shorter window than they can meet is the riskier error.
 */
export const REFUND_RESPONSE_BUSINESS_DAYS = 14
