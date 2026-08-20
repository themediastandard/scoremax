'use client'

import { useEffect, useReducer, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signOutAndRedirect } from '@/lib/sign-out'
import {
  headerUserMenuAuthReducer,
  initialHeaderUserMenuAuthState,
  scheduleHeaderUserRoleLookup,
} from '@/lib/header-user-menu-auth'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, UserPlus, LogOut, LayoutDashboard } from 'lucide-react'

export function HeaderUserMenu() {
  const [client] = useState(() => createClient())
  const [authState, dispatch] = useReducer(
    headerUserMenuAuthReducer,
    initialHeaderUserMenuAuthState
  )
  const { user } = authState
  const loadedRole = authState.role
  const role = loadedRole && loadedRole.userId === user?.id ? loadedRole.value : null
  const isRoleLoading = Boolean(user && loadedRole?.userId !== user.id)

  useEffect(() => {
    let cancelled = false
    const initialRequest = {}
    dispatch({ type: 'initial-started', request: initialRequest })

    const getInitial = async () => {
      try {
        const { data: { user: u } } = await client.auth.getUser()
        if (cancelled) return
        dispatch({ type: 'initial-resolved', request: initialRequest, user: u })
      } catch {
        if (!cancelled) dispatch({ type: 'initial-failed', request: initialRequest })
      }
    }

    const timeout = setTimeout(() => dispatch({ type: 'auth-timeout' }), 3000)
    const { data: { subscription } } = client.auth.onAuthStateChange((_, session) => {
      dispatch({ type: 'auth-event', user: session?.user ?? null })
    })
    void getInitial()

    return () => {
      cancelled = true
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [client])

  useEffect(() => {
    const userId = user?.id
    if (!userId) return

    return scheduleHeaderUserRoleLookup({
      userId,
      loadRole: async (requestedUserId) => {
        const { data: profile } = await client
          .from('profiles')
          .select('role')
          .eq('id', requestedUserId)
          .single()
        return profile?.role ?? null
      },
      onResolved: (resolvedUserId, resolvedRole) => {
        dispatch({
          type: 'role-resolved',
          userId: resolvedUserId,
          role: resolvedRole,
        })
      },
    })
  }, [client, user?.id])

  const handleSignOut = async () => {
    await signOutAndRedirect('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Account" className="p-2 rounded-lg hover:bg-gray-100 hover:text-black text-gray-700 cursor-pointer transition-colors">
          <User className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {authState.authLoading || isRoleLoading ? (
          <DropdownMenuItem disabled className="text-gray-500">
            Checking...
          </DropdownMenuItem>
        ) : user ? (
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
              <Link href={role === 'admin' || role === 'tutor' ? '/dashboard/sessions' : '/dashboard'} className="flex items-center gap-2 cursor-pointer">
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
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
