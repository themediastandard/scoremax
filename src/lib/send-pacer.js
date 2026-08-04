/**
 * Spacing for calls that share a per-second rate limit on someone else's API.
 *
 * Built for Resend, whose default allowance is 2 requests/second while several
 * routes here fire two sends back to back with sequential awaits — purchase
 * confirmations, booking confirmations, the scheduling pair. The second send
 * gets rejected, and a rejection is a customer not receiving their receipt.
 *
 * Two properties, and both matter:
 *
 *   Serialised. Slots are handed out through a promise chain, so callers that
 *   are not awaited in sequence — a Promise.all someone adds later — are still
 *   spaced. Delay alone would not survive that.
 *
 *   Elapsed-aware. The wait is measured from when the previous call *started*,
 *   not slept flat afterwards, so a request that itself took 400ms only waits
 *   the remaining 150ms. A flat sleep would pay for the network twice and add
 *   latency to every route for no gain in the arrival rate, which is the only
 *   thing the upstream limit actually counts.
 *
 * The clock and the timer are injectable so test/send-pacer.test.mjs can pin
 * the arithmetic without sleeping for real seconds.
 *
 * Plain JavaScript with a .d.ts alongside so test/*.test.mjs can require() it
 * without a build step. See CLAUDE.md.
 */

/** @param {number} ms */
function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function ignore() {}

/**
 * Build a runner that spaces the tasks handed to it by at least `intervalMs`.
 *
 * @param {{
 *   intervalMs: number,
 *   now?: () => number,
 *   sleep?: (ms: number) => Promise<void>,
 * }} options
 */
function createPacer({ intervalMs, now = Date.now, sleep = defaultSleep }) {
  /** Chain of already-claimed slots. Each new claim queues behind the last. */
  let tail = Promise.resolve()
  /** When the previous task was released to run. Null until the first one. */
  let lastStartedAt = null

  async function claimSlot() {
    try {
      if (lastStartedAt !== null) {
        /*
         * Clamped to one interval on the way up. If the host clock steps
         * backwards — NTP correction on a long-lived process — `lastStartedAt`
         * lands in the future and the raw arithmetic asks for a wait of
         * arbitrary length, which would look exactly like email having stopped
         * working. One interval of over-waiting is recoverable; an hour is not.
         */
        const wait = Math.min(Math.max(lastStartedAt + intervalMs - now(), 0), intervalMs)
        if (wait > 0) await sleep(wait)
      }
    } finally {
      // In `finally` so a clock or timer that throws still moves the marker
      // forward. Leaving it stale would let everything queued behind this slot
      // fire at once — the exact burst this module exists to prevent.
      lastStartedAt = now()
    }
  }

  /**
   * Run `task` once it is its turn, and never let the pacing be the reason it
   * did not run.
   *
   * `task` is invoked on both settled outcomes of the slot: if the clock or the
   * timer threw, the call goes out unpaced rather than not at all. A rate-limit
   * rejection is one lost email that Sentry sees; a limiter that swallows sends
   * is every email, silently. The task's own rejection propagates untouched to
   * the caller, which is what interprets it.
   *
   * The queue advances on the *slot*, not on the task, and the slot's only
   * await is its own timer. So a task that throws — or hangs on a stalled
   * socket — cannot wedge anything queued behind it.
   *
   * @template T
   * @param {() => Promise<T>} task
   * @returns {Promise<T>}
   */
  function paced(task) {
    const slot = tail.then(claimSlot)
    tail = slot.then(ignore, ignore)

    const run = () => task()
    return slot.then(run, run)
  }

  return paced
}

module.exports = { createPacer }
