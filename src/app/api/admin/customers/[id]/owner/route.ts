import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdmin } from '@/lib/auth'
import { normalizeStudentEmail, normalizeStudentPhone } from '@/lib/student-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

const paramsSchema = z.object({ id: z.string().uuid() })
const updateSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(50),
  expectedFullName: z.string().max(500).nullable(),
  expectedPhone: z.string().max(200).nullable(),
})

type CustomerOwnerRow = {
  id: string
  profile_id: string | null
  full_name: string
  email: string
  phone: string | null
  account_type: 'parent' | 'student' | null
}

type SelfStudentRow = {
  id: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
}

type ProfileOwnerRow = {
  id: string
  full_name: string | null
  role: string | null
}

function ownerMatches(
  row: { full_name: string | null; phone: string | null } | null,
  fullName: string,
  phone: string
) {
  return row?.full_name === fullName && row.phone === phone
}

async function readCustomer(customerId: string): Promise<CustomerOwnerRow | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('id, profile_id, full_name, email, phone, account_type')
    .eq('id', customerId)
    .maybeSingle()
  if (error) throw error
  return data as CustomerOwnerRow | null
}

async function readSelfStudent(customer: CustomerOwnerRow): Promise<SelfStudentRow | null> {
  const { data, error } = await supabaseAdmin
    .from('students')
    .select('id, full_name, email, phone, is_active')
    .eq('customer_id', customer.id)
  if (error) throw error

  const ownerEmail = normalizeStudentEmail(customer.email)
  return ((data ?? []) as SelfStudentRow[]).find((student) => (
    student.is_active && normalizeStudentEmail(student.email) === ownerEmail
  )) ?? null
}

async function readProfile(profileId: string): Promise<ProfileOwnerRow | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', profileId)
    .maybeSingle()
  if (error) throw error
  return data as ProfileOwnerRow | null
}

async function persistCustomerOwner(
  customer: CustomerOwnerRow,
  fullName: string,
  phone: string
) {
  if (ownerMatches(customer, fullName, phone)) return true

  let update = supabaseAdmin
    .from('customers')
    .update({ full_name: fullName, phone })
    .eq('id', customer.id)
    .eq('full_name', customer.full_name)
  update = customer.phone === null
    ? update.is('phone', null)
    : update.eq('phone', customer.phone)

  const { data, error } = await update
    .select('id, full_name, phone')
    .maybeSingle()
  if (!error && ownerMatches(data, fullName, phone)) return true

  try {
    return ownerMatches(await readCustomer(customer.id), fullName, phone)
  } catch {
    return false
  }
}

async function persistSelfStudent(
  student: SelfStudentRow,
  customerId: string,
  fullName: string,
  phone: string
) {
  if (ownerMatches(student, fullName, phone)) return true

  let update = supabaseAdmin
    .from('students')
    .update({ full_name: fullName, phone })
    .eq('id', student.id)
    .eq('customer_id', customerId)
    .eq('full_name', student.full_name)
  update = student.phone === null
    ? update.is('phone', null)
    : update.eq('phone', student.phone)

  const { data, error } = await update
    .select('id, full_name, phone')
    .maybeSingle()
  if (!error && ownerMatches(data, fullName, phone)) return true

  const { data: reconciled } = await supabaseAdmin
    .from('students')
    .select('full_name, phone')
    .eq('id', student.id)
    .eq('customer_id', customerId)
    .maybeSingle()
  return ownerMatches(reconciled, fullName, phone)
}

async function persistProfileName(profile: ProfileOwnerRow, fullName: string) {
  if (profile.full_name === fullName) return true

  let update = supabaseAdmin
    .from('profiles')
    .update({ full_name: fullName })
    .eq('id', profile.id)
  update = profile.full_name === null
    ? update.is('full_name', null)
    : update.eq('full_name', profile.full_name)

  const { data, error } = await update
    .select('id, full_name')
    .maybeSingle()
  if (!error && data?.full_name === fullName) return true

  try {
    return (await readProfile(profile.id))?.full_name === fullName
  } catch {
    return false
  }
}

async function restoreCustomerOwner(
  customer: CustomerOwnerRow,
  savedFullName: string,
  savedPhone: string
) {
  const update = supabaseAdmin
    .from('customers')
    .update({ full_name: customer.full_name, phone: customer.phone })
    .eq('id', customer.id)
    .eq('full_name', savedFullName)
    .eq('phone', savedPhone)
  const { error } = await update
  if (error) console.error('Could not compensate customer owner update:', error.message)
}

