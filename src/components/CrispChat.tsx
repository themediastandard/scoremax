'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const CRISP_WEBSITE_ID = '5904abc7-9785-4936-9985-45e22bd9050e'
const CRISP_SCRIPT_ID = 'crisp-chat-script'

// Chat is for public, pre-sale questions. Keep it away from authentication,
// account, booking, and recovery flows where it could cover important controls
// or encourage customers to put private account information into a chat.
const HIDDEN_PATH_PREFIXES = [
  '/auth',
  '/book',
  '/dashboard',
  '/forgot-password',
  '/login',
  '/register',
  '/reset-password',
]

declare global {
  interface Window {
    $crisp?: unknown[][]
    CRISP_WEBSITE_ID?: string
  }
}

export function isCrispChatPath(pathname: string): boolean {
  return !HIDDEN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export function CrispChat() {
  const pathname = usePathname()

  useEffect(() => {
    const shouldShowChat = isCrispChatPath(pathname)

    if (!shouldShowChat) {
      window.$crisp?.push(['do', 'chat:hide'])
      return
    }

    window.$crisp = window.$crisp ?? []
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID
    window.$crisp.push(['do', 'chat:show'])

    // Next client navigation preserves third-party scripts. Reuse the existing
    // Crisp client instead of loading a second copy when visitors move between
    // public pages.
    if (document.getElementById(CRISP_SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = CRISP_SCRIPT_ID
    script.src = 'https://client.crisp.chat/l.js'
    script.async = true
    document.head.appendChild(script)
  }, [pathname])

  return null
}
