begin;

-- A non-exposed helper checks the caller without recursing through this table's RLS.
-- No member IDs or profile data are returned by the privileged function.
create schema crm_internal;
revoke all on schema crm_internal from public, anon, authenticated;
grant usage on schema crm_internal to authenticated;

create function crm_internal.is_active_board_member()
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.board_members
    where user_id = (select auth.uid()) and active
  );
$$;
revoke all on function crm_internal.is_active_board_member() from public, anon, authenticated;
grant execute on function crm_internal.is_active_board_member() to authenticated;

-- Existing self-membership checks still work, including after deactivation.
-- Only a live board member can also see the active team directory.
alter policy board_members_self on public.board_members
using (
  user_id = (select auth.uid())
  or (active and (select crm_internal.is_active_board_member()))
);

commit;
