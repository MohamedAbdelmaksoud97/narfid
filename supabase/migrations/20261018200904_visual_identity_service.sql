begin;
create table public.identity_projects (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.crm_accounts(id) on delete restrict,
  title text not null check(char_length(btrim(title)) between 2 and 200),
  service_type text not null default 'refresh' check(service_type in ('refresh','new','digital')),
  status text not null default 'inquiry' check(status in ('inquiry','brief','proposal','design','review','delivery','completed','on_hold','cancelled')),
  owner_id uuid references public.board_members(user_id) on delete set null,
  designer text not null default '' check(char_length(designer)<=200),
  brief text not null default '' check(char_length(brief)<=10000),
  audience text not null default '' check(char_length(audience)<=3000),
  scope text not null default '' check(char_length(scope)<=10000),
  exclusions text not null default '' check(char_length(exclusions)<=5000),
  quote_status text not null default 'draft' check(quote_status in ('draft','sent','accepted','declined')),
  quote_fee_cents bigint check(quote_fee_cents between 1 and 100000000000),
  quote_reference text not null default '' check(char_length(quote_reference)<=1000),
  acceptance_note text not null default '' check(char_length(acceptance_note)<=2000),
  accepted_on date,
  revision_limit integer not null default 2 check(revision_limit between 0 and 100),
  due_on date,
  payment_due_on date check(payment_due_on between date '2000-01-01' and date '2100-12-31'),
  handover_url text not null default '' check(handover_url='' or handover_url ~ '^https://[^[:space:]]+$'),
  notes text not null default '' check(char_length(notes)<=10000),
  archived boolean not null default false,
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid,
  check(accepted_on is null or accepted_on between date '2000-01-01' and date '2100-12-31'),
  check(due_on is null or due_on between date '2000-01-01' and date '2100-12-31')
);
create index identity_projects_account on public.identity_projects(account_id);
create index identity_projects_owner on public.identity_projects(owner_id);
create index identity_projects_stage on public.identity_projects(status,archived);
create table public.identity_deliverables (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.identity_projects(id) on delete cascade,
  title text not null check(char_length(btrim(title)) between 2 and 200),
  status text not null default 'planned' check(status in ('planned','in_progress','review','approved')),
  due_on date check(due_on between date '2000-01-01' and date '2100-12-31'),
  asset_url text not null default '' check(asset_url='' or asset_url ~ '^https://[^[:space:]]+$'),
  approval_note text not null default '' check(char_length(approval_note)<=2000),
  approved_on date check(approved_on between date '2000-01-01' and date '2100-12-31'),
  revision_round integer not null default 0 check(revision_round between 0 and 100),
  notes text not null default '' check(char_length(notes)<=5000),
  revision bigint not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid
);
create index identity_deliverables_project on public.identity_deliverables(project_id);
create table public.identity_events (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.identity_projects(id) on delete cascade,
  title text not null, details text not null default '', actor_id uuid default auth.uid(), created_at timestamptz not null default now()
);
create index identity_events_project on public.identity_events(project_id);
do $$ declare tab text; begin
  foreach tab in array array['identity_projects','identity_deliverables','identity_events'] loop
    execute format('alter table public.%I enable row level security',tab);
    execute format('revoke all on public.%I from public,anon,authenticated',tab);
    execute format('grant select,insert,update on public.%I to authenticated',tab);
    execute format('create policy identity_board_access on public.%I for all to authenticated using(exists(select 1 from public.board_members where user_id=(select auth.uid()) and active)) with check(exists(select 1 from public.board_members where user_id=(select auth.uid()) and active))',tab);
  end loop;
end $$;
revoke update on public.identity_events from authenticated;
grant delete on public.identity_deliverables to authenticated;

alter table public.finance_entries add column identity_project_id uuid references public.identity_projects(id) on delete restrict;
create index finance_entries_identity on public.finance_entries(identity_project_id);
do $$ declare item record; begin
  for item in select conname from pg_constraint where conrelid='public.finance_entries'::regclass and contype='c' and pg_get_constraintdef(oid) like '%other_income%' loop
    execute format('alter table public.finance_entries drop constraint %I',item.conname);
  end loop;
end $$;
alter table public.finance_entries add constraint finance_entry_category check(
  (kind='income' and category in ('development','mobile','gates','consulting','visual_identity','other_income') and paid_on is not null)
  or (kind='expense' and category in ('hosting','software','marketing','people','operations','equipment','other_expense'))
);

