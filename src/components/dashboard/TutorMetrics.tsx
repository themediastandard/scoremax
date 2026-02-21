import { Users, UserCheck, CalendarCheck, BookOpen } from 'lucide-react'

interface Metric {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent: string
}

interface TutorMetricsProps {
  totalTutors: number
  activeTutors: number
  totalUpcoming: number
  totalCompleted: number
  subjectsCovered: number
}

export function TutorMetrics({
  totalTutors,
  activeTutors,
  totalUpcoming,
  totalCompleted,
  subjectsCovered,
}: TutorMetricsProps) {
  const metrics: Metric[] = [
    {
      label: 'Total Tutors',
      value: totalTutors.toLocaleString(),
      sub: `${activeTutors} active`,
      icon: <Users className="h-4 w-4" />,
      accent: 'text-[#517cad] bg-[#517cad]/10',
    },
    {
      label: 'Upcoming Sessions',
      value: totalUpcoming.toLocaleString(),
      sub: 'assigned to tutors',
      icon: <CalendarCheck className="h-4 w-4" />,
      accent: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Completed Sessions',
      value: totalCompleted.toLocaleString(),
      sub: 'all time',
      icon: <UserCheck className="h-4 w-4" />,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Subjects Covered',
      value: subjectsCovered.toLocaleString(),
      sub: 'across all tutors',
      icon: <BookOpen className="h-4 w-4" />,
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
