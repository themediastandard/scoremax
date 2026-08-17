'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { Search, Users, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AccountType } from '@/lib/account-type'
import { formatPhoneForDisplay } from '@/lib/phone-display'

interface Customer {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  student_grade: string | null
  account_type: AccountType | null
  created_at: string
}

interface Membership {
  tier: string
  status: string
  included_hours: number
  used_hours: number
  rollover_hours: number
}

interface ManagedStudent {
  id: string
  full_name: string
  email: string
  grade: string
  is_active: boolean
}

export interface CustomerNextSession {
  status: 'pending_scheduling' | 'scheduled'
  confirmed_start: string | null
}

interface PaymentApprovalState {
  step_up: boolean
  zelle: boolean
}

interface CustomersTableProps {
  customers: Customer[]
  membershipMap: Record<string, Membership>
  packageCreditsMap: Record<string, number>
  courseCreditsMap: Record<string, number>
  orderCountMap: Record<string, number>
  sessionCountMap: Record<string, { completed: number; upcoming: number }>
  nextSessionMap: Record<string, CustomerNextSession>
  studentMap: Record<string, ManagedStudent[]>
  paymentApprovalMap: Record<string, PaymentApprovalState>
  totalSpentMap: Record<string, number>
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'credits' | 'orders' | 'sessions'
type AttentionFilter = 'all' | 'needs-attention' | 'no-student' | 'type-not-specified' | 'missing-phone'

function getCredits(
  customerId: string,
  membershipMap: Record<string, Membership>,
  packageCreditsMap: Record<string, number>,
  courseCreditsMap: Record<string, number>
) {
  const membership = membershipMap[customerId]
  const membershipCredits = membership
    ? membership.included_hours + membership.rollover_hours - membership.used_hours
    : 0
  return (
    Math.max(0, membershipCredits) +
    (packageCreditsMap[customerId] ?? 0) +
    (courseCreditsMap[customerId] ?? 0)
  )
}

function getPlanType(
  customerId: string,
  membershipMap: Record<string, Membership>,
  packageCreditsMap: Record<string, number>,
  courseCreditsMap: Record<string, number>
): string {
  const membership = membershipMap[customerId]
  if (membership) return membership.tier
  if (packageCreditsMap[customerId] > 0) return 'package'
  if (courseCreditsMap[customerId] > 0) return 'course'
  return 'none'
}

function CustomerPlan({
  membership,
  hasPackage,
  hasCourse,
}: {
  membership?: Membership
  hasPackage: boolean
  hasCourse: boolean
}) {
  if (membership) {
    return (
      <Badge
        variant="outline"
        className={
          membership.tier === 'core'
            ? 'border-[#b08a30] text-[#b08a30]'
            : membership.tier === 'premier'
              ? 'border-purple-500 text-purple-600'
              : 'border-[#517cad] text-[#4a729f]'
        }
      >
        {membership.tier.charAt(0).toUpperCase() + membership.tier.slice(1)}
      </Badge>
    )
  }

  if (hasPackage) {
    return <Badge variant="outline" className="border-gray-300 text-gray-600">Package</Badge>
  }

  if (hasCourse) {
    return <Badge variant="outline" className="border-[#517cad] text-[#4a729f]">Course</Badge>
  }

  return <span className="text-xs text-gray-500">—</span>
}

function CompactStudents({ students }: { students: ManagedStudent[] }) {
  if (students.length === 0) {
    return <span className="text-xs font-medium text-amber-700">None</span>
  }

  const activeStudents = students.filter((student) => student.is_active)
  const displayStudents = activeStudents.length > 0 ? activeStudents : students

  if (displayStudents.length > 1) {
    return (
      <span className="text-sm font-medium text-[#1e293b]">
        {displayStudents.length} students
      </span>
    )
  }

  const first = displayStudents[0]

  return (
    <div className={first.is_active ? '' : 'opacity-60'}>
      <p className="text-sm font-medium text-[#1e293b]">{first.full_name}</p>
      <p className="text-xs text-gray-500">
        {first.grade}{first.is_active ? '' : ' · Inactive'}
      </p>
    </div>
  )
}

function PaymentAccess({ approvals }: { approvals?: PaymentApprovalState }) {
  if (!approvals?.step_up && !approvals?.zelle) {
    return <span className="text-xs text-gray-500">None</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {approvals.step_up && (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] font-medium text-emerald-700">
          Step Up
        </Badge>
      )}
      {approvals.zelle && (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-1.5 py-0 text-[10px] font-medium text-emerald-700">
          Zelle
        </Badge>
      )}
    </div>
  )
}

function formatTotalSpent(amountCents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amountCents / 100)
}

