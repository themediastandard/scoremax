import { randomUUID } from 'node:crypto'

import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { parseSignupStudentDrafts } from '@/lib/signup-onboarding'
import { supabaseAdmin } from '@/lib/supabase/admin'

const paramsSchema = z.object({ id: z.string().uuid() })

type CreatedStudent = {
  id: string
  full_name: string
  email: string
  phone: string | null
  grade: string
  is_active: boolean
}

async function readCreatedStudent(customerId: string, studentId: string) {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('id, full_name, email, phone, grade, is_active')
    .eq('id', studentId)
    .eq('customer_id', customerId)
    .maybeSingle()

  if (error) throw error
  return data as CreatedStudent | null
}

export async function POST(
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

  const student = parseSignupStudentDrafts([body])?.[0]
  if (!student) {
    return NextResponse.json(
      { error: 'Enter a name, valid email, phone number, and grade' },
      { status: 400 }
    )
  }

  const customerId = parsedParams.data.id
  const { data: customer, error: customerError } = await supabaseAdmin
    .from('customers')
    .select('id, account_type')
    .eq('id', customerId)
    .maybeSingle()

  if (customerError) {
    return NextResponse.json({ error: 'Could not load customer' }, { status: 500 })
  }
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }
  if (customer.account_type !== 'parent') {
    return NextResponse.json(
      {
        error: customer.account_type
          ? 'Managed students can only be added to parent or guardian accounts'
          : 'Complete the account setup as Parent / Guardian before adding a student',
      },
      { status: 409 }
    )
  }

  const studentId = randomUUID()
  const { data, error } = await supabaseAdmin
    .from('students')
    .insert({
      id: studentId,
      customer_id: customerId,
      full_name: student.fullName,
      email: student.email,
      phone: student.phone,
      grade: student.grade,
    })
    .select('id, full_name, email, phone, grade, is_active')
    .maybeSingle()

  let created = data as CreatedStudent | null
  if (error || !created) {
    try {
      created = await readCreatedStudent(customerId, studentId)
    } catch (verificationError) {
      console.error('Could not verify admin-created student:', verificationError)
    }
  }

  if (!created) {
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'A student with this email already exists on this account' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'Could not add student' }, { status: 500 })
  }

  revalidatePath('/dashboard/customers')
  revalidatePath(`/dashboard/customers/${customerId}`)
  return NextResponse.json({ student: created }, { status: 201 })
}
