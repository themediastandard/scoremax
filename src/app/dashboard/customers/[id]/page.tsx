import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import { CustomerDetailContent } from '@/components/dashboard/CustomerDetailContent'
import { getAuthUser, getProfile } from '@/lib/auth'
import { loadAdminCustomerDetail } from '@/lib/admin-customer-detail'

const customerIdSchema = z.string().uuid()

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  const parsedId = customerIdSchema.safeParse((await params).id)
  if (!parsedId.success) notFound()

  const detail = await loadAdminCustomerDetail(parsedId.data)
  if (!detail) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-[#4a729f]"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to customers
        </Link>
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#4a729f]">Customer Details</p>
          <h1 className="mt-1 text-2xl font-bold font-serif text-[#1e293b] sm:text-3xl">
            {detail.customer.full_name || 'Unnamed Customer'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Account owner and student activity in one place.</p>
        </div>
      </div>

      <CustomerDetailContent detail={detail} />
    </div>
  )
}
