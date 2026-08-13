'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Search, X } from 'lucide-react'
import { ReceiptButton } from '@/components/dashboard/ReceiptButton'
import { formatOrderAmount } from '@/lib/order-amount'
import { formatPaymentMethod, isOfflinePaymentMethod } from '@/lib/payment-method'

export interface OrderRow {
  id: string
  created_at: string
  status?: string | null
  payment_type?: string | null
  payment_method?: string | null
  session_type?: string | null
  amount_cents?: number | null
  stripe_payment_intent_id?: string | null
  subjects?: string[] | null
  payments?: Array<{ amount_cents?: number | null; payment_method?: string | null }> | null
  customers?: { full_name?: string | null; email?: string | null } | null
  student?: { id: string; full_name: string; email: string; grade: string } | null
}

interface OrdersTableProps {
  orders: OrderRow[]
  isAdmin: boolean
  subjectMap: Record<string, string>
  planLabels: Record<string, string>
}

function getOrderPaymentMethod(order: OrderRow): string | null | undefined {
  return order.payment_method ?? order.payments?.[0]?.payment_method
}

export function OrdersTable({ orders, isAdmin, subjectMap, planLabels }: OrdersTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [studentFilter, setStudentFilter] = useState('all')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const sMap = new Map(Object.entries(subjectMap))
  const getSubjectNames = (ids: string[] | null | undefined) =>
    (ids ?? []).map((id) => sMap.get(id)).filter(Boolean).join(', ') || '—'
  const studentOptions = useMemo(() => {
    const byId = new Map<string, string>()
    for (const order of orders) {
      if (order.student) byId.set(order.student.id, order.student.full_name)
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [orders])
  const hasUnassigned = orders.some((order) => !order.student)

  const filtered = useMemo(() => {
    let result = [...orders]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((o) => {
        const name = o.customers?.full_name?.toLowerCase() ?? ''
        const email = o.customers?.email?.toLowerCase() ?? ''
        const studentName = o.student?.full_name?.toLowerCase() ?? ''
        const studentEmail = o.student?.email?.toLowerCase() ?? ''
        return name.includes(q) || email.includes(q) || studentName.includes(q) || studentEmail.includes(q)
      })
    }

    if (studentFilter !== 'all') {
      result = result.filter((order) => studentFilter === 'unassigned'
        ? !order.student
        : order.student?.id === studentFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter)
    }

    if (planFilter !== 'all') {
      result = result.filter((o) => o.payment_type === planFilter)
    }

    if (typeFilter !== 'all') {
      result = result.filter((o) => o.session_type === typeFilter)
    }

    if (methodFilter !== 'all') {
      result = result.filter((o) => getOrderPaymentMethod(o) === methodFilter)
    }

    result.sort((a, b) => {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sortDir === 'desc' ? db - da : da - db
    })

    return result
  }, [orders, search, statusFilter, planFilter, typeFilter, methodFilter, studentFilter, sortDir])

  const hasFilters = search || statusFilter !== 'all' || planFilter !== 'all' || typeFilter !== 'all' || methodFilter !== 'all' || studentFilter !== 'all'

  return (
    <>
      {(isAdmin || studentOptions.length > 1 || hasUnassigned) && (
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search owner or student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
          <Select value={studentFilter} onValueChange={setStudentFilter}>
            <SelectTrigger className="w-[170px] h-9">
              <SelectValue placeholder="Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {studentOptions.map((student) => (
                <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
              ))}
              {hasUnassigned && <SelectItem value="unassigned">Student not assigned</SelectItem>}
            </SelectContent>
          </Select>
          {isAdmin && <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>}
          {isAdmin && <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="single">Single Session</SelectItem>
              <SelectItem value="package">Package</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
              <SelectItem value="course">Course</SelectItem>
            </SelectContent>
          </Select>}
          {isAdmin && <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in-person">In Person</SelectItem>
            </SelectContent>
          </Select>}
          {isAdmin && <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[155px] h-9">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="step_up">Step Up</SelectItem>
              <SelectItem value="zelle">Zelle</SelectItem>
              <SelectItem value="account_credit">Account Credit</SelectItem>
            </SelectContent>
          </Select>}
          {isAdmin && <Select value={sortDir} onValueChange={(v) => setSortDir(v as 'desc' | 'asc')}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>}
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setPlanFilter('all'); setTypeFilter('all'); setMethodFilter('all'); setStudentFilter('all') }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 ? (
        <>
        {/* Phones get stacked cards because the full order table is intentionally dense. */}
        <div className="md:hidden space-y-3">
          {filtered.map((order) => {
            const paymentMethod = getOrderPaymentMethod(order)

            return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {isAdmin && (
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Account Owner · {order.customers?.full_name ?? '—'}
                    </p>
                  )}
                  <p className="mt-1 truncate text-sm font-semibold text-[#1e293b]">
                    Student · {order.student?.full_name ?? 'Student not assigned'}
                  </p>
                  <Badge variant="secondary" className={`font-medium bg-slate-100 text-slate-600 ${isAdmin ? 'mt-1' : ''}`}>
                    {planLabels[order.id] || order.payment_type}
                  </Badge>
                  {getSubjectNames(order.subjects) !== '—' && (
                    <p className="text-xs text-gray-500 mt-1.5">{getSubjectNames(order.subjects)}</p>
                  )}
                  <p className="mt-1.5 text-xs font-medium text-gray-500">
                    {formatPaymentMethod(paymentMethod)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-[#1e293b]">{formatOrderAmount(order)}</p>
                  <span
                    className={`mt-1 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      order.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'refunded'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {order.session_type && (
                    <span className="capitalize"> · {order.session_type === 'in-person' ? 'In Person' : order.session_type}</span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  {order.stripe_payment_intent_id && !isOfflinePaymentMethod(paymentMethod) && (
                    <ReceiptButton bookingId={order.id} compact />
                  )}
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-sm text-[#4a729f] hover:text-[#3b5c85] font-medium transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
            )
          })}
        </div>

        <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                {isAdmin && (
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Owner</th>
                )}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => {
                const amountLabel = formatOrderAmount(order)
                const paymentMethod = getOrderPaymentMethod(order)

                return (
                  <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-[#1e293b]">{order.customers?.full_name ?? '—'}</p>
                        {order.customers?.email && (
                          <p className="text-xs text-gray-400 mt-0.5">{order.customers.email}</p>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <p className={`text-sm font-medium ${order.student ? 'text-[#1e293b]' : 'text-amber-700'}`}>
                        {order.student?.full_name ?? 'Student not assigned'}
                      </p>
                      {order.student && (
                        <p className="mt-0.5 text-xs text-gray-400">{order.student.grade}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-600">
                        {planLabels[order.id] || order.payment_type}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">{getSubjectNames(order.subjects)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600 capitalize">
                        {order.session_type === 'in-person' ? 'In Person' : order.session_type || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="whitespace-nowrap text-sm font-medium text-gray-600">
                        {formatPaymentMethod(paymentMethod)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-semibold text-[#1e293b]">
                        {amountLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                          order.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'refunded'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.stripe_payment_intent_id && !isOfflinePaymentMethod(paymentMethod) && (
                          <ReceiptButton bookingId={order.id} compact />
                        )}
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-sm text-[#4a729f] hover:text-[#3b5c85] font-medium transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 py-14 px-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#517cad]/10">
            <BookOpen className="h-7 w-7 text-[#4a729f]" aria-hidden="true" />
          </div>
          {hasFilters ? (
            <>
              <p className="font-semibold text-[#1e293b]">No matching orders</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-[#1e293b]">No orders yet</p>
              <p className="text-sm text-gray-500 mt-1 mx-auto max-w-sm">
                Orders for your sessions, packages, and memberships will appear here.
              </p>
              {!isAdmin && (
                <Link
                  href="/book"
                  className="mt-6 inline-flex items-center justify-center bg-[#b08a30] hover:bg-[#9a7628] text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
                >
                  Book Your First Session
                </Link>
              )}
            </>
          )}
        </div>
      )}

      {isAdmin && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </>
  )
}
