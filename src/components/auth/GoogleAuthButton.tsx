"use client"

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Chrome } from 'lucide-react'

export function GoogleAuthButton({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleGoogle} 
      className="w-full flex items-center justify-center gap-2"
    >
      <Chrome className="w-4 h-4" />
      {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
    </Button>
  )
}