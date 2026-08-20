import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  headerUserMenuAuthReducer,
  initialHeaderUserMenuAuthState,
  scheduleHeaderUserRoleLookup,
} from '../src/lib/header-user-menu-auth.js'

const source = readFileSync(
  new URL('../src/components/HeaderUserMenu.tsx', import.meta.url),
  'utf8'
)

const user = (id) => ({ id })
const freshState = () => ({ ...initialHeaderUserMenuAuthState })

test('an auth event wins when the initial user request resolves late', () => {
  const request = {}
  let state = headerUserMenuAuthReducer(freshState(), {
    type: 'initial-started',
    request,
  })

  state = headerUserMenuAuthReducer(state, {
    type: 'auth-event',
    user: user('account-b'),
  })
  assert.equal(state.user.id, 'account-b')
  assert.equal(state.authLoading, false)

  state = headerUserMenuAuthReducer(state, {
    type: 'initial-resolved',
    request,
    user: user('account-a'),
  })
  assert.equal(state.user.id, 'account-b')

  const signOutRequest = {}
  state = headerUserMenuAuthReducer(state, {
    type: 'initial-started',
    request: signOutRequest,
  })
  state = headerUserMenuAuthReducer(state, { type: 'auth-event', user: null })
  state = headerUserMenuAuthReducer(state, {
    type: 'initial-resolved',
    request: signOutRequest,
    user: user('account-b'),
  })
  assert.equal(state.user, null)
})

test('stale roles cannot cross an account change and same-user auth events preserve a loaded role', () => {
  const loadedRole = { userId: 'account-a', value: 'admin' }
  let state = {
    ...freshState(),
    user: user('account-a'),
    role: loadedRole,
    authLoading: false,
  }

  state = headerUserMenuAuthReducer(state, {
    type: 'auth-event',
    user: user('account-a'),
  })
  assert.equal(state.role, loadedRole, 'TOKEN_REFRESHED/SIGNED_IN for the same ID keeps its role')

  state = headerUserMenuAuthReducer(state, {
    type: 'auth-event',
    user: user('account-b'),
  })
  assert.equal(state.role, null)

  const beforeLateRole = state
  state = headerUserMenuAuthReducer(state, {
    type: 'role-resolved',
    userId: 'account-a',
    role: 'admin',
  })
  assert.equal(state, beforeLateRole)
  assert.equal(state.user.id, 'account-b')
  assert.equal(state.role, null)
})

test('role lookup is deferred to a macrotask and cancellation blocks late updates', async () => {
  let scheduled
  let cancelledTimer = null
  let loadCalls = 0
  let resolveRole
  const rolePromise = new Promise((resolve) => {
    resolveRole = resolve
  })
  const resolved = []

  const cancel = scheduleHeaderUserRoleLookup({
    userId: 'account-a',
    loadRole: async () => {
      loadCalls += 1
      return rolePromise
    },
    onResolved: (userId, role) => resolved.push({ userId, role }),
    schedule: (callback) => {
      scheduled = callback
      return 17
    },
    cancelSchedule: (timer) => {
      cancelledTimer = timer
    },
  })

  assert.equal(loadCalls, 0, 'the Supabase lookup must not run inline')
  scheduled()
  await Promise.resolve()
  assert.equal(loadCalls, 1)

  cancel()
  resolveRole('admin')
  await rolePromise
  await Promise.resolve()
  assert.equal(cancelledTimer, 17)
  assert.deepEqual(resolved, [])
})

test('a current role lookup resolves for the requested account', async () => {
  let scheduled
  const resolved = []
  scheduleHeaderUserRoleLookup({
    userId: 'account-b',
    loadRole: async () => 'tutor',
    onResolved: (userId, role) => resolved.push({ userId, role }),
    schedule: (callback) => {
      scheduled = callback
      return 1
    },
  })

  scheduled()
  await new Promise((resolve) => setImmediate(resolve))
  assert.deepEqual(resolved, [{ userId: 'account-b', role: 'tutor' }])
})

test('the auth callback is synchronous and contains no Supabase client call', () => {
  const callbackStart = source.indexOf('client.auth.onAuthStateChange(')
  const callbackEnd = source.indexOf('\n    })\n    void getInitial()', callbackStart)
  assert.ok(callbackStart >= 0 && callbackEnd > callbackStart)
  const callbackBodyStart = source.indexOf('{', callbackStart) + 1
  const callback = source.slice(callbackBodyStart, callbackEnd)

  assert.doesNotMatch(callback, /\basync\b|\bawait\b/)
  assert.doesNotMatch(callback, /client\.|\.from\(|loadRole/)
  assert.match(callback, /dispatch\(\{ type: 'auth-event', user: session\?\.user \?\? null \}\)/)

  assert.match(source, /scheduleHeaderUserRoleLookup\(\{[\s\S]*loadRole: async/)
  assert.match(source, /\}, \[client, user\?\.id\]\)/)
  assert.match(source, /authState\.authLoading \|\| isRoleLoading/)
})

test('admin and tutor role navigation remains unchanged', () => {
  assert.match(source, /\(role === 'admin' \|\| role === 'tutor'\)/)
  assert.match(
    source,
    /href=\{role === 'admin' \|\| role === 'tutor' \? '\/dashboard\/sessions' : '\/dashboard'\}/
  )
  assert.match(source, /<Link href="\/login"/)
  assert.match(source, /<Link href="\/register"/)
})
