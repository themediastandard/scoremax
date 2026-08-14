import 'server-only'
import { randomUUID } from 'node:crypto'
import type { calendar_v3 } from 'googleapis'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { calendar } from '@/lib/google-calendar'
import {
  clearAdminGoogleConnection,
  getAdminGoogleAuth,
  isRevokedGoogleTokenError,
} from '@/lib/google-admin'
import { buildSessionCalendarPlan } from '@/lib/session-calendar'
import {
  adminBookingCalendarEventId,
  adminBookingEmailRecipients,
} from '@/lib/admin-session-booking'
import { sendEmail, getEmailDefaults } from '@/lib/resend'
import { detailRow, emailLayout } from '@/lib/email-templates'
import { formatBusinessDateTime } from '@/lib/business-datetime'
import { reportError } from '@/lib/report-error'

type DeliveryStatus = 'pending' | 'processing' | 'complete' | 'attention'
type StepStatus = 'pending' | 'complete' | 'attention'

type DeliveryRow = {
  id: string
  audit_id: string
  session_id: string
  status: DeliveryStatus
  calendar_status: StepStatus
  email_status: StepStatus
  calendar_event_id: string | null
  owner_email_sent_at: string | null
  student_email_sent_at: string | null
  tutor_email_sent_at: string | null
  admin_email_sent_at: string | null
  claim_token: string | null
  last_error: string | null
  claimed?: boolean
}

type Person = { id?: string; email: string; full_name: string }
type AuditContext = {
  owner: Person
  student: Person
  tutor: Person
  admin: Person
  admins: Person[]
  internal_notes?: string
}

type AuditRow = {
  id: string
  immutable_context: AuditContext
  subject_ids: string[]
  confirmed_start: string
  confirmed_end: string
  session_type: string
}

export type AdminBookingDeliveryResult = {
  status: DeliveryStatus
  calendarStatus: StepStatus
  emailStatus: StepStatus
  warning?: string
  processing?: boolean
}

const safeAttentionMessage =
  'The session and credit are safely recorded, but the calendar or confirmation emails still need attention. Use Retry calendar & emails from the session.'

function getMeetUrl(event: calendar_v3.Schema$Event) {
  const videoEntry = event.conferenceData?.entryPoints?.find(
    (entry) => entry.entryPointType === 'video'
  )
  return event.hangoutLink ?? videoEntry?.uri ?? null
}

async function loadDeliveryBundle(sessionId: string) {
  const { data: delivery, error: deliveryError } = await supabaseAdmin
    .from('admin_session_booking_delivery')
    .select('*')
    .eq('session_id', sessionId)
    .single<DeliveryRow>()
  if (deliveryError || !delivery) throw new Error('delivery_not_found')

  const [{ data: audit, error: auditError }, { data: session, error: sessionError }] =
    await Promise.all([
      supabaseAdmin
        .from('admin_session_booking_audit')
        .select('id, immutable_context, subject_ids, confirmed_start, confirmed_end, session_type')
        .eq('id', delivery.audit_id)
        .single<AuditRow>(),
      supabaseAdmin
        .from('sessions')
        .select('id, tutor_calendar_event_id, meet_url')
        .eq('id', sessionId)
        .single(),
    ])
  if (auditError || !audit || sessionError || !session) throw new Error('delivery_context_missing')

  const { data: subjects, error: subjectError } = await supabaseAdmin
    .from('subjects')
    .select('id, name')
    .in('id', audit.subject_ids)
  if (subjectError) throw new Error('delivery_subjects_missing')
  const byId = new Map((subjects ?? []).map((subject) => [subject.id, subject.name]))
  return {
    delivery,
    audit,
    session,
    subjectNames: audit.subject_ids.map((id) => byId.get(id)).filter(Boolean) as string[],
  }
}

