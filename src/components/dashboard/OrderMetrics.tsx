import { DollarSign, TrendingUp, RotateCcw, ShoppingBag } from 'lucide-react'

interface Metric {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
}

interface OrderMetricsProps {
  monthRevenue: number
  allTimeRevenue: number
  refundTotal: number
  refundCount: number
  monthOrderCount: number
  avgOrderValue: number
}

function fmt(cents: number): string {
  if (cents === 0) return '$0'
  return `$${(cents / 100).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function OrderMetrics({
  monthRevenue,
  allTimeRevenue,
  refundTotal,
  refundCount,
  monthOrderCount,
  avgOrderValue,
}: OrderMetricsProps) {
  const now = new Date()
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long' })

  const metrics: Metric[] = [
    {
      label: `${monthLabel} Revenue`,
      value: fmt(monthRevenue),
      sub: `${monthOrderCount} order${monthOrderCount !== 1 ? 's' : ''}`,
      icon: <TrendingUp className="h-4 w-4" />,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'All-Time Revenue',
      value: fmt(allTimeRevenue),
      icon: <DollarSign className="h-4 w-4" />,
      accent: 'text-[#517cad] bg-[#517cad]/10',
    },
    {
      label: 'Avg. Order Value',
      value: fmt(avgOrderValue),
      icon: <ShoppingBag className="h-4 w-4" />,
      accent: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'Refunds',
      value: fmt(refundTotal),
      sub: refundCount > 0 ? `${refundCount} order${refundCount !== 1 ? 's' : ''}` : undefined,
      icon: <RotateCcw className="h-4 w-4" />,
      accent: refundCount > 0 ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50',
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
