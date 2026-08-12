/**
 * Build an order label from the package grant itself. The purchase amount is
 * only a fallback because an admin may correct the granted hours afterward.
 */
function formatPackageHoursLabel(totalHours, creditFunded = false) {
  const hours = Number(totalHours)
  if (!Number.isFinite(hours) || hours <= 0) return null

  return `${hours}-Hr Package${creditFunded ? ' (Credit)' : ''}`
}

module.exports = { formatPackageHoursLabel }
