import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { supabaseAdmin } from '@/lib/supabase/admin'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  let customerData = null
  let isGoogleConnected = false

  if (profile?.role === 'customer') {
    const { data } = await supabaseAdmin
      .from('customers')
      .select('full_name, phone, student_grade, google_calendar_connected')
      .eq('profile_id', user.id)
      .maybeSingle()
    customerData = data
    isGoogleConnected = data?.google_calendar_connected || false
  } else if (profile?.role === 'tutor') {
    const { data } = await supabase.from('tutors').select('google_calendar_connected').eq('profile_id', user.id).single()
    isGoogleConnected = data?.google_calendar_connected || false
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your account</p>
      </div>
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={customerData?.full_name || profile?.full_name || ''}
            email={profile?.email || user.email || ''}
            phone={customerData?.phone || ''}
            studentGrade={customerData?.student_grade || ''}
            role={profile?.role || 'customer'}
          />
        </CardContent>
      </Card>
      
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Google Calendar</div>
              <p className="text-sm text-gray-500">Sync your sessions automatically.</p>
            </div>
            {isGoogleConnected ? (
              <Button variant="outline" className="text-green-600 border-green-200 bg-green-50" disabled>
                Connected
              </Button>
            ) : (
              <form action="/api/google/auth">
                <input type="hidden" name="role" value={profile?.role} />
                <Button type="submit" variant="outline">Connect</Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Password</div>
              <p className="text-sm text-gray-500">Update your account password.</p>
            </div>
            <Button variant="outline" asChild>
              <a href="/forgot-password">Change Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
