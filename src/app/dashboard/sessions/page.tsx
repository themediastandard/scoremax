import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (profile?.role === 'customer') {
    return <div>Access Denied</div>
  }
  
  // If Admin, show all active sessions? Or just assigned?
  // Usually admins view sessions via Orders page.
  // This page is primarily for Tutors to see their schedule.
  
  let query = supabase.from('booking_requests')
    .select(`
      *,
      customers (full_name, email, phone)
    `)
    .eq('status', 'active')
    .order('confirmed_start', { ascending: true })
    
  if (profile?.role === 'tutor') {
    // Get tutor ID
    const { data: tutor } = await supabase.from('tutors').select('id').eq('profile_id', user.id).single()
    if (tutor) {
      query = query.eq('assigned_tutor_id', tutor.id)
    }
  }
  
  const { data: sessions } = await query

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Upcoming Sessions</h1>
      
      <div className="grid gap-6">
        {sessions?.map((session: any) => (
          <div key={session.id} className="bg-white rounded-lg shadow p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-900">{session.customers?.full_name}</div>
              <div className="text-sm text-gray-500">{new Date(session.confirmed_start).toLocaleString()} - {new Date(session.confirmed_end).toLocaleTimeString()}</div>
              <div className="mt-2 text-sm">
                <span className="font-medium text-gray-700">Subject:</span> {session.subjects?.length} selected
              </div>
              <div className="mt-1 text-sm">
                <span className="font-medium text-gray-700">Location:</span> {session.session_type === 'in-person' ? 'Sawgrass, FL' : 'Online (Zoom)'}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
               <button className="bg-[#517cad] text-white px-4 py-2 rounded text-sm hover:bg-[#3b5c85]">
                 View Details
               </button>
            </div>
          </div>
        ))}
        {sessions?.length === 0 && (
          <div className="text-center py-12 text-gray-500">No upcoming sessions found.</div>
        )}
      </div>
    </div>
  )
}