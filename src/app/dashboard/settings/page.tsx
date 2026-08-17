import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProfileForm } from '@/components/dashboard/ProfileForm'
import { TutorPublicProfileForm } from '@/components/dashboard/TutorPublicProfileForm'
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
      .select('full_name, phone')
      .eq('profile_id', user.id)
      .maybeSingle()
    customerData = data
  }

  let tutorData = null
  if (profile?.role === 'tutor') {
    const { data } = await supabaseAdmin
      .from('tutors')
      .select('full_name, email, phone, photo_url, bio, specialties')
      .eq('profile_id', user.id)
      .maybeSingle()
    tutorData = data
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
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b]">Settings</h1>
        <p className="mt-1 text-gray-500">Manage your account</p>
      </div>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            fullName={customerData?.full_name || tutorData?.full_name || profile?.full_name || ''}
            email={tutorData?.email || profile?.email || user.email || ''}
            phone={customerData?.phone || tutorData?.phone || ''}
          />
        </CardContent>
      </Card>

      {profile?.role === 'tutor' && tutorData && (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Public Tutor Profile</CardTitle>
            <p className="text-sm text-gray-600">
              Manage the photo, bio, and subjects families see on the ScoreMax tutors page.
            </p>
          </CardHeader>
          <CardContent>
            <TutorPublicProfileForm
              fullName={tutorData.full_name || profile.full_name || ''}
              bio={tutorData.bio || ''}
              photoUrl={tutorData.photo_url || null}
              specialties={tutorData.specialties || []}
            />
          </CardContent>
        </Card>
      )}

      {isAdmin && (
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <div className="mt-1">
              <GoogleConnectionBadge connected={googleConnected} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="font-medium">Password</div>
              <p className="text-sm text-gray-500">Update your account password.</p>
            </div>
            <Button variant="outline" asChild className="self-start sm:self-auto">
              <a href="/forgot-password">Change Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
