export interface AssignmentPerson {
  id?: string
  email?: string | null
  full_name?: string | null
}

export interface CalendarAttendee {
  email?: string | null
  displayName?: string | null
  responseStatus?: string | null
}

export function replaceManagedStudentAttendee(
  attendees: CalendarAttendee[] | null | undefined,
  previousStudent: AssignmentPerson | null | undefined,
  nextStudent: AssignmentPerson,
  owner: AssignmentPerson,
  tutor: AssignmentPerson
): CalendarAttendee[]

export interface StudentAssignmentPolicyInput {
  currentStudentId?: string | null
  nextStudentId?: string | null
  paymentMethod?: string | null
  paymentType?: string | null
  courseEnrollmentId?: string | null
  boundStudentId?: string | null
}

export type StudentAssignmentPolicyResult =
  | { allowed: true }
  | { allowed: false; code: string; message: string }

export function studentAssignmentPolicy(
  input: StudentAssignmentPolicyInput
): StudentAssignmentPolicyResult
