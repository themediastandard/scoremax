const COURSE_TYPES = new Set(['sat', 'act', 'sat-act-combined'])

/**
 * @param {unknown} value
 * @returns {'sat' | 'act' | 'sat-act-combined' | null}
 */
function normalizeCourseType(value) {
  const normalized = String(value ?? '').toLowerCase()
  return COURSE_TYPES.has(normalized) ? normalized : null
}

/**
 * Match the same SAT/ACT subject rule enforced by the offline purchase RPC.
 * Other selected subjects are allowed, but the requested course must include
 * its exam subject and must not include the other exam unless it is combined.
 *
 * @param {'sat' | 'act' | 'sat-act-combined'} courseType
 * @param {{ isSAT: boolean, isACT: boolean }} selection
 */
function courseTypeMatchesSelection(courseType, selection) {
  if (courseType === 'sat') return selection.isSAT && !selection.isACT
  if (courseType === 'act') return selection.isACT && !selection.isSAT
  return selection.isSAT && selection.isACT
}

/**
 * The pricing row, not checkout metadata or the paid amount, is the authority
 * for which course was sold.
 *
 * @param {string | null | undefined} name
 * @returns {'sat' | 'act' | 'sat-act-combined' | null}
 */
function courseTypeFromPricingName(name) {
  const normalized = String(name ?? '').toLowerCase()
  const hasSAT = normalized.includes('sat')
  const hasACT = normalized.includes('act')
  if (hasSAT && hasACT) return 'sat-act-combined'
  if (hasACT) return 'act'
  if (hasSAT) return 'sat'
  return null
}

module.exports = {
  courseTypeFromPricingName,
  courseTypeMatchesSelection,
  normalizeCourseType,
}
