import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderAssignForm } from '@/components/dashboard/OrderAssignForm' // Client component

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  // Fetch order
  const { data: order, error } = await supabase
    .from('booking_requests')
    .select(`
      *,
      customers (full_name, email, phone, student_grade, notes),
      tutors (id, full_name),
      course_enrollments (course_type)
    `)
    .eq('id', params.id)
    .single()
    
  if (error || !order) {
    return <div>Order not found</div>
  }
  
  // Check access
  if (profile?.role === 'customer') {
    // Ensure customer owns this order
    const { data: customer } = await supabase.from('customers').select('id').eq('profile_id', user.id).single()
    if (order.customer_id !== customer?.id) {
      return <div>Access Denied</div>
    }
  }
  
  // Fetch tutors for assignment dropdown (if admin)
  let tutors = []
  if (profile?.role === 'admin') {
    const { data } = await supabase.from('tutors').select('id, full_name, specialties').eq('is_active', true)
    tutors = data || []
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Order Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Subjects</div>
                  {/* Need to fetch subject names properly or just show count */}
                  <div className="text-lg">{order.subjects?.length || 1} Selected</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Session Type</div>
                  <div className="text-lg capitalize">{order.session_type}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Requested Days</div>
                  <div className="text-lg">{order.available_days?.join(', ') || 'Any'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Time Preference</div>
                  <div className="text-lg">{order.available_time_start} - {order.available_time_end}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Customer Notes</div>
                <div className="bg-gray-50 p-3 rounded text-gray-700">{order.notes || 'None'}</div>
              </div>
            </CardContent>
          </Card>
          
          {profile?.role === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Assignment & Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderAssignForm order={order} tutors={tutors} />
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Name</div>
                <div className="font-medium">{order.customers?.full_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div>{order.customers?.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div>{order.customers?.phone}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Grade</div>
                <div>{order.customers?.student_grade || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-500">Type</div>
                <div className="font-medium capitalize">{order.payment_type}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Amount</div>
                <div className="font-medium">${(order.amount_cents / 100).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Status</div>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${order.status === 'active' ? 'bg-green-100 text-green-800' : 
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {order.status}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}