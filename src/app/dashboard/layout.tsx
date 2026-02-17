import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { getCustomerMembership } from '@/lib/customer-membership'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
    
  if (!profile) {
    redirect('/login')
  }

  let membershipTier: string | null = null
  if (profile.role === 'customer') {
    const result = await getCustomerMembership(user.id, user.email ?? null)
    membershipTier = result?.membershipTier ?? null
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar
        role={profile.role as 'admin' | 'tutor' | 'customer'}
        fullName={profile.full_name ?? null}
        membershipTier={membershipTier}
      />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}