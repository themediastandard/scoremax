import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { getCustomerMembership } from '@/lib/customer-membership'
import { getAuthUser, getProfile } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const profile = await getProfile(user.id)
    
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