import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const { createPacer } = require('../src/lib/send-pacer.js')

const INTERVAL = 550

/**
 * A virtual clock. `sleep` advances it instantly and records the wait, so every
 * assertion below is about the arithmetic rather than about real elapsed time —
 * these tests must not actually sleep for seconds.
 */
function fakeClock(startAt = 0) {
  let t = startAt
  const slept = []
  return {
    slept,
    now: () => t,
    sleep: async (ms) => {
      slept.push(ms)
      t += ms
    },
    advance: (ms) => {
      t += ms
    },
    set: (ms) => {
      t = ms
    },
    at: () => t,
  }
}

/** A pacer over a fake clock, plus the clock, plus a task that records its start. */
function harness(startAt = 0) {
  const clock = fakeClock(startAt)
  const paced = createPacer({ intervalMs: INTERVAL, now: clock.now, sleep: clock.sleep })
  const starts = []
  const mark = (workMs = 0) => async () => {
    starts.push(clock.at())
    if (workMs) clock.advance(workMs)
    return starts.length
  }
  return { clock, paced, starts, mark }
}

// ---------------------------------------------------------------------------
// The spacing itself. Resend's default is 2 requests/second; a send that gets
// rejected here is a customer's receipt that never arrives.
// ---------------------------------------------------------------------------

test('the first send goes out immediately — pacing costs nothing when there is nothing to pace', async () => {
  const { clock, paced, starts, mark } = harness()

  await paced(mark())

  assert.deepEqual(starts, [0])
  assert.deepEqual(clock.slept, [], 'no sleep at all on a cold pacer')
})

test('two sends issued back to back are spaced by a full interval', async () => {
  const { clock, paced, starts, mark } = harness()

  await paced(mark())
  await paced(mark())

  assert.deepEqual(starts, [0, INTERVAL])
  assert.deepEqual(clock.slept, [INTERVAL])
})

test('sends that are not awaited in sequence are still spaced', async () => {
  // The reason the pacer is a queue and not merely a delay: a Promise.all here,
  // or two sends fired without awaiting, must not both arrive in the same second.
  const { paced, starts, mark } = harness()

  await Promise.all([paced(mark()), paced(mark()), paced(mark())])

  assert.deepEqual(starts, [0, INTERVAL, 2 * INTERVAL])
})

test('a slow send shortens the next wait rather than adding to it', async () => {
  // The whole point of measuring from the previous *start*. A flat sleep after
  // every send would make this pair cost 950ms for no gain in the arrival rate.
  const { clock, paced, starts, mark } = harness()

  await paced(mark(400))
  await paced(mark())

  assert.deepEqual(clock.slept, [150], 'waited the remainder, not another full interval')
  assert.deepEqual(starts, [0, INTERVAL])
})

test('a send slower than the interval means the next one waits not at all', async () => {
  const { clock, paced, starts, mark } = harness()

  await paced(mark(900))
  await paced(mark())

  assert.deepEqual(clock.slept, [])
  assert.deepEqual(starts, [0, 900])
})

test('a send long after the previous one waits not at all', async () => {
  const { clock, paced, starts, mark } = harness()

  await paced(mark())
  clock.advance(5_000)
  await paced(mark())

  assert.deepEqual(clock.slept, [])
  assert.deepEqual(starts, [0, 5_000])
})

test('a burst never exceeds two sends per second, however many are queued', async () => {
  const { paced, starts, mark } = harness()

  await Promise.all(Array.from({ length: 10 }, () => paced(mark())))

  for (let i = 1; i < starts.length; i += 1) {
    const gap = starts[i] - starts[i - 1]
    assert.ok(gap >= 500, `send ${i} came ${gap}ms after send ${i - 1}, inside Resend's 2/second`)
  }
})

test('the task result is handed back untouched', async () => {
  const { paced } = harness()

  assert.equal(await paced(async () => 'sent'), 'sent')
  assert.deepEqual(await paced(async () => ({ error: null })), { error: null })
})

// ---------------------------------------------------------------------------
// The queue must not be wedgeable. Every send in the app goes through it, and a
// stuck queue is email stopping with nothing visibly erroring.
// ---------------------------------------------------------------------------

test('a rejecting send does not wedge the queue for everything after it', async () => {
  const { paced, starts, mark } = harness()

  await assert.rejects(paced(async () => { throw new Error('resend exploded') }), /resend exploded/)
  await paced(mark())
  await paced(mark())

  assert.deepEqual(starts, [INTERVAL, 2 * INTERVAL], 'the survivors still ran, and still spaced')
})

