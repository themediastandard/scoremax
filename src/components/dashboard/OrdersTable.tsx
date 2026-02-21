'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Search, X } from 'lucide-react'
import { ReceiptButton } from '@/components/dashboard/ReceiptButton'
import { formatAmount } from '@/lib/order-format'

interface OrdersTableProps {
  orders: any[]
  isAdmin: boolean
  subjectMap: Record<string, string>
  planLabels: Record<string, string>
}

export function OrdersTable({ orders, isAdmin, subjectMap, planLabels }: OrdersTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [planFilter, setPlanFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc')

  const sMap = new Map(Object.entries(subjectMap))
  const getSubjectNames = (ids: string[] | null) =>
    (ids ?? []).map((id) => sMap.get(id)).filter(Boolean).join(', ') || '—'

  const filtered = useMemo(() => {
    let result = [...orders]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((o) => {
        const name = o.customers?.full_name?.toLowerCase() ?? ''
        const email = o.customers?.email?.toLowerCase() ?? ''
        return name.includes(q) || email.includes(q)
      })
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

    result.sort((a, b) => {
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sortDir === 'desc' ? db - da : da - db
    })

    return result
  }, [orders, search, statusFilter, planFilter, typeFilter, sortDir])

  const hasFilters = search || statusFilter !== 'all' || planFilter !== 'all' || typeFilter !== 'all'

  return (
    <>
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
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
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="in-person">In Person</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortDir} onValueChange={(v) => setSortDir(v as 'desc' | 'asc')}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setPlanFilter('all'); setTypeFilter('all') }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                {isAdmin && (
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                )}
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order: any) => {
                const amt = order.amount_cents || order.payments?.[0]?.amount_cents

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
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-semibold text-[#1e293b]">
                        {amt ? formatAmount(amt) : '—'}
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
                        {order.stripe_payment_intent_id && (
                          <ReceiptButton bookingId={order.id} compact />
                        )}
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-sm text-[#517cad] hover:text-[#3b5c85] font-medium transition-colors"
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
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          {hasFilters ? (
            <>
              <p className="text-gray-500 font-medium">No matching orders</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">Your orders will appear here</p>
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
