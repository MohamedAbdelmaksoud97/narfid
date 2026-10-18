begin;
-- A received payment is actual cash, not a future installment commitment.
-- Older future-dated rows can still be voided for correction.
create function public.crm_payment_date_guard() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.paid_on>(now() at time zone 'Asia/Riyadh')::date then
    if tg_op='INSERT' or new.paid_on is distinct from old.paid_on then
      raise exception 'CRM_PAYMENT_FUTURE' using errcode='22023';
    end if;
  end if;
  return new;
end $$;
revoke all on function public.crm_payment_date_guard() from public,anon,authenticated;
create trigger crm_payment_date_guard before insert or update on public.crm_payments
  for each row execute function public.crm_payment_date_guard();
commit;
