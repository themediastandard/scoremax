/** A `sessions` row, narrowed to the columns the reminder logic reads. */
export interface ReminderSessionRow {
  status?: string | null
  confirmed_start?: string | null
  reminder_sent_for?: string | null
  session_type?: string | null
  meet_url?: string | null
}

/** IANA zone every session time is rendered in. */
export declare const BUSINESS_TIME_ZONE: string

/** Street address used for in-person sessions, shared with the calendar event. */
export declare const IN_PERSON_LOCATION: string

/** Lower edge of the selection window, in minutes before `confirmed_start`. */
export declare const REMINDER_LEAD_MIN_MINUTES: number

/** Upper edge of the selection window, in minutes before `confirmed_start`. */
export declare const REMINDER_LEAD_MAX_MINUTES: number

/** Inclusive `confirmed_start` range a tick at `now` should poll for. */
export declare function reminderWindow(now?: Date | string | number): {
  start: string
  end: string
}

/** True when the stored marker says this exact start has already been reminded. */
export declare function isAlreadyReminded(
  reminderSentFor: string | Date | null | undefined,
  confirmedStart: string | Date | null | undefined
): boolean

/** True when the session should be reminded on a tick at `now`. */
export declare function isReminderDue(
  session: ReminderSessionRow | null | undefined,
  now?: Date | string | number
): boolean

/** Re-check immediately before sending: still scheduled, still at `expectedStart`, still unsent. */
export declare function isReminderStillDue(
  session: ReminderSessionRow | null | undefined,
  expectedStart: string | Date | null | undefined
): boolean

/** Session time in the business timezone, with the zone abbreviation appended. */
export declare function formatSessionTime(value: string | Date | null | undefined): string

/**
 * Location line for the reminder email.
 *
 * `locationHtml` is trusted HTML built from escaped parts — it may contain an
 * anchor — and is safe to interpolate into `emailLayout`'s `body`. `joinUrl` is
 * null whenever there is no link to offer, and must never be rendered as an
 * href without checking that.
 */
export declare function buildReminderLocation(
  session: ReminderSessionRow | null | undefined
): { locationHtml: string; joinUrl: string | null }
