import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TutorSessionCard } from '@/components/dashboard/TutorSessionCard'
import type { AdminTutorDetail, AdminTutorSession } from '@/lib/admin-tutor-detail'
import { BUSINESS_TIME_ZONE } from '@/lib/business-datetime'

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

function SessionSection({
  title,
  description,
  sessions,
  subjectMap,
  emptyMessage,
}: {
  title: string
  description: string
  sessions: AdminTutorSession[]
  subjectMap: Record<string, string>
  emptyMessage: string
}) {
  return (
    <Section title={`${title} (${sessions.length})`} description={description}>
      {sessions.length > 0 ? (
        <div className="space-y-4 bg-gray-50/40 px-5 py-5 sm:px-6">
          {sessions.map((session) => (
            <TutorSessionCard key={session.id} session={session} subjectMap={subjectMap} />
          ))}
        </div>
      ) : (
        <p className="px-5 py-8 text-sm text-gray-500 sm:px-6">{emptyMessage}</p>
      )}
    </Section>
  )
}

export function TutorDetailContent({ detail }: { detail: AdminTutorDetail }) {
  const { tutor, upcomingSessions, pastSessions, subjectMap } = detail
  const allSessions = [...upcomingSessions, ...pastSessions]
  const uniqueStudents = new Set(
    allSessions.map((session) => session.student?.id ?? `customer:${session.customer_id}`)
  ).size

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'All sessions', value: allSessions.length, icon: CalendarClock },
          { label: 'Upcoming', value: upcomingSessions.length, icon: CalendarCheck },
          { label: 'Past', value: pastSessions.length, icon: CheckCircle2 },
          { label: 'Students', value: uniqueStudents, icon: GraduationCap },
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
          <SessionSection
            title="Upcoming Sessions"
            description="Pending and scheduled sessions that still need to happen."
            sessions={upcomingSessions}
            subjectMap={subjectMap}
            emptyMessage="No upcoming sessions are assigned to this tutor."
          />
          <SessionSection
            title="Past Sessions"
            description="Completed, cancelled, and previously scheduled sessions."
            sessions={pastSessions}
            subjectMap={subjectMap}
            emptyMessage="No past sessions are recorded for this tutor."
          />
        </div>

        <aside className="space-y-6">
          <Section title="Tutor Profile">
            <div className="space-y-4 px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-3">
                {tutor.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- tutor photos are admin-managed storage URLs.
                  <img
                    src={tutor.photo_url}
                    alt={`${tutor.full_name} profile`}
                    className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                  />
                )}
                <Badge className={`ml-auto ${tutor.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {tutor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex gap-3">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div><p className="text-xs uppercase tracking-wider text-gray-400">Name</p><p className="text-sm font-medium text-[#1e293b]">{tutor.full_name}</p></div>
              </div>
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0"><p className="text-xs uppercase tracking-wider text-gray-400">Email</p><a href={`mailto:${tutor.email}`} className="break-all text-sm text-gray-600 hover:text-[#4a729f] hover:underline">{tutor.email}</a></div>
              </div>
              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div><p className="text-xs uppercase tracking-wider text-gray-400">Phone</p>{tutor.phone ? <a href={`tel:${tutor.phone}`} className="text-sm text-gray-600 hover:text-[#4a729f] hover:underline">{tutor.phone}</a> : <p className="text-sm text-gray-500">Not provided</p>}</div>
              </div>
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                <div><p className="text-xs uppercase tracking-wider text-gray-400">Joined</p><p className="text-sm text-gray-600">{new Date(tutor.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: BUSINESS_TIME_ZONE })}</p></div>
              </div>
            </div>
          </Section>

          <Section title="Specialties">
            <div className="flex flex-wrap gap-2 px-5 py-5 sm:px-6">
              {tutor.specialties?.length
                ? tutor.specialties.map((specialty) => <Badge key={specialty} variant="secondary" className="bg-slate-100 text-slate-700">{specialty}</Badge>)
                : <p className="text-sm text-gray-500">No specialties have been recorded.</p>}
            </div>
          </Section>

          <Section title="Bio">
            <div
              role="region"
              aria-label={`${tutor.full_name} biography`}
              tabIndex={0}
              className="max-h-none overflow-visible px-5 py-5 text-sm leading-6 text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#517cad] sm:px-6 xl:max-h-[32rem] xl:overflow-y-auto xl:overscroll-contain"
            >
              <p className="whitespace-pre-wrap">{tutor.bio || 'No bio has been added.'}</p>
            </div>
          </Section>

        </aside>
      </div>
    </>
  )
}
