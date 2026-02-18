import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderAssignForm } from '@/components/dashboard/OrderAssignForm'
import { formatDateTime, formatAmount } from '@/lib/order-format'
import { ArrowLeft, Calendar, User, BookOpen, Video, CreditCard, VideoIcon, Clock } from 'lucide-react'
import { ReceiptButton } from '@/components/dashboard/ReceiptButton'

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
    return (
      <div className="space-y-6">
        <Link href="/dashboard/orders" className="inline-flex items-center text-sm text-[#517cad] hover:text-[#3b5c85]">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to orders
        </Link>
        <Card className="py-12 text-center">
          <CardContent>
            <p className="text-gray-500">Order not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Check access
  if (profile?.role === 'customer') {
    const { data: customer } = await supabase.from('customers').select('id').eq('profile_id', user.id).single()
    if (order.customer_id !== customer?.id) {
      return (
        <div className="space-y-6">
          <Link href="/dashboard/orders" className="inline-flex items-center text-sm text-[#517cad] hover:text-[#3b5c85]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Link>
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-gray-600 font-medium">Access denied</p>
              <p className="text-sm text-gray-500 mt-1">You don&apos;t have permission to view this order.</p>
            </CardContent>
          </Card>
        </div>
      )
    }
  }
  
  const { data: subjects } = await supabase.from('subjects').select('id, name')
  const subjectMap = new Map((subjects ?? []).map((s) => [s.id, s.name]))

  // Fetch tutors for assignment dropdown (if admin)
  let tutors = []
  if (profile?.role === 'admin') {
    const { data } = await supabase.from('tutors').select('id, full_name, specialties').eq('is_active', true)
    tutors = data || []
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center text-sm text-gray-500 hover:text-[#517cad] transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to orders
        </Link>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b] mt-6">Order Details</h1>
        <div className="flex items-center gap-3 mt-0.5">
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <span className="text-gray-300">|</span>
          <p className="text-sm text-gray-400 font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#517cad]/10">
                    <BookOpen className="h-5 w-5 text-[#517cad]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {order.subjects?.map((id: string) => (
                        <span key={id} className="px-2.5 py-0.5 rounded-full bg-[#517cad]/10 text-sm font-medium text-[#1e293b]">
                          {subjectMap.get(id) || id}
                        </span>
                      )) || <span className="text-sm text-gray-500">None</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#517cad]/10">
                    <Video className="h-5 w-5 text-[#517cad]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Session Type</p>
                    <p className="text-lg font-medium text-[#1e293b] capitalize">{order.session_type}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#517cad]/10">
                    <User className="h-5 w-5 text-[#517cad]" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</p>
                    <p className="text-lg font-medium text-[#1e293b]">{order.tutors?.full_name || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</p>
                    <p className={`text-lg font-medium ${order.confirmed_start ? 'text-[#1e293b]' : 'text-gray-500 italic'}`}>
                      {order.confirmed_start ? (
                        <>
                          {formatDateTime(order.confirmed_start)}
                          {order.confirmed_end && (
                            <span className="text-gray-600">
                              {' – '}
                              {new Date(order.confirmed_end).toLocaleTimeString(undefined, {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </>
                      ) : (
                        'Not yet scheduled'
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {profile?.role === 'admin' && (order.available_days || order.available_time_start) && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Requested Availability
                  </p>
                  <div className="rounded-lg bg-amber-50/60 border border-amber-100 p-4 space-y-2">
                    {order.available_days && order.available_days.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {order.available_days.map((day: string) => (
                          <span key={day} className="px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-sm font-medium text-amber-800 capitalize">
                            {day}
                          </span>
                        ))}
                      </div>
                    )}
                    {(order.available_time_start || order.available_time_end) && (
                      <p className="text-sm text-amber-800">
                        {order.available_time_start && order.available_time_end
                          ? `${order.available_time_start} – ${order.available_time_end}`
                          : order.available_time_start || order.available_time_end}
                        {order.timezone && <span className="text-amber-600 ml-1">({order.timezone})</span>}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {order.meet_url && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Google Meet</p>
                  <a
                    href={order.meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <VideoIcon className="h-5 w-5" />
                    Join Meeting
                  </a>
                </div>
              )}

              {order.notes && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer Notes</p>
                  <div className="rounded-lg bg-slate-50/80 p-4 text-gray-700">{order.notes}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {profile?.role === 'admin' && (
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Assignment & Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderAssignForm order={order} tutors={tutors} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-[#c79d3c]" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</p>
                <p className="font-medium">{order.customers?.full_name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-[#517cad]">{order.customers?.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</p>
                <p>{order.customers?.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</p>
                <p>{order.customers?.student_grade || '—'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#c79d3c]" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</p>
                <p className="font-medium capitalize">{order.payment_type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</p>
                <p className="font-bold text-lg">{formatAmount(order.amount_cents)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'refunded'
                      ? 'bg-red-50 text-red-700'
                      : order.stripe_payment_intent_id || order.payment_type === 'membership'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {order.status === 'refunded' ? 'Refunded' : (order.stripe_payment_intent_id || order.payment_type === 'membership') ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.stripe_payment_intent_id && (
                <ReceiptButton bookingId={order.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}