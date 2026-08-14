-- Executable schema contract for the live MCP-applied admin credit booking
-- feature. This is a test fixture, not a migration: ScoreMax database changes
-- are applied and verified through the configured Supabase MCP.

create table if not exists public.admin_session_booking_audit (
  id uuid primary key default gen_random_uuid(),
  idempotency_key uuid not null unique,
  admin_profile_id uuid not null references public.profiles(id) on delete restrict,
  customer_id uuid not null references public.customers(id) on delete restrict,
  student_id uuid not null,
  booking_request_id uuid not null unique references public.booking_requests(id) on delete restrict,
  session_id uuid not null unique references public.sessions(id) on delete restrict,
  tutor_id uuid not null references public.tutors(id) on delete restrict,
  subject_ids uuid[] not null,
  confirmed_start timestamptz not null,
  confirmed_end timestamptz not null,
  session_type text not null check (session_type in ('online','in-person')),
  credit_source_type text not null check (credit_source_type in ('course','package','membership')),
  credit_source_id uuid not null,
  eligible_credits_before integer not null check (eligible_credits_before > 0),
  eligible_credits_after integer not null check (eligible_credits_after >= 0),
  immutable_context jsonb not null,
  created_at timestamptz not null default now(),
  constraint admin_session_booking_student_owner_fkey
    foreign key (student_id, customer_id)
    references public.students(id, customer_id) on delete restrict,
  constraint admin_session_booking_duration_check
    check (confirmed_end = confirmed_start + interval '1 hour')
);

create index if not exists admin_session_booking_audit_admin_profile_idx
  on public.admin_session_booking_audit(admin_profile_id);
create index if not exists admin_session_booking_audit_customer_idx
  on public.admin_session_booking_audit(customer_id);
create index if not exists admin_session_booking_audit_tutor_idx
  on public.admin_session_booking_audit(tutor_id);
create index if not exists admin_session_booking_audit_student_owner_idx
  on public.admin_session_booking_audit(student_id, customer_id);

alter table public.admin_session_booking_audit enable row level security;
revoke all on public.admin_session_booking_audit from public, anon, authenticated;
grant select, insert on public.admin_session_booking_audit to service_role;

