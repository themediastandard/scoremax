import { NextRequest, NextResponse } from 'next/server'

import { isAccountType, type AccountType } from '@/lib/account-type'
import { GRADE_OPTIONS } from '@/lib/student-grades'
import {
  PENDING_STUDENTS_METADATA_KEY,
  SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY,
  SIGNUP_ONBOARDING_GATE_KEY,
  parseGoogleAccountSetup,
  parseSignupStudentDrafts,
  type GoogleAccountSetupRequest,
  type SignupStudentDraft,
} from '@/lib/signup-onboarding'
import { notifyAdminsOfSignup } from '@/lib/signup-admin-notification'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  normalizeStudentEmail,
  normalizeStudentPhone,
  toStudentDto,
  type ManagedStudent,
} from '@/lib/student-server'

export const dynamic = 'force-dynamic'

type Customer = {
  id: string
  profile_id: string | null
  full_name: string
  email: string
  phone: string | null
  account_type: AccountType | null
  student_grade: string | null
}

async function readCustomer(profileId: string): Promise<Customer | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('id, profile_id, full_name, email, phone, account_type, student_grade')
    .eq('profile_id', profileId)
    .maybeSingle()
  if (error) throw error
  return data as Customer | null
}

async function readStudents(customerId: string): Promise<ManagedStudent[]> {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('id, customer_id, full_name, email, phone, grade, is_active, created_at, updated_at')
    .eq('customer_id', customerId)
    .order('is_active', { ascending: false })
    .order('full_name', { ascending: true })
  if (error) throw error
  return data as ManagedStudent[]
}

async function insertParentStudents(customerId: string, drafts: SignupStudentDraft[]) {
  const existing = await readStudents(customerId)
  const existingEmails = new Set(existing.map((student) => normalizeStudentEmail(student.email)))
  const missing = drafts.filter((draft) => !existingEmails.has(draft.email))

  if (missing.length > 0) {
    // PostgREST sends this array as one INSERT statement: validation or a
    // constraint failure rolls back the entire missing set.
    const { error } = await supabaseAdmin.from('students').insert(missing.map((draft) => ({
      customer_id: customerId,
      full_name: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      grade: draft.grade,
    })))

    if (error && error.code !== '23505') throw error
  }

  const authoritative = await readStudents(customerId)
  const authoritativeEmails = new Set(authoritative.map((student) => normalizeStudentEmail(student.email)))
  if (!drafts.every((draft) => authoritativeEmails.has(draft.email))) {
    throw new Error('student_onboarding_incomplete')
  }
  return authoritative
}

