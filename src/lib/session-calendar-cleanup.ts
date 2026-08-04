import { calendar } from '@/lib/google-calendar'
import { getAdminGoogleAuth } from '@/lib/google-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { reportError, reportIssue } from '@/lib/report-error'

/**
 * Delete the Google Calendar events belonging to a refunded booking's sessions.
 *
 * refund_booking() cancels the session rows in Postgres, but Postgres cannot
 * call Google — so a refund used to leave the invite live on the customer's and
 * tutor's calendars, Meet link and all, with no UI pointing at the orphan. The
 * admin route's handleCancel does the equivalent cleanup, but only fires on a
 * status transition *away from* 'scheduled'; after a refund the row is already
 * 'cancelled', so that path can never reach it.
 *
 * Best effort by design. The refund and the credit revocation have already
 * committed by the time this runs, and the caller is a Stripe webhook whose side
 * effects are skipped on replay — so a throw here would buy a pointless retry
 * rather than a second deletion attempt. Anything that fails is logged loudly
 * enough to clean up by hand.
 *
 * Returns the number of events actually deleted, for logging.
 */
export async function cancelCalendarEventsForBookings(bookingIds: string[]): Promise<number> {
  if (bookingIds.length === 0) return 0

  const { data: sessions, error } = await supabaseAdmin
    .from('sessions')
    .select('id, tutor_calendar_event_id')
    .in('order_id', bookingIds)
    .not('tutor_calendar_event_id', 'is', null)

  if (error) {
    reportIssue('refund:calendar-load', 'Could not load sessions for calendar cleanup', {
      bookingIds,
      supabaseError: error.message,
    })
    return 0
  }
  if (!sessions?.length) return 0

  // Resolved once: every event belongs to the single ScoreMax business account.
  const adminAuth = await getAdminGoogleAuth()
  if (!adminAuth) {
    reportIssue(
      'refund:calendar-disconnected',
      'Google not connected — refunded bookings left live calendar invites',
      { bookingIds, eventCount: sessions.length }
    )
    return 0
  }

  let deleted = 0

  for (const session of sessions) {
    const eventId = session.tutor_calendar_event_id as string
    try {
      await calendar.events.delete({
        auth: adminAuth,
        calendarId: 'primary',
        eventId,
        // The attendees were told the session was happening; they get told it is
        // not. Matches what the admin cancel path sends.
        sendUpdates: 'all',
      })
      deleted += 1
    } catch (e) {
      // 404/410 mean it is already gone from Google, so clearing our reference
      // is still correct. Anything else leaves a live invite we cannot see.
      const status =
        (e as { code?: number; status?: number })?.code ?? (e as { status?: number })?.status
      if (status !== 404 && status !== 410) {
        reportError('refund:calendar-delete', e, {
          eventId,
          sessionId: session.id,
          note: 'invite is probably still live on attendee calendars',
        })
        continue
      }
    }

    const { error: clearError } = await supabaseAdmin
      .from('sessions')
      .update({
        tutor_calendar_event_id: null,
        student_calendar_event_id: null,
        meet_url: null,
      })
      .eq('id', session.id)

    if (clearError) {
      reportIssue(
        'refund:calendar-clear',
        'Deleted the calendar event but could not clear the session reference',
        { eventId, sessionId: session.id, supabaseError: clearError.message }
      )
    }
  }

  return deleted
}
