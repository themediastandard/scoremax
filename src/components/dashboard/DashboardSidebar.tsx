"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  LogOut, 
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DashboardSidebarProps {
  role: 'admin' | 'tutor' | 'customer'
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'tutor', 'customer']
    },
    {
      label: 'My Orders',
      href: '/dashboard/orders',
      icon: BookOpen,
      roles: ['customer']
    },
    {
      label: 'All Orders',
      href: '/dashboard/orders',
      icon: BookOpen,
      roles: ['admin']
    },
    {
      label: 'Sessions',
      href: '/dashboard/sessions',
      icon: Calendar,
      roles: ['admin', 'tutor']
    },
    {
      label: 'Tutors',
      href: '/dashboard/tutors',
      icon: Users,
      roles: ['admin']
    },
    {
      label: 'Cohorts',
      href: '/dashboard/cohorts',
      icon: GraduationCap,
      roles: ['admin']
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['admin', 'tutor', 'customer']
    }
  ]

  const filteredLinks = links.filter(link => link.roles.includes(role))

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="text-2xl font-serif font-bold text-[#1e293b]">
          ScoreMax
        </Link>
        <div className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500">
          {role} Portal
        </div>
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
                  ? "bg-slate-50 text-[#517cad]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-[#517cad]" : "text-gray-400")} />
              {link.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
          Sign Out
        </button>
      </div>
    </div>
  )
}