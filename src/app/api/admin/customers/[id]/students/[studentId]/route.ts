import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { normalizeStudentEmail, normalizeStudentPhone } from '@/lib/student-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const paramsSchema = z.object({
  id: z.string().uuid(),
  studentId: z.string().uuid(),
})
const updateSchema = z.discriminatedUnion('action', [
  z.strictObject({
    action: z.literal('status'),
    isActive: z.boolean(),
    expectedIsActive: z.boolean(),
  }),
  z.strictObject({
    action: z.literal('details'),
    fullName: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(1).max(50),
    expectedFullName: z.string().max(500),
    expectedPhone: z.string().max(200).nullable(),
  }),
])
const deleteSchema = z.strictObject({
  expectedIsActive: z.boolean(),
})

const STUDENT_REFERENCE_TABLES = [
  'booking_requests',
  'sessions',
  'packages',
  'course_enrollments',
  'act_course_enrollments',
  'admin_session_booking_audit',
] as const

type CustomerContext = {
  id: string
  email: string
  account_type: 'parent' | 'student' | null
}

type StudentContext = {
  id: string
  customer_id: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
}

async function readCustomer(customerId: string): Promise<CustomerContext | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('id, email, account_type')
    .eq('id', customerId)
    .maybeSingle()
  if (error) throw error
  return data as CustomerContext | null
}

async function readStudent(
  customerId: string,
  studentId: string
): Promise<StudentContext | null> {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('id, customer_id, full_name, email, phone, is_active')
    .eq('id', studentId)
    .eq('customer_id', customerId)
    .maybeSingle()
  if (error) throw error
  return data as StudentContext | null
}

function isRequiredSelfStudent(customer: CustomerContext, student: StudentContext) {
  return (
    customer.account_type === 'student' &&
    normalizeStudentEmail(customer.email) === normalizeStudentEmail(student.email)
  )
}

async function loadContext(customerId: string, studentId: string) {
  const [customer, student] = await Promise.all([
    readCustomer(customerId),
    readStudent(customerId, studentId),
  ])
  return { customer, student }
}

function revalidateCustomer(customerId: string) {
  revalidatePath('/dashboard/customers')
  revalidatePath(`/dashboard/customers/${customerId}`)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsedParams = paramsSchema.safeParse(await params)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid customer or student id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const parsedBody = updateSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Enter valid student details or status' }, { status: 400 })
  }

  const customerId = parsedParams.data.id
  const studentId = parsedParams.data.studentId
  let context: Awaited<ReturnType<typeof loadContext>>
  try {
    context = await loadContext(customerId, studentId)
  } catch {
    return NextResponse.json({ error: 'Could not load the student' }, { status: 500 })
  }
  if (!context.customer || !context.student) {
    return NextResponse.json({ error: 'Student not found on this account' }, { status: 404 })
  }

  if (parsedBody.data.action === 'details') {
    if (isRequiredSelfStudent(context.customer, context.student)) {
      return NextResponse.json(
        { error: 'Edit this student through Account Owner so the linked profile stays synchronized' },
        { status: 409 }
      )
    }

    if (
      context.student.full_name !== parsedBody.data.expectedFullName ||
      context.student.phone !== parsedBody.data.expectedPhone
    ) {
      return NextResponse.json(
        {
          error: 'The student details changed in another request',
          fullName: context.student.full_name,
          phone: context.student.phone,
        },
        { status: 409 }
      )
    }

    const fullName = parsedBody.data.fullName
    const phone = normalizeStudentPhone(parsedBody.data.phone)
    if (!phone) {
      return NextResponse.json({ error: 'Enter a phone number' }, { status: 400 })
    }
    if (context.student.full_name === fullName && context.student.phone === phone) {
      return NextResponse.json({ fullName, phone })
    }

    let updateQuery = supabaseAdmin
      .from('students')
      .update({ full_name: fullName, phone })
      .eq('id', studentId)
      .eq('customer_id', customerId)
      .eq('full_name', context.student.full_name)
    updateQuery = context.student.phone === null
      ? updateQuery.is('phone', null)
      : updateQuery.eq('phone', context.student.phone)

    const { data: updated, error: updateError } = await updateQuery
      .select('id, full_name, phone')
      .maybeSingle()

    let committed = (
      !updateError &&
      updated?.full_name === fullName &&
      updated?.phone === phone
    )
    if (!committed) {
      try {
        const current = await readStudent(customerId, studentId)
        committed = current?.full_name === fullName && current.phone === phone
      } catch {
        // The response-loss verification failed too.
      }
    }
    if (!committed) {
      return NextResponse.json({ error: 'Could not update the student details' }, { status: 500 })
    }

    revalidateCustomer(customerId)
    return NextResponse.json({ fullName, phone })
  }

  if (context.student.is_active !== parsedBody.data.expectedIsActive) {
    return NextResponse.json(
      {
        error: 'The student status changed in another request',
        isActive: context.student.is_active,
      },
      { status: 409 }
    )
  }
  if (context.student.is_active === parsedBody.data.isActive) {
    return NextResponse.json({ isActive: context.student.is_active })
  }
  if (!parsedBody.data.isActive && isRequiredSelfStudent(context.customer, context.student)) {
    return NextResponse.json(
      { error: 'Change this account type before deactivating its required student profile' },
      { status: 409 }
    )
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('students')
    .update({ is_active: parsedBody.data.isActive })
    .eq('id', studentId)
    .eq('customer_id', customerId)
    .eq('is_active', context.student.is_active)
    .select('id, is_active')
    .maybeSingle()

  let committed = !updateError && updated?.is_active === parsedBody.data.isActive
  if (!committed) {
    try {
      committed = (await readStudent(customerId, studentId))?.is_active === parsedBody.data.isActive
    } catch {
      // The response-loss verification failed too.
    }
  }
  if (!committed) {
    return NextResponse.json({ error: 'Could not update the student status' }, { status: 500 })
  }

  revalidateCustomer(customerId)
  return NextResponse.json({ isActive: parsedBody.data.isActive })
}

