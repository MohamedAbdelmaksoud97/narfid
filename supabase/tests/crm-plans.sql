begin;
do $$ begin perform set_config('request.jwt.claims',jsonb_build_object('sub',(select user_id from public.board_members where active limit 1),'role','authenticated')::text,true); end $$;
set local role authenticated;
do $$
declare p public.crm_plans; a public.crm_accounts; c public.crm_contracts; n int;
begin
  insert into public.crm_plans(name,annual_fee_cents,features) values('CRM-PLAN-QA-SQL',720000,array['الاشتراكات','الحجوزات']) returning * into p;
  insert into public.crm_accounts(kind,name,stage,plan_id) values('lead','CRM-QA-PLAN-SQL','new',p.id) returning * into a;
  select * into a from public.convert_crm_lead(a.id,a.revision,jsonb_build_object('plan_id',p.id,'title','عقد باقة','starts_on','2026-10-18','ends_on','2027-10-17','annual_fee_cents',700000,'setup_fee_cents',10000));
  select * into c from public.crm_contracts where account_id=a.id;
  if a.plan_id<>p.id or c.plan_id<>p.id or c.plan_name<>p.name or c.plan_features<>p.features then raise exception 'Plan link or contract snapshot missing'; end if;
  update public.crm_plans set name='CRM-PLAN-QA-RENAMED',annual_fee_cents=900000,features=array['ميزة جديدة'] where id=p.id;
  select * into c from public.crm_contracts where id=c.id;
  if c.plan_name<>p.name or c.plan_features<>p.features or c.annual_fee_cents<>700000 then raise exception 'Catalog changed existing contract'; end if;
  update public.crm_contracts set scope='نطاق متفق عليه' where id=c.id;
  select * into c from public.crm_contracts where id=c.id;
  if c.plan_features<>p.features then raise exception 'Ordinary contract edit changed snapshot'; end if;
  update public.crm_plans set description='قديم' where id=p.id and revision=p.revision; get diagnostics n=row_count;
  if n<>0 then raise exception 'Stale plan update allowed'; end if;
  begin delete from public.crm_plans where id=p.id; raise exception 'Linked plan deleted'; exception when foreign_key_violation then null; end;
  update public.crm_plans set active=false where id=p.id;
  update public.crm_accounts set city='الرياض' where id=a.id;
  begin insert into public.crm_accounts(kind,name,stage,plan_id) values('lead','CRM-QA-INACTIVE-PLAN','new',p.id); raise exception 'Unavailable plan assigned'; exception when sqlstate '22023' then null; end;
  insert into public.crm_accounts(kind,name,stage,plan_id) values('client','CRM-QA-CLIENT-PLAN','onboarding',null) returning * into a;
  begin insert into public.crm_contracts(account_id,plan_id,title,starts_on,ends_on) values(a.id,p.id,'غير متاحة','2027-10-18','2028-10-17'); raise exception 'Unavailable plan in new contract'; exception when sqlstate '22023' then null; end;
  insert into public.crm_plans(name,pricing_type,features) values('CRM-PLAN-QA-CUSTOM','custom',array['تخصيص متفق عليه']) returning * into p;
  if p.annual_fee_cents is not null then raise exception 'Custom quote has invented price'; end if;
  delete from public.crm_plans where id=p.id;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000000","role":"authenticated"}',true); end $$;
set local role authenticated;
do $$ declare n int; begin
  if (select count(*) from public.crm_plans)<>0 then raise exception 'Nonboard catalog exposed'; end if;
  begin insert into public.crm_plans(name,annual_fee_cents) values('CRM-PLAN-QA-NONBOARD',100); raise exception 'Nonboard insert allowed'; exception when insufficient_privilege then null; end;
  update public.crm_plans set active=false; get diagnostics n=row_count; if n<>0 then raise exception 'Nonboard update allowed'; end if;
  delete from public.crm_plans; get diagnostics n=row_count; if n<>0 then raise exception 'Nonboard delete allowed'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin perform count(*) from public.crm_plans; raise exception 'Public catalog exposed'; exception when insufficient_privilege then null; end;
  begin insert into public.crm_plans(name,annual_fee_cents) values('CRM-PLAN-QA-ANON',100); raise exception 'Anon insert allowed'; exception when insufficient_privilege then null; end;
  begin update public.crm_plans set active=false; raise exception 'Anon update allowed'; exception when insufficient_privilege then null; end;
  begin delete from public.crm_plans; raise exception 'Anon delete allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
