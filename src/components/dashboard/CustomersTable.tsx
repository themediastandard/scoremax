'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Users, X } from 'lucide-react'

interface Customer {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  student_grade: string | null
  created_at: string
}

interface Membership {
  tier: string
  status: string
  included_hours: number
  used_hours: number
  rollover_hours: number
}

interface CustomersTableProps {
  customers: Customer[]
  membershipMap: Record<string, Membership>
  packageCreditsMap: Record<string, number>
  orderCountMap: Record<string, number>
  sessionCountMap: Record<string, { completed: number; upcoming: number }>
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'credits' | 'orders' | 'sessions'

function getCredits(
  customerId: string,
  membershipMap: Record<string, Membership>,
  packageCreditsMap: Record<string, number>
) {
  const mem = membershipMap[customerId]
  const memCredits = mem
    ? mem.included_hours + mem.rollover_hours - mem.used_hours
    : 0
  const pkgCredits = packageCreditsMap[customerId] ?? 0
  return memCredits + pkgCredits
}

function getPlanType(
  customerId: string,
  membershipMap: Record<string, Membership>,
  packageCreditsMap: Record<string, number>
): string {
  const mem = membershipMap[customerId]
  if (mem) return mem.tier
  if (packageCreditsMap[customerId] > 0) return 'package'
  return 'none'
}

export function CustomersTable({
  customers,
  membershipMap,
  packageCreditsMap,
  orderCountMap,
  sessionCountMap,
}: CustomersTableProps) {
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [creditFilter, setCreditFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const grades = useMemo(() => {
    const set = new Set<string>()
    for (const c of customers) {
      if (c.student_grade) set.add(c.student_grade)
    }
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a)
      const numB = parseInt(b)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      return a.localeCompare(b)
    })
  }, [customers])

  const filtered = useMemo(() => {
    let result = [...customers]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) => {
        const name = c.full_name?.toLowerCase() ?? ''
        const email = c.email?.toLowerCase() ?? ''
        const phone = c.phone?.toLowerCase() ?? ''
        return name.includes(q) || email.includes(q) || phone.includes(q)
      })
    }

    if (planFilter !== 'all') {
      result = result.filter(
        (c) => getPlanType(c.id, membershipMap, packageCreditsMap) === planFilter
      )
    }

    if (gradeFilter !== 'all') {
      result = result.filter((c) => c.student_grade === gradeFilter)
    }

    if (creditFilter !== 'all') {
      result = result.filter((c) => {
        const credits = getCredits(c.id, membershipMap, packageCreditsMap)
        return creditFilter === 'has' ? credits > 0 : credits === 0
      })
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name-asc':
          return (a.full_name ?? '').localeCompare(b.full_name ?? '')
        case 'name-desc':
          return (b.full_name ?? '').localeCompare(a.full_name ?? '')
        case 'credits':
          return (
            getCredits(b.id, membershipMap, packageCreditsMap) -
            getCredits(a.id, membershipMap, packageCreditsMap)
          )
        case 'orders':
          return (orderCountMap[b.id] ?? 0) - (orderCountMap[a.id] ?? 0)
        case 'sessions': {
          const sa = sessionCountMap[a.id] ?? { completed: 0, upcoming: 0 }
          const sb = sessionCountMap[b.id] ?? { completed: 0, upcoming: 0 }
          return sb.completed + sb.upcoming - (sa.completed + sa.upcoming)
        }
        default:
          return 0
      }
    })

    return result
  }, [customers, search, planFilter, gradeFilter, creditFilter, sortBy, membershipMap, packageCreditsMap, orderCountMap, sessionCountMap])

  const hasFilters = search || planFilter !== 'all' || gradeFilter !== 'all' || creditFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setPlanFilter('all')
    setGradeFilter('all')
    setCreditFilter('all')
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="premier">Premier</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
            <SelectItem value="package">Package</SelectItem>
            <SelectItem value="none">No Plan</SelectItem>
          </SelectContent>
        </Select>

        {grades.length > 0 && (
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {grades.map((g) => (
                <SelectItem key={g} value={g}>
                  Grade {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={creditFilter} onValueChange={setCreditFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Credits" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Credits</SelectItem>
            <SelectItem value="has">Has Credits</SelectItem>
            <SelectItem value="none">No Credits</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A–Z</SelectItem>
            <SelectItem value="name-desc">Name Z–A</SelectItem>
            <SelectItem value="credits">Most Credits</SelectItem>
            <SelectItem value="orders">Most Orders</SelectItem>
            <SelectItem value="sessions">Most Sessions</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((customer) => {
                const membership = membershipMap[customer.id]
                const credits = getCredits(customer.id, membershipMap, packageCreditsMap)
                const orderCount = orderCountMap[customer.id] ?? 0
                const sessionStats = sessionCountMap[customer.id] ?? { completed: 0, upcoming: 0 }

                return (
                  <tr key={customer.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-sm text-[#1e293b]">
                        {customer.full_name || 'Unnamed'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-600">{customer.email}</p>
                      {customer.phone && (
                        <p className="text-xs text-gray-400 mt-0.5">{customer.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">
                        {customer.student_grade || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {membership ? (
                        <Badge
                          variant="outline"
                          className={
                            membership.tier === 'core'
                              ? 'border-[#b08a30] text-[#b08a30]'
                              : membership.tier === 'premier'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-[#517cad] text-[#517cad]'
                          }
                        >
                          {membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)}
                        </Badge>
                      ) : packageCreditsMap[customer.id] > 0 ? (
                        <Badge variant="outline" className="border-gray-300 text-gray-600">
                          Package
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {credits > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-[#517cad]/10 px-2.5 py-0.5 text-xs font-semibold text-[#517cad]">
                          {credits}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm text-gray-700">{orderCount}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {sessionStats.upcoming > 0 && (
                          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            {sessionStats.upcoming} upcoming
                          </span>
                        )}
                        {sessionStats.completed > 0 && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {sessionStats.completed} done
                          </span>
                        )}
                        {sessionStats.upcoming === 0 && sessionStats.completed === 0 && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs text-gray-400">
                        {new Date(customer.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-dashed border-gray-200 py-16 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          {hasFilters ? (
            <>
              <p className="text-gray-500 font-medium">No matching customers</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </>
          ) : (
            <>
              <p className="text-gray-500 font-medium">No customers yet</p>
              <p className="text-sm text-gray-400 mt-1">Customers will appear here after they sign up</p>
            </>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 text-right">
        Showing {filtered.length} of {customers.length} customers
      </p>
    </>
  )
}
