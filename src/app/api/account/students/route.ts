import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  findAccountOwner,
  normalizeStudentEmail,
  toStudentDto,
  type ManagedStudent,
} from '@/lib/student-server'

const createStudentSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  grade: z.string().trim().min(1).max(100),
})

async function authenticatedOwner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return findAccountOwner(user.id)
}

export async function GET() {
  const owner = await authenticatedOwner()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('students')
    .select('id, customer_id, full_name, email, grade, is_active, created_at, updated_at')
    .eq('customer_id', owner.id)
    .order('is_active', { ascending: false })
    .order('full_name', { ascending: true })

  if (error) return NextResponse.json({ error: 'Could not load students' }, { status: 500 })

  const managedStudents = data as ManagedStudent[]
  const ownerEmail = normalizeStudentEmail(owner.email)
  const selfStudentId = owner.account_type === 'student'
    ? managedStudents.find((student) => (
        student.is_active && normalizeStudentEmail(student.email) === ownerEmail
      ))?.id ?? null
    : null

  return NextResponse.json({
    students: managedStudents.map(toStudentDto),
    accountType: owner.account_type,
    selfStudentId,
  })
}

export async function POST(req: NextRequest) {
  const owner = await authenticatedOwner()
  if (!owner) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (owner.account_type !== 'parent') {
    return NextResponse.json(
      { error: 'Only parent or guardian accounts can add managed students' },
      { status: 403 }
    )
  }

  let parsed
  try {
    parsed = createStudentSchema.safeParse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request', code: 'invalid_request' }, { status: 400 })
  }
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid student details', code: 'invalid_request' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('students')
    .insert({
      customer_id: owner.id,
      full_name: parsed.data.fullName,
      email: normalizeStudentEmail(parsed.data.email),
      grade: parsed.data.grade,
    })
    .select('id, customer_id, full_name, email, grade, is_active, created_at, updated_at')
    .single()

  if (error?.code === '23505') {
    return NextResponse.json(
      { error: 'A student with this email already exists', code: 'duplicate_student' },
      { status: 409 }
    )
  }
  if (error || !data) return NextResponse.json({ error: 'Could not add student' }, { status: 500 })
  return NextResponse.json({ student: toStudentDto(data as ManagedStudent) }, { status: 201 })
}
