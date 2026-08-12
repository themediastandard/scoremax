/**
 * Identify the SAT/ACT subjects that require the dedicated exam-prep package.
 * The booking UI and checkout route share this rule so hiding the academic
 * packages cannot be bypassed by posting a generic package id directly.
 *
 * @param {string[]} subjectIds
 * @param {Record<string, { slug?: string | null } | undefined>} subjectMap
 */
function getSatActSelection(subjectIds, subjectMap) {
  let isSAT = false
  let isACT = false

  for (const id of subjectIds) {
    const slug = String(subjectMap[id]?.slug ?? '').toLowerCase()
    if (slug.includes('sat')) isSAT = true
    if (slug.includes('act')) isACT = true
  }

  return { isSAT, isACT }
}

/**
 * @param {string[]} subjectIds
 * @param {Record<string, { slug?: string | null } | undefined>} subjectMap
 */
function hasSatOrActSubject(subjectIds, subjectMap) {
  const { isSAT, isACT } = getSatActSelection(subjectIds, subjectMap)
  return isSAT || isACT
}

/**
 * Academic memberships are not priced for SAT/ACT tutoring. Keep this rule
 * shared by the booking UI and checkout so hiding the cards cannot be bypassed
 * by posting a membership plan directly.
 *
 * @param {string[]} subjectIds
 * @param {Record<string, { slug?: string | null } | undefined>} subjectMap
 */
function canPurchaseMembershipForSubjects(subjectIds, subjectMap) {
  return !hasSatOrActSubject(subjectIds, subjectMap)
}

module.exports = {
  canPurchaseMembershipForSubjects,
  getSatActSelection,
  hasSatOrActSubject,
}
