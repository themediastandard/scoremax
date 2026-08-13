import Link from 'next/link'
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Mail,
  Phone,
  ReceiptText,
  UserRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PaymentApprovalControls } from '@/components/dashboard/PaymentApprovalControls'
import { AccountTypeControl } from '@/components/dashboard/AccountTypeControl'
import type { AdminCustomerDetail } from '@/lib/admin-customer-detail'
import { formatBusinessDateTime } from '@/lib/business-datetime'
import { formatOrderAmount } from '@/lib/order-amount'
import { formatPlanLabel } from '@/lib/order-format'
import { formatPaymentMethod } from '@/lib/payment-method'

const sessionStatus: Record<string, { label: string; className: string }> = {
  pending_scheduling: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700' },
}

const orderStatus: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  refunded: 'bg-red-50 text-red-700',
  pending_payment: 'bg-gray-100 text-gray-600',
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-[#1e293b]">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export function CustomerDetailContent({ detail }: { detail: AdminCustomerDetail }) {
  const { customer, students, memberships, packages, courseEnrollments, orders, sessions, approvals } = detail
  const activeMembership = memberships.find((membership) => membership.status === 'active')
  const membershipCredits = activeMembership
    ? Math.max(0, activeMembership.included_hours + activeMembership.rollover_hours - activeMembership.used_hours)
    : 0
  const familyPackageCredits = packages
    .filter((pkg) => !pkg.student_id)
    .reduce((sum, pkg) => sum + pkg.remaining_hours, 0)
  const familyCredits = membershipCredits + familyPackageCredits
  const studentCreditMap = new Map<string, number>()

  for (const grant of [...packages, ...courseEnrollments]) {
    if (!grant.student_id) continue
    const credits = 'remaining_hours' in grant ? grant.remaining_hours : grant.remaining_sessions
    studentCreditMap.set(grant.student_id, (studentCreditMap.get(grant.student_id) ?? 0) + credits)
  }

  const studentCredits = Array.from(studentCreditMap.values()).reduce((sum, credits) => sum + credits, 0)
  const totalCredits = familyCredits + studentCredits
  const activeStudents = students.filter((student) => student.is_active)
  const planLabels = [
    activeMembership && `${activeMembership.tier.charAt(0).toUpperCase()}${activeMembership.tier.slice(1)} membership`,
    packages.length > 0 && 'Prepaid package',
    courseEnrollments.length > 0 && 'Course',
  ].filter(Boolean) as string[]

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Plan', value: planLabels.join(' + ') || 'No active plan', icon: CreditCard },
          { label: 'Credits', value: totalCredits.toString(), icon: CheckCircle2 },
          { label: 'Students', value: activeStudents.length.toString(), icon: GraduationCap },
          { label: 'Orders', value: orders.length.toString(), icon: ReceiptText },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{item.label}</p>
                <Icon className="h-4 w-4 text-[#4a729f]" />
              </div>
              <p className="mt-1 text-lg font-semibold text-[#1e293b]">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Section title="Managed Students" description="Students connected to this account owner.">
            {students.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {students.map((student) => (
                  <div key={student.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className={student.is_active ? '' : 'opacity-60'}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#1e293b]">{student.full_name}</p>
                        {!student.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </div>
                      <p className="mt-0.5 break-all text-sm text-gray-500">{student.email}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{student.phone || 'Phone not provided'}</p>
                    </div>
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400">Grade</p>
                        <p className="text-sm font-medium text-[#1e293b]">{student.grade}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-400">Reserved credits</p>
                        <p className="text-sm font-medium text-[#1e293b]">{studentCreditMap.get(student.id) ?? 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 sm:px-6">No managed students have been added.</p>
            )}
          </Section>

          <Section title={`Orders (${orders.length})`} description="Purchases and bookings made by this account.">
            {orders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const effectiveMethod = order.payment_method ?? order.payments?.[0]?.payment_method
                  const linkedPackage = order.customers?.packages?.find(
                    (pkg) =>
                      Boolean(order.stripe_payment_intent_id) &&
                      pkg.stripe_payment_intent_id === order.stripe_payment_intent_id
                  )
                  return (
                    <div key={order.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-[#1e293b] hover:text-[#4a729f] hover:underline">
                            {formatPlanLabel({
                              payment_type: order.payment_type,
                              amount_cents: order.amount_cents,
                              package_hours: linkedPackage?.total_hours,
                            })}
                          </Link>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${orderStatus[order.status ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                            {(order.status ?? 'Unknown').replaceAll('_', ' ')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {order.student?.full_name ?? 'Student not assigned'} · {formatPaymentMethod(effectiveMethod)}
                        </p>
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="font-semibold text-[#1e293b]">{formatOrderAmount(order)}</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 sm:px-6">No completed orders yet.</p>
            )}
          </Section>

          <Section title={`Sessions (${sessions.length})`} description="Scheduled, pending, and completed tutoring sessions.">
            {sessions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {sessions.map((session) => {
                  const status = sessionStatus[session.status ?? ''] ?? { label: 'Unknown', className: 'bg-gray-100 text-gray-600' }
                  return (
                    <div key={session.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[#1e293b]">{session.student?.full_name ?? 'Student not assigned'}</p>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>{status.label}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {session.tutors?.full_name ?? 'Tutor not assigned'}
                          {session.session_type ? ` · ${session.session_type === 'in-person' ? 'In Person' : 'Online'}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm text-gray-600 sm:max-w-[15rem] sm:text-right">
                        {session.confirmed_start ? formatBusinessDateTime(session.confirmed_start) : 'Date not set'}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 sm:px-6">No sessions yet.</p>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Account Owner">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="flex gap-3">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div><p className="text-xs uppercase tracking-wider text-gray-400">Name</p><p className="text-sm font-medium text-[#1e293b]">{customer.full_name || 'Unnamed'}</p></div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0"><p className="text-xs uppercase tracking-wider text-gray-400">Email</p><p className="break-all text-sm text-gray-600">{customer.email}</p></div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div><p className="text-xs uppercase tracking-wider text-gray-400">Phone</p><p className="text-sm text-gray-600">{customer.phone || 'Not provided'}</p></div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div><p className="text-xs uppercase tracking-wider text-gray-400">Joined</p><p className="text-sm text-gray-600">{new Date(customer.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p></div>
              </div>
            </div>
          </Section>

          <Section title="Payment Approvals" description="Allow this account to purchase with Step Up or Zelle.">
            <div className="px-5 py-5 sm:px-6">
              <PaymentApprovalControls
                customerId={customer.id}
                customerName={customer.full_name || customer.email}
                initialApprovals={approvals}
                idScope="desktop"
              />
            </div>
          </Section>

          <Section title="Account Type" description="Controls whether this account belongs to a parent/guardian or a student.">
            <div className="px-5 py-5 sm:px-6">
              <AccountTypeControl
                customerId={customer.id}
                customerName={customer.full_name || customer.email}
                initialAccountType={customer.account_type}
              />
            </div>
          </Section>

          <Section title="Credit Breakdown">
            <div className="space-y-3 px-5 py-5 text-sm sm:px-6">
              <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Family credits</span><span className="font-semibold text-[#1e293b]">{familyCredits}</span></div>
              <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Student credits</span><span className="font-semibold text-[#1e293b]">{studentCredits}</span></div>
              <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3"><span className="font-medium text-[#1e293b]">Total available</span><span className="font-semibold text-[#1e293b]">{totalCredits}</span></div>
              <p className="pt-1 text-xs leading-5 text-gray-400">Family credits can be used for any selected student. Reserved credits stay with the named student.</p>
            </div>
          </Section>
        </aside>
      </div>
    </>
  )
}
