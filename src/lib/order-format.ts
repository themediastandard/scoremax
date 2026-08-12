import { formatPackageHoursLabel } from '@/lib/package-order-label'
import { formatBusinessDateTime } from '@/lib/business-datetime'

/** Format payment_type + amount into a friendly plan label */
export function formatPlanLabel(order: {
  payment_type?: string | null
  amount_cents?: number | null
  package_hours?: number | null
}): string {
  const type = order.payment_type ?? ''
  const cents = order.amount_cents ?? 0
  const packageLabel = type === 'package'
    ? formatPackageHoursLabel(order.package_hours, cents === 0)
    : null

  if (packageLabel) return packageLabel

  if (cents === 0 && type) {
    if (type === 'membership') return 'Membership Credit'
    if (type === 'package') return 'Package Credit'
    return 'Credit'
  }
  if (type === 'membership') {
    if (cents >= 89900) return 'Premier'
    if (cents >= 54900) return 'Core'
    if (cents >= 29900) return 'Starter'
    return 'Membership'
  }
  if (type === 'package') {
    if (cents >= 200000) return '20-Hr Package'
    if (cents >= 100000) return '10-Hr Package'
    return 'Package'
  }
  if (type === 'course') return 'SAT/ACT Course'
  if (type === 'sat-course-inperson') return 'In-Person SAT'
  if (type === 'single') return 'Single Session'
  return type || '—'
}

/** Format amount for display */
export function formatAmount(cents: number | null | undefined): string {
  if (cents == null) return '—'
  if (cents === 0) return 'Free (Credit)'
  return `$${(cents / 100).toLocaleString()}`
}

/** Format timestamp to readable date + time */
export function formatDateTime(ts: string | null | undefined): string {
  return formatBusinessDateTime(ts) ?? '—'
}

/** Format Postgres time "HH:mm:ss" to "h:mm AM/PM" */
export function formatTime24To12(time: string | null | undefined): string {
  if (!time) return '—'
  const str = String(time).slice(0, 5)
  const [h, m] = str.split(':').map(Number)
  if (isNaN(h)) return '—'
  const h12 = h % 12 || 12
  const ampm = h < 12 ? 'AM' : 'PM'
  return `${h12}:${(m ?? 0).toString().padStart(2, '0')} ${ampm}`
}
