-- Every fixture and membership change is rolled back, including on assertion failure.
begin;
do $$
declare member_ids uuid[];
begin
  select array_agg(user_id order by user_id) into member_ids from public.board_members where active;
  if cardinality(member_ids)<2 then raise exception 'Need two active board members to test assignment'; end if;
  perform set_config('crm_test.actor',member_ids[1]::text,true);
  perform set_config('crm_test.assignee',member_ids[2]::text,true);
  perform set_config('crm_test.active_count',cardinality(member_ids)::text,true);
  perform set_config('request.jwt.claims',jsonb_build_object('sub',member_ids[1],'role','authenticated')::text,true);
end $$;
set local role authenticated;
do $$
declare a public.crm_accounts;
begin
  if not crm_internal.is_active_board_member() then raise exception 'Live membership not found'; end if;
  if (select count(*) from public.board_members where active)<>current_setting('crm_test.active_count')::int then raise exception 'Directory truncated to current member'; end if;
  insert into public.crm_accounts(kind,name,stage,owner_id)
    values('lead','CRM-QA-DIRECTORY','new',current_setting('crm_test.assignee')::uuid) returning * into a;
  insert into public.crm_followups(account_id,title,owner_id)
    values(a.id,'Follow up by another member',current_setting('crm_test.assignee')::uuid);
  begin update public.board_members set active=false; raise exception 'Board membership update allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.board_members(user_id) values(gen_random_uuid()); raise exception 'Board membership insert allowed'; exception when insufficient_privilege then null; end;
  begin delete from public.board_members; raise exception 'Board membership delete allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- The directory must react immediately to membership deactivation.
update public.board_members set active=false where user_id=current_setting('crm_test.assignee')::uuid;
set local role authenticated;
do $$ begin
  if exists(select 1 from public.board_members where user_id=current_setting('crm_test.assignee')::uuid) then raise exception 'Inactive colleague visible'; end if;
  begin
    insert into public.crm_accounts(kind,name,stage,owner_id) values('lead','CRM-QA-DIRECTORY-INACTIVE','new',current_setting('crm_test.assignee')::uuid);
    raise exception 'Inactive assignee allowed';
  exception when sqlstate '22023' then null; end;
end $$;
reset role;

do $$ begin perform set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('crm_test.assignee'),'role','authenticated')::text,true); end $$;
set local role authenticated;
do $$ begin
  if crm_internal.is_active_board_member() then raise exception 'Inactive membership accepted'; end if;
  if (select count(*) from public.board_members where active)<>0 then raise exception 'Inactive member can read team'; end if;
  if (select count(*) from public.board_members)<>1 then raise exception 'Own membership check changed'; end if;
end $$;
reset role;

do $$ begin perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000000","role":"authenticated"}',true); end $$;
set local role authenticated;
do $$ begin
  if crm_internal.is_active_board_member() then raise exception 'Nonboard membership accepted'; end if;
  if (select count(*) from public.board_members)<>0 then raise exception 'Nonboard can read directory'; end if;
end $$;
reset role;

set local role anon;
do $$ begin
  begin perform count(*) from public.board_members; raise exception 'Anonymous directory exposed'; exception when insufficient_privilege then null; end;
  begin perform crm_internal.is_active_board_member(); raise exception 'Anonymous helper exposed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
