export const initialHeaderUserMenuAuthState = {
  user: null,
  role: null,
  authLoading: true,
  pendingInitialRequest: null,
}

function userId(user) {
  return user?.id ?? null
}

/**
 * Keeps async auth/profile results tied to the state that requested them.
 * Effects still own the Supabase calls; this reducer only accepts or rejects
 * their local results.
 */
export function headerUserMenuAuthReducer(state, action) {
  switch (action.type) {
    case 'initial-started':
      return {
        ...state,
        pendingInitialRequest: action.request,
      }
    case 'auth-event': {
      const nextUser = action.user
      const changedAccount = userId(nextUser) !== userId(state.user)
      return {
        ...state,
        user: nextUser,
        role: changedAccount ? null : state.role,
        authLoading: false,
        pendingInitialRequest: null,
      }
    }
    case 'initial-resolved': {
      if (state.pendingInitialRequest !== action.request) {
        return { ...state, authLoading: false }
      }

      const changedAccount = userId(action.user) !== userId(state.user)
      return {
        ...state,
        user: action.user,
        role: changedAccount ? null : state.role,
        authLoading: false,
        pendingInitialRequest: null,
      }
    }
    case 'initial-failed':
      if (state.pendingInitialRequest !== action.request) {
        return { ...state, authLoading: false }
      }
      return {
        ...state,
        user: null,
        role: null,
        authLoading: false,
        pendingInitialRequest: null,
      }
    case 'auth-timeout':
      return { ...state, authLoading: false }
    case 'role-resolved':
      if (userId(state.user) !== action.userId) return state
      return {
        ...state,
        role: {
          userId: action.userId,
          value: action.role,
        },
      }
    default:
      return state
  }
}

/**
 * Starts a profile lookup in a later macrotask. Supabase Auth invokes state
 * callbacks while holding an exclusive lock, so even an effect caused by that
 * callback must not turn into an inline client call.
 */
export function scheduleHeaderUserRoleLookup({
  userId: requestedUserId,
  loadRole,
  onResolved,
  schedule = (callback) => setTimeout(callback, 0),
  cancelSchedule = (timer) => clearTimeout(timer),
}) {
  let cancelled = false
  const timer = schedule(() => {
    Promise.resolve()
      .then(() => loadRole(requestedUserId))
      .then(
        (role) => {
          if (!cancelled) onResolved(requestedUserId, role)
        },
        () => {
          if (!cancelled) onResolved(requestedUserId, null)
        }
      )
  })

  return () => {
    cancelled = true
    cancelSchedule(timer)
  }
}
