begin;

create table public.marketing_video_productions (
  video_id text primary key check (video_id ~ '^NV-0(0[1-9]|[1-4][0-9]|50)$'),
  status text not null default 'planned' check (status in ('planned','producing','needs_revision','ready')),
  attempt_id uuid,
  output_path text,
  output_metadata jsonb,
  notes text not null default '' check (length(notes) <= 1000),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  check ((output_path is null) = (output_metadata is null)),
  check (status <> 'ready' or (output_path is not null and attempt_id is not null))
);
create table public.marketing_video_publications (
  video_id text not null references public.marketing_video_productions(video_id),
  platform text not null check (platform in ('instagram','x','linkedin','facebook','snapchat')),
  published boolean not null default false,
  published_at timestamptz,
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key(video_id, platform),
  check (published = (published_at is not null))
);
alter table public.marketing_video_productions enable row level security;
alter table public.marketing_video_publications enable row level security;
revoke all on public.marketing_video_productions, public.marketing_video_publications from public, anon, authenticated;
grant select on public.marketing_video_productions, public.marketing_video_publications to authenticated;
grant update(status,attempt_id,output_path,output_metadata,notes) on public.marketing_video_productions to authenticated;
grant update(published) on public.marketing_video_publications to authenticated;

create policy video_productions_read on public.marketing_video_productions for select to authenticated
using (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));
create policy video_productions_update on public.marketing_video_productions for update to authenticated
using (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active))
with check (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));
create policy video_publications_read on public.marketing_video_publications for select to authenticated
using (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));
create policy video_publications_update on public.marketing_video_publications for update to authenticated
using (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active))
with check (exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));

insert into public.marketing_video_productions(video_id)
select 'NV-' || lpad(n::text,3,'0') from generate_series(1,50) n;
insert into public.marketing_video_publications(video_id,platform)
select video_id, platform from public.marketing_video_productions
cross join unnest(array['instagram','x','linkedin','facebook','snapchat']) platform;

-- Files are immutable, private, and never bundled into Git or the website build.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('marketing-videos','marketing-videos',false,52428800,array['video/mp4']);
create policy marketing_videos_read on storage.objects for select to authenticated
using (bucket_id='marketing-videos' and exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));
create policy marketing_videos_insert on storage.objects for insert to authenticated
with check (bucket_id='marketing-videos'
  and name ~ '^NV-0(0[1-9]|[1-4][0-9]|50)/[0-9a-f-]{36}/[0-9a-f]{64}\.mp4$'
  and exists(select 1 from public.board_members where user_id=(select auth.uid()) and active)
  and exists(select 1 from public.marketing_video_productions p
    where p.video_id=split_part(name,'/',1) and p.status='producing'
      and p.attempt_id::text=split_part(name,'/',2)));

create function public.stamp_marketing_video_production() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.video_id is distinct from old.video_id then raise exception 'Immutable identity' using errcode='22023'; end if;
  if row(new.status,new.attempt_id,new.output_path,new.output_metadata,new.notes)
    is not distinct from row(old.status,old.attempt_id,old.output_path,old.output_metadata,old.notes) then return old; end if;
  if new.status='producing' and new.attempt_id is null then raise exception 'Attempt required' using errcode='22023'; end if;
  if new.status='ready' then
    if old.status <> 'producing' or new.attempt_id is distinct from old.attempt_id
      or new.output_metadata is null
      or new.output_path is distinct from (new.video_id || '/' || new.attempt_id::text || '/' || (new.output_metadata->>'sha256') || '.mp4')
      or coalesce(new.output_metadata->>'sha256','') !~ '^[0-9a-f]{64}$'
      or (new.output_metadata->>'width')::int is distinct from 1080
      or (new.output_metadata->>'height')::int is distinct from 1920
      or abs(coalesce((new.output_metadata->>'fps')::numeric,0)-30)>0.01
      or coalesce((new.output_metadata->>'duration')::numeric,0) not between 25 and 45.1
      or new.output_metadata->>'audio' is distinct from 'true'
      or new.output_metadata->>'signature_id' is distinct from 'narfid-sonic-v1'
      or coalesce((new.output_metadata->>'bytes')::bigint,0) not between 1 and 52428800
      or not exists(select 1 from storage.objects o where o.bucket_id='marketing-videos' and o.name=new.output_path
        and (o.metadata->>'size')::bigint=(new.output_metadata->>'bytes')::bigint
        and o.metadata->>'mimetype'='video/mp4')
    then raise exception 'Verified uploaded video required' using errcode='22023'; end if;
  elsif new.output_path is distinct from old.output_path or new.output_metadata is distinct from old.output_metadata then
    raise exception 'Output may only change on completion' using errcode='22023';
  end if;
  new.revision:=old.revision+1; new.updated_at:=now(); new.updated_by:=auth.uid();
  return new;
