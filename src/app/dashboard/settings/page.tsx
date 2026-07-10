import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { GoogleConnectionBadge } from '@/components/dashboard/GoogleConnectionBadge'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, getProfile } from '@/lib/auth'
import {
  ADMIN_GOOGLE_CONNECTED_AT_KEY,
  getAdminSetting,
  isAdminGoogleConnected,
} from '@/lib/google-admin'

export default async function SettingsPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)

  let customerData = null
  if (profile?.role === 'customer') {
    const { data } = await supabaseAdmin
      .from('customers')
      .select('full_name, phone, student_grade')
      .eq('profile_id', user.id)
      .maybeSingle()
    customerData = data
  }

  const isAdmin = profile?.role === 'admin'
  let googleConnected = false
  let googleConnectedAt: string | null = null
  if (isAdmin) {
    googleConnected = await isAdminGoogleConnected()
    if (googleConnected) {
      googleConnectedAt = await getAdminSetting(ADMIN_GOOGLE_CONNECTED_AT_KEY)
    }
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

      {isAdmin && (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <div className="mt-1">
              <GoogleConnectionBadge connected={googleConnected} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">ScoreMax Google Account</div>
                <p className="text-sm text-gray-500">
                  Creates the calendar invites and Google Meet links sent to tutors and students
                  when a session is scheduled. Online sessions cannot be scheduled while this is
                  disconnected.
                </p>
                {googleConnected && googleConnectedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Connected {new Date(googleConnectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <form action="/api/google/auth">
                  <Button type="submit" variant="outline" size="sm">
                    {googleConnected ? 'Reconnect' : 'Connect'}
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
