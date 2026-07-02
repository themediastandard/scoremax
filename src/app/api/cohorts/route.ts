import { NextResponse } from 'next/server'

/**
 * Public cohort enrollment is paused for launch.
 * Keep the endpoint stable for old clients, but do not expose cohorts.
 */
export async function GET() {
  return NextResponse.json([])
}
