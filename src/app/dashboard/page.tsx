import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardHome() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()
    
  if (!profile) return <div>Profile not found</div>
  
  // ADMIN VIEW
  if (profile.role === 'admin') {
    // Fetch stats
    // We can call our API or fetch directly. Fetching directly is faster/SSR.
    // For MVP simplicity, let's fetch directly here.
    
    // Pending Orders
    const { count: pendingCount } = await supabase
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')
      
    // Active Sessions
    const { count: activeCount } = await supabase
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      
    // Active Members
    const { count: memberCount } = await supabase
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#c79d3c]">{pendingCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#517cad]">{activeCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled & confirmed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{memberCount || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Paying subscribers</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-4">
          <Link href="/dashboard/orders">
            <Button>Manage Orders</Button>
          </Link>
          <Link href="/dashboard/tutors">
            <Button variant="outline">Manage Tutors</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  // TUTOR VIEW
  if (profile.role === 'tutor') {
    // Get tutor ID
    const { data: tutor } = await supabase
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single()
      
    // Count upcoming sessions
    const { count: sessionCount } = await supabase
      .from('booking_requests')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_tutor_id', tutor?.id)
      .eq('status', 'active')
      .gte('confirmed_start', new Date().toISOString())
      
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>
        
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#517cad]">{sessionCount || 0}</div>
            <p className="text-sm text-gray-500 mt-2">Scheduled sessions coming up</p>
            <div className="mt-4">
              <Link href="/dashboard/sessions">
                <Button className="w-full">View Schedule</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // CUSTOMER VIEW
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Welcome back, {profile.full_name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#f8fafc] border-dashed border-2 border-gray-200 flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need help with a subject?</h3>
          <p className="text-gray-500 mb-6">Book a new tutoring session or enroll in a course.</p>
          <Link href="/book">
            <Button size="lg" className="bg-[#c79d3c] hover:bg-[#b58b2a]">Book a Session</Button>
          </Link>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">View your booking history and status.</p>
            <Link href="/dashboard/orders">
              <Button variant="outline" className="w-full">View My Orders</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}