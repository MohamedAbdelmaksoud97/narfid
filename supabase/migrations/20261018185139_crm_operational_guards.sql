begin;

create or replace function public.crm_contract_guard() returns trigger language plpgsql security invoker set search_path='' as $$
declare received bigint;
begin
  if tg_op='DELETE' then
    if old.status<>'draft' then raise exception 'CRM_CONTRACT_KEEP_HISTORY' using errcode='22023'; end if;
    return old;
  end if;
  -- Application users cannot turn a retained contract into a deletable draft.
  -- Privileged database maintenance can still clean up isolated QA fixtures.
  if tg_op='UPDATE' then
    if current_user='authenticated' and old.status<>'draft' and new.status='draft' then raise exception 'CRM_CONTRACT_KEEP_HISTORY' using errcode='22023'; end if;
  end if;
  perform 1 from public.crm_accounts where id=new.account_id for update;
  select coalesce(sum(amount_cents),0) into received from public.crm_payments where contract_id=new.id and not voided;
  if received>new.annual_fee_cents+new.setup_fee_cents or (received>0 and new.status<>'signed') then raise exception 'CRM_CONTRACT_HAS_PAYMENTS' using errcode='22023'; end if;
  if new.status='signed' and exists(select 1 from public.crm_contracts where account_id=new.account_id and id<>new.id and status='signed' and daterange(starts_on,ends_on,'[]') && daterange(new.starts_on,new.ends_on,'[]')) then raise exception 'CRM_CONTRACT_OVERLAP' using errcode='22023'; end if;
  return new;
end $$;

create or replace function public.crm_plan_link() returns trigger language plpgsql security invoker set search_path='' as $$
declare selected public.crm_plans; changed boolean; needs_active boolean;
begin
  changed:=tg_op='INSERT' or new.plan_id is distinct from old.plan_id;
  needs_active:=changed;
  if tg_table_name='crm_contracts' and tg_op='UPDATE' then
    needs_active:=needs_active or (old.status='draft' and new.status='signed');
  end if;
  if needs_active and new.plan_id is not null then
    select * into selected from public.crm_plans where id=new.plan_id for share;
    if not found or not selected.active then raise exception 'CRM_PLAN_UNAVAILABLE' using errcode='22023'; end if;
  end if;
  if tg_table_name='crm_contracts' then
    if changed then new.plan_name:=coalesce(selected.name,''); new.plan_features:=coalesce(selected.features,'{}'::text[]);
    else new.plan_name:=old.plan_name; new.plan_features:=old.plan_features; end if;
  end if;
  return new;
end $$;

create function public.crm_archive_delete_guard() returns trigger language plpgsql security invoker set search_path='' as $$
declare archived boolean;
begin
  select a.archived into archived from public.crm_accounts a where a.id=old.account_id for share;
  if found and archived then raise exception 'CRM_ACCOUNT_UNAVAILABLE' using errcode='22023'; end if;
  return old;
end $$;
revoke all on function public.crm_archive_delete_guard() from public,anon,authenticated;
do $$ declare tab text; begin
  foreach tab in array array['crm_contacts','crm_activities','crm_followups','crm_contracts','crm_workspaces','crm_tickets'] loop
    execute format('create trigger crm_archive_delete_guard before delete on public.%I for each row execute function public.crm_archive_delete_guard()',tab);
  end loop;
end $$;
commit;