async function createOrRecoverCalendarEvent(
  sessionId: string,
  audit: AuditRow,
  subjectNames: string[],
) {
  const auth = await getAdminGoogleAuth()
  if (!auth) throw new Error('google_not_connected')

  const eventId = adminBookingCalendarEventId(sessionId)
  const context = audit.immutable_context
  const plan = buildSessionCalendarPlan({
    id: sessionId,
    session_type: audit.session_type,
    confirmed_start: audit.confirmed_start,
    confirmed_end: audit.confirmed_end,
    subjectNames,
    customers: context.owner,
    students: context.student,
    tutors: context.tutor,
  })
  const requestBody: calendar_v3.Schema$Event = {
    id: eventId,
    ...plan.requestBody,
    ...(plan.shouldCreateMeet
      ? {
          conferenceData: {
            createRequest: {
              requestId: `adminbooking${audit.id.replaceAll('-', '')}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        }
      : {}),
  }

  let event: calendar_v3.Schema$Event
  try {
    const inserted = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      conferenceDataVersion: plan.shouldCreateMeet ? 1 : 0,
      sendUpdates: 'all',
      requestBody,
    })
    event = inserted.data
  } catch (error) {
    if (isRevokedGoogleTokenError(error)) {
      await clearAdminGoogleConnection()
      throw new Error('google_connection_expired')
    }
    // The insert may have reached Google even if its response did not reach us.
    // Deterministic event ids let the retry recover that exact event.
    try {
      const existing = await calendar.events.get({ auth, calendarId: 'primary', eventId })
      event = existing.data
    } catch {
      throw error
    }
  }

  const meetUrl = getMeetUrl(event)
  if (plan.shouldCreateMeet && !meetUrl) throw new Error('google_meet_missing')

  const { error: sessionError } = await supabaseAdmin
    .from('sessions')
    .update({
      tutor_calendar_event_id: event.id ?? eventId,
      student_calendar_event_id: null,
      meet_url: meetUrl,
    })
    .eq('id', sessionId)
  if (sessionError) throw new Error('calendar_reference_not_saved')
  return { eventId: event.id ?? eventId, meetUrl }
}

function deliveryEmail(role: string, person: Person, audit: AuditRow, subjectNames: string[]) {
  const context = audit.immutable_context
  const when = formatBusinessDateTime(audit.confirmed_start) ?? audit.confirmed_start
  const location = audit.session_type === 'online'
    ? 'Online — use the Google Meet link in the calendar invitation'
    : 'Florida Blue Center · 1970 Sawgrass Mills Cir, Sunrise, FL 33323-2994'
  const subjects = subjectNames.join(', ') || 'Tutoring'

  if (role === 'admin') {
    return {
      subject: `Admin booking complete: ${context.student.full_name}`,
      html: emailLayout({
        title: 'Admin Booking Complete',
        greeting: `Hi ${person.full_name || 'there'},`,
        body: [
          '<p style="margin: 0 0 16px 0;">A session was booked by an administrator using one customer credit.</p>',
          detailRow('Account owner:', context.owner.full_name),
          detailRow('Student:', context.student.full_name),
          detailRow('Tutor:', context.tutor.full_name),
          detailRow('Subject:', subjects),
          detailRow('Time:', when),
          detailRow('Location:', location),
        ].join(''),
      }),
    }
  }

  const isTutor = role === 'tutor'
  const isOwner = role === 'owner'
  return {
    subject: isTutor ? 'New Session Assigned' : 'Session Confirmed: Your session is scheduled',
    html: emailLayout({
      title: isTutor ? 'New Session Assigned' : 'Session Confirmed',
      greeting: `Hi ${person.full_name || 'there'},`,
      body: [
        `<p style="margin: 0 0 16px 0;">${isTutor ? 'You have been assigned a new ScoreMax session.' : 'The ScoreMax session has been scheduled. A calendar invite is on its way to your inbox.'}</p>`,
        ...(isOwner || isTutor ? [detailRow('Student:', context.student.full_name)] : []),
        ...(!isTutor ? [detailRow('Tutor:', context.tutor.full_name)] : []),
        detailRow('Subject:', subjects),
        detailRow('Time:', when),
        detailRow('Location:', location),
      ].join(''),
    }),
  }
}

async function updateClaimedDelivery(
  deliveryId: string,
  claimToken: string,
  values: Record<string, string | null>,
  errorCode: string,
) {
  const { data, error } = await supabaseAdmin
    .from('admin_session_booking_delivery')
    .update(values)
    .eq('id', deliveryId)
    .eq('claim_token', claimToken)
    .select('id')
    .maybeSingle()
  if (error || !data) throw new Error(errorCode)
}

async function processEmails(
  delivery: DeliveryRow,
  audit: AuditRow,
  subjectNames: string[],
  claimToken: string,
) {
  const recipients = adminBookingEmailRecipients(audit.immutable_context)
  const grouped = new Map<string, Person[]>()
  for (const recipient of recipients) {
    grouped.set(recipient.role, [...(grouped.get(recipient.role) ?? []), recipient])
  }
  const sentField = {
    owner: 'owner_email_sent_at',
    student: 'student_email_sent_at',
    tutor: 'tutor_email_sent_at',
    admin: 'admin_email_sent_at',
  } as const

  for (const role of ['owner', 'student', 'tutor', 'admin'] as const) {
    const people = grouped.get(role) ?? []
    if (!people.length || delivery[sentField[role]]) continue
    const message = deliveryEmail(role, people[0], audit, subjectNames)
    const ok = await sendEmail(
      {
        ...getEmailDefaults(),
        to: people.map((person) => person.email),
        ...message,
      },
      `admin-booking:${role}:${audit.id}`,
      `admin-booking-${audit.id}-${role}`,
    )
    if (!ok) throw new Error(`email_${role}_failed`)
    const sentAt = new Date().toISOString()
    await updateClaimedDelivery(
      delivery.id,
      claimToken,
      { [sentField[role]]: sentAt, updated_at: sentAt },
      `email_${role}_receipt_not_saved`,
    )
    delivery[sentField[role]] = sentAt
  }
}

function toResult(delivery: DeliveryRow, extra: Partial<AdminBookingDeliveryResult> = {}) {
  return {
    status: delivery.status,
    calendarStatus: delivery.calendar_status,
    emailStatus: delivery.email_status,
    ...extra,
  } satisfies AdminBookingDeliveryResult
}

/**
 * Idempotent external worker for the committed booking. Database creation is
 * never compensated here: failures move the visible delivery row to attention,
 * and retry resumes only the incomplete calendar/email steps.
 */
export async function processAdminSessionDelivery(
  sessionId: string,
): Promise<AdminBookingDeliveryResult> {
  const claimToken = randomUUID()
  const { data: claim, error: claimError } = await supabaseAdmin
    .rpc('claim_admin_session_booking_delivery', {
      p_session_id: sessionId,
      p_claim_token: claimToken,
    })
    .single<DeliveryRow>()
  if (claimError || !claim) throw new Error('delivery_not_found')
  if (claim.status === 'complete') return toResult(claim)
  if (!claim.claimed) return toResult(claim, { processing: claim.status === 'processing' })

  const bundle = await loadDeliveryBundle(sessionId)
  const delivery: DeliveryRow = {
    ...bundle.delivery,
    claim_token: claimToken,
    status: 'processing',
  }

  try {
    if (delivery.calendar_status !== 'complete') {
      const calendarResult = await createOrRecoverCalendarEvent(
        sessionId,
        bundle.audit,
        bundle.subjectNames,
      )
      await updateClaimedDelivery(
        delivery.id,
        claimToken,
        {
          calendar_status: 'complete',
          calendar_event_id: calendarResult.eventId,
          updated_at: new Date().toISOString(),
        },
        'calendar_receipt_not_saved',
      )
      delivery.calendar_status = 'complete'
      delivery.calendar_event_id = calendarResult.eventId
    }

    await processEmails(delivery, bundle.audit, bundle.subjectNames, claimToken)
    delivery.email_status = 'complete'
    delivery.status = 'complete'
    const now = new Date().toISOString()
    await updateClaimedDelivery(
      delivery.id,
      claimToken,
      {
        status: 'complete',
        email_status: 'complete',
        claim_token: null,
        claim_expires_at: null,
        last_error: null,
        updated_at: now,
      },
      'delivery_completion_not_saved',
    )
    return toResult(delivery)
  } catch (error) {
    reportError('admin-booking:delivery', error, { sessionId })
    delivery.status = 'attention'
    if (delivery.calendar_status !== 'complete') delivery.calendar_status = 'attention'
    if (delivery.email_status !== 'complete') delivery.email_status = 'attention'
    await supabaseAdmin
      .from('admin_session_booking_delivery')
      .update({
        status: 'attention',
        calendar_status: delivery.calendar_status,
        email_status: delivery.email_status,
        claim_token: null,
        claim_expires_at: null,
        last_error: error instanceof Error ? error.message.slice(0, 500) : 'delivery_failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', delivery.id)
      .eq('claim_token', claimToken)
    return toResult(delivery, { warning: safeAttentionMessage })
  }
}
