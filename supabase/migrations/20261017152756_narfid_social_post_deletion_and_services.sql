begin;

alter table public.social_post_publications add column deleted boolean not null default false;
grant update (deleted) on public.social_post_publications to authenticated;

create or replace function public.stamp_social_publication()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.platform is distinct from old.platform or new.post_id is distinct from old.post_id then
    raise exception 'Immutable publication identity' using errcode = '22023';
  end if;
  if new.published is not distinct from old.published and new.deleted is not distinct from old.deleted then return old; end if;
  if old.deleted and new.published is distinct from old.published then
    raise exception 'Restore the post before changing publication' using errcode = '22023';
  end if;
  new.revision := old.revision + 1;
  new.updated_at := now();
  new.updated_by := auth.uid();
  new.published_at := case when new.published is distinct from old.published then
    case when new.published then now() else null end else old.published_at end;
  return new;
end;
$$;

create function public.set_social_deleted(p_platform text, p_post_id text, p_deleted boolean, p_revision bigint)
returns public.social_post_publications language plpgsql security invoker set search_path = '' as $$
declare current_row public.social_post_publications;
begin
  if auth.uid() is null or not exists(select 1 from public.board_members where user_id = auth.uid() and active) then
    raise exception 'SOCIAL_FORBIDDEN' using errcode = '42501';
  end if;
  if p_deleted is null or p_revision is null or p_revision < 0 then
    raise exception 'SOCIAL_INVALID' using errcode = '22023';
  end if;
  select * into current_row from public.social_post_publications
    where platform = p_platform and post_id = p_post_id for update;
  if not found then raise exception 'SOCIAL_NOT_FOUND' using errcode = 'P0002'; end if;
  if current_row.revision <> p_revision then raise sqlstate 'PT409' using message = 'SOCIAL_CONFLICT'; end if;
  if current_row.deleted = p_deleted then return current_row; end if;
  update public.social_post_publications set deleted = p_deleted
    where platform = p_platform and post_id = p_post_id returning * into current_row;
  return current_row;
end;
$$;
revoke all on function public.set_social_deleted(text,text,boolean,bigint) from public, anon;
grant execute on function public.set_social_deleted(text,text,boolean,bigint) to authenticated;

insert into public.social_post_publications(platform,post_id)
  select platform,post_number::text from unnest(array['snapchat','instagram','x','facebook']) as platforms(platform)
  cross join generate_series(51,58) as posts(post_number)
  on conflict(platform,post_id) do nothing;

commit;
