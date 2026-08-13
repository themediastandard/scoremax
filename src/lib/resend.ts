import { Resend, type CreateEmailOptions } from 'resend'
import { reportError, reportIssue } from '@/lib/report-error'
import { createPacer } from '@/lib/send-pacer'

export const resend = new Resend(process.env.RESEND_API_KEY)

export function getEmailDefaults() {
  const from = process.env.RESEND_FROM_EMAIL ?? 'ScoreMax <noreply@scoremaxtutoring.com>'
  return { from }
}

/**
 * Floor between the *starts* of two Resend requests.
 *
 * Resend's default allowance is 2 requests/second, which puts the arithmetic
 * floor at 500ms. The extra 50ms is headroom: the limit is counted on Resend's
 * side against arrival time, not against the moment we called send, so two
 * requests that left here exactly 500ms apart can still land inside the same
 * second after a little network jitter.
 */
const MIN_SEND_INTERVAL_MS = 550

/**
 * Every send in the app goes through here, so no call site has to know the
 * limit exists. Five routes fire two sends back to back; before this, the
 * second could be rejected and its email simply never arrive.
 *
 * Module state, and therefore per function invocation: Netlify gives each
 * invocation a fresh module instance, so this paces sends *within one request*
 * — which is exactly the paired-send case it was built for. Two concurrent
 * requests each sending twice can still collide and get one rejected. That is
 * known and accepted: a distributed limiter would need shared state on the hot
 * path of a payment webhook to fix a case that is already reported to Sentry
 * and rare at this volume. Revisit if the Sentry `email:*` groups say otherwise.
 */
const paceSend = createPacer({ intervalMs: MIN_SEND_INTERVAL_MS })

/**
 * Send an email and say plainly whether it worked.
 *
 * The Resend SDK does **not** throw when the API rejects a send — it resolves
 * with `{ data: null, error }`. So `await resend.emails.send(...)` inside a
 * try/catch looks safe while silently swallowing every API-level failure:
 * unverified domain, exhausted quota, rejected recipient. Callers that ignored
 * the return value reported success to the user and logged nothing, so a lost
 * enquiry was invisible from both ends.
 *
 * Rate limiting used to belong on that list too. It no longer does: the send is
 * routed through `paceSend`, so back-to-back sends from one request are spaced
 * under Resend's limit and callers need do nothing. Pacing can only delay a
 * send, never replace one — see `createPacer`.
 *
 * This wraps both failure modes — the resolved `error` and a genuinely thrown
 * network/DNS error — into one boolean, and logs with a `context` tag so the
 * Netlify log line identifies which send failed.
 *
 * Deliberately returns a boolean rather than the error: no caller should be
 * putting Resend's message in front of a user (see CLAUDE.md on not leaking
 * `error.message`), and forcing an `if (!ok)` at each call site is the point.
 *
 * `payload` takes the full `CreateEmailOptions`, so callers keep spreading
 * `...getEmailDefaults()` as they already do. That type is a union
 * (`RequireAtLeastOne` over html/text/react), and an `Omit<…, 'from'>` wrapper
 * would collapse it into a single non-discriminated object, losing the
 * guarantee that some content field is present.
 *
 * `idempotencyKey` is deliberately opt-in. Purchase routes can key a send to a
 * committed payment or booking, while contact forms and session updates retain
 * their existing ability to send again when a person performs the action again.
 */
export async function sendEmail(
  payload: CreateEmailOptions,
  context: string,
  idempotencyKey?: string
): Promise<boolean> {
  try {
    const { error } = await paceSend(() => resend.emails.send(
      payload,
      idempotencyKey ? { idempotencyKey } : undefined
    ))
    if (error) {
      reportIssue(`email:${groupingKey(context)}`, `Resend rejected the send: ${error.name}`, {
        emailContext: context,
        resendMessage: error.message,
      })
      return false
    }
    return true
  } catch (err) {
    // Thrown rather than returned — network failure, DNS, aborted request.
    reportError(`email:${groupingKey(context)}`, err, { emailContext: context })
    return false
  }
}

/**
 * Call-site contexts carry a row id — `admin:order-refunded:<uuid>` — which is
 * exactly what you want in a log line and exactly what you do not want in a
 * Sentry tag, where every occurrence would become its own group. Keep the first
 * two segments, which identify the *kind* of send; the full string stays in
 * `emailContext` on the event.
 */
function groupingKey(context: string): string {
  return context.split(':').slice(0, 2).join(':')
}
