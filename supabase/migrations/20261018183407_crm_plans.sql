begin;
create table public.crm_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(btrim(name)) between 2 and 150),
  description text not null default '' check(char_length(description)<=2000),
  pricing_type text not null default 'fixed' check(pricing_type in ('fixed','custom')),
  annual_fee_cents bigint check(annual_fee_cents between 0 and 100000000000),
  setup_fee_cents bigint not null default 0 check(setup_fee_cents between 0 and 100000000000),
  features text[] not null default '{}', active boolean not null default true,
  sort_order integer not null default 1 check(sort_order between 1 and 10000),
  revision bigint not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid,
  check((pricing_type='fixed' and annual_fee_cents is not null) or (pricing_type='custom' and annual_fee_cents is null)),
  check(coalesce(array_ndims(features),1)=1 and cardinality(features)<=50 and array_position(features,null) is null and array_position(features,'') is null and char_length(array_to_string(features,E'\n'))<=10000)
);
create unique index crm_plans_name on public.crm_plans(lower(btrim(name)));
create index crm_plans_sort on public.crm_plans(sort_order,name);
alter table public.crm_plans enable row level security;
revoke all on public.crm_plans from public,anon,authenticated;
grant select,insert,update,delete on public.crm_plans to authenticated;
create policy plans_board_select on public.crm_plans for select to authenticated using ((select crm_internal.is_active_board_member()));
create policy plans_board_insert on public.crm_plans for insert to authenticated with check ((select crm_internal.is_active_board_member()));
create policy plans_board_update on public.crm_plans for update to authenticated using ((select crm_internal.is_active_board_member())) with check ((select crm_internal.is_active_board_member()));
create policy plans_board_delete on public.crm_plans for delete to authenticated using ((select crm_internal.is_active_board_member()));

create function public.crm_plan_stamp() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='UPDATE' then
    if new.id<>old.id or new.created_at<>old.created_at then raise exception 'CRM_IMMUTABLE' using errcode='22023'; end if;
    new.revision:=old.revision+1; new.created_at:=old.created_at;
  else new.revision:=0; new.created_at:=now(); end if;
  new.updated_at:=now(); new.updated_by:=auth.uid(); return new;
end $$;
revoke all on function public.crm_plan_stamp() from public,anon,authenticated;
create trigger crm_plan_stamp before insert or update on public.crm_plans for each row execute function public.crm_plan_stamp();

alter table public.crm_accounts add column plan_id uuid references public.crm_plans(id) on delete restrict;
alter table public.crm_contracts add column plan_id uuid references public.crm_plans(id) on delete restrict;
alter table public.crm_contracts add column plan_name text not null default '';
alter table public.crm_contracts add column plan_features text[] not null default '{}';
create index crm_accounts_plan on public.crm_accounts(plan_id);
create index crm_contracts_plan on public.crm_contracts(plan_id);

create function public.crm_plan_link() returns trigger language plpgsql security invoker set search_path='' as $$
declare selected public.crm_plans; changed boolean;
begin
  changed:=tg_op='INSERT' or new.plan_id is distinct from old.plan_id;
  if changed and new.plan_id is not null then
    select * into selected from public.crm_plans where id=new.plan_id for share;
    if not found or not selected.active then raise exception 'CRM_PLAN_UNAVAILABLE' using errcode='22023'; end if;
  end if;
  if tg_table_name='crm_contracts' then
    if changed then new.plan_name:=coalesce(selected.name,''); new.plan_features:=coalesce(selected.features,'{}'::text[]);
    else new.plan_name:=old.plan_name; new.plan_features:=old.plan_features; end if;
  end if;
  return new;
end $$;
revoke all on function public.crm_plan_link() from public,anon,authenticated;
create trigger crm_plan_link before insert or update on public.crm_accounts for each row execute function public.crm_plan_link();
create trigger crm_plan_link before insert or update on public.crm_contracts for each row execute function public.crm_plan_link();

create or replace function public.convert_crm_lead(p_id uuid,p_revision bigint,p_contract jsonb) returns public.crm_accounts language plpgsql security invoker set search_path='' as $$
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
  insert into public.crm_contracts(account_id,title,reference,starts_on,ends_on,annual_fee_cents,setup_fee_cents,status,scope,document_url,plan_id)
    values(p_id,p_contract->>'title',coalesce(p_contract->>'reference',''),(p_contract->>'starts_on')::date,(p_contract->>'ends_on')::date,(p_contract->>'annual_fee_cents')::bigint,(p_contract->>'setup_fee_cents')::bigint,'signed',coalesce(p_contract->>'scope',''),coalesce(p_contract->>'document_url',''),selected_id);
  return acc;
end $$;
revoke all on function public.convert_crm_lead(uuid,bigint,jsonb) from public,anon;
grant execute on function public.convert_crm_lead(uuid,bigint,jsonb) to authenticated;

-- Initial private catalog reflects the current offer; future edits stay in CRM.
insert into public.crm_plans(name,description,annual_fee_cents,features,sort_order) values
('أساس','بداية مرتّبة لناديك',360000,array['فرع واحد','إدارة الأعضاء والاشتراكات','التجديد والتجميد ومتابعة الحضور','سجلات التحصيل والفواتير','صلاحيات فريق العمل','التقارير الأساسية'],1),
('تشغيل','للنادي الذي يقدم أكثر',720000,array['فرع واحد','إدارة الأعضاء والاشتراكات','التجديد والتجميد ومتابعة الحضور','سجلات التحصيل والفواتير','صلاحيات فريق العمل','التقارير الأساسية','نقاط البيع وإدارة الورديات','المطبخ وقوائم الوجبات اليومية','اشتراكات الوجبات وصرفها','مخزون المنتجات والمرتجعات','تقارير المبيعات والتشغيل'],2),
('توسّع','منظومة تنمو مع طموحك',1200000,array['حتى ٣ فروع','إدارة الأعضاء والاشتراكات','التجديد والتجميد ومتابعة الحضور','سجلات التحصيل والفواتير','صلاحيات فريق العمل','التقارير الأساسية','نقاط البيع وإدارة الورديات','المطبخ وقوائم الوجبات اليومية','اشتراكات الوجبات وصرفها','مخزون المنتجات والمرتجعات','تقارير المبيعات والتشغيل','حجوزات الملاعب والحصص','مواعيد التدريب الشخصي','إدارة مركزية للفروع','صلاحيات وتشغيل حسب الفرع','تقارير مجمّعة لمتابعة الأداء'],3);
insert into public.crm_plans(name,description,pricing_type,features,sort_order) values
('الشراكة التقنية','عرض مخصص حسب نطاق المنصة والتطوير والتكامل المتفق عليه.','custom',array['اشتراك المنصة بالنطاق المتفق عليه','دراسة تطبيق خاص للأعضاء','دراسة تكامل بوابات الدخول المتوافقة','ربط أنظمة خارجية أو تطوير مخصص','تحديد التنفيذ والأجهزة والصيانة في عرض مستقل'],4);
commit;
