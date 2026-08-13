import { redirect } from 'next/navigation'
import { StudentsManager } from '@/components/dashboard/StudentsManager'
import { getAuthUser, getProfile } from '@/lib/auth'
import { findAccountOwner } from '@/lib/student-server'

export default async function StudentsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'customer') redirect('/dashboard')

  const owner = await findAccountOwner(user.id)
  if (owner?.account_type !== 'parent') redirect('/dashboard')

  return <StudentsManager />
}
