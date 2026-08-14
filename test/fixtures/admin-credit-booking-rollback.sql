begin;

insert into auth.users (id,email,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
  ('10000000-0000-4000-8000-000000000001','fixture-admin@scoremax.invalid','{"role":"admin"}','{"full_name":"Fixture Admin"}',now(),now()),
  ('10000000-0000-4000-8000-000000000002','fixture-customer@scoremax.invalid','{"role":"customer"}','{"full_name":"Fixture Parent","account_type":"parent"}',now(),now()),
  ('10000000-0000-4000-8000-000000000003','fixture-tutor@scoremax.invalid','{"role":"tutor"}','{"full_name":"Fixture Tutor"}',now(),now()),
  ('10000000-0000-4000-8000-000000000004','fixture-nonadmin@scoremax.invalid','{"role":"customer"}','{"full_name":"Fixture Nonadmin","account_type":"parent"}',now(),now()),
  ('10000000-0000-4000-8000-000000000005','fixture-empty@scoremax.invalid','{"role":"customer"}','{"full_name":"Fixture Empty Parent","account_type":"parent"}',now(),now());

insert into public.tutors (id,profile_id,full_name,email,is_active)
values ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','Fixture Tutor','fixture-tutor@scoremax.invalid',true);

insert into public.subjects (id,name,slug,category,hourly_rate_cents,is_active)
values ('30000000-0000-4000-8000-000000000001','Fixture Algebra','fixture-algebra','high-school',17500,true);

insert into public.students (id,customer_id,full_name,email,grade,is_active)
select '40000000-0000-4000-8000-000000000001',id,'Fixture Child A','fixture-child-a@scoremax.invalid','8th Grade',true
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.students (id,customer_id,full_name,email,grade,is_active)
select '40000000-0000-4000-8000-000000000002',id,'Fixture Child B','fixture-child-b@scoremax.invalid','9th Grade',true
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.students (id,customer_id,full_name,email,grade,is_active)
select '40000000-0000-4000-8000-000000000003',id,'Fixture Child C','fixture-child-c@scoremax.invalid','10th Grade',true
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.students (id,customer_id,full_name,email,grade,is_active)
select '40000000-0000-4000-8000-000000000004',id,'Fixture Empty Child','fixture-empty-child@scoremax.invalid','7th Grade',true
from public.customers where profile_id='10000000-0000-4000-8000-000000000005';

insert into public.course_enrollments (
  id,customer_id,student_id,course_type,total_sessions,remaining_sessions,amount_cents,status
)
select '50000000-0000-4000-8000-000000000001',id,'40000000-0000-4000-8000-000000000001',
  'sat',1,1,250000,'active'
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.packages (id,customer_id,student_id,total_hours,remaining_hours,expires_at)
select '60000000-0000-4000-8000-000000000001',id,'40000000-0000-4000-8000-000000000001',1,1,now()+interval '1 year'
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.packages (id,customer_id,student_id,total_hours,remaining_hours,expires_at)
select '60000000-0000-4000-8000-000000000002',id,'40000000-0000-4000-8000-000000000002',1,1,now()+interval '1 year'
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.packages (id,customer_id,student_id,total_hours,remaining_hours,expires_at)
select '60000000-0000-4000-8000-000000000003',id,null,2,2,now()+interval '1 year'
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.packages (id,customer_id,student_id,total_hours,remaining_hours,expires_at)
select '60000000-0000-4000-8000-000000000004',id,'40000000-0000-4000-8000-000000000003',9,9,now()-interval '1 day'
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

insert into public.memberships (
  id,customer_id,tier,status,included_hours,used_hours,rollover_hours,current_period_end
)
select '70000000-0000-4000-8000-000000000001',id,'starter','active',1,0,0,now()+interval '1 month'
from public.customers where profile_id='10000000-0000-4000-8000-000000000002';

do $fixture$
declare
  v_customer uuid;
  v_empty_customer uuid;
  v_start timestamptz:=date_trunc('day',now())+interval '30 days 14 hours';
  v_first record;
  v_duplicate record;
  v_second record;
  v_third record;
  v_delivery record;
  v_failed boolean;
begin
  if position(
    'admin-booking-tutor:' in pg_get_functiondef(
      'public.admin_book_session_with_credit(uuid,uuid,uuid,uuid,uuid[],timestamp with time zone,timestamp with time zone,text,text,uuid)'::regprocedure
    )
  )=0 then
    raise exception 'fixture_tutor_concurrency_lock_missing';
  end if;

  select id into v_customer from public.customers
  where profile_id='10000000-0000-4000-8000-000000000002';
  select id into v_empty_customer from public.customers
  where profile_id='10000000-0000-4000-8000-000000000005';

  -- Auth and ownership fail closed before any credit is used.
  v_failed:=false;
  begin
    perform * from public.admin_book_session_with_credit(
      '10000000-0000-4000-8000-000000000004',v_customer,
      '40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',
      array['30000000-0000-4000-8000-000000000001'::uuid],v_start,v_start+interval '1 hour',
      'online','must fail','80000000-0000-4000-8000-000000000001'
    );
  exception when insufficient_privilege then v_failed:=true;
  end;
  if not v_failed then raise exception 'fixture_admin_auth_guard_failed'; end if;

  v_failed:=false;
  begin
    perform * from public.admin_book_session_with_credit(
      '10000000-0000-4000-8000-000000000001',v_customer,
      '40000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001',
      array['30000000-0000-4000-8000-000000000001'::uuid],v_start,v_start+interval '1 hour',
      'online','must fail','80000000-0000-4000-8000-000000000002'
    );
  exception when insufficient_privilege then v_failed:=true;
  end;
  if not v_failed then raise exception 'fixture_student_ownership_guard_failed'; end if;

  -- Child-bound course wins before package/membership/family credit.
  select * into v_first from public.admin_book_session_with_credit(
    '10000000-0000-4000-8000-000000000001',v_customer,
    '40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',
    array['30000000-0000-4000-8000-000000000001'::uuid],v_start,v_start+interval '1 hour',
    'online','fixture first','80000000-0000-4000-8000-000000000003'
  );
  if v_first.credit_source_type<>'course' or not v_first.created then
    raise exception 'fixture_course_priority_failed';
  end if;
  if (select remaining_sessions from public.course_enrollments where id='50000000-0000-4000-8000-000000000001')<>0 then
    raise exception 'fixture_course_not_decremented';
  end if;

  -- Same key is a pure replay: same rows, no second decrement.
  select * into v_duplicate from public.admin_book_session_with_credit(
    '10000000-0000-4000-8000-000000000001',v_customer,
    '40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',
    array['30000000-0000-4000-8000-000000000001'::uuid],v_start,v_start+interval '1 hour',
    'online','fixture first','80000000-0000-4000-8000-000000000003'
  );
  if v_duplicate.created or v_duplicate.session_id<>v_first.session_id then
    raise exception 'fixture_idempotency_failed';
  end if;
  if (select remaining_hours from public.packages where id='60000000-0000-4000-8000-000000000001')<>1 then
    raise exception 'fixture_duplicate_spent_package';
  end if;

  -- Exact overlap is rejected before another credit can move.
  v_failed:=false;
  begin
    perform * from public.admin_book_session_with_credit(
      '10000000-0000-4000-8000-000000000001',v_customer,
      '40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',
      array['30000000-0000-4000-8000-000000000001'::uuid],v_start+interval '30 minutes',v_start+interval '90 minutes',
      'online','must overlap','80000000-0000-4000-8000-000000000004'
    );
  exception when exclusion_violation then v_failed:=true;
  end;
  if not v_failed then raise exception 'fixture_overlap_guard_failed'; end if;
  if (select remaining_hours from public.packages where id='60000000-0000-4000-8000-000000000002')<>1 then
    raise exception 'fixture_overlap_spent_credit';
  end if;

  -- Child B spends only its own grant; Child A's package remains untouched.
  select * into v_second from public.admin_book_session_with_credit(
    '10000000-0000-4000-8000-000000000001',v_customer,
    '40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',
    array['30000000-0000-4000-8000-000000000001'::uuid],v_start+interval '2 hours',v_start+interval '3 hours',
    'online','fixture sibling','80000000-0000-4000-8000-000000000005'
  );
  if v_second.credit_source_type<>'package'
     or (select remaining_hours from public.packages where id='60000000-0000-4000-8000-000000000002')<>0
     or (select remaining_hours from public.packages where id='60000000-0000-4000-8000-000000000001')<>1 then
    raise exception 'fixture_sibling_scope_failed';
  end if;

  -- Expired Child C package is ignored; membership wins before family package.
  select * into v_third from public.admin_book_session_with_credit(
    '10000000-0000-4000-8000-000000000001',v_customer,
    '40000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001',
    array['30000000-0000-4000-8000-000000000001'::uuid],v_start+interval '4 hours',v_start+interval '5 hours',
    'online','fixture membership','80000000-0000-4000-8000-000000000006'
  );
  if v_third.credit_source_type<>'membership'
     or (select used_hours from public.memberships where id='70000000-0000-4000-8000-000000000001')<>1
     or (select remaining_hours from public.packages where id='60000000-0000-4000-8000-000000000003')<>2 then
    raise exception 'fixture_membership_priority_failed';
  end if;

  -- No eligible credit never creates a free order.
  v_failed:=false;
  begin
    perform * from public.admin_book_session_with_credit(
      '10000000-0000-4000-8000-000000000001',v_empty_customer,
      '40000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001',
      array['30000000-0000-4000-8000-000000000001'::uuid],v_start+interval '6 hours',v_start+interval '7 hours',
      'online','must have no credit','80000000-0000-4000-8000-000000000007'
    );
  exception when sqlstate 'P0003' then v_failed:=true;
  end;
  if not v_failed then raise exception 'fixture_no_credit_guard_failed'; end if;

  if not exists (
    select 1 from public.booking_requests b join public.sessions s on s.order_id=b.id
    join public.admin_session_booking_audit a on a.booking_request_id=b.id and a.session_id=s.id
    join public.admin_session_booking_delivery d on d.audit_id=a.id and d.session_id=s.id
    where b.id=v_first.booking_id and b.payment_method='account_credit' and b.amount_cents=0
      and b.notes is null
      and s.status='scheduled' and s.student_id='40000000-0000-4000-8000-000000000001'
      and s.internal_notes='fixture first'
  ) then raise exception 'fixture_atomic_rows_missing'; end if;

  -- Delivery claims are concurrency-safe, recoverable, and do not touch credit.
  select * into v_delivery from public.claim_admin_session_booking_delivery(v_first.session_id,'90000000-0000-4000-8000-000000000001');
  if v_delivery.claimed is not true then raise exception 'fixture_delivery_claim_failed'; end if;
  select * into v_delivery from public.claim_admin_session_booking_delivery(v_first.session_id,'90000000-0000-4000-8000-000000000002');
  if v_delivery.claimed is true then raise exception 'fixture_delivery_double_claimed'; end if;
  update public.admin_session_booking_delivery set status='attention',claim_token=null,claim_expires_at=null
  where session_id=v_first.session_id;
  select * into v_delivery from public.claim_admin_session_booking_delivery(v_first.session_id,'90000000-0000-4000-8000-000000000002');
  if v_delivery.claimed is not true
     or v_delivery.attempt_count<>2 then raise exception 'fixture_delivery_retry_failed'; end if;

  -- Core audit context cannot be rewritten even by the service path.
  v_failed:=false;
  begin
    update public.admin_session_booking_audit set immutable_context='{}'::jsonb where id=v_first.audit_id;
  exception when object_not_in_prerequisite_state then v_failed:=true;
  end;
  if not v_failed then raise exception 'fixture_audit_mutability_guard_failed'; end if;
end
$fixture$;

rollback;

select
  (select count(*) from auth.users where email like 'fixture-%@scoremax.invalid') as fixture_auth_users,
  (select count(*) from public.booking_requests where purchase_key::text like '80000000-%') as fixture_orders,
  (select count(*) from public.admin_session_booking_audit where idempotency_key::text like '80000000-%') as fixture_audits;
