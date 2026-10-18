begin;
do $$ begin perform set_config('request.jwt.claims',jsonb_build_object('sub',(select user_id from public.board_members where active limit 1),'role','authenticated')::text,true); end $$;
set local role authenticated;
do $$
declare e public.finance_entries; a public.crm_accounts; lead public.crm_accounts; d date:=(now() at time zone 'Asia/Riyadh')::date;
begin
  insert into public.crm_accounts(kind,name,stage) values('client','FINANCE-QA-SQL','onboarding') returning * into a;
  insert into public.finance_entries(kind,title,category,amount_cents,account_id,due_on)
    values('expense','مصروف منتظر','hosting',12345,a.id,d+10) returning * into e;
  if e.paid_on is not null or e.revision<>0 or e.created_by is distinct from auth.uid() then raise exception 'Bad initial finance stamps'; end if;
  update public.finance_entries set amount_cents=15001 where id=e.id returning * into e;
  if e.revision<>1 then raise exception 'Missing revision'; end if;
  update public.finance_entries set paid_on=d,reference='QA-PAID' where id=e.id returning * into e;
  begin update public.finance_entries set amount_cents=20000 where id=e.id; raise exception 'Paid amount changed'; exception when sqlstate '22023' then null; end;
  begin update public.finance_entries set paid_on=null where id=e.id; raise exception 'Paid entry reopened'; exception when sqlstate '22023' then null; end;
  begin update public.finance_entries set voided=true,void_reason='' where id=e.id; raise exception 'Void without reason'; exception when sqlstate '22023' then null; end;
  begin delete from public.finance_entries where id=e.id; raise exception 'Finance history deleted'; exception when insufficient_privilege then null; end;
  update public.finance_entries set voided=true,void_reason='تصحيح تسجيل تجريبي' where id=e.id returning * into e;
  if e.voided_at is null or e.updated_by is distinct from auth.uid() then raise exception 'Missing cancellation actor/time'; end if;
  begin update public.finance_entries set voided=false,void_reason='',voided_at=null where id=e.id; raise exception 'Void entry restored'; exception when sqlstate '22023' then null; end;
  begin insert into public.finance_entries(kind,title,category,amount_cents,due_on,paid_on) values('income','قبض مستقبلي','mobile',100,d,d+1); raise exception 'Future cash accepted'; exception when sqlstate '22023' then null; end;
  begin insert into public.finance_entries(kind,title,category,amount_cents,due_on) values('expense','تصنيف غير صالح','mobile',100,d); raise exception 'Invalid category accepted'; exception when check_violation then null; end;
  begin insert into public.finance_entries(kind,title,category,amount_cents,due_on) values('income','قبض بلا تاريخ','mobile',100,d); raise exception 'Income without cash accepted'; exception when check_violation then null; end;
  insert into public.crm_accounts(kind,name,stage) values('lead','FINANCE-QA-CONVERT','new') returning * into lead;
  perform public.convert_crm_lead(lead.id,lead.revision,jsonb_build_object('title','عقد بموعد سداد','starts_on',d,'ends_on',d+364,'payment_due_on',d+10,'annual_fee_cents',10000,'setup_fee_cents',0));
  if not exists(select 1 from public.crm_contracts where account_id=lead.id and payment_due_on=d+10) then raise exception 'Conversion lost payment deadline'; end if;
  begin insert into public.crm_payments(account_id,contract_id,amount_cents,paid_on,method)
    select lead.id,id,100,d+1,'bank' from public.crm_contracts where account_id=lead.id;
    raise exception 'Future contract receipt accepted'; exception when sqlstate '22023' then null; end;
end $$;
reset role;
-- An authenticated identity outside the board cannot read or write finance.
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000099","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.finance_entries) then raise exception 'Finance visible to outsider'; end if;
  begin insert into public.finance_entries(kind,title,category,amount_cents,due_on) values('expense','محاولة خارجية','hosting',100,current_date); raise exception 'Outsider inserted finance'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin perform 1 from public.finance_entries; raise exception 'Anonymous finance access'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