async function restoreSelfStudent(
  student: SelfStudentRow,
  customerId: string,
  savedFullName: string,
  savedPhone: string
) {
  const { error } = await supabaseAdmin
    .from('students')
    .update({ full_name: student.full_name, phone: student.phone })
    .eq('id', student.id)
    .eq('customer_id', customerId)
    .eq('full_name', savedFullName)
    .eq('phone', savedPhone)
  if (error) console.error('Could not compensate student owner update:', error.message)
}

async function restoreProfileName(profile: ProfileOwnerRow, savedFullName: string) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ full_name: profile.full_name })
    .eq('id', profile.id)
    .eq('full_name', savedFullName)
  if (error) console.error('Could not compensate profile owner update:', error.message)
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
    return NextResponse.json(
      { error: 'Enter a valid account owner name and phone number' },
      { status: 400 }
    )
  }

  const customerId = parsedParams.data.id
  const fullName = parsedBody.data.fullName
  const phone = normalizeStudentPhone(parsedBody.data.phone)
  if (!phone) {
    return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 })
  }

  let customer: CustomerOwnerRow | null
  try {
    customer = await readCustomer(customerId)
  } catch {
    return NextResponse.json({ error: 'Could not load customer' }, { status: 500 })
  }
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }
  if (
    customer.full_name !== parsedBody.data.expectedFullName ||
    customer.phone !== parsedBody.data.expectedPhone
  ) {
    return NextResponse.json(
      {
        error: 'The account owner details changed in another request',
        fullName: customer.full_name,
        phone: customer.phone,
      },
      { status: 409 }
    )
  }

  let selfStudent: SelfStudentRow | null = null
  if (customer.account_type === 'student') {
    try {
      selfStudent = await readSelfStudent(customer)
    } catch {
      return NextResponse.json({ error: 'Could not load the student profile' }, { status: 500 })
    }
    if (!selfStudent) {
      return NextResponse.json(
        { error: 'Repair this student account profile before editing its owner details' },
        { status: 409 }
      )
    }
  }

  let profile: ProfileOwnerRow | null = null
  if (customer.profile_id) {
    try {
      profile = await readProfile(customer.profile_id)
    } catch {
      return NextResponse.json({ error: 'Could not load the linked account profile' }, { status: 500 })
    }
    if (!profile) {
      return NextResponse.json({ error: 'The linked account profile was not found' }, { status: 409 })
    }
    if (profile.role !== 'customer') {
      return NextResponse.json(
        { error: 'The linked profile is not a customer account' },
        { status: 409 }
      )
    }
  }

  const compensate = async () => {
    if (profile && profile.full_name !== fullName) {
      await restoreProfileName(profile, fullName)
    }
    if (selfStudent && !ownerMatches(selfStudent, fullName, phone)) {
      await restoreSelfStudent(selfStudent, customerId, fullName, phone)
    }
    if (!ownerMatches(customer, fullName, phone)) {
      await restoreCustomerOwner(customer, fullName, phone)
    }
  }

  try {
    const customerCommitted = await persistCustomerOwner(customer, fullName, phone)
    if (!customerCommitted) {
      await compensate()
      return NextResponse.json(
        { error: 'Could not update the account owner' },
        { status: 500 }
      )
    }

    if (selfStudent) {
      const studentCommitted = await persistSelfStudent(selfStudent, customerId, fullName, phone)
      if (!studentCommitted) {
        await compensate()
        return NextResponse.json(
          { error: 'Could not update the student account owner' },
          { status: 500 }
        )
      }
    }

    if (profile) {
      const profileCommitted = await persistProfileName(profile, fullName)
      if (!profileCommitted) {
        await compensate()
        return NextResponse.json(
          { error: 'Could not update the linked account owner' },
          { status: 500 }
        )
      }
    }
  } catch {
    await compensate()
    return NextResponse.json({ error: 'Could not update the account owner' }, { status: 500 })
  }

  revalidatePath('/dashboard/customers')
  revalidatePath(`/dashboard/customers/${customerId}`)
  return NextResponse.json({ fullName, phone })
}
