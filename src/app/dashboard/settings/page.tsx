import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  
  // Fetch Google Calendar status based on role
  let isGoogleConnected = false
  if (profile?.role === 'tutor') {
    const { data } = await supabase.from('tutors').select('google_calendar_connected').eq('profile_id', user.id).single()
    isGoogleConnected = data?.google_calendar_connected || false
  } else if (profile?.role === 'customer') {
    const { data } = await supabase.from('customers').select('google_calendar_connected').eq('profile_id', user.id).single()
    isGoogleConnected = data?.google_calendar_connected || false
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif font-bold text-[#1e293b]">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue={profile?.full_name} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={profile?.email} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
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
    </div>
  )
}