-- One-hour-before session reminders: the idempotency marker.
--
-- Nothing sent session reminders before this. Attendees got only whatever their
-- own Google Calendar default happened to be — typically a 10-minute popup —
-- and anyone not on Google Calendar got nothing at all. A scheduled job now
-- polls this table and emails the student and the assigned tutor roughly an
-- hour out, which needs exactly one piece of state: has this session already
-- been reminded?
--
-- WHY reminder_sent_for AND NOT reminder_sent_at
--
-- The marker stores *the confirmed_start a reminder was sent for*, not the
-- moment the send happened. Selection is then
--
--     reminder_sent_for is distinct from confirmed_start
--
-- which self-heals across a reschedule. With a plain reminder_sent_at, an admin
-- moving a session from 3pm to 6pm leaves the flag set, and the moved session is
-- never reminded — unless every code path that touches confirmed_start also
-- remembers to clear the flag. Storing the start instead means a moved session
-- no longer matches its own marker and re-arms automatically, so
-- src/app/api/admin/sessions/[id]/route.ts needs no change at all.
--
-- Nullable with no default: NULL means "never reminded", which is the correct
-- reading for every row that exists today.

alter table public.sessions
  add column if not exists reminder_sent_for timestamptz;

comment on column public.sessions.reminder_sent_for is
  'The confirmed_start value a reminder email was last sent for, or NULL if '
  'none has been. Written only by /api/cron/session-reminders, and only after '
  'at least one of the two reminder emails was accepted by Resend. A session is '
  'due a reminder when reminder_sent_for is distinct from confirmed_start, so '
  'rescheduling re-arms it without anything having to clear this column.';

-- Supports the polling query: status = 'scheduled' and confirmed_start inside a
-- 15-minute window, run every 10 minutes forever. Partial on the status because
-- cancelled and completed sessions are dead weight in this index and will
-- eventually outnumber live ones many times over.
--
-- reminder_sent_for is deliberately NOT part of the index. Postgres cannot use
-- an index for a column-to-column `is distinct from` comparison anyway, and the
-- window predicate alone already cuts the scan to a handful of rows, which the
-- route then filters in application code.
create index if not exists sessions_reminder_due_idx
  on public.sessions (confirmed_start)
  where status = 'scheduled';
