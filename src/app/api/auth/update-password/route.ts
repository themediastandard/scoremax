import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get('origin')
  if (!requestOrigin || requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const password =
    body && typeof body === 'object' && 'password' in body
      ? (body as { password: unknown }).password
      : undefined

  if (typeof password !== 'string' || password.length < 6 || password.length > 256) {
    return NextResponse.json(
      { error: 'Password must be between 6 and 256 characters' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Your reset link has expired. Please request a new one.' },
      { status: 401 }
    )
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
