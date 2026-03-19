import { redirect } from 'next/navigation'
import { getAuthUser, getProfile } from '@/lib/auth'
import { PricingTable } from '@/components/dashboard/PricingTable'

export default async function PricingPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Pricing</h1>
        <p className="mt-1 text-gray-500 text-sm">
          Manage pricing for memberships, packages, and courses. Changes apply to new bookings.
        </p>
      </div>
      <PricingTable />
    </div>
  )
}