create function public.identity_project_guard() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  perform 1 from public.crm_accounts where id=new.account_id and not archived for share;
  if not found then raise exception 'IDENTITY_ACCOUNT_UNAVAILABLE' using errcode='22023'; end if;
  if tg_op='UPDATE' then
    if new.id<>old.id or new.account_id<>old.account_id or new.created_at<>old.created_at then raise exception 'IDENTITY_IMMUTABLE' using errcode='22023'; end if;
    if old.archived and to_jsonb(new)-'archived' is distinct from to_jsonb(old)-'archived' then raise exception 'IDENTITY_ARCHIVED' using errcode='22023'; end if;
    if old.quote_status='accepted' and
      (new.quote_status<>'accepted' or new.quote_fee_cents is distinct from old.quote_fee_cents or new.scope<>old.scope or new.exclusions<>old.exclusions or new.service_type<>old.service_type or new.revision_limit<>old.revision_limit or new.accepted_on is distinct from old.accepted_on or new.acceptance_note<>old.acceptance_note or new.quote_reference<>old.quote_reference) then
      raise exception 'IDENTITY_QUOTE_LOCKED' using errcode='22023';
    end if;
    new.revision:=old.revision+1;
  else new.revision:=0; new.created_at:=now(); end if;
  if new.owner_id is not null and not exists(select 1 from public.board_members where user_id=new.owner_id and active) then raise exception 'CRM_OWNER_INACTIVE' using errcode='22023'; end if;
  if new.quote_status in ('sent','accepted') and (new.quote_fee_cents is null or char_length(btrim(new.scope))<2) then raise exception 'IDENTITY_QUOTE_INCOMPLETE' using errcode='22023'; end if;
  if new.quote_status='accepted' and (new.accepted_on is null or new.accepted_on>(now() at time zone 'Asia/Riyadh')::date or char_length(btrim(new.acceptance_note))<2) then raise exception 'IDENTITY_ACCEPTANCE_REQUIRED' using errcode='22023'; end if;
  if new.status in ('design','review','delivery','completed') and new.quote_status<>'accepted' then raise exception 'IDENTITY_ACCEPTANCE_REQUIRED' using errcode='22023'; end if;
  if new.status='completed' and (new.handover_url='' or not exists(select 1 from public.identity_deliverables where project_id=new.id) or exists(select 1 from public.identity_deliverables where project_id=new.id and status<>'approved')) then raise exception 'IDENTITY_DELIVERY_INCOMPLETE' using errcode='22023'; end if;
  new.updated_at:=now(); new.updated_by:=auth.uid(); return new;
end $$;
revoke all on function public.identity_project_guard() from public,anon,authenticated;
create trigger identity_project_guard before insert or update on public.identity_projects for each row execute function public.identity_project_guard();

create function public.identity_deliverable_guard() returns trigger language plpgsql security invoker set search_path='' as $$
declare p public.identity_projects;
begin
  select * into p from public.identity_projects where id=coalesce(new.project_id,old.project_id) for update;
  if not found and tg_op='DELETE' then return old; end if;
  if not found or p.archived or p.status in ('completed','cancelled') then raise exception 'IDENTITY_PROJECT_CLOSED' using errcode='22023'; end if;
  if tg_op='DELETE' then
    if old.status='approved' then raise exception 'IDENTITY_APPROVAL_LOCKED' using errcode='22023'; end if;
    return old;
  end if;
  if tg_op='UPDATE' then
    if new.id<>old.id or new.project_id<>old.project_id or new.created_at<>old.created_at or old.status='approved' then raise exception 'IDENTITY_APPROVAL_LOCKED' using errcode='22023'; end if;
    new.revision:=old.revision+1;
  else new.revision:=0; new.created_at:=now(); end if;
  if new.status<>'planned' and p.quote_status<>'accepted' then raise exception 'IDENTITY_ACCEPTANCE_REQUIRED' using errcode='22023'; end if;
  if new.revision_round>p.revision_limit then raise exception 'IDENTITY_REVISION_LIMIT' using errcode='22023'; end if;
  if new.status='approved' and (new.asset_url='' or new.approved_on is null or new.approved_on>(now() at time zone 'Asia/Riyadh')::date or char_length(btrim(new.approval_note))<2) then raise exception 'IDENTITY_APPROVAL_REQUIRED' using errcode='22023'; end if;
  new.updated_at:=now(); new.updated_by:=auth.uid(); return new;
