begin;

alter table public.board_members add column display_name text not null default 'عضو مجلس الإدارة' check(char_length(display_name) between 2 and 150);
update public.board_members m set display_name=case lower(u.email)
  when 'chairman@nerfed.example' then 'رئيس مجلس الإدارة' when 'operations@nerfed.example' then 'إدارة التشغيل'
  when 'finance@nerfed.example' then 'الإدارة المالية' when 'technology@nerfed.example' then 'الإدارة التقنية'
  when 'strategy@nerfed.example' then 'إدارة الاستراتيجية' else 'عضو مجلس الإدارة' end
  from auth.users u where u.id=m.user_id;

create table public.crm_accounts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('lead','client')),
  name text not null check(char_length(btrim(name)) between 2 and 200),
  stage text not null,
  owner_id uuid references public.board_members(user_id) on delete set null,
  priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
  source text not null default 'other' check(source in ('referral','website','whatsapp','social','outbound','event','other')),
  city text not null default '' check(char_length(city)<=100),
  institution_type text not null default '' check(char_length(institution_type)<=100),
  branches integer not null default 1 check(branches between 1 and 10000),
  contact_name text not null default '' check(char_length(contact_name)<=150),
  contact_role text not null default '' check(char_length(contact_role)<=100),
  email text not null default '' check(char_length(email)<=254),
  phone text not null default '' check(char_length(phone)<=32),
  website text not null default '' check(website='' or website ~ '^https://[^[:space:]]+$'),
  needs text not null default '' check(char_length(needs)<=10000),
  annual_budget_cents bigint check(annual_budget_cents between 0 and 100000000000),
  expected_close_on date,
  next_follow_up_on date,
  lost_reason text not null default '' check(char_length(lost_reason)<=2000),
  archived boolean not null default false,
  converted_at timestamptz,
  revision bigint not null default 0 check(revision>=0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid,
  check((kind='lead' and stage in ('new','contacted','qualified','demo','proposal','negotiation','lost')) or (kind='client' and stage in ('onboarding','active','paused','churned'))),
  check(stage<>'lost' or char_length(btrim(lost_reason))>0)
);
create index crm_accounts_kind_stage on public.crm_accounts(kind,archived,stage);
create index crm_accounts_owner on public.crm_accounts(owner_id);
create index crm_accounts_followup on public.crm_accounts(next_follow_up_on) where not archived;

