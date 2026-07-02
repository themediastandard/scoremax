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
    totalCredits: availableMembershipCredits + totalPackageCredits,
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
