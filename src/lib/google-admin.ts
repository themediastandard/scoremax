import 'server-only'
import { google } from 'googleapis'
import { supabaseAdmin } from '@/lib/supabase/admin'

// The single business Google account (connected by an admin in dashboard
// settings) owns every session calendar event and Meet link. Its refresh
// token lives in the admin_settings key-value table.
export const ADMIN_GOOGLE_REFRESH_TOKEN_KEY = 'google_refresh_token'
export const ADMIN_GOOGLE_CONNECTED_AT_KEY = 'google_connected_at'

export async function getAdminSetting(key: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('admin_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return data?.value || null
}

export async function setAdminSetting(key: string, value: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .update({ value })
    .eq('key', key)
    .select('key')
  if (error) throw new Error(`Failed to update admin setting ${key}: ${error.message}`)
  if (!data?.length) {
    const { error: insertError } = await supabaseAdmin
      .from('admin_settings')
      .insert({ key, value })
    if (insertError) throw new Error(`Failed to insert admin setting ${key}: ${insertError.message}`)
  }
}

export async function isAdminGoogleConnected(): Promise<boolean> {
  return Boolean(await getAdminSetting(ADMIN_GOOGLE_REFRESH_TOKEN_KEY))
}

export async function getAdminGoogleAuth() {
  const refreshToken = await getAdminSetting(ADMIN_GOOGLE_REFRESH_TOKEN_KEY)
  if (!refreshToken) return null
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback`
  )
  client.setCredentials({ refresh_token: refreshToken })
  return client
}
