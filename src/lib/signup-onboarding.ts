import { z } from 'zod'

import { GRADE_OPTIONS } from '@/lib/student-grades'

export const PENDING_STUDENTS_METADATA_KEY = 'scoremax_pending_students_v1'
export const SIGNUP_ONBOARDING_GATE_KEY = 'scoremax_signup_onboarding_v1'
export const GOOGLE_SIGNUP_STORAGE_KEY = 'scoremax:signup-onboarding:v1'
export const MAX_SIGNUP_STUDENTS = 10

const studentDraftSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320).transform((email) => email.toLowerCase()),
  phone: z.string().trim().max(50).default(''),
  grade: z.string().trim().refine((grade) => GRADE_OPTIONS.includes(grade), 'Select a valid grade'),
})

const studentDraftsSchema = z
  .array(studentDraftSchema)
  .min(1)
  .max(MAX_SIGNUP_STUDENTS)
  .superRefine((students, context) => {
    const emails = new Set<string>()
    students.forEach((student, index) => {
      if (emails.has(student.email)) {
        context.addIssue({
          code: 'custom',
          message: 'Each student needs a different email address',
          path: [index, 'email'],
        })
      }
      emails.add(student.email)
    })
  })

export type SignupStudentDraft = z.infer<typeof studentDraftSchema>

export function parseSignupStudentDrafts(value: unknown): SignupStudentDraft[] | null {
  const parsed = studentDraftsSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export function signupStudentDraftError(value: unknown): string | null {
  const parsed = studentDraftsSchema.safeParse(value)
  if (parsed.success) return null
  const issue = parsed.error.issues[0]
  if (issue?.message === 'Each student needs a different email address') return issue.message
  return 'Enter a name, valid email, and grade for every student.'
}

type PendingGoogleSignup =
  | { accountType: 'parent'; students: SignupStudentDraft[]; studentGrade?: never; next: '/book' | null }
  | { accountType: 'student'; students?: never; studentGrade: string; next: '/book' | null }

export function writePendingGoogleSignup(storage: Storage, value: PendingGoogleSignup): boolean {
  try {
    storage.setItem(GOOGLE_SIGNUP_STORAGE_KEY, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function readPendingGoogleSignup(storage: Storage): PendingGoogleSignup | null {
  try {
    const raw = JSON.parse(storage.getItem(GOOGLE_SIGNUP_STORAGE_KEY) ?? 'null') as unknown
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const candidate = raw as Record<string, unknown>
    const next = candidate.next === '/book' ? '/book' : null
    if (candidate.accountType === 'parent') {
      const students = parseSignupStudentDrafts(candidate.students)
      return students ? { accountType: 'parent', students, next } : null
    }
    if (candidate.accountType === 'student' && (
      typeof candidate.studentGrade === 'string' && GRADE_OPTIONS.includes(candidate.studentGrade)
    )) {
      return { accountType: 'student', studentGrade: candidate.studentGrade, next }
    }
    return null
  } catch {
    return null
  }
}

export function clearPendingGoogleSignup(storage: Storage) {
  try {
    storage.removeItem(GOOGLE_SIGNUP_STORAGE_KEY)
  } catch {
    // A completed server finalization remains authoritative even if storage is unavailable.
  }
}
