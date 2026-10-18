begin;

-- Optional agreed payment deadline; legacy contracts use their start date.
alter table public.crm_contracts add column payment_due_on date
  check(payment_due_on between date '2000-01-01' and date '2100-12-31');

create or replace function public.convert_crm_lead(p_id uuid,p_revision bigint,p_contract jsonb)
returns public.crm_accounts language plpgsql security invoker set search_path='' as $$
declare acc public.crm_accounts; selected_id uuid;
begin
  if p_revision is null or p_revision<0 then raise exception 'CRM_INVALID_REVISION' using errcode='22023'; end if;
  select * into acc from public.crm_accounts where id=p_id for update;
  if not found then raise exception 'CRM_NOT_FOUND' using errcode='P0002'; end if;
  if acc.kind='client' then return acc; end if;
  if acc.archived then raise exception 'CRM_ARCHIVED' using errcode='22023'; end if;
  if acc.revision<>p_revision then raise sqlstate 'PT409' using message='CRM_CONFLICT'; end if;
  selected_id:=case when p_contract ? 'plan_id' then nullif(p_contract->>'plan_id','')::uuid else acc.plan_id end;
  if selected_id is not null and not exists(select 1 from public.crm_plans where id=selected_id and active) then raise exception 'CRM_PLAN_UNAVAILABLE' using errcode='22023'; end if;
  update public.crm_accounts set kind='client',stage='onboarding',converted_at=now(),lost_reason='',plan_id=selected_id where id=p_id returning * into acc;
  insert into public.crm_contracts(account_id,title,reference,starts_on,ends_on,payment_due_on,annual_fee_cents,setup_fee_cents,status,scope,document_url,plan_id)
    values(p_id,p_contract->>'title',coalesce(p_contract->>'reference',''),(p_contract->>'starts_on')::date,(p_contract->>'ends_on')::date,nullif(p_contract->>'payment_due_on','')::date,(p_contract->>'annual_fee_cents')::bigint,(p_contract->>'setup_fee_cents')::bigint,'signed',coalesce(p_contract->>'scope',''),coalesce(p_contract->>'document_url',''),selected_id);
  return acc;
end $$;
revoke all on function public.convert_crm_lead(uuid,bigint,jsonb) from public,anon;
grant execute on function public.convert_crm_lead(uuid,bigint,jsonb) to authenticated;

create table public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('income','expense')),
  title text not null check(char_length(btrim(title)) between 2 and 200),
  category text not null,
  account_id uuid references public.crm_accounts(id) on delete restrict,
  counterparty text not null default '' check(char_length(counterparty)<=200),
  amount_cents bigint not null check(amount_cents between 1 and 100000000000),
  due_on date not null check(due_on between date '2000-01-01' and date '2100-12-31'),
  paid_on date check(paid_on between date '2000-01-01' and date '2100-12-31'),
  method text not null default 'bank' check(method in ('bank','cash','card','other')),
  reference text not null default '' check(char_length(reference)<=150),
  notes text not null default '' check(char_length(notes)<=4000),
  voided boolean not null default false,
  void_reason text not null default '' check(char_length(void_reason)<=2000),
  voided_at timestamptz,
  revision bigint not null default 0 check(revision>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  updated_by uuid,
  check((kind='income' and category in ('development','mobile','gates','consulting','other_income') and paid_on is not null)
     or (kind='expense' and category in ('hosting','software','marketing','people','operations','equipment','other_expense'))),
  check((voided and char_length(btrim(void_reason))>=2 and voided_at is not null)
     or (not voided and void_reason='' and voided_at is null))
);
create index finance_entries_account on public.finance_entries(account_id);
create index finance_entries_paid on public.finance_entries(paid_on) where not voided;
create index finance_entries_pending on public.finance_entries(due_on) where not voided and paid_on is null;
create index crm_payments_paid on public.crm_payments(paid_on) where not voided;

alter table public.finance_entries enable row level security;
revoke all on public.finance_entries from public,anon,authenticated;
grant select,insert,update on public.finance_entries to authenticated;
create policy finance_board_access on public.finance_entries for all to authenticated
  using (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active))
  with check (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));

create function public.finance_entry_guard() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.paid_on>(now() at time zone 'Asia/Riyadh')::date then
    raise exception 'FINANCE_FUTURE_PAYMENT' using errcode='22023';
  end if;
  if tg_op='INSERT' then
    if new.voided then raise exception 'FINANCE_INVALID_STATE' using errcode='22023'; end if;
    new.revision:=0; new.created_at:=now(); new.created_by:=auth.uid();
    new.void_reason:=''; new.voided_at:=null;
  else
    if new.id<>old.id or new.kind<>old.kind or new.created_at<>old.created_at
      or new.created_by is distinct from old.created_by or old.voided then
      raise exception 'FINANCE_IMMUTABLE' using errcode='22023';
    end if;
    -- Once cash has moved, retain the original record and correct by void/re-entry.
    if old.paid_on is not null or new.voided then
      if not new.voided or
        (to_jsonb(new)-array['voided','void_reason','voided_at','revision','updated_at','updated_by'])
        is distinct from
        (to_jsonb(old)-array['voided','void_reason','voided_at','revision','updated_at','updated_by']) then
        raise exception 'FINANCE_IMMUTABLE' using errcode='22023';
      end if;
    end if;
    if new.voided then
      if char_length(btrim(new.void_reason)) not between 2 and 2000 then
        raise exception 'FINANCE_VOID_REASON' using errcode='22023';
      end if;
      new.voided_at:=now();
    else new.void_reason:=''; new.voided_at:=null; end if;
    new.revision:=old.revision+1;
  end if;
  new.updated_at:=now(); new.updated_by:=auth.uid();
  return new;
end $$;
revoke all on function public.finance_entry_guard() from public,anon,authenticated;
create trigger finance_entry_guard before insert or update on public.finance_entries
  for each row execute function public.finance_entry_guard();

commit;
