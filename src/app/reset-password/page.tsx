import { createClient } from '@/lib/supabase/server'

import { ResetPasswordForm } from './ResetPasswordForm'

// This page must never be served from the public page cache. The recovery
// callback creates the authenticated session before redirecting here, so the
// server can decide immediately whether the password form is available.
export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <ResetPasswordForm hasSession={Boolean(user)} />
}
