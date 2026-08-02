import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getCustomerMembership } from '@/lib/customer-membership'
import { getAuthUser, getProfile } from '@/lib/auth'
import { isAdminGoogleConnected } from '@/lib/google-admin'

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

  let googleConnected: boolean | null = null
  if (profile.role === 'admin') {
    googleConnected = await isAdminGoogleConnected()
  }

  return (
    <DashboardShell
      role={profile.role as 'admin' | 'tutor' | 'customer'}
      fullName={profile.full_name ?? null}
      membershipTier={membershipTier}
      googleConnected={googleConnected}
    >
      {children}
    </DashboardShell>
  )
}