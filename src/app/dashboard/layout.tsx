import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getCustomerMembership } from '@/lib/customer-membership'
import { getAuthUser, getProfile } from '@/lib/auth'
import { isAdminGoogleConnected } from '@/lib/google-admin'
import { createClient } from '@/lib/supabase/server'
import type { AccountType } from '@/lib/account-type'

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
  let accountType: AccountType | null = null
  if (profile.role === 'customer') {
    const result = await getCustomerMembership(user.id, user.email ?? null)
    membershipTier = result?.membershipTier ?? null
    accountType = result?.accountType ?? null
  }

  let googleConnected: boolean | null = null
  let pendingSessionCount: number | null = null
  let scheduledSessionCount: number | null = null
  if (profile.role === 'admin') {
    const supabase = await createClient()
    const [connectionStatus, pendingSessionsResult, scheduledSessionsResult] = await Promise.all([
      isAdminGoogleConnected(),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_scheduling'),
      supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled'),
    ])

    googleConnected = connectionStatus
    pendingSessionCount = pendingSessionsResult.error
      ? null
      : pendingSessionsResult.count ?? 0
    scheduledSessionCount = scheduledSessionsResult.error
      ? null
      : scheduledSessionsResult.count ?? 0
  }

  return (
    <DashboardShell
      role={profile.role as 'admin' | 'tutor' | 'customer'}
      fullName={profile.full_name ?? null}
      membershipTier={membershipTier}
      accountType={accountType}
      googleConnected={googleConnected}
      pendingSessionCount={pendingSessionCount}
      scheduledSessionCount={scheduledSessionCount}
    >
      {children}
    </DashboardShell>
  )
}
