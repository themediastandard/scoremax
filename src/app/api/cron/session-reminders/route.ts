import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { sessionReminderEmail } from '@/lib/email-templates'
import {
  isReminderDue,
  reminderWindow,
} from '@/lib/session-reminders'
import { flushReports, reportIssue } from '@/lib/report-error'
import { operationalRecipients, sessionStudentName } from '@/lib/session-recipients'

// node:crypto and Buffer, so not the edge runtime. Node is already the default
// for route handlers; stated here because the timing-safe comparison below
// silently has no equivalent on edge.
export const runtime = 'nodejs'

/**
 * Sends the one-hour-before session reminder to the student and the assigned
 * tutor. Driven by netlify/functions/session-reminders.mts on a 10-minute cron;
 * see that file for why the schedule and the window in session-reminders.js have
 * to stay in step.
 *
 * The logic lives here rather than in the Netlify function because the function
 * sits outside src/, where the `@/*` path alias does not reliably resolve inside
 * Netlify's function bundler. Here it reuses supabaseAdmin, sendEmail,
 * emailLayout and reportError exactly as the rest of the app does — and can be
 * driven by hand with curl, which is the only way this gets verified before it
 * matters (`sessions` is empty in production today).
 */

/** Header carrying the shared secret. Set by the Netlify scheduled function. */
const CRON_SECRET_HEADER = 'x-cron-secret'

/**
 * Ceiling on sessions touched per tick, and the wall clock that actually stops
 * the loop.
 *
 * Netlify's default synchronous function timeout is 10 seconds. Two paced sends
 * plus a re-read and a stamp costs roughly 1.3s per session, so the run stops
 * itself at 8s rather than being killed mid-session by the platform. Sessions
 * left over are NOT silently dropped — they are counted in the response and
 * reported to Sentry, because a reminder that never went out is otherwise
 * indistinguishable from there being nothing to send.
 *
 * The 5-minute overlap between consecutive windows gives a leftover session one
 * more chance on the next tick, but only one, and only if it is near a boundary.
 */
const MAX_SESSIONS_PER_RUN = 12
const RUN_DEADLINE_MS = 8_000

/**
 * How many rows the poll reads, as distinct from how many it will act on. Kept
 * well above MAX_SESSIONS_PER_RUN so the "N sessions were not processed" figure
 * in the Sentry report is the real number rather than "at least one" — a cap you
 * cannot size is a cap you cannot act on.
 */
const MAX_CANDIDATES_FETCHED = 100

const RequestBody = z.strictObject({
  /**
   * Report what would be sent, send nothing, write nothing. Strict object on
   * purpose: a typo like `dry_run: true` would otherwise be ignored and mail
   * real customers.
   */
  dryRun: z.boolean().optional(),
})

type ReminderParty = {
  email: string | null
  full_name: string | null
}

type ReminderCandidate = {
  id: string
  status: string | null
  confirmed_start: string | null
  session_type: string | null
  meet_url: string | null
  reminder_sent_for: string | null
  customers: ReminderParty | null
  students: ReminderParty | null
  tutors: ReminderParty | null
}

type SendOutcome = 'sent' | 'failed' | 'no-address'

type SessionResult = {
  id: string
  owner: SendOutcome
  student: SendOutcome
  tutor: SendOutcome
  stamped: boolean
}

const CANDIDATE_COLUMNS = `
  id,
  status,
  confirmed_start,
  session_type,
  meet_url,
  reminder_sent_for,
  customers ( email, full_name ),
  students ( email, full_name ),
  tutors ( email, full_name )
`

/**
 * Constant-time check of the shared secret.
 *
 * Fails closed when CRON_SECRET is unset. This route turns a POST into email to
 * real customers from ScoreMax's verified sending domain, so "no secret
 * configured" must never be read as "no authentication required" — that is an
 * open spam relay with the client's domain reputation attached to it.
 *
 * Both sides are hashed before comparison so timingSafeEqual always gets equal
 * length buffers (it throws otherwise) and the length of the real secret does
 * not leak through which requests error.
 */
