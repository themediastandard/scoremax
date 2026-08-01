'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

/**
 * Chrome for every non-dashboard route, plus the two things every page needs to
 * be navigable without a mouse: a skip link and a <main> landmark.
 *
 * The header carries ~15 links before the page content starts, so without the
 * skip link a keyboard or screen-reader user tabbed through all of them on
 * every single page (WCAG 2.4.1). The link is visually hidden until focused,
 * which is why it uses sr-only + focus:not-sr-only rather than display:none —
 * a display:none link cannot receive focus at all.
 *
 * /dashboard renders its own <main> in dashboard/layout.tsx, so it is excluded
 * here; nesting a second <main> would give the page two main landmarks.
 */
export function HeaderFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const showHeaderFooter = !isDashboard && !isAuthPage

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#7a5f1f]"
      >
        Skip to main content
      </a>
      {showHeaderFooter && <Header variant="ogee" />}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      {showHeaderFooter && <Footer />}
    </>
  )
}
