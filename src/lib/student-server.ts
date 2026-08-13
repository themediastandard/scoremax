import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { StudentDto } from '@/lib/student-contract'
import type { AccountType } from '@/lib/account-type'

export type AccountOwner = {
  id: string
  profile_id: string | null
  full_name: string
  email: string
  account_type: AccountType | null
}

export type ManagedStudent = {
  id: string
  customer_id: string
  full_name: string
  email: string
  phone: string | null
  grade: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function toStudentDto(student: ManagedStudent): StudentDto {
  return {
    id: student.id,
    fullName: student.full_name,
    email: student.email,
    phone: student.phone,
    grade: student.grade,
    isActive: student.is_active,
    createdAt: student.created_at,
    updatedAt: student.updated_at,
  }
}

export async function findAccountOwner(profileId: string): Promise<AccountOwner | null> {
  const { data, error } = await supabaseAdmin
    .from('customers')
    .select('id, profile_id, full_name, email, account_type')
    .eq('profile_id', profileId)
    .maybeSingle()

  if (error) throw error
  return data as AccountOwner | null
}

export async function findOwnedStudent(
  customerId: string,
  studentId: string,
  options: { activeOnly?: boolean } = {}
): Promise<ManagedStudent | null> {
  let query = supabaseAdmin
    .from('students')
    .select('id, customer_id, full_name, email, phone, grade, is_active, created_at, updated_at')
    .eq('id', studentId)
    .eq('customer_id', customerId)

  if (options.activeOnly) query = query.eq('is_active', true)

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data as ManagedStudent | null
}

export function normalizeStudentEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeStudentPhone(phone: string | undefined): string | null {
  return phone?.trim() || null
}