export function CustomersTable({
  customers,
  membershipMap,
  packageCreditsMap,
  courseCreditsMap,
  orderCountMap,
  sessionCountMap,
  studentMap,
  paymentApprovalMap = {},
  totalSpentMap = {},
}: CustomersTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [creditFilter, setCreditFilter] = useState('all')
  const [attentionFilter, setAttentionFilter] = useState<AttentionFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const grades = useMemo(() => {
    const set = new Set<string>()
    for (const customer of customers) {
      for (const student of studentMap[customer.id] ?? []) set.add(student.grade)
    }
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a)
      const numB = parseInt(b)
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB
      return a.localeCompare(b)
    })
  }, [customers, studentMap])

  const filtered = useMemo(() => {
    let result = [...customers]

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter((customer) => {
        const studentMatches = (studentMap[customer.id] ?? []).some(
          (student) =>
            student.full_name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query)
        )
        return (
          (customer.full_name?.toLowerCase() ?? '').includes(query) ||
          customer.email.toLowerCase().includes(query) ||
          (customer.phone?.toLowerCase() ?? '').includes(query) ||
          studentMatches
        )
      })
    }

    if (planFilter !== 'all') {
      result = result.filter(
        (customer) =>
          getPlanType(customer.id, membershipMap, packageCreditsMap, courseCreditsMap) === planFilter
      )
    }

    if (gradeFilter !== 'all') {
      result = result.filter((customer) =>
        (studentMap[customer.id] ?? []).some((student) => student.grade === gradeFilter)
      )
    }

    if (creditFilter !== 'all') {
      result = result.filter((customer) => {
        const credits = getCredits(customer.id, membershipMap, packageCreditsMap, courseCreditsMap)
        return creditFilter === 'has' ? credits > 0 : credits === 0
      })
    }

    if (attentionFilter !== 'all') {
      result = result.filter((customer) => {
        const noStudent = (studentMap[customer.id] ?? []).length === 0
        const typeNotSpecified = !customer.account_type
        const missingPhone = !customer.phone?.trim()

        switch (attentionFilter) {
          case 'needs-attention':
            return noStudent || typeNotSpecified || missingPhone
          case 'no-student':
            return noStudent
          case 'type-not-specified':
            return typeNotSpecified
          case 'missing-phone':
            return missingPhone
        }
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
            getCredits(b.id, membershipMap, packageCreditsMap, courseCreditsMap) -
            getCredits(a.id, membershipMap, packageCreditsMap, courseCreditsMap)
          )
        case 'orders':
          return (orderCountMap[b.id] ?? 0) - (orderCountMap[a.id] ?? 0)
        case 'sessions': {
          const aSessions = sessionCountMap[a.id] ?? { completed: 0, upcoming: 0 }
          const bSessions = sessionCountMap[b.id] ?? { completed: 0, upcoming: 0 }
          return bSessions.completed + bSessions.upcoming - (aSessions.completed + aSessions.upcoming)
        }
      }
    })

    return result
  }, [customers, search, planFilter, gradeFilter, creditFilter, attentionFilter, sortBy, membershipMap, packageCreditsMap, courseCreditsMap, orderCountMap, sessionCountMap, studentMap])

  const hasFilters = Boolean(
    search || planFilter !== 'all' || gradeFilter !== 'all' || creditFilter !== 'all' || attentionFilter !== 'all'
  )

  const clearFilters = () => {
    setSearch('')
    setPlanFilter('all')
    setGradeFilter('all')
    setCreditFilter('all')
    setAttentionFilter('all')
  }

  const openCustomer = (customerId: string) => router.push(`/dashboard/customers/${customerId}`)
  const openCustomerFromKeyboard = (event: KeyboardEvent<HTMLTableRowElement>, customerId: string) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    openCustomer(customerId)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            aria-label="Search customers"
            placeholder="Search owner or student..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger aria-label="Filter customers by plan" className="h-9 w-[140px]"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="premier">Premier</SelectItem>
            <SelectItem value="elite">Elite</SelectItem>
            <SelectItem value="package">Package</SelectItem>
            <SelectItem value="course">Course</SelectItem>
            <SelectItem value="none">No Plan</SelectItem>
          </SelectContent>
        </Select>

        {grades.length > 0 && (
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger aria-label="Filter customers by student grade" className="h-9 w-[130px]"><SelectValue placeholder="Grade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              {grades.map((grade) => <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        <Select value={creditFilter} onValueChange={setCreditFilter}>
          <SelectTrigger aria-label="Filter customers by available credits" className="h-9 w-[160px]"><SelectValue placeholder="Credits Available" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Credits</SelectItem>
            <SelectItem value="has">Has Credits</SelectItem>
            <SelectItem value="none">No Credits</SelectItem>
          </SelectContent>
        </Select>

        <Select value={attentionFilter} onValueChange={(value) => setAttentionFilter(value as AttentionFilter)}>
          <SelectTrigger aria-label="Filter customers needing attention" className="h-9 w-[170px]"><SelectValue placeholder="Attention" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="needs-attention">Needs Attention</SelectItem>
            <SelectItem value="no-student">No Student</SelectItem>
            <SelectItem value="type-not-specified">Type Not Specified</SelectItem>
            <SelectItem value="missing-phone">Missing Phone</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger aria-label="Sort customers" className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
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
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((customer) => {
              const membership = membershipMap[customer.id]
              const credits = getCredits(customer.id, membershipMap, packageCreditsMap, courseCreditsMap)
              const managedStudents = studentMap[customer.id] ?? []
              const detailsHref = `/dashboard/customers/${customer.id}`

              return (
                <Link
                  key={customer.id}
                  href={detailsHref}
                  className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#517cad]/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1e293b]">
                        {customer.full_name || 'Unnamed'}
                      </p>
                      <p className="truncate text-sm text-gray-600">{customer.email}</p>
                      <p className={`mt-0.5 text-xs ${customer.phone ? 'text-gray-600' : 'font-medium text-amber-700'}`}>
                        {customer.phone ? formatPhoneForDisplay(customer.phone) : 'Missing phone'}
                      </p>
                    </div>
                    <CustomerPlan
                      membership={membership}
                      hasPackage={(packageCreditsMap[customer.id] ?? 0) > 0}
                      hasCourse={(courseCreditsMap[customer.id] ?? 0) > 0}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-gray-100 pt-3 text-sm">
                    <div><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Students</p><div className="mt-1"><CompactStudents students={managedStudents} /></div></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Payment access</p><div className="mt-1"><PaymentAccess approvals={paymentApprovalMap[customer.id]} /></div></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Credits Available</p><p className="mt-1 font-semibold text-[#1e293b]">{credits}</p></div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">Orders / Total spent</p>
                      <p className="mt-1 font-medium text-[#1e293b]">{orderCountMap[customer.id] ?? 0} / {formatTotalSpent(totalSpentMap[customer.id] ?? 0)}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
            <table className="min-w-[1120px] w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Owner</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Students</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Plan</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Payment Access</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">Credits Available</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Orders / Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((customer) => {
                  const membership = membershipMap[customer.id]
                  const credits = getCredits(customer.id, membershipMap, packageCreditsMap, courseCreditsMap)
                  const managedStudents = studentMap[customer.id] ?? []

                  return (
                    <tr
                      key={customer.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`Open customer ${customer.full_name || customer.email}`}
                      onClick={() => openCustomer(customer.id)}
                      onKeyDown={(event) => openCustomerFromKeyboard(event, customer.id)}
                      className="cursor-pointer transition-colors hover:bg-gray-50/60 focus-visible:bg-[#517cad]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#517cad]/40"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-[#1e293b]">{customer.full_name || 'Unnamed'}</p>
                        <p className="mt-0.5 max-w-[240px] truncate text-xs text-gray-600">{customer.email}</p>
                        <p className={`mt-0.5 text-xs ${customer.phone ? 'text-gray-600' : 'font-medium text-amber-700'}`}>
                          {customer.phone ? formatPhoneForDisplay(customer.phone) : 'Missing phone'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5"><CompactStudents students={managedStudents} /></td>
                      <td className="px-5 py-3.5">
                        <CustomerPlan
                          membership={membership}
                          hasPackage={(packageCreditsMap[customer.id] ?? 0) > 0}
                          hasCourse={(courseCreditsMap[customer.id] ?? 0) > 0}
                        />
                      </td>
                      <td className="px-5 py-3.5"><PaymentAccess approvals={paymentApprovalMap[customer.id]} /></td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={credits > 0 ? 'inline-flex min-w-8 justify-center rounded-full bg-[#517cad]/10 px-2 py-1 text-xs font-semibold text-[#4a729f]' : 'text-sm font-medium text-gray-500'}>
                          {credits}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className="text-sm font-semibold text-[#1e293b]">{orderCountMap[customer.id] ?? 0} orders</p>
                        <p className="mt-0.5 text-xs font-medium text-gray-600">{formatTotalSpent(totalSpentMap[customer.id] ?? 0)}</p>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white py-16 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" aria-hidden="true" />
          <p className="font-medium text-gray-500">{hasFilters ? 'No matching customers' : 'No customers yet'}</p>
          <p className="mt-1 text-sm text-gray-500">
            {hasFilters ? 'Try adjusting your filters' : 'Customers will appear here after they sign up'}
          </p>
        </div>
      )}

      <p className="text-right text-xs text-gray-500">Showing {filtered.length} of {customers.length} customers</p>
    </>
  )
}