function checkCronAuth(req: NextRequest): 'ok' | 'denied' | 'unconfigured' {
  const expected = process.env.CRON_SECRET?.trim()
  if (!expected) return 'unconfigured'

  const provided = req.headers.get(CRON_SECRET_HEADER)?.trim()
  if (!provided) return 'denied'

  const expectedDigest = createHash('sha256').update(expected, 'utf8').digest()
  const providedDigest = createHash('sha256').update(provided, 'utf8').digest()
  return timingSafeEqual(expectedDigest, providedDigest) ? 'ok' : 'denied'
}

export async function POST(req: NextRequest) {
  const auth = checkCronAuth(req)

  if (auth === 'unconfigured') {
    reportIssue(
      'cron:session-reminders',
      'CRON_SECRET is not set, so the reminder job refused to run. No reminders are going out.'
    )
    await flushReports()
    return NextResponse.json({ error: 'Reminder job is not configured' }, { status: 503 })
  }

  if (auth === 'denied') {
    // Console only. An attacker who found this endpoint could otherwise turn a
    // request flood into a Sentry quota flood.
    console.warn('[cron:session-reminders] rejected a request with a missing or wrong secret')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // The Netlify function posts `{}`; a hand-run curl may post nothing at all.
  let dryRun = false
  const rawBody = await req.text()
  if (rawBody.trim()) {
    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Request body must be JSON' }, { status: 400 })
    }
    const result = RequestBody.safeParse(parsed)
    if (!result.success) {
      // Deliberately not echoing zod's message — see CLAUDE.md on leaking
      // internals to clients.
      return NextResponse.json(
        { error: 'Request body must be {} or { "dryRun": true }' },
        { status: 400 }
      )
    }
    dryRun = result.data.dryRun ?? false
  }

  const startedAt = Date.now()
  const now = new Date()
  const pollWindow = reminderWindow(now)

  // supabaseAdmin bypasses every RLS policy, so the scope has to be explicit:
  // only sessions that are still scheduled, and only those inside this tick's
  // window. Nothing here is keyed to a user, which is exactly why the status and
  // window predicates are the whole guard.
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select(CANDIDATE_COLUMNS)
    .eq('status', 'scheduled')
    .gte('confirmed_start', pollWindow.start)
    .lte('confirmed_start', pollWindow.end)
    .order('confirmed_start', { ascending: true })
    .limit(MAX_CANDIDATES_FETCHED)

  if (error) {
    reportIssue('cron:session-reminders', `Could not load sessions due a reminder: ${error.message}`, {
      window: pollWindow,
    })
    await flushReports()
    return NextResponse.json({ error: 'Could not load sessions' }, { status: 500 })
  }

  const candidates = (data ?? []) as unknown as ReminderCandidate[]

  // `reminder_sent_for is distinct from confirmed_start` cannot be expressed in
  // PostgREST — it compares two columns of the same row — so it happens here,
  // over the handful of rows the window predicate already narrowed us to.
  const due = candidates.filter((session) => isReminderDue(session, now))

  const overflowed = due.length > MAX_SESSIONS_PER_RUN
  const batch = overflowed ? due.slice(0, MAX_SESSIONS_PER_RUN) : due

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      checkedAt: now.toISOString(),
      window: pollWindow,
      inWindow: candidates.length,
      due: due.length,
      wouldRemind: batch.map((session) => ({
        id: session.id,
        confirmedStart: session.confirmed_start,
        sessionType: session.session_type,
        hasMeetUrl: Boolean(session.meet_url),
        alreadyRemindedFor: session.reminder_sent_for,
        ownerEmail: session.customers?.email ?? null,
        studentEmail: session.students?.email ?? null,
        tutorEmail: session.tutors?.email ?? null,
      })),
      deferred: due.length - batch.length,
    })
  }

  // This loop used to pace its own sends under Resend's 2-per-second limit. That
  // now lives inside sendEmail (src/lib/send-pacer.js), which every route shares,
  // so the wall-clock cost per session is unchanged and RUN_DEADLINE_MS below
  // still bounds the run the same way. Do not add a second pacer here.
  const results: SessionResult[] = []
  let deferred = 0
  // Counted rather than merely reported, so a run that sends nothing can still
  // say why. "0 reminders" and "0 sessions" look identical otherwise.
  let skippedNoLongerDue = 0
  let skippedUnreadable = 0

  for (const candidate of batch) {
    if (Date.now() - startedAt > RUN_DEADLINE_MS) {
      deferred += 1
      continue
    }

    // Unreachable — isReminderDue() already required a readable start — but it
    // is what the stamp below is keyed on, and stamping `reminder_sent_for` to
    // null would quietly re-arm a session that had just been reminded.
    const confirmedStart = candidate.confirmed_start
    if (!confirmedStart) {
      skippedUnreadable += 1
      continue
    }

    const tutorEmail = candidate.tutors?.email?.trim() || null
    const familyRecipients = operationalRecipients(candidate.customers, candidate.students)

    if (familyRecipients.length === 0 && !tutorEmail) {
      reportIssue(
        'cron:session-reminders',
        'A session due a reminder has neither a student nor a tutor email address.',
        { sessionId: candidate.id }
      )
      skippedUnreadable += 1
      continue
    }

    // Atomically claim this exact session/start before sending. A read followed
    // by an update is not a concurrency guard: two overlapping invocations can
    // both read the unstamped row before either writes. The database RPC changes
    // that into one conditional UPDATE, so only one caller receives true. Its
    // lease allows recovery if the process dies before it finishes the claim.
    const claimToken = randomUUID()
    const { data: claimed, error: claimError } = await supabaseAdmin.rpc('claim_session_reminder', {
      p_session_id: candidate.id,
      p_confirmed_start: confirmedStart,
      p_claim_token: claimToken,
      p_lease_seconds: 120,
    })
    if (claimError) {
      reportIssue(
        'cron:session-reminders',
        `Could not claim session reminder: ${claimError.message}`,
        { sessionId: candidate.id, confirmedStart }
      )
      skippedUnreadable += 1
      continue
    }
    if (!claimed) {
      skippedNoLongerDue += 1
      continue
    }

    let ownerOutcome: SendOutcome = 'no-address'
    let studentOutcome: SendOutcome = 'no-address'
    let tutorOutcome: SendOutcome = 'no-address'

    const studentName = sessionStudentName(candidate)
    for (const recipient of familyRecipients) {
      const { subject, html } = sessionReminderEmail({
        recipient: recipient.role,
        session: candidate,
        recipientName: recipient.full_name,
        counterpartName: candidate.tutors?.full_name,
        studentName,
      })
      const ok = await sendEmail(
        { ...getEmailDefaults(), to: recipient.email, subject, html },
        `cron:session-reminder:${recipient.role}:${candidate.id}:${confirmedStart}`,
        `session-reminder-${recipient.role}-${candidate.id}-${confirmedStart}`
      )
      if (recipient.role === 'owner') ownerOutcome = ok ? 'sent' : 'failed'
      else studentOutcome = ok ? 'sent' : 'failed'
    }

    if (tutorEmail) {
      const { subject, html } = sessionReminderEmail({
        recipient: 'tutor',
        session: candidate,
        recipientName: candidate.tutors?.full_name,
        counterpartName: studentName,
        studentName,
      })
      const ok = await sendEmail(
        { ...getEmailDefaults(), to: tutorEmail, subject, html },
        `cron:session-reminder:tutor:${candidate.id}:${confirmedStart}`,
        `session-reminder-tutor-${candidate.id}-${confirmedStart}`
      )
      tutorOutcome = ok ? 'sent' : 'failed'
    }

    const anySent = ownerOutcome === 'sent' || studentOutcome === 'sent' || tutorOutcome === 'sent'

    /*
     * Partial failure — one send landed, the other did not.
     *
     * The marker is stamped anyway, and the failed recipient is reported rather
     * than retried. The alternative, stamping only when both succeed, would mean
     * a retry re-sends to the recipient who already got it: the marker's
     * granularity is the session, not the recipient, so there is no way to retry
     * half of it. Given the guarantee is "neither ever receives two", a silent
     * duplicate to a paying customer is the worse outcome — it is unfixable
     * after the fact and it teaches people to distrust ScoreMax mail — whereas a
     * missed reminder is visible in Sentry, recoverable by a human, and the
     * attendee still holds the calendar invite.
     *
     * When BOTH sends fail nothing is stamped, so the session re-arms and the
     * next tick retries it in full. That can only actually fire if the session
     * sits in the 5-minute overlap between windows; outside it there is one
     * attempt, which is why the failure is reported rather than left to chance.
     */
    if (!anySent) {
      const { error: releaseError } = await supabaseAdmin.rpc('finish_session_reminder_claim', {
        p_session_id: candidate.id,
        p_confirmed_start: confirmedStart,
        p_claim_token: claimToken,
        p_sent: false,
      })
      reportIssue(
        'cron:session-reminders',
        'Every reminder send for this session failed; it was not marked as reminded.',
        {
          sessionId: candidate.id,
          ownerOutcome,
          studentOutcome,
          tutorOutcome,
          claimReleaseError: releaseError?.message,
        }
      )
      results.push({ id: candidate.id, owner: ownerOutcome, student: studentOutcome, tutor: tutorOutcome, stamped: false })
      continue
    }

    if (ownerOutcome === 'failed' || studentOutcome === 'failed' || tutorOutcome === 'failed') {
      reportIssue(
        'cron:session-reminders',
        'One or more reminder emails failed. They will NOT be retried, because retrying would duplicate recipients whose sends succeeded.',
        { sessionId: candidate.id, ownerOutcome, studentOutcome, tutorOutcome }
      )
    }

    // Finish only the claim token this invocation owns and only while the exact
    // scheduled time it emailed is still current.
    const { data: didStamp, error: stampError } = await supabaseAdmin.rpc(
      'finish_session_reminder_claim',
      {
        p_session_id: candidate.id,
        p_confirmed_start: confirmedStart,
        p_claim_token: claimToken,
        p_sent: true,
      }
    )
    if (!didStamp) {
      // The emails are already gone. Without the marker the next tick could send
      // them again, so this is the one failure here that can produce a duplicate.
      reportIssue(
        'cron:session-reminders',
        `Reminder sent but the session could not be marked as reminded: ${stampError?.message ?? 'the session was rescheduled mid-send'}`,
        { sessionId: candidate.id, confirmedStart }
      )
    }

    results.push({
      id: candidate.id,
      owner: ownerOutcome,
      student: studentOutcome,
      tutor: tutorOutcome,
      stamped: Boolean(didStamp),
    })
  }

  const leftOver = deferred + (overflowed ? due.length - batch.length : 0)
  if (leftOver > 0) {
    reportIssue(
      'cron:session-reminders',
      `${leftOver} session(s) due a reminder were not processed on this run (per-run cap or time budget).`,
      { window: pollWindow, due: due.length, processed: results.length }
    )
  }

  await flushReports()

  return NextResponse.json({
    dryRun: false,
    checkedAt: now.toISOString(),
    window: pollWindow,
    inWindow: candidates.length,
    due: due.length,
    processed: results.length,
    skippedNoLongerDue,
    skippedUnreadable,
    deferred: leftOver,
    results,
  })
}