async function hasStudentReferences(customerId: string, studentId: string) {
  const results = await Promise.all(
    STUDENT_REFERENCE_TABLES.map((table) => (
      supabaseAdmin
        .from(table)
        .select('student_id')
        .eq('customer_id', customerId)
        .eq('student_id', studentId)
        .limit(1)
    ))
  )
  if (results.some((result) => result.error)) throw new Error('student_reference_check_failed')
  return results.some((result) => (result.data?.length ?? 0) > 0)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
) {
  const authError = await requireAdmin()
  if (authError) return authError

  const parsedParams = paramsSchema.safeParse(await params)
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid customer or student id' }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const parsedBody = deleteSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Confirm the current student status' }, { status: 400 })
  }

  const customerId = parsedParams.data.id
  const studentId = parsedParams.data.studentId
  let context: Awaited<ReturnType<typeof loadContext>>
  try {
    context = await loadContext(customerId, studentId)
  } catch {
    return NextResponse.json({ error: 'Could not load the student' }, { status: 500 })
  }
  if (!context.customer || !context.student) {
    return NextResponse.json({ error: 'Student not found on this account' }, { status: 404 })
  }
  if (context.student.is_active !== parsedBody.data.expectedIsActive) {
    return NextResponse.json(
      {
        error: 'The student status changed in another request',
        isActive: context.student.is_active,
      },
      { status: 409 }
    )
  }
  if (isRequiredSelfStudent(context.customer, context.student)) {
    return NextResponse.json(
      { error: 'Change this account type before deleting its required student profile' },
      { status: 409 }
    )
  }
  if (context.student.is_active) {
    return NextResponse.json(
      { error: 'Deactivate this student before deleting them' },
      { status: 409 }
    )
  }

  let hasReferences: boolean
  try {
    hasReferences = await hasStudentReferences(customerId, studentId)
  } catch {
    return NextResponse.json({ error: 'Could not verify the student history' }, { status: 500 })
  }
  if (hasReferences) {
    return NextResponse.json(
      {
        error: 'This student has orders, sessions, credits, or course history and cannot be deleted. Keep them inactive instead.',
      },
      { status: 409 }
    )
  }

  const { data: deleted, error: deleteError } = await supabaseAdmin
    .from('students')
    .delete()
    .eq('id', studentId)
    .eq('customer_id', customerId)
    .eq('is_active', false)
    .select('id')
    .maybeSingle()

  let committed = !deleteError && deleted?.id === studentId
  if (!committed) {
    try {
      committed = (await readStudent(customerId, studentId)) === null
    } catch {
      // The response-loss verification failed too.
    }
  }
  if (!committed) {
    if (deleteError?.code === '23503') {
      return NextResponse.json(
        { error: 'This student has account history and cannot be deleted. Keep them inactive instead.' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Could not delete the student' }, { status: 500 })
  }

  revalidateCustomer(customerId)
  return NextResponse.json({ deleted: true, studentId })
}
