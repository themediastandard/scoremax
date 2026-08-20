import { randomUUID } from 'node:crypto'

import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { GRADE_OPTIONS } from '@/lib/student-grades'
import { parseSignupStudentDrafts, type SignupStudentDraft } from '@/lib/signup-onboarding'
import { normalizeStudentEmail, normalizeStudentPhone } from '@/lib/student-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const paramsSchema = z.object({ id: z.string().uuid() })
const updateSchema = z.discriminatedUnion('account_type', [
  z.strictObject({
    account_type: z.literal('parent'),
    student: z.unknown().optional(),
  }),
  z.strictObject({
    account_type: z.literal('student'),
    studentGrade: z.string().trim().refine(
      (grade) => GRADE_OPTIONS.includes(grade),
      'Choose a valid student grade'
    ),
    studentPhone: z.string().trim().min(1).max(50),
  }),
])

type CustomerForSetup = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  student_grade: string | null
  account_type: 'parent' | 'student' | null
}

type StudentForSetup = {
  id: string
  full_name: string
  email: string
  phone: string | null
  grade: string
  is_active: boolean
}

async function createSetupStudent(customerId: string, draft: SignupStudentDraft) {
  // Supplying the id lets us verify a committed insert even if its response is
  // lost, and lets compensation target only the row created by this request.
  const studentId = randomUUID()
  const { data, error } = await supabaseAdmin
    .from('students')
    .insert({
      id: studentId,
      customer_id: customerId,
      full_name: draft.fullName,
      email: draft.email,
      phone: draft.phone,
      grade: draft.grade,
    })
    .select('id')
    .maybeSingle()

  if (!error && data?.id === studentId) return studentId

  if (error) {
    const { data: committed, error: verifyError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('customer_id', customerId)
      .maybeSingle()
    if (!verifyError && committed?.id === studentId) return studentId
    throw error
  }

  throw new Error('student_setup_insert_incomplete')
}

async function removeSetupStudent(customerId: string, studentId: string) {
  const { error } = await supabaseAdmin
    .from('students')
    .delete()
    .eq('id', studentId)
    .eq('customer_id', customerId)
  if (error) {
    console.error('Could not compensate account setup student:', error.message)
  }
}

function studentSetupMatches(
  customer: Pick<CustomerForSetup, 'account_type' | 'phone' | 'student_grade'> | null,
  accountType: 'parent' | 'student',
  studentPhone: string | null,
  studentGrade: string | null
) {
  if (customer?.account_type !== accountType) return false
  if (accountType === 'parent') return true
  return (
    normalizeStudentPhone(customer.phone ?? undefined) === studentPhone &&
    customer.student_grade === studentGrade
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsedParams = paramsSchema.safeParse(await params)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid customer id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsedBody = updateSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Complete every required account setup field' }, { status: 400 })
  }

  const customerId = parsedParams.data.id
  const { data: customerData, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id, full_name, email, phone, student_grade, account_type')
    .eq('id', customerId)
    .maybeSingle()

  if (customerError) {
    return NextResponse.json({ error: 'Could not load customer' }, { status: 500 })
  }
  if (!customerData) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const customer = customerData as CustomerForSetup
  const accountType = parsedBody.data.account_type
  if (customer.account_type === accountType) {
    return NextResponse.json(
      { error: `This account is already classified as ${accountType}`, accountType },
      { status: 409 }
    )
  }

  const { data: studentData, error: studentsError } = await supabaseAdmin
    .from('students')
    .select('id, full_name, email, phone, grade, is_active')
    .eq('customer_id', customerId)
  if (studentsError) {
    return NextResponse.json({ error: 'Could not load managed students' }, { status: 500 })
  }
  const existingStudents = (studentData ?? []) as StudentForSetup[]

  let studentDraft: SignupStudentDraft | null = null
  let studentPhone: string | null = null
  let studentGrade: string | null = null
  let setupStudentId: string | null = null
  let createdStudentId: string | null = null
  let classificationCommitted = false

  if (accountType === 'parent') {
    const hasActiveStudent = existingStudents.some((student) => student.is_active)
    if (!hasActiveStudent) {
      const parsedStudents = parsedBody.data.student === undefined
        ? null
        : parseSignupStudentDrafts([parsedBody.data.student])
      if (!parsedStudents) {
        return NextResponse.json(
          { error: 'Add the first student before completing this parent account' },
          { status: 400 }
        )
      }
      studentDraft = parsedStudents[0]
      const conflictingStudent = existingStudents.find((student) => (
        normalizeStudentEmail(student.email) === studentDraft?.email
      ))
      if (conflictingStudent) {
        return NextResponse.json(
          { error: 'A student with that email already exists on this account and needs reactivation' },
          { status: 409 }
        )
      }
    }
  } else {
    studentPhone = normalizeStudentPhone(parsedBody.data.studentPhone)
    studentGrade = parsedBody.data.studentGrade
    if (!studentPhone) {
      return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })
    }

    const ownerEmail = normalizeStudentEmail(customer.email)
    const nonSelfStudents = existingStudents.filter((student) => (
      normalizeStudentEmail(student.email) !== ownerEmail
    ))
    if (nonSelfStudents.length > 0) {
      return NextResponse.json(
        { error: 'This account already manages another student and cannot be converted to a student account' },
        { status: 409 }
      )
    }

    const existingSelf = existingStudents.find((student) => (
      normalizeStudentEmail(student.email) === ownerEmail
    ))
    if (existingSelf) {
      const existingPhone = normalizeStudentPhone(existingSelf.phone ?? undefined)
      if (
        !existingSelf.is_active ||
        existingSelf.grade !== studentGrade ||
        existingPhone !== studentPhone
      ) {
        return NextResponse.json(
          { error: 'The existing student profile needs manual repair before conversion' },
          { status: 409 }
        )
      }
      setupStudentId = existingSelf.id
    } else {
      studentDraft = {
        fullName: customer.full_name?.trim() || 'Student',
        email: ownerEmail,
        phone: studentPhone,
        grade: studentGrade,
      }
    }
  }

  try {
    if (studentDraft) {
      createdStudentId = await createSetupStudent(customerId, studentDraft)
      setupStudentId = createdStudentId
    }

    let classificationQuery = supabaseAdmin
      .from('customers')
      .update({
        account_type: accountType,
        ...(accountType === 'student' && {
          phone: studentPhone,
          student_grade: studentGrade,
        }),
      })
      .eq('id', customerId)

    classificationQuery = customer.account_type === null
      ? classificationQuery.is('account_type', null)
      : classificationQuery.eq('account_type', customer.account_type)

    const { data: classifiedData, error: classificationError } = await classificationQuery
      .select('id, account_type, phone, student_grade')
      .maybeSingle()

    let classified = classifiedData as Pick<
      CustomerForSetup,
      'account_type' | 'phone' | 'student_grade'
    > | null

    if (classificationError || !classified) {
      const { data: reconciled, error: reconcileError } = await supabaseAdmin
        .from('customers')
        .select('account_type, phone, student_grade')
        .eq('id', customerId)
        .maybeSingle()
      classified = reconciled as Pick<
        CustomerForSetup,
        'account_type' | 'phone' | 'student_grade'
      > | null

      if (!reconcileError && studentSetupMatches(
        classified,
        accountType,
        studentPhone,
        studentGrade
      )) {
        // The guarded update committed but its response was lost.
      } else {
        if (createdStudentId) await removeSetupStudent(customerId, createdStudentId)
        if (classificationError || reconcileError) {
          return NextResponse.json({ error: 'Could not update account type' }, { status: 500 })
        }
        return NextResponse.json(
          { error: 'The account type changed in another request', accountType: classified?.account_type ?? null },
          { status: 409 }
        )
      }
    }

    classificationCommitted = true
    revalidatePath('/dashboard/customers')
    revalidatePath(`/dashboard/customers/${customerId}`)
    return NextResponse.json({ accountType, studentId: setupStudentId })
  } catch (error) {
    if (createdStudentId && !classificationCommitted) {
      await removeSetupStudent(customerId, createdStudentId)
    }
    console.error('Could not update admin account type:', error)
    return NextResponse.json({ error: 'Could not update account type' }, { status: 500 })
  }
}
