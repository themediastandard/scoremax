import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const LEGACY_PRODUCTION_HOST = 'scoremaxtutor.netlify.app'
const NETLIFY_DEPLOY_HOST_SUFFIX = '--scoremaxtutor.netlify.app'
const CANONICAL_PRODUCTION_HOST = 'www.scoremaxtutoring.com'
const SESSION_PATHS = new Set([
  '/login',
  '/register',
  '/reset-password',
  '/forgot-password',
])
const CANONICAL_AUTH_PATHS = new Set([
  ...SESSION_PATHS,
  '/book',
  '/auth/continue',
  '/auth/callback',
])

function requestHost(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  return (forwardedHost ?? request.headers.get('host') ?? request.nextUrl.host)
    .split(',')[0]
    .trim()
    .split(':')[0]
    .toLowerCase()
}

function needsSessionRefresh(pathname: string): boolean {
  return (
    SESSION_PATHS.has(pathname) ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/book' ||
    pathname.startsWith('/book/')
  )
}

export async function middleware(request: NextRequest) {
  const host = requestHost(request)
  if (
    host === LEGACY_PRODUCTION_HOST &&
    request.nextUrl.pathname !== '/api/auth/send-email'
  ) {
    const canonical = request.nextUrl.clone()
    canonical.protocol = 'https:'
    canonical.host = CANONICAL_PRODUCTION_HOST
    return NextResponse.redirect(canonical, 308)
  }

  if (
    host.endsWith(NETLIFY_DEPLOY_HOST_SUFFIX) &&
    CANONICAL_AUTH_PATHS.has(request.nextUrl.pathname)
  ) {
    const canonical = request.nextUrl.clone()
    canonical.protocol = 'https:'
    canonical.host = CANONICAL_PRODUCTION_HOST
    // Preserve callback POST bodies while avoiding a permanent cache entry
    // for an immutable Netlify deploy hostname.
    return NextResponse.redirect(canonical, 307)
  }

  if (needsSessionRefresh(request.nextUrl.pathname)) {
    return await updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|map|woff|woff2)$).*)',
  ],
}
