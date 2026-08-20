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
import { AdminAddStudentDialog } from '@/components/dashboard/AdminAddStudentDialog'
import { AdminCustomerOwnerControl } from '@/components/dashboard/AdminCustomerOwnerControl'
import { AdminStudentActions } from '@/components/dashboard/AdminStudentActions'
import { PaymentApprovalControls } from '@/components/dashboard/PaymentApprovalControls'
import { AccountTypeControl } from '@/components/dashboard/AccountTypeControl'
import type { AdminCustomerDetail } from '@/lib/admin-customer-detail'
import { formatBusinessDateTime } from '@/lib/business-datetime'
import { formatOrderAmount } from '@/lib/order-amount'
import { formatPlanLabel } from '@/lib/order-format'
import { formatPaymentMethod } from '@/lib/payment-method'
import { formatPhoneForDisplay } from '@/lib/phone-display'

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
  action,
  children,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-[#1e293b]">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
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
  const ownerEmail = customer.email.trim().toLowerCase()
  const selfStudent = students.find((student) => student.email.trim().toLowerCase() === ownerEmail)
  const hasNonSelfStudents = students.some(
    (student) => student.email.trim().toLowerCase() !== ownerEmail
  )
  const planLabels = [
    activeMembership && `${activeMembership.tier.charAt(0).toUpperCase()}${activeMembership.tier.slice(1)} membership`,
    packages.length > 0 && 'Prepaid package',
    courseEnrollments.length > 0 && 'Course',
  ].filter(Boolean) as string[]
  const orderRows = orders.map((order) => {
    const effectiveMethod = order.payment_method ?? order.payments?.[0]?.payment_method
    const linkedPackage = order.customers?.packages?.find(
      (pkg) =>
        Boolean(order.stripe_payment_intent_id) &&
        pkg.stripe_payment_intent_id === order.stripe_payment_intent_id
    )

    return {
      ...order,
      plan: formatPlanLabel({
        payment_type: order.payment_type,
        amount_cents: order.amount_cents,
        package_hours: linkedPackage?.total_hours,
      }),
      paymentMethod: formatPaymentMethod(effectiveMethod),
      amount: formatOrderAmount(order),
      date: new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }
  })
  const sessionRows = sessions.map((session) => ({
    ...session,
    statusPresentation: sessionStatus[session.status ?? ''] ?? {
      label: 'Unknown',
      className: 'bg-gray-100 text-gray-600',
    },
    dateTime: session.confirmed_start
      ? formatBusinessDateTime(session.confirmed_start)
      : 'Date not set',
  }))

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
          <Section
            title="Managed Students"
            description="Students connected to this account owner."
            action={customer.account_type === 'parent' ? (
              <AdminAddStudentDialog
                customerId={customer.id}
                customerName={customer.full_name || customer.email}
              />
            ) : undefined}
          >
            {students.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table data-managed-student-table className="w-full min-w-[560px] text-left">
                    <caption className="sr-only">Students managed by this account</caption>
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th scope="col" className="px-6 py-3">Student</th>
                        <th scope="col" className="px-4 py-3">Details</th>
                        <th scope="col" className="px-6 py-3 text-right">Status / Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          data-managed-student-two-line-row
                          className={`transition-colors hover:bg-slate-50/70 ${student.is_active ? '' : 'bg-slate-50/40'}`}
                        >
                          <th scope="row" className="max-w-64 px-6 py-3.5">
                            <div className={`flex items-center gap-3 ${student.is_active ? '' : 'opacity-70'}`}>
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#b08a30]/20 bg-[#b08a30]/10">
                                <GraduationCap className="h-4 w-4 text-[#9a7628]" aria-hidden="true" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-semibold text-[#1e293b]">{student.full_name}</span>
                                <a
                                  href={`mailto:${student.email}`}
                                  className="mt-0.5 block truncate text-xs font-medium text-slate-500 transition-colors hover:text-[#4a729f]"
                                >
                                  {student.email}
                                </a>
                              </span>
                            </div>
                          </th>
                          <td className="px-4 py-3.5">
                            {student.phone ? (
                              <a
                                href={`tel:${student.phone}`}
                                className="block text-sm font-medium text-slate-700 transition-colors hover:text-[#4a729f]"
                              >
                                {formatPhoneForDisplay(student.phone)}
                              </a>
                            ) : (
                              <p className="text-sm font-semibold text-amber-700">Phone not provided</p>
                            )}
                            <p className="mt-0.5 text-xs font-medium text-slate-500">
                              Grade {student.grade}
                              <span className="px-1.5 text-slate-300" aria-hidden="true">•</span>
                              {studentCreditMap.get(student.id) ?? 0} reserved credits
                            </p>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <Badge
                                variant="outline"
                                className={`shrink-0 border-0 px-2 py-0.5 ${
                                  student.is_active
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${student.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {student.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <AdminStudentActions
                                customerId={customer.id}
                                studentId={student.id}
                                studentName={student.full_name}
                                studentPhone={student.phone}
                                isActive={student.is_active}
                                isAccountOwner={customer.account_type === 'student' && selfStudent?.id === student.id}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {students.map((student) => (
                    <article
                      key={student.id}
                      data-managed-student-card
                      className={`px-5 py-4 ${student.is_active ? 'bg-white' : 'bg-slate-50/70'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#b08a30]/20 bg-[#b08a30]/10">
                            <GraduationCap className="h-4 w-4 text-[#9a7628]" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#1e293b]">{student.full_name}</p>
                            <p className="truncate text-sm font-medium text-slate-600">{student.email}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-start gap-1">
                          <Badge
                            variant="outline"
                            className={`mt-1 shrink-0 border-0 px-2 py-0.5 ${
                              student.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {student.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <AdminStudentActions
                            customerId={customer.id}
                            studentId={student.id}
                            studentName={student.full_name}
                            studentPhone={student.phone}
                            isActive={student.is_active}
                            isAccountOwner={customer.account_type === 'student' && selfStudent?.id === student.id}
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                        <span>Grade {student.grade}</span>
                        <span>{studentCreditMap.get(student.id) ?? 0} reserved credits</span>
                        {student.phone ? (
                          <a href={`tel:${student.phone}`} className="text-[#4a729f]">
                            {formatPhoneForDisplay(student.phone)}
                          </a>
                        ) : (
                          <span className="font-semibold text-amber-700">Phone not provided</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center px-5 py-10 text-center sm:px-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <GraduationCap className="h-6 w-6 text-slate-400" aria-hidden="true" />
                </div>
                <p className="mt-3 font-semibold text-[#1e293b]">No managed students yet</p>
                <p className="mt-1 max-w-md text-sm leading-6 text-gray-500">
                  {customer.account_type === 'parent'
                    ? 'Add the first student so this account can create bookings and orders for them.'
                    : 'Complete or correct the account type before adding a managed student.'}
                </p>
              </div>
            )}
          </Section>

          <Section title={`Orders (${orders.length})`} description="Purchases and bookings made by this account.">
            {orderRows.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table data-customer-orders-table className="w-full min-w-[720px] text-left">
                    <caption className="sr-only">Orders placed by this account</caption>
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th scope="col" className="px-6 py-3">Plan</th>
                        <th scope="col" className="px-4 py-3">Student</th>
                        <th scope="col" className="px-4 py-3">Payment</th>
                        <th scope="col" className="px-4 py-3">Amount</th>
                        <th scope="col" className="px-4 py-3">Date</th>
                        <th scope="col" className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderRows.map((order) => (
                        <tr key={order.id} className="transition-colors hover:bg-slate-50/70">
                          <th scope="row" className="px-6 py-3.5">
                            <Link
                              href={`/dashboard/orders/${order.id}`}
                              className="font-semibold text-[#1e293b] transition-colors hover:text-[#4a729f] hover:underline"
                            >
                              {order.plan}
                            </Link>
                          </th>
                          <td className="px-4 py-3.5 text-sm font-medium text-slate-700">
                            {order.student?.full_name ?? 'Not assigned'}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-600">{order.paymentMethod}</td>
                          <td className="px-4 py-3.5 text-sm font-semibold text-[#1e293b]">{order.amount}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">{order.date}</td>
                          <td className="px-6 py-3.5 text-right">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${orderStatus[order.status ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                              {(order.status ?? 'Unknown').replaceAll('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {orderRows.map((order) => (
                    <article key={order.id} data-customer-order-card className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="font-semibold text-[#1e293b] hover:text-[#4a729f] hover:underline"
                        >
                          {order.plan}
                        </Link>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${orderStatus[order.status ?? ''] ?? 'bg-gray-100 text-gray-600'}`}>
                          {(order.status ?? 'Unknown').replaceAll('_', ' ')}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {order.student?.full_name ?? 'Student not assigned'} · {order.paymentMethod}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                        <span className="font-semibold text-[#1e293b]">{order.amount}</span>
                        <span className="text-xs font-medium text-slate-500">{order.date}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 sm:px-6">No completed orders yet.</p>
            )}
          </Section>

          <Section title={`Sessions (${sessions.length})`} description="Scheduled, pending, and completed tutoring sessions.">
            {sessionRows.length > 0 ? (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table data-customer-sessions-table className="w-full min-w-[720px] text-left">
                    <caption className="sr-only">Tutoring sessions for this account</caption>
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th scope="col" className="px-6 py-3">Student</th>
                        <th scope="col" className="px-4 py-3">Tutor</th>
                        <th scope="col" className="px-4 py-3">Date &amp; Time</th>
                        <th scope="col" className="px-6 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessionRows.map((session) => (
                        <tr key={session.id} className="transition-colors hover:bg-slate-50/70">
                          <th scope="row" className="px-6 py-3.5 font-semibold text-[#1e293b]">
                            {session.student?.full_name ?? 'Not assigned'}
                          </th>
                          <td className="px-4 py-3.5 text-sm font-medium text-slate-700">
                            {session.tutors?.full_name ?? 'Not assigned'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-sm text-slate-600">{session.dateTime}</td>
                          <td className="px-6 py-3.5 text-right">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${session.statusPresentation.className}`}>
                              {session.statusPresentation.label}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-slate-100 md:hidden">
                  {sessionRows.map((session) => (
                    <article key={session.id} data-customer-session-card className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-[#1e293b]">
                          {session.student?.full_name ?? 'Student not assigned'}
                        </p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${session.statusPresentation.className}`}>
                          {session.statusPresentation.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {session.tutors?.full_name ?? 'Tutor not assigned'}
                      </p>
                      <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium text-slate-600">
                        {session.dateTime}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-500 sm:px-6">No sessions yet.</p>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <Section
            title="Account Owner"
            action={(
              <AdminCustomerOwnerControl
                customerId={customer.id}
                customerEmail={customer.email}
                initialName={customer.full_name}
                initialPhone={customer.phone}
              />
            )}
          >
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
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-gray-400">Phone</p>
                  {customer.phone ? (
                    <a href={`tel:${customer.phone}`} className="text-sm text-gray-600 hover:text-[#4a729f] hover:underline">
                      {formatPhoneForDisplay(customer.phone)}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-amber-700">Not provided</p>
                  )}
                </div>
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

          <Section title="Account Type" description="Complete a blank account or safely correct an existing classification.">
            <div className="px-5 py-5 sm:px-6">
              <AccountTypeControl
                customerId={customer.id}
                customerName={customer.full_name || customer.email}
                customerEmail={customer.email}
                customerPhone={customer.phone}
                customerGrade={customer.student_grade}
                selfStudentPhone={selfStudent?.phone ?? null}
                selfStudentGrade={selfStudent?.grade ?? null}
                initialAccountType={customer.account_type}
                hasActiveStudents={activeStudents.length > 0}
                hasNonSelfStudents={hasNonSelfStudents}
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