test('a send that throws synchronously rejects its own promise rather than the queue', async () => {
  const { paced, starts, mark } = harness()

  await assert.rejects(paced(() => { throw new Error('built the payload wrong') }))
  await paced(mark())

  assert.deepEqual(starts, [INTERVAL])
})

test('a send that never settles does not hold up the one behind it', async () => {
  // A stalled socket on send one must not mean send two is never attempted.
  const { paced, starts, mark } = harness()

  void paced(() => new Promise(() => {}))
  await paced(mark())

  assert.deepEqual(starts, [INTERVAL])
})

// ---------------------------------------------------------------------------
// Pacing may delay a send. It may never replace one.
// ---------------------------------------------------------------------------

test('a timer that throws still lets the send go out', async () => {
  const clock = fakeClock()
  const paced = createPacer({
    intervalMs: INTERVAL,
    now: clock.now,
    sleep: () => { throw new Error('timer gone') },
  })

  assert.equal(await paced(async () => 'first'), 'first')
  // This one needs a wait, so it is the one that hits the broken timer.
  assert.equal(await paced(async () => 'second'), 'second', 'unpaced beats unsent')
  assert.equal(await paced(async () => 'third'), 'third')
})

test('a clock that throws still lets the send go out', async () => {
  const paced = createPacer({
    intervalMs: INTERVAL,
    now: () => { throw new Error('no clock') },
    sleep: async () => {},
  })

  assert.equal(await paced(async () => 'first'), 'first')
  assert.equal(await paced(async () => 'second'), 'second')
})

test('a clock stepping backwards costs one interval, not an unbounded stall', async () => {
  // NTP corrects a long-lived process backwards: lastStartedAt is suddenly in
  // the future and the raw arithmetic asks for a wait of arbitrary length. That
  // would look exactly like email having stopped working.
  const clock = fakeClock(10_000)
  const paced = createPacer({ intervalMs: INTERVAL, now: clock.now, sleep: clock.sleep })

  await paced(async () => 'first')
  clock.set(0)
  await paced(async () => 'second')

  assert.deepEqual(clock.slept, [INTERVAL], 'clamped to one interval')
})

test('the default clock and timer work, not just the injected ones', async () => {
  // Everything above injects both, so the real Date.now/setTimeout path — the
  // one production actually runs — would otherwise never be exercised. A short
  // interval keeps this in milliseconds rather than seconds.
  const paced = createPacer({ intervalMs: 20 })
  const starts = []

  await paced(async () => starts.push(Date.now()))
  await paced(async () => starts.push(Date.now()))

  assert.equal(starts.length, 2)
  assert.ok(starts[1] - starts[0] >= 20, `real gap was ${starts[1] - starts[0]}ms`)
})

// ---------------------------------------------------------------------------
// Where the pacer is wired in. These are the facts that make the module matter;
// none of them are visible from send-pacer.js alone.
// ---------------------------------------------------------------------------

test('sendEmail routes the send through the pacer, so no call site has to', async () => {
  const source = readFileSync(new URL('../src/lib/resend.ts', import.meta.url), 'utf8')

  assert.match(
    source,
    /paceSend\(\(\)\s*=>\s*resend\.emails\.send\(/,
    'the one send in the app must go through the pacer'
  )
})

test('the send interval leaves headroom under Resend\'s 2 requests per second', async () => {
  const source = readFileSync(new URL('../src/lib/resend.ts', import.meta.url), 'utf8')
  const match = source.match(/const MIN_SEND_INTERVAL_MS = (\d+)/)
  assert.ok(match, 'expected a named interval constant in src/lib/resend.ts')

  const interval = Number(match[1])
  assert.ok(interval >= 500, `${interval}ms is at or over Resend's 2/second limit`)
  assert.ok(interval > 500, `${interval}ms leaves no headroom for arrival-time jitter`)
  // A runaway value would quietly push the reminder cron past its 8s deadline.
  assert.ok(interval <= 1_000, `${interval}ms is more headroom than any route can afford`)
})

test('the reminder cron does not pace a second time on top of sendEmail', async () => {
  // It used to own this logic; sendEmail now does. Two pacers would be dead
  // weight to reason about, and a future change to either would only half apply.
  const source = readFileSync(
    new URL('../src/app/api/cron/session-reminders/route.ts', import.meta.url),
    'utf8'
  )

  assert.doesNotMatch(source, /const MIN_SEND_INTERVAL_MS/, 'no local interval constant')
  assert.doesNotMatch(source, /await paceSend\(\)/, 'no local pacing call')
  // The time budget that keeps the run inside Netlify's function timeout stays.
  assert.match(source, /Date\.now\(\) - startedAt > RUN_DEADLINE_MS/)
})
