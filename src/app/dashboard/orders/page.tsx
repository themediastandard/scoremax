import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  // Fetch orders based on role
  let query = supabase.from('booking_requests').select(`
    *,
    customers (full_name, email),
    tutors (full_name)
  `).order('created_at', { ascending: false })
  
  if (profile?.role === 'customer') {
    // Get customer ID
    const { data: customer } = await supabase.from('customers').select('id').eq('profile_id', user.id).single()
    if (customer) {
      query = query.eq('customer_id', customer.id)
    } else {
      query = query.eq('customer_id', '00000000-0000-0000-0000-000000000000') // None
    }
  }
  
  const { data: orders } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Orders</h1>
      
      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              {profile?.role === 'admin' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders?.map((order: any) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {/* Need to fetch subject names or store them? We store IDs. Fetching names is N+1 unless joined.
                      For now just showing ID count or something. Ideally we join subjects.
                      Supabase doesn't support array joins easily in one query without RPC or flattening.
                      Actually we can just show "Tutoring Session" for MVP or fetch subjects client side.
                   */}
                   {order.subjects?.length || 1} Subject(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${order.status === 'active' ? 'bg-green-100 text-green-800' : 
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                    {order.status}
                  </span>
                </td>
                {profile?.role === 'admin' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customers?.full_name}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.tutors?.full_name || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href={`/dashboard/orders/${order.id}`} className="text-[#517cad] hover:text-[#3b5c85]">View</a>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}