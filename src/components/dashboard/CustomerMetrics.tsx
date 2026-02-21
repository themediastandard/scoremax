import { Users, Crown, CalendarCheck, Sparkles } from 'lucide-react'

interface Metric {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
}

interface CustomerMetricsProps {
  totalCustomers: number
  newThisMonth: number
  activeMemberships: number
  membershipBreakdown: { core: number; premier: number; elite: number }
  withUpcoming: number
  totalCreditsOutstanding: number
}

export function CustomerMetrics({
  totalCustomers,
  newThisMonth,
  activeMemberships,
  membershipBreakdown,
  withUpcoming,
  totalCreditsOutstanding,
}: CustomerMetricsProps) {
  const now = new Date()
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long' })

  const tierParts = [
    membershipBreakdown.core > 0 && `${membershipBreakdown.core} Core`,
    membershipBreakdown.premier > 0 && `${membershipBreakdown.premier} Premier`,
    membershipBreakdown.elite > 0 && `${membershipBreakdown.elite} Elite`,
  ].filter(Boolean)

  const metrics: Metric[] = [
    {
      label: 'Total Customers',
      value: totalCustomers.toLocaleString(),
      sub: `${newThisMonth} new in ${monthLabel}`,
      icon: <Users className="h-4 w-4" />,
      accent: 'text-[#517cad] bg-[#517cad]/10',
    },
    {
      label: 'Active Members',
      value: activeMemberships.toLocaleString(),
      sub: tierParts.length > 0 ? tierParts.join(', ') : undefined,
      icon: <Crown className="h-4 w-4" />,
      accent: 'text-[#b08a30] bg-[#b08a30]/10',
    },
    {
      label: 'Upcoming Sessions',
      value: withUpcoming.toLocaleString(),
      sub: `customer${withUpcoming !== 1 ? 's' : ''} scheduled`,
      icon: <CalendarCheck className="h-4 w-4" />,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Credits Outstanding',
      value: totalCreditsOutstanding.toLocaleString(),
      sub: 'hours across all customers',
      icon: <Sparkles className="h-4 w-4" />,
      accent: 'text-violet-600 bg-violet-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white rounded-lg border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {m.label}
            </span>
            <span className={`rounded-md p-1.5 ${m.accent}`}>
              {m.icon}
            </span>
          </div>
          <p className="text-2xl font-bold text-[#1e293b] tracking-tight">{m.value}</p>
          {m.sub && (
            <p className="text-xs text-gray-400">{m.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}
