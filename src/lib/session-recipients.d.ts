export interface RecipientPerson {
  id?: string
  email?: string | null
  full_name?: string | null
}

export interface OperationalRecipient extends RecipientPerson {
  role: 'owner' | 'student'
  email: string
}

export function normalizedEmail(value: unknown): string
export function operationalRecipients(
  owner?: RecipientPerson | null,
  student?: RecipientPerson | null
): OperationalRecipient[]
export function calendarAttendees(
  tutor?: RecipientPerson | null,
  owner?: RecipientPerson | null,
  student?: RecipientPerson | null
): Array<{ email: string; displayName?: string }>
export function sessionStudentName(session: {
  students?: { full_name?: string | null } | null
} | null): string
