"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Calendar, 
  Users,
  UserCheck,
  Settings, 
  LogOut, 
  BookOpen,
  CreditCard,
  DollarSign,
  GraduationCap,
} from 'lucide-react'
import { signOutAndRedirect } from '@/lib/sign-out'
import { siteImages } from '@/lib/site-images'
import { useEffect, useState } from 'react'
import { GoogleConnectionBadge } from '@/components/dashboard/GoogleConnectionBadge'
import type { AccountType } from '@/lib/account-type'

interface DashboardSidebarProps {
  role: 'admin' | 'tutor' | 'customer'
  fullName?: string | null
  membershipTier?: string | null
  accountType?: AccountType | null
  googleConnected?: boolean | null
  pendingSessionCount?: number | null
  scheduledSessionCount?: number | null
}

export function DashboardSidebar({
  role,
  fullName,
  membershipTier: serverTier,
  accountType,
  googleConnected,
  pendingSessionCount,
  scheduledSessionCount,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [tier, setTier] = useState<string | null>(serverTier ?? null)
  const [credits, setCredits] = useState<number | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    if (serverTier != null) setTier(serverTier)
  }, [serverTier])

  useEffect(() => {
    if (role !== 'customer') return
    let cancelled = false
    fetch('/api/account/membership/tier')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!cancelled) {
          if (data?.membershipTier != null) setTier(data.membershipTier)
          if (data?.credits != null) setCredits(data.credits)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [role])

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    await signOutAndRedirect('/login')
  }

  const links = [
    {
      label: 'Sessions',
      href: '/dashboard/sessions',
      icon: Calendar,
      roles: ['admin', 'tutor']
    },
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['customer']
    },
    {
      label: 'My Orders',
      href: '/dashboard/orders',
      icon: BookOpen,
      roles: ['customer']
    },
    {
      label: 'My Students',
      href: '/dashboard/students',
      icon: GraduationCap,
      roles: ['customer'],
      parentOnly: true,
    },
    {
      label: 'My Subscription',
      href: '/dashboard/subscription',
      icon: CreditCard,
      roles: ['customer']
    },
    {
      label: 'Orders',
      href: '/dashboard/orders',
      icon: BookOpen,
      roles: ['admin']
    },
    {
      label: 'My Sessions',
      href: '/dashboard/sessions',
      icon: Calendar,
      roles: ['customer']
    },
    {
      label: 'Customers',
      href: '/dashboard/customers',
      icon: UserCheck,
      roles: ['admin']
    },
    {
      label: 'Tutors',
      href: '/dashboard/tutors',
      icon: Users,
      roles: ['admin']
    },
    // Cohorts hidden — SAT/ACT course cohorts are no longer offered.
    // {
    //   label: 'Cohorts',
    //   href: '/dashboard/cohorts',
    //   icon: GraduationCap,
    //   roles: ['admin']
    // },
    {
      label: 'Pricing',
      href: '/dashboard/pricing',
      icon: DollarSign,
      roles: ['admin']
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['admin', 'tutor', 'customer']
    }
  ]

  const filteredLinks = links.filter(
    (link) => link.roles.includes(role) && (!link.parentOnly || accountType === 'parent')
  )

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-6 border-b border-gray-100">
        {role === 'customer' && fullName ? (
          <>
            <p className="text-lg font-semibold text-[#1e293b] truncate">
              {fullName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {tier && (
                <p className={`text-xs font-medium truncate ${
                  tier === 'Core'
                    ? 'text-[#b08a30] font-semibold'
                    : 'text-gray-500'
                }`}>
                  {tier} Member
                </p>
              )}
              {/* One pill, always — two branches used to both fire at exactly
                  0 (>= 0 and <= 0) and printed "0 credits" twice. */}
              <span className="inline-flex items-center rounded-full bg-[#517cad]/10 px-2 py-0.5 text-xs font-semibold text-[#4a729f]">
                {credits ?? 0} {(credits ?? 0) === 1 ? 'credit' : 'credits'}
              </span>
            </div>
          </>
        ) : (
          <>
            <Link href="/" className="inline-flex items-center">
              <Image src={siteImages.logoWide} alt="ScoreMax" width={140} height={32} className="h-6 w-auto max-w-none" />
            </Link>
            <div className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              {role} Portal
            </div>
            {role === 'admin' && googleConnected != null && (
              <GoogleConnectionBadge
                connected={googleConnected}
                href="/dashboard/settings"
                title={googleConnected
                  ? 'ScoreMax Google account is connected. Manage in Settings'
                  : 'ScoreMax Google account is disconnected. Online sessions cannot be scheduled. Click to connect.'}
                className="mt-2"
              />
            )}
          </>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-slate-50 text-[#4a729f]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-[#4a729f]" : "text-gray-400")} />
              <span className="flex-1">{link.label}</span>
              {role === 'admin' && link.href === '/dashboard/sessions' && (
                <span className="ml-3 flex items-center gap-1.5">
                  {pendingSessionCount != null && (
                    <span
                      aria-label={`${pendingSessionCount} sessions awaiting scheduling`}
                      title="Sessions awaiting scheduling"
                      className="inline-flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-800"
                    >
                      {pendingSessionCount}
                    </span>
                  )}
                  {scheduledSessionCount != null && (
                    <span
                      aria-label={`${scheduledSessionCount} scheduled sessions`}
                      title="Scheduled sessions"
                      className="inline-flex min-w-6 items-center justify-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-blue-800"
                    >
                      {scheduledSessionCount}
                    </span>
                  )}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100 shrink-0">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="group flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer touch-manipulation disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
