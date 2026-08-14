export declare const BUSINESS_TIME_ZONE: 'America/New_York'

export declare function businessLocalDateTimeToIso(
  dateValue: string,
  timeValue: string,
): { ok: true; iso: string } | { ok: false; code: string }

export declare function isOneHourSession(startIso: string, endIso: string): boolean
export declare function adminBookingCalendarEventId(sessionId: string): string

export type AdminBookingRecipient = {
  role: 'owner' | 'student' | 'tutor' | 'admin'
  email: string
  full_name: string
}

export declare function adminBookingEmailRecipients(context?: {
  owner?: { email?: string | null; full_name?: string | null } | null
  student?: { email?: string | null; full_name?: string | null } | null
  tutor?: { email?: string | null; full_name?: string | null } | null
  admins?: Array<{ email?: string | null; full_name?: string | null }> | null
}): AdminBookingRecipient[]
