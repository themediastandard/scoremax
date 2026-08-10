"use client"

import { Turnstile } from '@marsidev/react-turnstile'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()

/**
 * Supabase validates the token. The browser only needs Cloudflare's public
 * site key; the matching secret belongs in Supabase Auth settings, never here.
 */
export const AUTH_CAPTCHA_CONFIGURED = Boolean(TURNSTILE_SITE_KEY)

interface AuthTurnstileProps {
  action: 'login' | 'register' | 'password-reset'
  onTokenChange: (token: string | null) => void
}

export function AuthTurnstile({ action, onTokenChange }: AuthTurnstileProps) {
  // Keeps local builds and the pre-rollout production bundle working until the
  // public site key is configured. Supabase CAPTCHA must only be enabled after
  // a bundle with the key is deployed, or every email auth form will fail.
  if (!TURNSTILE_SITE_KEY) return null

  return (
    <div className="space-y-2" aria-label="Security check">
      <Turnstile
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={(token) => onTokenChange(token)}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
        onTimeout={() => onTokenChange(null)}
        options={{
          action,
          size: 'flexible',
          theme: 'light',
          refreshExpired: 'auto',
          refreshTimeout: 'auto',
        }}
        className="min-h-[65px] w-full"
      />
      <p className="text-center text-xs text-gray-500">
        Security check powered by Cloudflare Turnstile.
      </p>
    </div>
  )
}
