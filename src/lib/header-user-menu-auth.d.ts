import type { User } from '@supabase/supabase-js'

export type HeaderUserRole = {
  userId: string
  value: string | null
} | null

export type HeaderUserMenuAuthState = {
  user: User | null
  role: HeaderUserRole
  authLoading: boolean
  pendingInitialRequest: object | null
}

export type HeaderUserMenuAuthAction =
  | { type: 'initial-started'; request: object }
  | { type: 'auth-event'; user: User | null }
  | { type: 'initial-resolved'; request: object; user: User | null }
  | { type: 'initial-failed'; request: object }
  | { type: 'auth-timeout' }
  | { type: 'role-resolved'; userId: string; role: string | null }

export const initialHeaderUserMenuAuthState: HeaderUserMenuAuthState

export function headerUserMenuAuthReducer(
  state: HeaderUserMenuAuthState,
  action: HeaderUserMenuAuthAction
): HeaderUserMenuAuthState

type Timer = ReturnType<typeof setTimeout>

export function scheduleHeaderUserRoleLookup(options: {
  userId: string
  loadRole: (userId: string) => Promise<string | null>
  onResolved: (userId: string, role: string | null) => void
  schedule?: (callback: () => void) => Timer
  cancelSchedule?: (timer: Timer) => void
}): () => void
