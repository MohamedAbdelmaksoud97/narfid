-- Isolated test transaction: no CRM data survives this verification.
begin;
set local role anon;
do $$ begin
  begin perform count(*) from public.crm_accounts; raise exception 'Anon read allowed'; exception when insufficient_privilege then null; end;
  begin perform public.convert_crm_lead(gen_random_uuid(),0,'{}'); raise exception 'Anon conversion allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claims',jsonb_build_object('sub',(select user_id from public.board_members where active limit 1),'role','authenticated')::text,true); end $$;
set local role authenticated;
do $$
declare a public.crm_accounts; c public.crm_contracts; p public.crm_payments; n integer;
begin
  insert into public.crm_accounts(kind,name,stage) values('lead','CRM-QA-SQL','new') returning * into a;
  insert into public.crm_contacts(account_id,name) values(a.id,'جهة اختبار');
  insert into public.crm_activities(account_id,title,occurred_on) values(a.id,'مكالمة اختبار',current_date);
  select * into a from public.convert_crm_lead(a.id,a.revision,jsonb_build_object('title','عقد سنوي تجريبي','starts_on','2026-10-18','ends_on','2027-10-17','annual_fee_cents',360000,'setup_fee_cents',120000));
  if a.kind<>'client' or a.stage<>'onboarding' then raise exception 'Conversion failed'; end if;
  if (select count(*) from public.crm_followups where account_id=a.id and category='onboarding')<>7 then raise exception 'Checklist missing'; end if;
  if (select count(*) from public.crm_workspaces where account_id=a.id)<>1 then raise exception 'Workspace missing'; end if;
  if (select count(*) from public.crm_contacts where account_id=a.id)<>1 then raise exception 'Contact lost'; end if;
  perform public.convert_crm_lead(a.id,0,'{}');
  if (select count(*) from public.crm_contracts where account_id=a.id)<>1 then raise exception 'Duplicate conversion'; end if;
  update public.crm_accounts set city='الرياض' where id=a.id and revision=0; get diagnostics n=row_count;
  if n<>0 then raise exception 'Stale update allowed'; end if;
  select * into c from public.crm_contracts where account_id=a.id;
  begin insert into public.crm_contracts(account_id,title,starts_on,ends_on,status) values(a.id,'متداخل','2027-01-01','2027-12-31','signed'); raise exception 'Overlapping contract allowed'; exception when sqlstate '22023' then null; end;
  insert into public.crm_payments(account_id,contract_id,amount_cents,paid_on,method) values(a.id,c.id,180000,current_date,'bank') returning * into p;
  begin insert into public.crm_payments(account_id,contract_id,amount_cents,paid_on,method) values(a.id,c.id,300001,current_date,'bank'); raise exception 'Overpayment allowed'; exception when sqlstate 'PT409' then null; end;
  begin update public.crm_contracts set annual_fee_cents=0,setup_fee_cents=0 where id=c.id; raise exception 'Paid balance overwritten'; exception when sqlstate '22023' then null; end;
  begin update public.crm_payments set amount_cents=1 where id=p.id; raise exception 'Payment changed'; exception when sqlstate '22023' then null; end;
  update public.crm_payments set voided=true,void_reason='خطأ في التسجيل التجريبي' where id=p.id;
  begin update public.crm_payments set voided=false where id=p.id; raise exception 'Payment unvoid allowed'; exception when sqlstate '22023' then null; end;
  begin update public.crm_accounts set kind='lead',stage='new' where id=a.id; raise exception 'Reverse conversion allowed'; exception when sqlstate '22023' then null; end;
  update public.crm_accounts set archived=true where id=a.id;
  begin insert into public.crm_contacts(account_id,name) values(a.id,'جهة أخرى'); raise exception 'Archived write allowed'; exception when sqlstate '22023' then null; end;
  if not exists(select 1 from public.crm_events where account_id=a.id and actor_id=auth.uid()) then raise exception 'History missing'; end if;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000000","role":"authenticated"}',true); end $$;
set local role authenticated;
do $$ begin
  if (select count(*) from public.crm_accounts)<>0 then raise exception 'Nonboard read allowed'; end if;
  begin insert into public.crm_accounts(kind,name,stage) values('lead','CRM-QA-UNAUTHORIZED','new'); raise exception 'Nonboard insert allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