create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  name text not null check(char_length(btrim(name)) between 2 and 150), role text not null default '' check(char_length(role)<=100),
  email text not null default '' check(char_length(email)<=254), phone text not null default '' check(char_length(phone)<=32), notes text not null default '' check(char_length(notes)<=4000),
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid
);
create table public.crm_activities (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  title text not null check(char_length(btrim(title)) between 2 and 200), body text not null default '' check(char_length(body)<=10000),
  channel text not null default 'note' check(channel in ('note','call','whatsapp','email','meeting','demo')), occurred_on date not null,
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid
);
create table public.crm_followups (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  title text not null check(char_length(btrim(title)) between 2 and 200), details text not null default '' check(char_length(details)<=4000), due_on date,
  owner_id uuid references public.board_members(user_id) on delete set null,
  status text not null default 'open' check(status in ('open','done')), category text not null default 'followup' check(category in ('followup','onboarding')),
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid
);
create index crm_followups_due on public.crm_followups(due_on) where status='open';
create index crm_followups_owner on public.crm_followups(owner_id);
create table public.crm_contracts (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  title text not null check(char_length(btrim(title)) between 2 and 200), reference text not null default '' check(char_length(reference)<=150),
  starts_on date not null, ends_on date not null check(ends_on>=starts_on),
  annual_fee_cents bigint not null default 0 check(annual_fee_cents between 0 and 100000000000),
  setup_fee_cents bigint not null default 0 check(setup_fee_cents between 0 and 100000000000),
  status text not null default 'draft' check(status in ('draft','signed','cancelled')),
  scope text not null default '' check(char_length(scope)<=10000), document_url text not null default '' check(document_url='' or document_url ~ '^https://[^[:space:]]+$'),
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid
);
create index crm_contracts_renewal on public.crm_contracts(ends_on) where status='signed';
create table public.crm_workspaces (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  environment text not null default 'production' check(environment in ('production','staging')), status text not null default 'planned' check(status in ('planned','configuring','testing','live','maintenance','retired')),
  app_url text not null default '' check(app_url='' or app_url ~ '^https://[^[:space:]]+$'), database_ref text not null default '' check(char_length(database_ref)<=200 and database_ref !~* 'postgres(ql)?://|sb_secret|service_role|password[[:space:]]*=|bearer[[:space:]]'),
  repository_url text not null default '' check(repository_url='' or repository_url ~ '^https://[^[:space:]]+$'), release_ref text not null default '' check(char_length(release_ref)<=200), hosting_provider text not null default '' check(char_length(hosting_provider)<=150),
  backup_status text not null default 'unknown' check(backup_status in ('unknown','configured','verified')), backup_checked_on date,
  notes text not null default '' check(char_length(notes)<=5000),
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid,
  unique(account_id,environment),
  check(status<>'live' or (app_url<>'' and database_ref<>'')), check(backup_status<>'verified' or backup_checked_on is not null)
);
create table public.crm_tickets (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  title text not null check(char_length(btrim(title)) between 2 and 200), body text not null default '' check(char_length(body)<=10000),
  category text not null default 'support' check(category in ('support','bug','change','integration')), priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
  status text not null default 'open' check(status in ('open','in_progress','waiting','resolved')), owner_id uuid references public.board_members(user_id) on delete set null,
  due_on date, resolution text not null default '' check(char_length(resolution)<=5000),
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid
);
create index crm_tickets_owner on public.crm_tickets(owner_id);
create table public.crm_payments (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  contract_id uuid not null references public.crm_contracts on delete restrict,
  amount_cents bigint not null check(amount_cents>0 and amount_cents<=200000000000), paid_on date not null,
  method text not null check(method in ('bank','cash','card','other')), reference text not null default '' check(char_length(reference)<=150),
  notes text not null default '' check(char_length(notes)<=4000), voided boolean not null default false, void_reason text not null default '',
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid,
  check(not voided or char_length(btrim(void_reason))>=2)
);
create index crm_payments_contract on public.crm_payments(contract_id);
create table public.crm_events (
  id uuid primary key default gen_random_uuid(), account_id uuid not null references public.crm_accounts on delete cascade,
  title text not null, details text not null default '', actor_id uuid default auth.uid(), created_at timestamptz not null default now()
);

-- Every table is private to active board members. No public read policy.
do $$ declare tab text; begin
  foreach tab in array array['crm_accounts','crm_contacts','crm_activities','crm_followups','crm_contracts','crm_workspaces','crm_tickets','crm_payments','crm_events'] loop
    execute format('alter table public.%I enable row level security',tab);
    execute format('revoke all on public.%I from public,anon,authenticated',tab);
    execute format('grant select,insert,update on public.%I to authenticated',tab);
    execute format('create policy crm_board_access on public.%I for all to authenticated using (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active)) with check (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active))',tab);
    if tab not in ('crm_accounts','crm_events','crm_payments') then execute format('grant delete on public.%I to authenticated',tab); end if;
    if tab<>'crm_accounts' then execute format('create index %I on public.%I(account_id)',tab||'_account',tab); end if;
  end loop;
end $$;
revoke update on public.crm_events from authenticated;

create function public.crm_stamp() returns trigger language plpgsql security invoker set search_path='' as $$
declare account_kind text; account_archived boolean;
begin
  if tg_op='UPDATE' then
    if new.id<>old.id or new.created_at<>old.created_at then raise exception 'CRM_IMMUTABLE' using errcode='22023'; end if;
    if tg_table_name<>'crm_accounts' then
      if new.account_id<>old.account_id then raise exception 'CRM_IMMUTABLE' using errcode='22023'; end if;
    else
      if new.kind<>old.kind and (old.kind<>'lead' or new.kind<>'client' or new.converted_at is null) then raise exception 'CRM_BAD_CONVERSION' using errcode='22023'; end if;
    end if;
    new.revision:=old.revision+1; new.updated_at:=now();
  else new.revision:=0; new.created_at:=now(); new.updated_at:=now(); end if;
  new.updated_by:=auth.uid();
  if tg_table_name<>'crm_accounts' then
    select kind,archived into account_kind,account_archived from public.crm_accounts where id=new.account_id;
    if not found or account_archived then raise exception 'CRM_ACCOUNT_UNAVAILABLE' using errcode='22023'; end if;
    if tg_table_name in ('crm_contracts','crm_workspaces','crm_tickets','crm_payments') and account_kind<>'client' then raise exception 'CRM_CLIENT_REQUIRED' using errcode='22023'; end if;
  end if;
  if tg_table_name in ('crm_accounts','crm_followups','crm_tickets') then
    if new.owner_id is not null and not exists(select 1 from public.board_members where user_id=new.owner_id and active) then raise exception 'CRM_OWNER_INACTIVE' using errcode='22023'; end if;
  end if;
  return new;
