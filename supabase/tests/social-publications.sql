-- Run against the connected project with scripts/article-db.mjs. All changes
-- roll back; real board identities are resolved inside SQL and never printed.
begin;
set local role anon;
do $$ begin
  begin perform count(*) from public.social_post_publications; raise exception 'Anon read allowed';
  exception when insufficient_privilege then null; end;
  begin perform public.set_social_publication('snapchat','31',true,0); raise exception 'Anon RPC allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  perform set_config('request.jwt.claims', jsonb_build_object('sub',
    (select user_id from public.board_members where active limit 1), 'role','authenticated')::text, true);
end $$;
set local role authenticated;
do $$ declare r public.social_post_publications; changed public.social_post_publications; begin
  if (select count(*) from public.social_post_publications) <> 200 then raise exception 'Catalogue read incomplete'; end if;
  select * into r from public.social_post_publications where platform='snapchat' and post_id='31';
  select * into changed from public.set_social_publication(r.platform,r.post_id,not r.published,r.revision);
  if changed.published = r.published or changed.revision <> r.revision+1
    or changed.updated_by <> auth.uid() then raise exception 'Toggle/audit failed'; end if;
  begin perform public.set_social_publication(r.platform,r.post_id,r.published,r.revision); raise exception 'Stale change allowed';
  exception when sqlstate 'PT409' then null; end;
  begin update public.social_post_publications set revision=100 where platform='snapchat' and post_id='31'; raise exception 'Revision spoof allowed';
  exception when insufficient_privilege then null; end;
  begin insert into public.social_post_publications(platform,post_id) values('x','99'); raise exception 'Insert allowed';
  exception when insufficient_privilege then null; end;
  begin delete from public.social_post_publications where platform='snapchat' and post_id='31'; raise exception 'Delete allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000000","role":"authenticated"}',true); end $$;
set local role authenticated;
do $$ declare affected integer; begin
  if (select count(*) from public.social_post_publications) <> 0 then raise exception 'Nonmember read allowed'; end if;
  update public.social_post_publications set published=true where platform='snapchat' and post_id='31';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Nonmember update allowed'; end if;
  begin perform public.set_social_publication('snapchat','31',true,0); raise exception 'Nonmember RPC allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
