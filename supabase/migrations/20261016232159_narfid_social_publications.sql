begin;

-- Stable identity is platform + post number, independent of category and copy.
create table public.social_post_publications (
  platform text not null check (platform in ('snapchat', 'instagram', 'x', 'facebook')),
  post_id text not null check (post_id ~ '^[0-9]{2,4}$'),
  published boolean not null default false,
  published_at timestamptz,
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  -- Audit identifier deliberately survives removal of an Auth account.
  updated_by uuid,
  primary key (platform, post_id),
  check (published = (published_at is not null))
);
alter table public.social_post_publications enable row level security;
revoke all on public.social_post_publications from public, anon, authenticated;
grant select on public.social_post_publications to authenticated;
grant update (published) on public.social_post_publications to authenticated;

create policy social_publications_read on public.social_post_publications
  for select to authenticated using (
    exists(select 1 from public.board_members where user_id = (select auth.uid()) and active)
  );
create policy social_publications_update on public.social_post_publications
  for update to authenticated using (
    exists(select 1 from public.board_members where user_id = (select auth.uid()) and active)
  ) with check (
    exists(select 1 from public.board_members where user_id = (select auth.uid()) and active)
  );

create function public.stamp_social_publication()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.platform is distinct from old.platform or new.post_id is distinct from old.post_id then
    raise exception 'Immutable publication identity' using errcode = '22023';
  end if;
  if new.published is not distinct from old.published then return old; end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  new.updated_by := auth.uid();
  new.published_at := case when new.published then now() else null end;
  return new;
end;
$$;
revoke all on function public.stamp_social_publication() from public, anon, authenticated;
create trigger stamp_social_publication before update on public.social_post_publications
  for each row execute function public.stamp_social_publication();

-- Security invoker preserves table RLS. The lock + revision check stops an old
-- board tab from silently reversing a newer decision made by another member.
create function public.set_social_publication(
  p_platform text, p_post_id text, p_published boolean, p_revision bigint
) returns public.social_post_publications
language plpgsql security invoker set search_path = '' as $$
declare current_row public.social_post_publications;
begin
  if auth.uid() is null or not exists (
    select 1 from public.board_members where user_id = auth.uid() and active
  ) then raise exception 'SOCIAL_FORBIDDEN' using errcode = '42501'; end if;
  if p_published is null or p_revision is null or p_revision < 0 then
    raise exception 'SOCIAL_INVALID' using errcode = '22023';
  end if;
  select * into current_row from public.social_post_publications
    where platform = p_platform and post_id = p_post_id for update;
  if not found then raise exception 'SOCIAL_NOT_FOUND' using errcode = 'P0002'; end if;
  if current_row.revision <> p_revision then
    raise sqlstate 'PT409' using message = 'SOCIAL_CONFLICT';
  end if;
  if current_row.published = p_published then return current_row; end if;
  update public.social_post_publications set published = p_published
    where platform = p_platform and post_id = p_post_id returning * into current_row;
  return current_row;
end;
$$;
revoke all on function public.set_social_publication(text, text, boolean, bigint) from public, anon;
grant execute on function public.set_social_publication(text, text, boolean, bigint) to authenticated;

-- New content is added by migrations; requests cannot invent catalogue records.
insert into public.social_post_publications(platform, post_id)
  select platform, lpad(post_number::text, 2, '0')
  from unnest(array['snapchat','instagram','x','facebook']) as platforms(platform)
  cross join generate_series(1, 50) as posts(post_number);

commit;
