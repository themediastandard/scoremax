import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { processAdminSessionDelivery } from '@/lib/admin-session-delivery'
import { reportError } from '@/lib/report-error'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdmin()
  if (authError) return authError
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 400 })
  }

  try {
    const delivery = await processAdminSessionDelivery(id)
    return NextResponse.json({ delivery })
  } catch (error) {
    reportError('admin-booking:delivery-retry', error, { sessionId: id })
    return NextResponse.json(
      { error: 'Calendar and email setup could not be retried. The session and credit are still safely recorded.' },
      { status: 500 },
    )
  }
}
