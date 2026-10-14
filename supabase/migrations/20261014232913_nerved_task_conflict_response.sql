begin;
-- Revision conflicts are application conflicts, not retryable database outages.
-- Translate the internal transaction error before PostgREST / SDK retry handling.
create or replace function public.mutate_board_task(action text, payload jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
begin
  return private.mutate_board_task(action, payload);
exception when serialization_failure then
  raise exception 'TASK_CONFLICT' using errcode = 'PT409';
end;
$$;
revoke all on function public.mutate_board_task(text, jsonb) from public, anon;
grant execute on function public.mutate_board_task(text, jsonb) to authenticated;
commit;
