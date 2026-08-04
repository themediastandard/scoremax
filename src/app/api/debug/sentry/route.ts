import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

/**
 * TEMPORARY diagnostic. Delete once server-side Sentry is confirmed working.
 *
 * Two smoke tests reported nothing, and the candidate causes are
 * indistinguishable from the outside: the DSN might not reach the server
 * runtime, or Next's instrumentation hook might not run under Netlify's
 * adapter, in which case Sentry.init never executes and every capture is a
 * silent no-op.
 *
 * Returns booleans only — no secret is echoed. `?send=1` additionally captures
 * a test event and flushes it, returning the event id Sentry assigned.
 */
export async function GET(req: Request) {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  const client = Sentry.getClient()

  const diagnosis = {
    // Is the value visible to the server runtime at all?
    dsnPresent: Boolean(dsn),
    dsnHost: dsn ? new URL(dsn).host : null,

    // Did Sentry.init actually run? False here means instrumentation.ts never
    // executed, which is the interesting failure.
    clientInitialized: Boolean(client),
    clientEnabled: client?.getOptions()?.enabled ?? null,
    clientDsn: Boolean(client?.getOptions()?.dsn),

    runtime: process.env.NEXT_RUNTIME ?? 'unknown',
    nodeEnv: process.env.NODE_ENV,
    eventId: null as string | null,
    flushed: null as boolean | null,
  }

  if (new URL(req.url).searchParams.get('send') === '1') {
    diagnosis.eventId =
      Sentry.captureMessage('Sentry diagnostic probe', 'error') ?? null
    diagnosis.flushed = await Sentry.flush(5000).catch(() => false)
  }

  return NextResponse.json(diagnosis)
}
