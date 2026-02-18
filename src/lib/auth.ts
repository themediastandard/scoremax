import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getAuthUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', userId)
    .single()
  return profile
})
