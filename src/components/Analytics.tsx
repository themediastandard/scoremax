'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

// Public by design — a GA4 measurement ID ships in the client bundle no matter
// where it is stored, so an env var would only mean a Netlify variable and a
// redeploy stand between this file and working analytics.
const GA_MEASUREMENT_ID = 'G-JJ8TFYH2FN'

// Netlify deploy previews build with NODE_ENV=production too, so the env check
// alone would pollute the property with preview traffic. Only the real site
// counts, and only the browser knows which host it is on.
const PRODUCTION_HOSTNAME = 'www.scoremaxtutoring.com'

// Pages whose URL carries a secret. /reset-password is loaded with a single-use
// recovery token in the query string; the page strips it with
// history.replaceState, but that runs after mount, and gtag's initial page_view
// fires on load — it would read the original URL and send the token to Google as
// page_location. /auth is the callback surface the same tokens land on.
//
// The narrow fix is to skip GA on these paths entirely. Stripping query strings
// globally would work too, but it would kill UTM campaign attribution
// everywhere else, which is half the reason to have analytics at all.
const SENSITIVE_PATH_PREFIXES = ['/reset-password', '/auth']

export function isSensitivePath(pathname: string): boolean {
  return SENSITIVE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

export default function Analytics() {
  const pathname = usePathname()
  // Checked in an effect rather than during render: the server has no
  // window.location, so reading it inline would render nothing on the server and
  // the tag on the client, which is a hydration mismatch.
  const [isProductionHost, setIsProductionHost] = useState(false)

  useEffect(() => {
    setIsProductionHost(window.location.hostname === PRODUCTION_HOSTNAME)
  }, [])

  if (process.env.NODE_ENV !== 'production') return null
  if (!isProductionHost) return null
  if (isSensitivePath(pathname)) return null

  // No route-change handler here on purpose. GA4 Enhanced Measurement already
  // tracks SPA navigations through History API events; firing our own page_view
  // on every pathname change would double-count each one.
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
