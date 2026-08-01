/**
 * @param {{
 *   customer?: { full_name?: string | null } | null,
 *   membership?: { tier?: string | null, included_hours?: number | null, used_hours?: number | null, rollover_hours?: number | null } | null,
 *   packages?: Array<{ remaining_hours?: number | null }> | null,
 *   courseEnrollments?: Array<{ remaining_sessions?: number | null }> | null,
 * }} [input]
 */
function sanitizeCustomerCreditSummary({
  customer = null,
  membership = null,
  packages = [],
  courseEnrollments = [],
} = {}) {
  const availableMembershipCredits = membership
    ? Math.max(
        0,
        (membership.included_hours ?? 0) -
          (membership.used_hours ?? 0) +
          (membership.rollover_hours ?? 0)
      )
    : 0
  const sanitizedPackages = (packages ?? []).map((pkg) => ({
    remaining_hours: pkg.remaining_hours ?? 0,
  }))
  const sanitizedCourses = (courseEnrollments ?? []).map((course) => ({
    remaining_sessions: course.remaining_sessions ?? 0,
  }))
  const totalPackageCredits = sanitizedPackages.reduce(
    (sum, pkg) => sum + (pkg.remaining_hours ?? 0),
    0
  )
  const totalCourseSessions = sanitizedCourses.reduce(
    (sum, course) => sum + (course.remaining_sessions ?? 0),
    0
  )
  const sanitizedMembership = membership
    ? {
        tier: membership.tier,
        included_hours: membership.included_hours ?? 0,
        used_hours: membership.used_hours ?? 0,
        rollover_hours: membership.rollover_hours ?? 0,
      }
    : null

  return {
    customer: customer ? { full_name: customer.full_name } : null,
    membership: sanitizedMembership,
    packages: sanitizedPackages,
    courseEnrollments: sanitizedCourses,
    isMember: !!membership,
    hasCredits:
      availableMembershipCredits > 0 ||
      totalPackageCredits > 0 ||
      totalCourseSessions > 0,
    // Course sessions are spendable exactly like membership and package hours —
    // redeem_credit_and_create_booking() treats course_enrollments as its third
    // credit source. Excluding them here told a course-only customer "You have 0
    // credits remaining" directly above "Including 10 course sessions."
    totalCredits:
      availableMembershipCredits + totalPackageCredits + totalCourseSessions,
    totalCourseSessions,
  }
}

function emptyCustomerCreditSummary() {
  return sanitizeCustomerCreditSummary()
}

module.exports = {
  emptyCustomerCreditSummary,
  sanitizeCustomerCreditSummary,
}
