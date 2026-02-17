'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, LayoutDashboard } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function HeaderUserMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const client = createClient()
    const getInitial = async () => {
      const { data: { user: u } } = await client.auth.getUser()
      setUser(u)
      if (u) {
        const { data: profile } = await client.from('profiles').select('role').eq('id', u.id).single()
        setRole(profile?.role ?? null)
      } else {
        setRole(null)
      }
    }
    getInitial()
    const { data: { subscription } } = client.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await client.from('profiles').select('role').eq('id', session.user.id).single()
        setRole(profile?.role ?? null)
      } else {
        setRole(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Account" className="p-2 hover:text-black text-gray-700">
          <User className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {user ? (
          <>
            {(role === 'admin' || role === 'tutor') && (
              <>
                <DropdownMenuLabel className="text-xs font-normal text-gray-500 capitalize">
                  {role}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleSignOut}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Log in
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/register" className="flex items-center gap-2 cursor-pointer">
                Register
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
