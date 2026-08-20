import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createClient } from '@supabase/supabase-js'
import {
  mergeRowsById,
  retrySupabaseOperation,
  runConditionalUpdateWithRecovery,
} from '../src/lib/supabase-operation-retry.js'

const routeSource = readFileSync(
  new URL('../src/app/api/cron/session-reminders/route.ts', import.meta.url),
  'utf8'
)
const completionEmailSource = readFileSync(
  new URL('../src/lib/session-completion-email.ts', import.meta.url),
  'utf8'
)

const success = (data) => ({
  data,
  error: null,
  status: 200,
  statusText: 'OK',
})

const transportFailure = (code = 'UND_ERR_SOCKET') => ({
  data: null,
  error: {
    message: 'TypeError: fetch failed',
    details: `TypeError: fetch failed\n\nCaused by: Error: socket closed (${code})`,
    hint: '',
    code: '',
  },
  status: 0,
  statusText: '',
})

const httpFailure = (status, code = '') => ({
  data: null,
  error: { message: `HTTP ${status}`, details: '', hint: '', code },
  status,
  statusText: 'Error',
})

const retryOptions = (overrides = {}) => ({
  operation: 'test-operation',
  maxAttempts: 3,
  delaysMs: [75, 150],
  sleep: async () => {},
  ...overrides,
})

test('the installed postgrest 2.96 flattened transport shape retries and succeeds', async () => {
  let fetchCalls = 0
  const observedFailures = []
  const client = createClient('https://example.supabase.co', 'test-anon-key', {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: async () => {
        fetchCalls += 1
        if (fetchCalls === 1) {
          const error = new TypeError('fetch failed')
          error.cause = Object.assign(new Error('other side closed'), {
            code: 'UND_ERR_SOCKET',
          })
          throw error
        }
        return new Response('[]', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      },
    },
  })

  const outcome = await retrySupabaseOperation(async () => {
    const response = await client.from('sessions').select('id')
    if (response.error) observedFailures.push(response)
    return response
  }, retryOptions())

  assert.equal(fetchCalls, 2)
  assert.equal(observedFailures.length, 1)
  assert.equal(observedFailures[0].status, 0)
  assert.equal(observedFailures[0].error.message, 'TypeError: fetch failed')
  assert.match(observedFailures[0].error.details, /UND_ERR_SOCKET/)
  assert.equal(outcome.attempts, 2)
  assert.deepEqual(outcome.response.data, [])
})

test('a matching flattened transport response uses one short retry', async () => {
  let calls = 0
  const sleeps = []
  const outcome = await retrySupabaseOperation(
    async () => {
      calls += 1
      return calls === 1 ? transportFailure('UND_ERR_SOCKET') : success([{ id: 'session-1' }])
    },
    retryOptions({ sleep: async (delay) => sleeps.push(delay) })
  )

  assert.equal(calls, 2)
  assert.deepEqual(sleeps, [75])
  assert.equal(outcome.attempts, 2)
  assert.deepEqual(outcome.response.data, [{ id: 'session-1' }])
  assert.equal(outcome.failure, null)
})

test('recognized nested transport causes retry thrown fetch failures', async () => {
  let calls = 0
  const outcome = await retrySupabaseOperation(async () => {
    calls += 1
    if (calls === 1) {
      const error = new TypeError('fetch failed')
      error.cause = { code: 'ECONNRESET', message: 'socket reset' }
      throw error
    }
    return success([])
  }, retryOptions())

  assert.equal(outcome.attempts, 2)
  assert.equal(outcome.response.error, null)
})

test('status-zero lookalikes and permanent HTTP failures do not retry', async (t) => {
  const failures = [
    {
      name: 'bare fetch-failed lookalike',
      response: {
        data: null,
        error: { message: 'TypeError: fetch failed', details: '', hint: '', code: '' },
        status: 0,
        statusText: '',
      },
    },
    ...[400, 409, 500].map((status) => ({ name: `HTTP ${status}`, response: httpFailure(status) })),
  ]

  for (const failure of failures) {
    await t.test(failure.name, async () => {
      let calls = 0
      const outcome = await retrySupabaseOperation(async () => {
        calls += 1
        return failure.response
      }, retryOptions())
      assert.equal(calls, 1)
      assert.equal(outcome.attempts, 1)
      assert.equal(outcome.exhausted, false)
      assert.equal(outcome.failure.retryable, false)
    })
  }
})

test('only the bounded transient HTTP statuses retry', async (t) => {
  for (const status of [502, 503, 504, 520]) {
    await t.test(String(status), async () => {
      let calls = 0
      const outcome = await retrySupabaseOperation(async () => {
        calls += 1
        return calls === 1 ? httpFailure(status, 'PGRST001') : success([])
      }, retryOptions())
      assert.equal(calls, 2)
      assert.equal(outcome.attempts, 2)
    })
  }

  let exhaustedCalls = 0
  const exhausted = await retrySupabaseOperation(async () => {
    exhaustedCalls += 1
    return httpFailure(503, 'PGRST001')
  }, retryOptions())
  assert.equal(exhaustedCalls, 3)
  assert.equal(exhausted.exhausted, true)
  assert.equal(exhausted.failure.status, 503)
})

test('the deadline prevents another delay or attempt', async () => {
  let calls = 0
  let sleeps = 0
  const outcome = await retrySupabaseOperation(async () => {
    calls += 1
    return transportFailure('ETIMEDOUT')
  }, retryOptions({
    deadlineAt: 1_050,
    now: () => 1_000,
    sleep: async () => { sleeps += 1 },
  }))

  assert.equal(calls, 1)
  assert.equal(sleeps, 0)
  assert.equal(outcome.exhausted, true)
})

