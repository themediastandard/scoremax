'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { siteImages } from '@/lib/site-images'

interface DashboardShellProps {
  role: 'admin' | 'tutor' | 'customer'
  fullName?: string | null
  membershipTier?: string | null
  googleConnected?: boolean | null
  children: React.ReactNode
}

/**
 * Responsive chrome for every dashboard page.
 *
 * Below lg the old layout rendered the fixed 256px sidebar side by side with
 * the content, which left a phone with barely 120px of usable width. Here the
 * sidebar is static from lg up and becomes a slide-in drawer behind a top-bar
 * burger on smaller screens.
 */
export function DashboardShell({
  role,
  fullName,
  membershipTier,
  googleConnected,
  children,
}: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Navigating (link tap in the drawer) should dismiss it.
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [drawerOpen])

  const sidebar = (
    <DashboardSidebar
      role={role}
      fullName={fullName}
      membershipTier={membershipTier}
      googleConnected={googleConnected}
    />
  )

  return (
    <div className="flex h-dvh flex-col lg:flex-row bg-slate-50">
      {/* Mobile top bar */}
      <header className="lg:hidden flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <Link href="/dashboard" className="flex items-center">
          <Image src={siteImages.logoWide} alt="ScoreMax" width={140} height={32} priority className="h-6 w-auto max-w-none" />
        </Link>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open dashboard menu"
          aria-expanded={drawerOpen}
          className="-mr-2 rounded-md p-2 text-gray-700 hover:bg-gray-100 touch-manipulation"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </header>

      {/* Static sidebar from lg up */}
      <div className="hidden lg:block shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden">
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm premium-backdrop"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard menu"
            className="dashboard-drawer fixed inset-y-0 left-0 z-50 flex h-dvh w-64 max-w-[85vw] bg-white shadow-2xl"
          >
            {sidebar}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close dashboard menu"
              className="absolute right-3 top-4 rounded-md p-2 text-gray-500 hover:bg-gray-100 touch-manipulation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