end $$;
revoke all on function public.identity_deliverable_guard() from public,anon,authenticated;
create trigger identity_deliverable_guard before insert or update or delete on public.identity_deliverables for each row execute function public.identity_deliverable_guard();

create function public.identity_history() returns trigger language plpgsql security invoker set search_path='' as $$
declare pid uuid;
begin
  if tg_table_name='identity_projects' then pid:=new.id; else pid:=coalesce(new.project_id,old.project_id); end if;
  if not exists(select 1 from public.identity_projects where id=pid) then return coalesce(new,old); end if;
  insert into public.identity_events(project_id,title,details) values(pid,
    case tg_op when 'INSERT' then 'إضافة ' when 'DELETE' then 'حذف ' else 'تحديث ' end||case tg_table_name when 'identity_projects' then 'المشروع' else 'تسليم' end,
    coalesce(new.title,old.title,'')||case when tg_op='DELETE' then '' else ' · '||coalesce(to_jsonb(new)->>'status','') end);
  return coalesce(new,old);
end $$;
revoke all on function public.identity_history() from public,anon,authenticated;
create trigger identity_history after insert or update on public.identity_projects for each row execute function public.identity_history();
create trigger identity_history after insert or update or delete on public.identity_deliverables for each row execute function public.identity_history();

create function public.identity_prepare() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  insert into public.identity_deliverables(project_id,title)
  select new.id,item from unnest(case new.service_type
    when 'digital' then array['مراجعة أصول الهوية الحالية','تطبيقات الموقع والتطبيق المتفق عليها','قوالب التواصل وبطاقة العضوية','حزمة الأصول وإرشادات الاستخدام']
    when 'new' then array['الاتجاه البصري للمؤسسة','الشعار والنسخ المعتمدة','الألوان والخطوط والنظام البصري','دليل الهوية والملفات الأصلية']
    else array['مراجعة الهوية وأولويات التطوير','تطوير الشعار واستخداماته','الألوان والخطوط والعناصر البصرية','دليل الاستخدام والتطبيقات المتفق عليها'] end) item;
  return new;
end $$;
revoke all on function public.identity_prepare() from public,anon,authenticated;
create trigger identity_prepare after insert on public.identity_projects for each row execute function public.identity_prepare();

create function public.identity_finance_history() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if new.identity_project_id is not null then
    insert into public.identity_events(project_id,title,details) values(new.identity_project_id,
      case when new.voided then 'إلغاء تسجيل حركة مالية' when new.kind='income' then 'تسجيل تحصيل للمشروع' else 'تسجيل أو تحديث تكلفة المشروع' end,
      new.title||' · '||new.amount_cents::text||' هللة');
  end if;
  return new;
end $$;
revoke all on function public.identity_finance_history() from public,anon,authenticated;
create trigger identity_finance_history after insert or update on public.finance_entries for each row execute function public.identity_finance_history();

create function public.identity_finance_guard() returns trigger language plpgsql security invoker set search_path='' as $$
declare p public.identity_projects; received bigint;
begin
  if new.identity_project_id is null then return new; end if;
  select * into p from public.identity_projects where id=new.identity_project_id for update;
  if not found or new.account_id is distinct from p.account_id then raise exception 'IDENTITY_FINANCE_ACCOUNT' using errcode='22023'; end if;
  if new.kind='income' and not new.voided then
    if p.archived or p.status='cancelled' or p.quote_status<>'accepted' or new.category<>'visual_identity' then raise exception 'IDENTITY_FINANCE_QUOTE' using errcode='22023'; end if;
    select coalesce(sum(amount_cents),0) into received from public.finance_entries where identity_project_id=p.id and kind='income' and not voided and id<>new.id;
    if received+new.amount_cents>p.quote_fee_cents then raise exception 'IDENTITY_OVERPAYMENT' using errcode='22023'; end if;
  end if;
  return new;
end $$;
revoke all on function public.identity_finance_guard() from public,anon,authenticated;
create trigger identity_finance_guard before insert or update on public.finance_entries for each row execute function public.identity_finance_guard();
commit;
