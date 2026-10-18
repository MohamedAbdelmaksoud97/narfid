begin;
do $$ begin perform set_config('request.jwt.claims',jsonb_build_object('sub',(select user_id from public.board_members where active limit 1),'role','authenticated')::text,true); end $$;
set local role authenticated;
do $$
declare a public.crm_accounts; p public.crm_plans; agreement public.crm_contracts; contact_id uuid; draft_id uuid;
begin
  insert into public.crm_accounts(kind,name,stage) values('client','CRM-QA-GUARDS','onboarding') returning * into a;
  insert into public.crm_contacts(account_id,name) values(a.id,'جهة اختبار الأرشيف') returning id into contact_id;
  insert into public.crm_contracts(account_id,title,starts_on,ends_on,status) values(a.id,'عقد موقّع','2026-10-18','2027-10-17','signed') returning * into agreement;
  begin update public.crm_contracts set status='draft' where id=agreement.id; raise exception 'Signed history made deletable'; exception when sqlstate '22023' then null; end;
  update public.crm_accounts set archived=true where id=a.id;
  begin delete from public.crm_contacts where id=contact_id; raise exception 'Archived child deleted'; exception when sqlstate '22023' then null; end;
  update public.crm_accounts set archived=false where id=a.id;
  delete from public.crm_contacts where id=contact_id;
  insert into public.crm_plans(name,annual_fee_cents,features) values('CRM-PLAN-QA-GUARDS',10000,array['ميزة تجريبية']) returning * into p;
  insert into public.crm_contracts(account_id,plan_id,title,starts_on,ends_on,status) values(a.id,p.id,'عرض تجديد','2027-10-18','2028-10-17','draft') returning id into draft_id;
  update public.crm_plans set active=false where id=p.id;
  begin update public.crm_contracts set status='signed' where id=draft_id; raise exception 'Disabled plan newly signed'; exception when sqlstate '22023' then null; end;
end $$;
reset role;
rollback;
