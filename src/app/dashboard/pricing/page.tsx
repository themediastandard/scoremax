import { redirect } from 'next/navigation'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { PricingTable } from '@/components/dashboard/PricingTable'
import { buildSubjectCatalog, flattenSubjectCatalog } from '@/lib/subject-catalog'

const CATEGORY_LABELS: Record<string, string> = {
  'test-prep': 'Test Prep',
  'high-school': 'High School',
  'middle-school': 'Middle School',
  college: 'College',
  elementary: 'Elementary',
}

const GROUP_ORDER = ['Test Prep', 'AP Preparation', 'High School', 'Middle School', 'College', 'Elementary']

export default async function PricingPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  // One-off session rates come from the subject catalog, not the pricing
  // table — surface the effective hourly rate per category so the page shows
  // the complete picture.
  const supabase = await createClient()
  const { data: subjects } = await supabase.from('subjects').select('*').eq('is_active', true)
  const flat = flattenSubjectCatalog(buildSubjectCatalog(subjects ?? []))

  const rateGroups = new Map<string, { rateCents: number; subjects: string[] }>()
  for (const s of flat) {
    if (s.hourly_rate_cents == null) continue
    // AP subjects sit inside test-prep but carry their own (lower) rate.
    const isAp = s.category === 'test-prep' && s.hourly_rate_cents === 20000
    const label = isAp ? 'AP Preparation' : (CATEGORY_LABELS[s.category] ?? s.category)
    const g = rateGroups.get(label) ?? { rateCents: s.hourly_rate_cents, subjects: [] }
    g.subjects.push(s.name)
    g.rateCents = Math.max(g.rateCents, s.hourly_rate_cents)
    rateGroups.set(label, g)
  }
  const singleRates = GROUP_ORDER.filter((l) => rateGroups.has(l)).map((l) => {
    const g = rateGroups.get(l)!
    return { label: l, rateCents: g.rateCents, subjects: [...g.subjects].sort((a, b) => a.localeCompare(b)) }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Pricing</h1>
        <p className="mt-1 text-gray-500 text-sm">
          Manage pricing for memberships, packages, and courses. Changes apply to new bookings.
        </p>
      </div>
      <PricingTable />

      <div className="space-y-3">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1e293b]">Single Session Rates</h2>
          <p className="mt-1 text-gray-500 text-sm">
            Hourly rates for one-off sessions, set per subject category in the subject catalog.
          </p>
        </div>
        <div className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100">
          {singleRates.map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-3 px-4 sm:px-6 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{r.label}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {r.subjects.join(' · ')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ${(r.rateCents / 100).toLocaleString()}/hr
                </p>
                <span className="text-xs text-muted-foreground">Managed in code</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
