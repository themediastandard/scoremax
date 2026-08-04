/**
 * Scheduled trigger for the one-hour-before session reminder.
 *
 * Deliberately thin: its entire job is one authenticated POST to
 * /api/cron/session-reminders, which does the real work. The logic is not in
 * here because this file sits outside src/, where the `@/*` path alias does not
 * reliably resolve inside Netlify's function bundler — so importing
 * supabaseAdmin, sendEmail or the email templates from here would be a build-time
 * gamble on every deploy. Keeping it in a route handler also means the job can be
 * driven by hand with curl, which is how it gets verified.
 *
 * This is the first scheduled function in the project. Netlify picks it up from
 * netlify/functions/ automatically; the `config.schedule` export below is what
 * registers the cron.
 *
 * SCHEDULE — every 10 minutes, and it must stay tighter than the 15-minute
 * selection window in src/lib/session-reminders.js. Windows are [t+55, t+70], so
 * a 10-minute interval makes consecutive windows overlap by 5 minutes and every
 * session start is covered by at least one tick with room for cron drift. Widen
 * this to 15 and the windows merely abut: a tick firing even seconds late opens
 * a gap, and a session that falls through it is never reminded and never logged.
 * The overlap sends some sessions to two ticks, which sessions.reminder_sent_for
 * absorbs.
 *
 * REQUIRES: CRON_SECRET set in Netlify, scoped to both Functions and Runtime —
 * this file needs it to send, and the Next.js route needs it to verify.
 */

export default async () => {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    // Fail loudly rather than calling an endpoint that will reject us anyway.
    // The route fails closed for the same reason: unauthenticated, it is an
    // open relay for mail from ScoreMax's verified sending domain.
    console.error('[cron:session-reminders] CRON_SECRET is not set; no reminders will be sent.')
    return new Response('CRON_SECRET is not configured', { status: 503 })
  }

  // NEXT_PUBLIC_APP_URL is the canonical https://www.scoremaxtutoring.com, but
  // Netlify env vars can be scoped to builds only, in which case it is absent
  // here. process.env.URL is Netlify's own primary-site URL and covers that.
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.URL ||
    'https://www.scoremaxtutoring.com'
  ).replace(/\/+$/, '')

  try {
    const response = await fetch(`${baseUrl}/api/cron/session-reminders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-cron-secret': secret,
      },
      body: JSON.stringify({}),
      // Netlify caps a scheduled function at 30s. Give up before that so the
      // failure is a logged non-2xx rather than an opaque platform timeout.
      signal: AbortSignal.timeout(25_000),
    })

    const body = await response.text()
    if (!response.ok) {
      console.error(`[cron:session-reminders] route returned ${response.status}: ${body.slice(0, 1000)}`)
      // Non-2xx marks the run as failed in Netlify's function log, which is the
      // only place a silently broken cron would otherwise show up.
      return new Response(body.slice(0, 1000), { status: 500 })
    }

    console.log(`[cron:session-reminders] ${body.slice(0, 1000)}`)
    return new Response(body.slice(0, 1000), { status: 200 })
  } catch (error) {
    console.error('[cron:session-reminders] could not reach the reminder route', error)
    return new Response('Could not reach the reminder route', { status: 500 })
  }
}

export const config = {
  schedule: '*/10 * * * *',
}
