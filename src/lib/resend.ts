import { Resend, type CreateEmailOptions } from 'resend'
import { reportError, reportIssue } from '@/lib/report-error'

export const resend = new Resend(process.env.RESEND_API_KEY)

export function getEmailDefaults() {
  const from = process.env.RESEND_FROM_EMAIL ?? 'ScoreMax <noreply@scoremaxtutoring.com>'
  return { from }
}

/**
 * Send an email and say plainly whether it worked.
 *
 * The Resend SDK does **not** throw when the API rejects a send — it resolves
 * with `{ data: null, error }`. So `await resend.emails.send(...)` inside a
 * try/catch looks safe while silently swallowing every API-level failure:
 * unverified domain, exhausted quota, rejected recipient, rate limit (the
 * default is 2 requests/second, and several routes fire two sends back to
 * back). Callers that ignored the return value reported success to the user
 * and logged nothing, so a lost enquiry was invisible from both ends.
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
 */
export async function sendEmail(
  payload: CreateEmailOptions,
  context: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send(payload)
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
