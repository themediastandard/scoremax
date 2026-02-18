'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export function HeaderFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const showHeaderFooter = !isDashboard && !isAuthPage

  return (
    <>
      {showHeaderFooter && <Header variant="ogee" />}
      {children}
      {showHeaderFooter && <Footer />}
    </>
  )
}
