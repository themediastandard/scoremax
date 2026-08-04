import { escapeHtml } from '@/lib/html-escape'
import {
  buildReminderLocation,
  formatSessionTime,
  type ReminderSessionRow,
} from '@/lib/session-reminders'

const GOLD = '#b08a30'
const DARK = '#1e293b'
const GRAY_600 = '#4b5563'
const GRAY_500 = '#6b7280'
const WHITE = '#ffffff'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://www.scoremaxtutoring.com'
}

/**
 * Wraps pre-rendered `body` HTML in the ScoreMax email chrome.
 *
 * `body` is deliberately NOT escaped — it is assembled HTML, typically from
 * detailRow(), which escapes its own inputs. Everything else here is escaped,
 * because callers do interpolate user input into them: /api/step-up builds its
 * greeting from a submitted first name.
 */
export function emailLayout(options: {
  title: string
  /** Trusted HTML. Escape anything user-supplied before it gets here. */
  body: string
  ctaText?: string
  ctaUrl?: string
  greeting?: string
}): string {
  const { body } = options
  const title = escapeHtml(options.title)
  const ctaText = options.ctaText ? escapeHtml(options.ctaText) : options.ctaText
  const ctaUrl = options.ctaUrl ? escapeHtml(options.ctaUrl) : options.ctaUrl
  const greeting = options.greeting ? escapeHtml(options.greeting) : options.greeting
  const baseUrl = getBaseUrl()

  const ctaButton = ctaText && ctaUrl
    ? `
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 32px;">
        <tr>
          <td align="center">
            <a href="${ctaUrl}" style="display: inline-block; background-color: ${GOLD}; color: ${WHITE}; font-family: Georgia, serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 14px 28px; text-decoration: none;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>
    `
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, Helvetica, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 560px; background-color: ${WHITE};">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <a href="${baseUrl}" style="text-decoration: none;">
                <img src="${baseUrl}/Images/score-max-logo-wide.png" alt="ScoreMax" width="140" height="32" style="display: block; height: 32px; width: auto;">
              </a>
              <div style="width: 24px; height: 3px; background-color: ${GOLD}; margin-top: 20px;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h1 style="margin: 0 0 16px 0; font-family: Georgia, serif; font-size: 24px; font-weight: 600; color: ${DARK};">
                ${title}
              </h1>
              ${greeting ? `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${GRAY_600};">${greeting}</p>` : ''}
              <div style="font-size: 16px; line-height: 1.6; color: ${GRAY_600};">
                ${body}
              </div>
              ${ctaButton}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: ${GRAY_500};">
                ScoreMax Tutoring · Expert test prep and academic tutoring
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

/**
 * Renders a detail row (label: value) for use inside an email body.
 *
 * Both arguments are HTML-escaped. Every one of the ~26 call sites passes plain
 * text, and several pass values straight from a public form or from checkout,
 * so escaping here rather than at each call site means a new caller is safe by
 * default instead of safe only if the author remembered.
 */
export function detailRow(label: string, value: string): string {
  return `<p style="margin: 0 0 8px 0;"><strong style="color: ${DARK};">${escapeHtml(label)}</strong> ${escapeHtml(value)}</p>`
}

/**
 * Same row, for a value that is already HTML — a link, typically.
 *
 * Kept separate from detailRow() rather than added as a flag, because the
 * difference is which argument is trusted, and that should be visible at the
 * call site. The label is still escaped; `valueHtml` is not, so build it from
 * escaped pieces.
 */
export function detailRowHtml(label: string, valueHtml: string): string {
  return `<p style="margin: 0 0 8px 0;"><strong style="color: ${DARK};">${escapeHtml(label)}</strong> ${valueHtml}</p>`
}

/**
 * The reminder that goes out roughly an hour before a session, to the student
 * and to the assigned tutor.
 *
 * Both emails are the same shape and differ only in who the other person is, so
 * they are one function with a `recipient` discriminator rather than the two
 * near-identical literals the scheduling route in
 * src/app/api/admin/sessions/[id]/route.ts keeps side by side.
 *
 * Everything user-supplied goes through detailRow() or the escaped `greeting`,
 * and the one piece of raw HTML — the location line — is assembled by
 * buildReminderLocation() from escaped parts. Sender: /api/cron/session-reminders.
 */
export function sessionReminderEmail(options: {
  recipient: 'student' | 'tutor'
  /** The `sessions` row; only session_type, meet_url and confirmed_start are read. */
  session: ReminderSessionRow
  /** Who the email is addressed to. */
  recipientName?: string | null
  /** The other person on the session — the tutor for a student, the student for a tutor. */
  counterpartName?: string | null
}): { subject: string; html: string } {
  const { recipient, session } = options
  const recipientName = options.recipientName?.trim() || ''
  const counterpartName =
    options.counterpartName?.trim() ||
    (recipient === 'student' ? 'Your ScoreMax tutor' : 'Your ScoreMax student')

  const { locationHtml, joinUrl } = buildReminderLocation(session)

  return {
    subject: 'Reminder: Your session starts in about an hour',
    html: emailLayout({
      title: 'Your Session Starts Soon',
      greeting: recipientName ? `Hi ${recipientName},` : 'Hi there,',
      body: [
        `<p style="margin: 0 0 16px 0;">This is a reminder that your ScoreMax session starts in about an hour.</p>`,
        detailRow(recipient === 'student' ? 'Tutor:' : 'Student:', counterpartName),
        detailRow('Time:', formatSessionTime(session.confirmed_start)),
        detailRowHtml('Location:', locationHtml),
      ].join(''),
      // No button at all when there is nothing to join — an in-person session,
      // or an online one whose Meet link was never created or has been cleared.
      // A CTA with an empty href renders as a dead button an hour before the
      // session, which is worse than no button.
      ...(joinUrl ? { ctaText: 'Join Your Session', ctaUrl: joinUrl } : {}),
    }),
  }
}