end $$;
revoke all on function public.crm_stamp() from public,anon,authenticated;
do $$ declare tab text; begin
  foreach tab in array array['crm_accounts','crm_contacts','crm_activities','crm_followups','crm_contracts','crm_workspaces','crm_tickets','crm_payments'] loop
    execute format('create trigger crm_stamp before insert or update on public.%I for each row execute function public.crm_stamp()',tab);
  end loop;
end $$;

create function public.crm_history() returns trigger language plpgsql security invoker set search_path='' as $$
declare aid uuid; title text; label text;
begin
  label:=case tg_table_name when 'crm_accounts' then 'الملف' when 'crm_contacts' then 'جهة اتصال' when 'crm_activities' then 'تواصل أو ملاحظة' when 'crm_followups' then 'مهمة متابعة' when 'crm_contracts' then 'عقد' when 'crm_workspaces' then 'بيئة العميل' when 'crm_tickets' then 'طلب دعم أو تطوير' when 'crm_payments' then 'دفعة' end;
  if tg_table_name='crm_accounts' then aid:=coalesce(new.id,old.id); else aid:=coalesce(new.account_id,old.account_id); end if;
  if not exists(select 1 from public.crm_accounts where id=aid) then return coalesce(new,old); end if;
  title:=case tg_op when 'INSERT' then 'إضافة ' when 'DELETE' then 'حذف ' else 'تحديث ' end||label;
  if tg_table_name='crm_accounts' and tg_op='UPDATE' then
    if new.kind<>old.kind then title:='تحويل العميل المحتمل إلى عميل متعاقد';
    elsif new.archived<>old.archived then title:=case when new.archived then 'أرشفة الملف' else 'استعادة الملف' end;
    elsif new.stage<>old.stage then title:='تغيير مرحلة الملف'; end if;
  end if;
  insert into public.crm_events(account_id,title,details,actor_id) values(aid,title,coalesce(to_jsonb(new)->>'title',to_jsonb(old)->>'title',to_jsonb(new)->>'name',to_jsonb(old)->>'name',''),auth.uid());
  return coalesce(new,old);
end $$;
revoke all on function public.crm_history() from public,anon,authenticated;
do $$ declare tab text; begin
  foreach tab in array array['crm_accounts','crm_contacts','crm_activities','crm_followups','crm_contracts','crm_workspaces','crm_tickets','crm_payments'] loop
    execute format('create trigger crm_history after insert or update or delete on public.%I for each row execute function public.crm_history()',tab);
  end loop;
end $$;

create function public.crm_prepare_client() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.kind='client' and (tg_op='INSERT' or old.kind='lead') then
    insert into public.crm_workspaces(account_id) values(new.id);
    insert into public.crm_followups(account_id,title,category,owner_id)
      select new.id,item,'onboarding',new.owner_id from unnest(array['اعتماد نطاق الخدمات والتخصيصات','تجهيز قاعدة البيانات وبيئة التشغيل','تهيئة الهوية والخدمات والصلاحيات','نقل البيانات ومراجعة العينة','تدريب فريق العميل','اختبار دورة عمل كاملة واعتماد التسليم','بدء التشغيل والتحقق من النسخ الاحتياطي']) as tasks(item);
  end if;
  return new;
end $$;
revoke all on function public.crm_prepare_client() from public,anon,authenticated;
create trigger crm_prepare_client after insert or update of kind on public.crm_accounts for each row execute function public.crm_prepare_client();

