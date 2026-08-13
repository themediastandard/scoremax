import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import { TutorDetailContent } from '@/components/dashboard/TutorDetailContent'
import { TutorForm } from '@/components/dashboard/TutorForm'
import { getAuthUser, getProfile } from '@/lib/auth'
import { loadAdminTutorDetail } from '@/lib/admin-tutor-detail'

const tutorIdSchema = z.string().uuid()

export default async function TutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const parsedId = tutorIdSchema.safeParse((await params).id)
  if (!parsedId.success) notFound()

  const detail = await loadAdminTutorDetail(parsedId.data)
  if (!detail) notFound()

  const { tutor } = detail

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/tutors"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-[#4a729f]"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to tutors
        </Link>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#4a729f]">Tutor Details</p>
            <h1 className="mt-1 text-2xl font-bold font-serif text-[#1e293b] sm:text-3xl">{tutor.full_name}</h1>
            <p className="mt-1 text-sm text-gray-500">Tutor profile and complete assigned session history.</p>
          </div>
          <TutorForm
            tutor={{
              id: tutor.id,
              full_name: tutor.full_name,
              email: tutor.email,
              phone: tutor.phone ?? '',
              bio: tutor.bio ?? '',
              photo_url: tutor.photo_url ?? '',
              specialties: tutor.specialties ?? [],
              is_active: tutor.is_active,
            }}
          />
        </div>
      </div>

      <TutorDetailContent detail={detail} />
    </div>
  )
}
