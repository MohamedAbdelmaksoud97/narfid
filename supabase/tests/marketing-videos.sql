-- All mutations, including storage metadata fixtures, are rolled back.
begin;
set local role anon;
do $$ begin
  begin perform count(*) from public.marketing_video_productions; raise exception 'Anon read allowed'; exception when insufficient_privilege then null; end;
  begin perform public.set_marketing_video_production('NV-001','producing',0); raise exception 'Anon write allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claims',jsonb_build_object('sub',(select user_id from public.board_members where active limit 1),'role','authenticated')::text,true); end $$;
set local role authenticated;
do $$ declare r public.marketing_video_productions; changed public.marketing_video_productions; p public.marketing_video_publications; p2 public.marketing_video_publications; path text; meta jsonb; n integer; begin
  if (select count(*) from public.marketing_video_productions)<>50 or (select count(*) from public.marketing_video_publications)<>250 then raise exception 'Incomplete inventory'; end if;
  select * into strict r from public.marketing_video_productions where video_id='NV-001';
  select * into changed from public.set_marketing_video_production(r.video_id,'producing',r.revision);
  if changed.revision<>r.revision+1 or changed.updated_by<>auth.uid() or changed.attempt_id is null then raise exception 'Production stamping failed'; end if;
  begin perform public.set_marketing_video_production(r.video_id,'planned',r.revision); raise exception 'Stale production accepted'; exception when sqlstate 'PT409' then null; end;
  begin perform public.set_marketing_video_production(r.video_id,'ready',changed.revision,gen_random_uuid()); raise exception 'Wrong attempt accepted'; exception when sqlstate 'PT409' then null; end;
  begin perform public.set_marketing_video_production(r.video_id,'ready',changed.revision,changed.attempt_id); raise exception 'Missing output accepted'; exception when sqlstate '22023' then null; end;
  begin update public.marketing_video_productions set revision=999 where video_id=r.video_id; raise exception 'Revision spoof accepted'; exception when insufficient_privilege then null; end;
  begin delete from public.marketing_video_productions where video_id=r.video_id; raise exception 'Delete accepted'; exception when insufficient_privilege then null; end;
  path:=r.video_id||'/'||changed.attempt_id::text||'/'||repeat('a',64)||'.mp4';
  insert into storage.objects(bucket_id,name,metadata) values('marketing-videos',path,jsonb_build_object('size',2048,'mimetype','video/mp4'));
  meta:=jsonb_build_object('width',1080,'height',1920,'fps',30,'duration',37,'bytes',2048,'sha256',repeat('a',64),'audio',true,'signature_id','narfid-sonic-v1');
  select * into changed from public.set_marketing_video_production(r.video_id,'ready',changed.revision,changed.attempt_id,path,meta);
  if changed.status<>'ready' or changed.output_path<>path then raise exception 'Ready output not attached'; end if;
  update storage.objects set metadata=jsonb_build_object('size',3000,'mimetype','video/mp4') where bucket_id='marketing-videos' and name=path;
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Immutable output overwrite allowed'; end if;
  select * into p from public.marketing_video_publications where video_id=r.video_id and platform='instagram';
  select * into p2 from public.set_marketing_video_publication(r.video_id,'instagram',not p.published,p.revision);
  if p2.published=p.published or p2.revision<>p.revision+1 or p2.updated_by<>auth.uid() then raise exception 'Publication stamping failed'; end if;
  if (select published from public.marketing_video_publications where video_id=r.video_id and platform='x') then raise exception 'Cross-platform state changed'; end if;
  begin perform public.set_marketing_video_publication(r.video_id,'instagram',p.published,p.revision); raise exception 'Stale publication accepted'; exception when sqlstate 'PT409' then null; end;
end $$;
reset role;
do $$ begin perform set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000000","role":"authenticated"}',true); end $$;
set local role authenticated;
do $$ declare n integer; begin
  if (select count(*) from public.marketing_video_productions)<>0 or (select count(*) from public.marketing_video_publications)<>0 then raise exception 'Nonmember read allowed'; end if;
  update public.marketing_video_publications set published=true where video_id='NV-001';get diagnostics n=row_count;
  if n<>0 then raise exception 'Nonmember update allowed'; end if;
  begin perform public.set_marketing_video_publication('NV-001','instagram',true,0); raise exception 'Nonmember RPC allowed'; exception when insufficient_privilege then null; end;
  if exists(select 1 from storage.objects where bucket_id='marketing-videos') then raise exception 'Nonmember asset read allowed'; end if;
end $$;
reset role;
rollback;
