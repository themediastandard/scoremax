'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'

export function HeaderFooterWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  return (
    <>
      {!isDashboard && <Header variant="ogee" />}
      {children}
      {!isDashboard && <Footer />}
    </>
  )
}
