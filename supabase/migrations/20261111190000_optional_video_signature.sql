-- Retain all production checks while allowing film-specific sound endings.
create or replace function public.stamp_marketing_video_production() returns trigger
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