async function ensureSelfStudent(customer: Customer) {
  if (!customer.student_grade || !GRADE_OPTIONS.includes(customer.student_grade)) {
    // Legacy student accounts can predate the required grade field. Keep the
    // booking page's specific support message instead of collapsing this into
    // a generic student-loading error.
    return readStudents(customer.id)
  }
  const email = normalizeStudentEmail(customer.email)
  const existing = await readStudents(customer.id)
  if (!existing.some((student) => normalizeStudentEmail(student.email) === email)) {
    const { error } = await supabaseAdmin.from('students').insert({
      customer_id: customer.id,
      full_name: customer.full_name || 'Student',
      email,
      phone: customer.phone?.trim() || null,
      grade: customer.student_grade,
    })
    if (error && error.code !== '23505') throw error
  }
  return readStudents(customer.id)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email || !user.email_confirmed_at) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profileError || profile?.role !== 'customer') {
    return NextResponse.json({ error: 'This account cannot create students' }, { status: 403 })
  }

  let requestStudents: SignupStudentDraft[] | null = null
  let requestStudentGrade: string | null = null
  let requestStudentPhone: string | null = null
  let googleSetupRequest: GoogleAccountSetupRequest | null = null
  try {
    const body = await request.json() as {
      accountType?: unknown
      students?: unknown
      studentGrade?: unknown
      studentPhone?: unknown
    }
    if (body.accountType !== undefined) {
      googleSetupRequest = parseGoogleAccountSetup(body)
      if (!googleSetupRequest) {
        return NextResponse.json(
          { error: 'Complete every required account setup field' },
          { status: 400 }
        )
      }
    }
    if (body.students !== undefined) requestStudents = parseSignupStudentDrafts(body.students)
    if (body.students !== undefined && !requestStudents) {
      return NextResponse.json({ error: 'Check every student and try again' }, { status: 400 })
    }
    if (body.studentGrade !== undefined) {
      if (typeof body.studentGrade !== 'string' || !GRADE_OPTIONS.includes(body.studentGrade)) {
        return NextResponse.json({ error: 'Choose a valid student grade' }, { status: 400 })
      }
      requestStudentGrade = body.studentGrade
    }
    if (body.studentPhone !== undefined) {
      if (typeof body.studentPhone !== 'string') {
        return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })
      }
      requestStudentPhone = normalizeStudentPhone(body.studentPhone)
      if (!requestStudentPhone || requestStudentPhone.length > 50) {
        return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })
      }
    }
  } catch {
    // An empty body is valid for email signup and normal returning customers.
  }

  try {
    let customer = await readCustomer(user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Your customer account is not ready yet' }, { status: 409 })
    }

    const metadataAccountType = isAccountType(user.user_metadata?.account_type)
      ? user.user_metadata.account_type
      : null
    const onboardingGate = isAccountType(user.app_metadata?.[SIGNUP_ONBOARDING_GATE_KEY])
      ? user.app_metadata[SIGNUP_ONBOARDING_GATE_KEY]
      : null
    const authProviders = user.app_metadata?.providers
    const hasGoogleIdentity = user.app_metadata?.provider === 'google' || (
      Array.isArray(authProviders) && authProviders.includes('google')
    )
    const requestedGoogleAccountType = googleSetupRequest?.accountType ?? null
    if (requestedGoogleAccountType && !hasGoogleIdentity) {
      return NextResponse.json({ error: 'Google account setup is not available' }, { status: 403 })
    }
    if (
      requestedGoogleAccountType &&
      customer.account_type &&
      customer.account_type !== requestedGoogleAccountType
    ) {
      return NextResponse.json({ error: 'Account setup is already complete' }, { status: 409 })
    }
    const googleSetupAuthorized = Boolean(
      requestedGoogleAccountType &&
      hasGoogleIdentity &&
      (!customer.account_type || onboardingGate === requestedGoogleAccountType)
    )
    let effectiveOnboardingGate = onboardingGate
    let onboardingAuthorized = onboardingGate === 'parent'
    let signupNotificationPending = (
      user.app_metadata?.[SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY] === true
    )

    if (!customer.account_type) {
      const requestedAccountType = metadataAccountType ?? onboardingGate ?? (
        googleSetupAuthorized ? requestedGoogleAccountType : null
      )
      if (!requestedAccountType) {
        if (hasGoogleIdentity) {
          return NextResponse.json(
            { error: 'Finish setting up your account', code: 'account_setup_required' },
            { status: 409 }
          )
        }
        return NextResponse.json(
          { error: 'Choose a parent or student account type' },
          { status: 409 }
        )
      }
      const metadataGrade = user.user_metadata?.student_grade
      const requestedStudentGrade = (
        typeof metadataGrade === 'string' && GRADE_OPTIONS.includes(metadataGrade)
      ) ? metadataGrade : requestStudentGrade
      const metadataPhone = typeof user.user_metadata?.phone === 'string'
        ? normalizeStudentPhone(user.user_metadata.phone)
        : null
      const requestedStudentPhone = metadataPhone ?? requestStudentPhone
      if (requestedAccountType === 'student') {
        if (!requestedStudentGrade) {
          return NextResponse.json({ error: 'Choose a valid student grade' }, { status: 409 })
        }
        if (!requestedStudentPhone) {
          return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 409 })
        }
      }

      // Arm the trusted, retryable notification before classification. If the
      // request stops after the database write, the next /book load can still
      // deliver the admin email. Existing classified accounts never get armed.
      const { error: gateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        app_metadata: {
          ...user.app_metadata,
          [SIGNUP_ONBOARDING_GATE_KEY]: requestedAccountType,
          [SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY]: true,
        },
      })
      if (gateError) throw gateError
      signupNotificationPending = true
      effectiveOnboardingGate = requestedAccountType
      if (requestedAccountType === 'parent') {
        onboardingAuthorized = true
      }

      const { error: classificationError } = await supabaseAdmin
        .from('customers')
        .update({
          account_type: requestedAccountType,
          ...(requestedAccountType === 'student' && {
            student_grade: requestedStudentGrade,
            phone: requestedStudentPhone,
          }),
        })
        .eq('profile_id', user.id)
        .is('account_type', null)
      if (classificationError) throw classificationError
      customer = await readCustomer(user.id)
      if (!customer?.account_type) throw new Error('account_classification_incomplete')
    }

    let students: ManagedStudent[]
    let preferredStudentId: string | null = null
    let onboardingCompleted = false

    if (customer.account_type === 'student') {
      students = await ensureSelfStudent(customer)
      if (effectiveOnboardingGate === 'student') {
        const { error: clearError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          app_metadata: {
            ...user.app_metadata,
            [SIGNUP_ONBOARDING_GATE_KEY]: null,
            [SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY]: signupNotificationPending || null,
          },
        })
        if (clearError) throw clearError
      }
    } else {
      const metadataStudents = parseSignupStudentDrafts(
        user.user_metadata?.[PENDING_STUDENTS_METADATA_KEY]
      )
      // Email confirmation can return after another completion request has
      // already classified the customer as a parent but before it created the
      // pending students. The persisted parent classification plus the
      // original signup account type must still be allowed to finish that
      // idempotent, owner-scoped work on the next /book load.
      const hasPendingEmailSignupStudents = (
        metadataAccountType === 'parent' && metadataStudents !== null
      )
      const canConsumeParentDrafts = onboardingAuthorized || hasPendingEmailSignupStudents
      const drafts = canConsumeParentDrafts ? (metadataStudents ?? requestStudents) : null
      if (canConsumeParentDrafts && !drafts) {
        // OAuth may return in a new tab or a browser may discard sessionStorage.
        // The trusted gate can classify the parent, but missing child details
        // must fail soft into the inline Add First Student recovery path rather
        // than trapping every refresh behind the same 409.
        const { error: clearError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            [PENDING_STUDENTS_METADATA_KEY]: null,
          },
          app_metadata: {
            ...user.app_metadata,
            [SIGNUP_ONBOARDING_GATE_KEY]: null,
            [SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY]: signupNotificationPending || null,
          },
        })
        if (clearError) throw clearError
      }

      students = drafts ? await insertParentStudents(customer.id, drafts) : await readStudents(customer.id)
      if (drafts) {
        const firstEmail = drafts[0].email
        preferredStudentId = students.find((student) => (
          student.is_active && normalizeStudentEmail(student.email) === firstEmail
        ))?.id ?? null
        onboardingCompleted = Boolean(preferredStudentId)

        const { error: clearError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            [PENDING_STUDENTS_METADATA_KEY]: null,
          },
          app_metadata: {
            ...user.app_metadata,
            [SIGNUP_ONBOARDING_GATE_KEY]: null,
            [SIGNUP_ADMIN_NOTIFICATION_PENDING_KEY]: signupNotificationPending || null,
          },
        })
        if (clearError) throw clearError
      }
    }

    const ownerEmail = normalizeStudentEmail(customer.email)
    const selfStudentId = customer.account_type === 'student'
      ? students.find((student) => (
          student.is_active && normalizeStudentEmail(student.email) === ownerEmail
        ))?.id ?? null
      : null

    await notifyAdminsOfSignup({
      userId: user.id,
      customer,
      students,
      notificationPending: signupNotificationPending,
    })

    return NextResponse.json({
      students: students.map(toStudentDto),
      accountType: customer.account_type,
      selfStudentId,
      preferredStudentId,
      onboardingCompleted,
    })
  } catch (error) {
    console.error('Could not complete signup onboarding:', error)
    return NextResponse.json({ error: 'Could not finish account setup. Try again.' }, { status: 500 })
  }
}