create table if not exists public.admin_session_booking_delivery (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null unique references public.admin_session_booking_audit(id) on delete cascade,
  session_id uuid not null unique references public.sessions(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','processing','complete','attention')),
  calendar_status text not null default 'pending' check (calendar_status in ('pending','complete','attention')),
  email_status text not null default 'pending' check (email_status in ('pending','complete','attention')),
  calendar_event_id text,
  owner_email_sent_at timestamptz,
  student_email_sent_at timestamptz,
  tutor_email_sent_at timestamptz,
  admin_email_sent_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  claim_token uuid,
  claim_expires_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);

alter table public.admin_session_booking_delivery enable row level security;
revoke all on public.admin_session_booking_delivery from public, anon, authenticated;
grant select, insert, update on public.admin_session_booking_delivery to service_role;

create or replace function public.reject_admin_session_booking_audit_mutation()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  raise exception 'admin_session_booking_audit_is_immutable' using errcode='55000';
end
$function$;

drop trigger if exists admin_session_booking_audit_immutable on public.admin_session_booking_audit;
create trigger admin_session_booking_audit_immutable
before update or delete on public.admin_session_booking_audit
for each row execute function public.reject_admin_session_booking_audit_mutation();

create or replace function public.admin_book_session_with_credit(
  p_admin_profile_id uuid,
  p_customer_id uuid,
  p_student_id uuid,
  p_tutor_id uuid,
  p_subject_ids uuid[],
  p_confirmed_start timestamptz,
  p_confirmed_end timestamptz,
  p_session_type text,
  p_internal_notes text,
  p_idempotency_key uuid
)
returns table (
  booking_id uuid,
  session_id uuid,
  audit_id uuid,
  credit_source_type text,
  credit_source_id uuid,
  eligible_credits_before integer,
  eligible_credits_after integer,
  created boolean
)
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_customer public.customers;
  v_student public.students;
  v_tutor public.tutors;
  v_existing public.admin_session_booking_audit;
  v_booking public.booking_requests;
  v_session public.sessions;
  v_audit public.admin_session_booking_audit;
  v_source_type text;
  v_source_id uuid;
  v_eligible_before integer;
  v_eligible_after integer;
  v_subject_count integer;
  v_day text;
  v_start_time time;
  v_end_time time;
  v_admin public.profiles;
  v_admin_emails jsonb;
begin
  if p_idempotency_key is null then raise exception 'missing_idempotency_key' using errcode='22023'; end if;
  if p_customer_id is null or p_student_id is null or p_tutor_id is null then
    raise exception 'missing_booking_identity' using errcode='22023';
  end if;
  if p_session_type<>'online' then
    raise exception 'invalid_session_type' using errcode='22023';
  end if;
  if p_subject_ids is null or cardinality(p_subject_ids)=0 or cardinality(p_subject_ids)>20 then
    raise exception 'invalid_subject_selection' using errcode='22023';
  end if;
  if p_confirmed_start is null or p_confirmed_end is null
     or p_confirmed_end<>p_confirmed_start+interval '1 hour'
     or p_confirmed_start<=now()
     or p_confirmed_start>now()+interval '2 years' then
    raise exception 'invalid_session_time' using errcode='22023';
  end if;
  if length(coalesce(p_internal_notes,''))>2000 then
    raise exception 'notes_too_long' using errcode='22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text,0));

  select a.* into v_existing
  from public.admin_session_booking_audit a
  where a.idempotency_key=p_idempotency_key;
  if found then
    if v_existing.admin_profile_id<>p_admin_profile_id
       or v_existing.customer_id<>p_customer_id
       or v_existing.student_id<>p_student_id
       or v_existing.tutor_id<>p_tutor_id
       or v_existing.subject_ids<>p_subject_ids
       or v_existing.confirmed_start<>p_confirmed_start
       or v_existing.confirmed_end<>p_confirmed_end
       or v_existing.session_type<>p_session_type
       or coalesce(v_existing.immutable_context->>'internal_notes','')<>coalesce(nullif(btrim(p_internal_notes),''),'') then
      raise exception 'idempotency_key_reused' using errcode='23505';
    end if;
    return query select
      v_existing.booking_request_id,v_existing.session_id,v_existing.id,
      v_existing.credit_source_type,v_existing.credit_source_id,
      v_existing.eligible_credits_before,v_existing.eligible_credits_after,false;
    return;
  end if;

  select p.* into v_admin from public.profiles p
  where p.id=p_admin_profile_id and p.role='admin';
  if not found then raise exception 'admin_required' using errcode='42501'; end if;

  select c.* into v_customer from public.customers c
  where c.id=p_customer_id for update;
  if not found then raise exception 'customer_not_found' using errcode='P0002'; end if;

  select s.* into v_student from public.students s
  where s.id=p_student_id and s.customer_id=p_customer_id and s.is_active=true;
  if not found then raise exception 'student_not_active_or_owned' using errcode='42501'; end if;

  select t.* into v_tutor from public.tutors t
  where t.id=p_tutor_id and t.is_active=true;
  if not found then raise exception 'tutor_not_active' using errcode='22023'; end if;

  -- Serialize bookings for one tutor even when the account owners differ.
  -- Without this lock, two transactions can both pass the overlap read before
  -- either inserts its scheduled session.
  perform pg_advisory_xact_lock(
    hashtextextended('admin-booking-tutor:' || p_tutor_id::text,0)
  );

  select count(distinct s.id) into v_subject_count
  from public.subjects s
  where s.id=any(p_subject_ids)
    and s.is_active=true
    and s.slug<>'in-person-sat'
    and s.name !~* 'in[- ]person'
    and not (
      s.category='high-school'
      and s.slug in ('biology','environmental-science','spanish','history','french','english')
    );
  if v_subject_count<>cardinality(p_subject_ids) then
    raise exception 'invalid_subject_selection' using errcode='22023';
  end if;

  if exists (
    select 1 from public.sessions s
    where s.assigned_tutor_id=p_tutor_id
      and s.status='scheduled'
      and s.confirmed_start is not null
      and s.confirmed_end is not null
      and tstzrange(s.confirmed_start,s.confirmed_end,'[)')
          && tstzrange(p_confirmed_start,p_confirmed_end,'[)')
  ) then raise exception 'admin_booking_tutor_overlap' using errcode='23P01'; end if;

  select
    coalesce((select sum(greatest(0,ce.remaining_sessions)) from public.course_enrollments ce
      where ce.customer_id=p_customer_id and ce.student_id=p_student_id
        and ce.status='active' and ce.remaining_sessions>0),0)
    + coalesce((select sum(greatest(0,p.remaining_hours)) from public.packages p
      where p.customer_id=p_customer_id and p.student_id=p_student_id and p.remaining_hours>0
        and (p.expires_at is null or p.expires_at>now())),0)
    + coalesce((select sum(greatest(0,coalesce(m.included_hours,0)+coalesce(m.rollover_hours,0)-coalesce(m.used_hours,0)))
      from public.memberships m where m.customer_id=p_customer_id and m.status='active'
        and coalesce(m.included_hours,0)+coalesce(m.rollover_hours,0)-coalesce(m.used_hours,0)>0),0)
    + coalesce((select sum(greatest(0,p.remaining_hours)) from public.packages p
      where p.customer_id=p_customer_id and p.student_id is null and p.remaining_hours>0
        and (p.expires_at is null or p.expires_at>now())),0)
  into v_eligible_before;

  update public.course_enrollments set remaining_sessions=remaining_sessions-1
  where id=(select ce.id from public.course_enrollments ce
    where ce.customer_id=p_customer_id and ce.student_id=p_student_id
      and ce.status='active' and ce.remaining_sessions>0
    order by ce.created_at asc for update skip locked limit 1)
  and remaining_sessions>0
  returning id into v_source_id;
  if v_source_id is not null then v_source_type:='course'; end if;

  if v_source_type is null then
    update public.packages set remaining_hours=remaining_hours-1
    where id=(select p.id from public.packages p
      where p.customer_id=p_customer_id and p.student_id=p_student_id
        and p.remaining_hours>0 and (p.expires_at is null or p.expires_at>now())
      order by p.expires_at asc nulls last for update skip locked limit 1)
    and remaining_hours>0 and (expires_at is null or expires_at>now())
    returning id into v_source_id;
    if v_source_id is not null then v_source_type:='package'; end if;
  end if;

  if v_source_type is null then
    update public.memberships set used_hours=coalesce(used_hours,0)+1
    where id=(select m.id from public.memberships m
      where m.customer_id=p_customer_id and m.status='active'
        and coalesce(m.included_hours,0)+coalesce(m.rollover_hours,0)-coalesce(m.used_hours,0)>0
      order by m.current_period_end desc nulls last for update skip locked limit 1)
    and coalesce(included_hours,0)+coalesce(rollover_hours,0)-coalesce(used_hours,0)>0
    returning id into v_source_id;
    if v_source_id is not null then v_source_type:='membership'; end if;
  end if;

  if v_source_type is null then
    update public.packages set remaining_hours=remaining_hours-1
    where id=(select p.id from public.packages p
      where p.customer_id=p_customer_id and p.student_id is null
        and p.remaining_hours>0 and (p.expires_at is null or p.expires_at>now())
      order by p.expires_at asc nulls last for update skip locked limit 1)
    and remaining_hours>0 and (expires_at is null or expires_at>now())
    returning id into v_source_id;
    if v_source_id is not null then v_source_type:='package'; end if;
  end if;

  if v_source_type is null then raise exception 'no_available_credits' using errcode='P0003'; end if;
  v_eligible_after:=v_eligible_before-1;

  v_day:=lower(btrim(to_char(p_confirmed_start at time zone 'America/New_York','FMDay')));
  v_start_time:=(p_confirmed_start at time zone 'America/New_York')::time;
  v_end_time:=(p_confirmed_end at time zone 'America/New_York')::time;

  insert into public.booking_requests (
    customer_id,student_id,subjects,available_days,available_time_start,
    available_time_end,available_windows,timezone,session_type,status,payment_type,
    payment_method,purchase_key,course_enrollment_id,credit_source_id,notes,amount_cents
  ) values (
    p_customer_id,p_student_id,p_subject_ids,array[v_day],v_start_time,v_end_time,
    jsonb_build_array(jsonb_build_object('day',v_day,'start',to_char(v_start_time,'HH24:MI'),'end',to_char(v_end_time,'HH24:MI'))),
    'America/New_York',p_session_type,'paid',v_source_type,'account_credit',p_idempotency_key,
    case when v_source_type='course' then v_source_id else null end,
    v_source_id,null,0
  ) returning * into v_booking;

  insert into public.sessions (
    order_id,customer_id,student_id,assigned_tutor_id,confirmed_start,confirmed_end,
    session_type,subjects,status,internal_notes
  ) values (
    v_booking.id,p_customer_id,p_student_id,p_tutor_id,p_confirmed_start,p_confirmed_end,
    p_session_type,(select array_agg(id::text) from unnest(p_subject_ids) id),'scheduled',
    nullif(btrim(p_internal_notes),'')
  ) returning * into v_session;

  select coalesce(jsonb_agg(jsonb_build_object('email',btrim(entry),'full_name','ScoreMax Admin')),'[]'::jsonb)
  into v_admin_emails
  from public.admin_settings settings
  cross join lateral unnest(string_to_array(coalesce(settings.value,''),',')) entry
  where settings.key='notification_emails' and btrim(entry)<>'';

  insert into public.admin_session_booking_audit (
    idempotency_key,admin_profile_id,customer_id,student_id,booking_request_id,session_id,
    tutor_id,subject_ids,confirmed_start,confirmed_end,session_type,credit_source_type,
    credit_source_id,eligible_credits_before,eligible_credits_after,immutable_context
  ) values (
    p_idempotency_key,p_admin_profile_id,p_customer_id,p_student_id,v_booking.id,v_session.id,
    p_tutor_id,p_subject_ids,p_confirmed_start,p_confirmed_end,p_session_type,v_source_type,
    v_source_id,v_eligible_before,v_eligible_after,
    jsonb_build_object(
      'admin',jsonb_build_object('id',v_admin.id,'email',v_admin.email,'full_name',v_admin.full_name),
      'owner',jsonb_build_object('id',v_customer.id,'email',v_customer.email,'full_name',v_customer.full_name),
      'student',jsonb_build_object('id',v_student.id,'email',v_student.email,'full_name',v_student.full_name),
      'tutor',jsonb_build_object('id',v_tutor.id,'email',v_tutor.email,'full_name',v_tutor.full_name),
      'admins',coalesce(v_admin_emails,'[]'::jsonb),
      'internal_notes',coalesce(nullif(btrim(p_internal_notes),''),'')
    )
  ) returning * into v_audit;

  insert into public.admin_session_booking_delivery (audit_id,session_id)
  values (v_audit.id,v_session.id);

  return query select v_booking.id,v_session.id,v_audit.id,v_source_type,v_source_id,
    v_eligible_before,v_eligible_after,true;
end
$function$;

revoke all on function public.admin_book_session_with_credit(uuid,uuid,uuid,uuid,uuid[],timestamptz,timestamptz,text,text,uuid)
from public, anon, authenticated;
grant execute on function public.admin_book_session_with_credit(uuid,uuid,uuid,uuid,uuid[],timestamptz,timestamptz,text,text,uuid)
to service_role;

create or replace function public.claim_admin_session_booking_delivery(
  p_session_id uuid,
  p_claim_token uuid
)
returns table (
  id uuid,
  audit_id uuid,
  session_id uuid,
  status text,
  calendar_status text,
  email_status text,
  calendar_event_id text,
  owner_email_sent_at timestamptz,
  student_email_sent_at timestamptz,
  tutor_email_sent_at timestamptz,
  admin_email_sent_at timestamptz,
  attempt_count integer,
  claim_token uuid,
  claim_expires_at timestamptz,
  last_error text,
  updated_at timestamptz,
  claimed boolean
)
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_delivery public.admin_session_booking_delivery;
  v_claimed boolean:=false;
begin
  if p_session_id is null or p_claim_token is null then
    raise exception 'invalid_delivery_claim' using errcode='22023';
  end if;

  update public.admin_session_booking_delivery d set
    status='processing',
    attempt_count=d.attempt_count+1,
    claim_token=p_claim_token,
    claim_expires_at=now()+interval '5 minutes',
    last_error=null,
    updated_at=now()
  where d.session_id=p_session_id
    and d.status<>'complete'
    and (d.claim_expires_at is null or d.claim_expires_at<now())
  returning d.* into v_delivery;
  if found then v_claimed:=true;
  else
    select d.* into v_delivery from public.admin_session_booking_delivery d
    where d.session_id=p_session_id;
  end if;

  if not found then raise exception 'delivery_not_found' using errcode='P0002'; end if;
  return query select
    v_delivery.id,v_delivery.audit_id,v_delivery.session_id,v_delivery.status,
    v_delivery.calendar_status,v_delivery.email_status,v_delivery.calendar_event_id,
    v_delivery.owner_email_sent_at,v_delivery.student_email_sent_at,
    v_delivery.tutor_email_sent_at,v_delivery.admin_email_sent_at,
    v_delivery.attempt_count,v_delivery.claim_token,v_delivery.claim_expires_at,
    v_delivery.last_error,v_delivery.updated_at,v_claimed;
end
$function$;

revoke all on function public.claim_admin_session_booking_delivery(uuid,uuid)
from public, anon, authenticated;
grant execute on function public.claim_admin_session_booking_delivery(uuid,uuid)
to service_role;
