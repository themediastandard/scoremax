import type { AccountType } from '@/lib/account-type'

/**
 * Browser-safe contracts for managed student profiles.
 *
 * A managed student is an operational profile owned by an authenticated
 * ScoreMax customer. It is deliberately not a Supabase Auth user and carries
 * no login or billing authority.
 */
export interface StudentDto {
  id: string
  fullName: string
  email: string
  phone: string | null
  grade: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StudentsResponse {
  students: StudentDto[]
  accountType: AccountType | null
  /**
   * Present only for a student account whose active self profile matches the
   * account owner's email. Parent accounts never receive a self student id.
   */
  selfStudentId: string | null
}

export interface SignupCompletionResponse extends StudentsResponse {
  /** A server-verified active student from the just-completed parent signup. */
  preferredStudentId: string | null
  onboardingCompleted: boolean
}

export interface CreateStudentRequest {
  fullName: string
  email: string
  phone: string
  grade: string
}

export interface CreateStudentResponse {
  student: StudentDto
}

export interface UpdateStudentRequest {
  fullName?: string
  email?: string
  phone?: string
  grade?: string
  isActive?: boolean
}

export interface UpdateStudentResponse {
  student: StudentDto
}

export interface StudentApiError {
  error: string
  code?: 'duplicate_student' | 'student_not_found' | 'invalid_request'
}

export interface StudentCreditBreakdown {
  studentId: string
  studentName: string
  credits: number
}

/**
 * Account-wide totals remain visible in the parent portal, while
 * `eligibleCredits` is always calculated for `selectedStudentId`.
 */
export interface StudentCreditSummaryResponse {
  totalCredits: number
  familyCredits: number
  studentCredits: StudentCreditBreakdown[]
  selectedStudentId: string | null
  eligibleCredits: number
}

/** A compact student shape embedded in bookings, sessions, and confirmations. */
export type BookingStudentDto = Pick<StudentDto, 'id' | 'fullName' | 'email' | 'grade'>