end; $$;
revoke all on function public.stamp_marketing_video_production() from public,anon,authenticated;
create trigger stamp_video_production before update on public.marketing_video_productions
for each row execute function public.stamp_marketing_video_production();

create function public.set_marketing_video_production(
 p_video_id text,p_status text,p_revision bigint,p_attempt_id uuid default null,
 p_output_path text default null,p_output_metadata jsonb default null,p_notes text default ''
) returns public.marketing_video_productions language plpgsql security invoker set search_path='' as $$
declare r public.marketing_video_productions;
begin
  if auth.uid() is null or not exists(select 1 from public.board_members where user_id=(select auth.uid()) and active)
    then raise exception 'Forbidden' using errcode='42501'; end if;
  if p_status not in ('planned','producing','needs_revision','ready') or p_status is null or p_revision is null or p_revision<0
    then raise exception 'Invalid change' using errcode='22023'; end if;
  select * into r from public.marketing_video_productions where video_id=p_video_id for update;
  if not found then raise exception 'Missing video' using errcode='P0002'; end if;
  if r.revision<>p_revision then raise sqlstate 'PT409' using message='VIDEO_CONFLICT'; end if;
  if p_status='ready' and (r.status<>'producing' or p_attempt_id is distinct from r.attempt_id)
    then raise sqlstate 'PT409' using message='VIDEO_ATTEMPT_CONFLICT'; end if;
  update public.marketing_video_productions set status=p_status,
    attempt_id=case when p_status='producing' then coalesce(p_attempt_id,gen_random_uuid()) else r.attempt_id end,
    output_path=case when p_status='ready' then p_output_path else r.output_path end,
    output_metadata=case when p_status='ready' then p_output_metadata else r.output_metadata end,
    notes=coalesce(p_notes,'') where video_id=p_video_id returning * into r;
  return r;
end; $$;
revoke all on function public.set_marketing_video_production(text,text,bigint,uuid,text,jsonb,text) from public,anon;
grant execute on function public.set_marketing_video_production(text,text,bigint,uuid,text,jsonb,text) to authenticated;

create function public.stamp_marketing_video_publication() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if new.video_id is distinct from old.video_id or new.platform is distinct from old.platform then
    raise exception 'Immutable identity' using errcode='22023'; end if;
  if new.published is not distinct from old.published then return old; end if;
  new.revision:=old.revision+1; new.updated_at:=now(); new.updated_by:=auth.uid();
  new.published_at:=case when new.published then now() else null end;
  return new;
end; $$;
revoke all on function public.stamp_marketing_video_publication() from public,anon,authenticated;
create trigger stamp_video_publication before update on public.marketing_video_publications
for each row execute function public.stamp_marketing_video_publication();
create function public.set_marketing_video_publication(p_video_id text,p_platform text,p_published boolean,p_revision bigint)
returns public.marketing_video_publications language plpgsql security invoker set search_path='' as $$
declare r public.marketing_video_publications;
begin
  if auth.uid() is null or not exists(select 1 from public.board_members where user_id=(select auth.uid()) and active)
    then raise exception 'Forbidden' using errcode='42501'; end if;
  if p_published is null or p_revision is null or p_revision<0 then raise exception 'Invalid change' using errcode='22023'; end if;
  select * into r from public.marketing_video_publications where video_id=p_video_id and platform=p_platform for update;
  if not found then raise exception 'Missing video' using errcode='P0002'; end if;
  if r.revision<>p_revision then raise sqlstate 'PT409' using message='VIDEO_CONFLICT'; end if;
  update public.marketing_video_publications set published=p_published
    where video_id=p_video_id and platform=p_platform returning * into r;
  return r;
end; $$;
revoke all on function public.set_marketing_video_publication(text,text,boolean,bigint) from public,anon;
grant execute on function public.set_marketing_video_publication(text,text,boolean,bigint) to authenticated;
commit;