test('a committed update with a lost response recovers an old overdue completion', async () => {
  const oldSession = { id: 'old-session', confirmed_end: '2026-01-01T00:00:00.000Z' }
  let status = 'scheduled'
  let updates = 0
  let recoveryReads = 0

  const result = await runConditionalUpdateWithRecovery({
    expectedRows: [oldSession],
    update: async () => {
      updates += 1
      if (status === 'scheduled') status = 'completed'
      if (updates === 1) return transportFailure('UND_ERR_SOCKET')
      return success([])
    },
    loadCompletedRows: async (ids) => {
      recoveryReads += 1
      return success(status === 'completed' && ids.includes(oldSession.id) ? [oldSession] : [])
    },
    updateRetry: retryOptions({ operation: 'update-ended-scheduled' }),
    recoveryRetry: retryOptions({ operation: 'select-completed-update-recovery' }),
  })

  assert.equal(result.ok, true)
  assert.equal(updates, 2)
  assert.equal(recoveryReads, 1)
  assert.deepEqual(result.rows, [oldSession])
})

test('completion recovery succeeds when every PATCH response is lost', async () => {
  const oldSession = { id: 'old-session', confirmed_end: '2026-01-01T00:00:00.000Z' }
  let status = 'scheduled'
  let updates = 0

  const result = await runConditionalUpdateWithRecovery({
    expectedRows: [oldSession],
    update: async () => {
      updates += 1
      status = 'completed'
      return transportFailure('ECONNRESET')
    },
    loadCompletedRows: async () => success(status === 'completed' ? [oldSession] : []),
    updateRetry: retryOptions({ operation: 'update-ended-scheduled' }),
    recoveryRetry: retryOptions({ operation: 'select-completed-update-recovery' }),
  })

  assert.equal(result.ok, true)
  assert.equal(updates, 3)
  assert.equal(result.updateOutcome.exhausted, true)
  assert.equal(result.recoveredAfterUncertainUpdate, true)
  assert.deepEqual(result.rows, [oldSession])

  const candidates = mergeRowsById(result.rows, [oldSession])
  const deliveredKeys = new Set()
  let deliveries = 0
  for (const session of candidates) {
    const key = `session-completed-${session.id}`
    if (!deliveredKeys.has(key)) {
      deliveredKeys.add(key)
      deliveries += 1
    }
  }
  assert.equal(candidates.length, 1)
  assert.equal(deliveries, 1)
})

test('a commit followed by a permanent retry response is reconciled before failing', async () => {
  const session = { id: 'session-1' }
  let status = 'scheduled'
  let calls = 0
  const result = await runConditionalUpdateWithRecovery({
    expectedRows: [session],
    update: async () => {
      calls += 1
      if (calls === 1) {
        status = 'completed'
        return transportFailure('UND_ERR_SOCKET')
      }
      return httpFailure(400, 'PGRST100')
    },
    loadCompletedRows: async () => success(status === 'completed' ? [session] : []),
    updateRetry: retryOptions({ operation: 'update-ended-scheduled' }),
    recoveryRetry: retryOptions({ operation: 'select-completed-update-recovery' }),
  })

  assert.equal(result.ok, true)
  assert.equal(calls, 2)
  assert.equal(result.recoveredAfterUncertainUpdate, true)
  assert.deepEqual(result.rows, [session])
})

test('a permanent update error is not retried or reconciled', async () => {
  let updateCalls = 0
  let recoveryCalls = 0
  const result = await runConditionalUpdateWithRecovery({
    expectedRows: [{ id: 'session-1' }],
    update: async () => {
      updateCalls += 1
      return httpFailure(400, '42501')
    },
    loadCompletedRows: async () => {
      recoveryCalls += 1
      return success([])
    },
    updateRetry: retryOptions({ operation: 'update-ended-scheduled' }),
    recoveryRetry: retryOptions({ operation: 'select-completed-update-recovery' }),
  })

  assert.equal(result.ok, false)
  assert.equal(result.stage, 'update')
  assert.equal(updateCalls, 1)
  assert.equal(recoveryCalls, 0)
})

test('the route retries only pre-email reads and the guarded completion update', () => {
  for (const operation of [
    'select-ended-scheduled',
    'update-ended-scheduled',
    'select-completed-update-recovery',
    'select-recent-completed',
    'select-reminder-candidates',
  ]) {
    assert.match(routeSource, new RegExp(`retryOptions\\('${operation}'`))
  }

  assert.match(
    routeSource,
    /\.update\(\{ status: 'completed' \}\)\s*\.eq\('status', 'scheduled'\)\s*\.not\('confirmed_end', 'is', null\)\s*\.lte\('confirmed_end', nowIso\)\s*\.in\('id', endedSessionIds\)\s*\.select\(COMPLETION_EMAIL_COLUMNS\)/
  )

  const emailLoop = routeSource.indexOf('for (const session of completionEmailCandidates)')
  assert.ok(emailLoop > 0)
  assert.doesNotMatch(routeSource.slice(emailLoop), /retrySupabaseOperation|runConditionalUpdateWithRecovery/)
  assert.match(routeSource.slice(emailLoop), /sendSessionCompletionEmail\(\{/)
  assert.match(completionEmailSource, /`session-completed-\$\{session\.id\}`/)

  const reporterStart = routeSource.indexOf('function reportSupabaseOperationFailure')
  const reporterEnd = routeSource.indexOf('\n}\n\nexport async function POST', reporterStart)
  const reporter = routeSource.slice(reporterStart, reporterEnd)
  assert.doesNotMatch(reporter, /\.message|\.details|\.hint|sessionId|email/)
  assert.match(reporter, /operation: outcome\.operation/)
  assert.match(reporter, /attempts: outcome\.attempts/)
})
