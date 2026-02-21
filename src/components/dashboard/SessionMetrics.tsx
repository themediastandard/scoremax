import { AlertCircle, UserX, CalendarClock, CheckCircle2 } from 'lucide-react'

interface Metric {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
  urgent?: boolean
}

interface SessionMetricsProps {
  needsScheduling: number
  unassigned: number
  upcomingThisWeek: number
  totalCompleted: number
  totalActive: number
}

export function SessionMetrics({
  needsScheduling,
  unassigned,
  upcomingThisWeek,
  totalCompleted,
  totalActive,
}: SessionMetricsProps) {
  const metrics: Metric[] = [
    {
      label: 'Needs Scheduling',
      value: needsScheduling.toLocaleString(),
      sub: needsScheduling > 0 ? 'require action' : 'all caught up',
      icon: <AlertCircle className="h-4 w-4" />,
      accent: needsScheduling > 0 ? 'text-amber-600 bg-amber-50' : 'text-gray-400 bg-gray-50',
      urgent: needsScheduling > 0,
    },
    {
      label: 'Unassigned',
      value: unassigned.toLocaleString(),
      sub: unassigned > 0 ? 'need a tutor' : 'all assigned',
      icon: <UserX className="h-4 w-4" />,
      accent: unassigned > 0 ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-gray-50',
      urgent: unassigned > 0,
    },
    {
      label: 'This Week',
      value: upcomingThisWeek.toLocaleString(),
      sub: `of ${totalActive} scheduled`,
      icon: <CalendarClock className="h-4 w-4" />,
      accent: 'text-[#517cad] bg-[#517cad]/10',
    },
    {
      label: 'Completed',
      value: totalCompleted.toLocaleString(),
      sub: 'all time',
      icon: <CheckCircle2 className="h-4 w-4" />,
      accent: 'text-emerald-600 bg-emerald-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div
          key={m.label}
          className={`bg-white rounded-lg border shadow-sm px-5 py-4 flex flex-col gap-1 ${
            m.urgent ? 'border-amber-200' : 'border-gray-200'
          }`}
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