create function public.convert_crm_lead(p_id uuid,p_revision bigint,p_contract jsonb) returns public.crm_accounts language plpgsql security invoker set search_path='' as $$
declare acc public.crm_accounts;
begin
  if p_revision is null or p_revision<0 then raise exception 'CRM_INVALID_REVISION' using errcode='22023'; end if;
  select * into acc from public.crm_accounts where id=p_id for update;
  if not found then raise exception 'CRM_NOT_FOUND' using errcode='P0002'; end if;
  if acc.kind='client' then return acc; end if;
  if acc.archived then raise exception 'CRM_ARCHIVED' using errcode='22023'; end if;
  if acc.revision<>p_revision then raise sqlstate 'PT409' using message='CRM_CONFLICT'; end if;
  update public.crm_accounts set kind='client',stage='onboarding',converted_at=now(),lost_reason='' where id=p_id returning * into acc;
  insert into public.crm_contracts(account_id,title,reference,starts_on,ends_on,annual_fee_cents,setup_fee_cents,status,scope,document_url)
    values(p_id,p_contract->>'title',coalesce(p_contract->>'reference',''),(p_contract->>'starts_on')::date,(p_contract->>'ends_on')::date,(p_contract->>'annual_fee_cents')::bigint,(p_contract->>'setup_fee_cents')::bigint,'signed',coalesce(p_contract->>'scope',''),coalesce(p_contract->>'document_url',''));
  return acc;
end $$;
revoke all on function public.convert_crm_lead(uuid,bigint,jsonb) from public,anon;
grant execute on function public.convert_crm_lead(uuid,bigint,jsonb) to authenticated;

-- The contract row serializes payment creation, voiding and amount changes.
create function public.crm_payment_guard() returns trigger language plpgsql security invoker set search_path='' as $$
declare agreement public.crm_contracts; received bigint;
begin
  select * into agreement from public.crm_contracts where id=new.contract_id for update;
  if not found or agreement.account_id<>new.account_id or agreement.status<>'signed' then raise exception 'CRM_PAYMENT_CONTRACT' using errcode='22023'; end if;
  if tg_op='UPDATE' and (new.contract_id<>old.contract_id or new.amount_cents<>old.amount_cents or new.paid_on<>old.paid_on or new.method<>old.method or new.reference<>old.reference or new.notes<>old.notes or old.voided or not new.voided) then raise exception 'CRM_PAYMENT_IMMUTABLE' using errcode='22023'; end if;
  select coalesce(sum(amount_cents),0) into received from public.crm_payments where contract_id=new.contract_id and not voided and id<>new.id;
  if not new.voided and received+new.amount_cents>agreement.annual_fee_cents+agreement.setup_fee_cents then raise sqlstate 'PT409' using message='CRM_OVERPAYMENT'; end if;
  return new;
end $$;
revoke all on function public.crm_payment_guard() from public,anon,authenticated;
create trigger crm_payment_guard before insert or update on public.crm_payments for each row execute function public.crm_payment_guard();

create function public.crm_contract_guard() returns trigger language plpgsql security invoker set search_path='' as $$
declare received bigint;
begin
  if tg_op='DELETE' then
    if old.status<>'draft' then raise exception 'CRM_CONTRACT_KEEP_HISTORY' using errcode='22023'; end if;
    return old;
  end if;
  perform 1 from public.crm_accounts where id=new.account_id for update;
  select coalesce(sum(amount_cents),0) into received from public.crm_payments where contract_id=new.id and not voided;
  if received>new.annual_fee_cents+new.setup_fee_cents or (received>0 and new.status<>'signed') then raise exception 'CRM_CONTRACT_HAS_PAYMENTS' using errcode='22023'; end if;
  if new.status='signed' and exists(select 1 from public.crm_contracts where account_id=new.account_id and id<>new.id and status='signed' and daterange(starts_on,ends_on,'[]') && daterange(new.starts_on,new.ends_on,'[]')) then raise exception 'CRM_CONTRACT_OVERLAP' using errcode='22023'; end if;
  return new;
end $$;
revoke all on function public.crm_contract_guard() from public,anon,authenticated;
create trigger crm_contract_guard before insert or update or delete on public.crm_contracts for each row execute function public.crm_contract_guard();

commit;
