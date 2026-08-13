import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import {
  findAccountOwner,
  findOwnedStudent,
  normalizeStudentEmail,
  toStudentDto,
  type ManagedStudent,
} from '@/lib/student-server'

const updateStudentSchema = z.strictObject({
  fullName: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(320).optional(),
  grade: z.string().trim().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => Object.keys(value).length > 0)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const owner = await findAccountOwner(user.id)
  if (!owner) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  if (owner.account_type !== 'parent') {
    return NextResponse.json(
      { error: 'Only parent or guardian accounts can manage students' },
      { status: 403 }
    )
  }

  const { id } = await params
  if (!z.string().uuid().safeParse(id).success || !(await findOwnedStudent(owner.id, id))) {
    return NextResponse.json(
      { error: 'Student not found', code: 'student_not_found' },
      { status: 404 }
    )
  }

  let parsed
  try {
    parsed = updateStudentSchema.safeParse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request', code: 'invalid_request' }, { status: 400 })
  }
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid student details', code: 'invalid_request' }, { status: 400 })
  }

  const updates: Record<string, string | boolean> = {}
  if (parsed.data.fullName !== undefined) updates.full_name = parsed.data.fullName
  if (parsed.data.email !== undefined) updates.email = normalizeStudentEmail(parsed.data.email)
  if (parsed.data.grade !== undefined) updates.grade = parsed.data.grade
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive

  const { data, error } = await supabaseAdmin
    .from('students')
    .update(updates)
    .eq('id', id)
    .eq('customer_id', owner.id)
    .select('id, customer_id, full_name, email, grade, is_active, created_at, updated_at')
    .single()

  if (error?.code === '23505') {
    return NextResponse.json(
      { error: 'A student with this email already exists', code: 'duplicate_student' },
      { status: 409 }
    )
  }
  if (error || !data) return NextResponse.json({ error: 'Could not update student' }, { status: 500 })
  return NextResponse.json({ student: toStudentDto(data as ManagedStudent) })
}
