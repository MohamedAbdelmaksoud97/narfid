begin;
-- Use an explicit row alias when comparing the previous and new public snapshots.
create or replace function public.publish_article(article_id uuid, expected_revision bigint)
returns public.articles language plpgsql security invoker set search_path = '' as $$
declare a public.articles; media text[];
begin
 update public.articles set status = 'published', published_at = coalesce(published_at, now()), published_revision = revision + 1
 where id = article_id and revision = expected_revision and char_length(trim(title)) > 0 returning * into a;
 if a.id is null then raise exception 'Article changed or cannot be published' using errcode = 'P0001'; end if;
 select coalesce(array_agg(o.name), '{}') into media from storage.objects o
 where o.bucket_id = 'article-media' and split_part(o.name, '/', 1) = a.id::text
   and (a.cover_image_url = '/media/articles/' || o.name or position('/media/articles/' || o.name in a.content::text) > 0);
 insert into public.article_publications as current_publication(id,slug,title,excerpt,content,cover_image_url,cover_image_alt,category_id,author_name,
   tags,seo_title,seo_description,direction,revision,published_at,updated_at,media_paths,
   related_solution,public_author_slug,cover_image_width,cover_image_height)
 values (a.id,a.slug,a.title,a.excerpt,a.content,a.cover_image_url,a.cover_image_alt,a.category_id,'فريق نرفد',
   a.tags,a.seo_title,a.seo_description,a.direction,a.revision,a.published_at,a.updated_at,media,
   a.related_solution,a.public_author_slug,a.cover_image_width,a.cover_image_height)
 on conflict (id) do update set slug=excluded.slug,title=excluded.title,excerpt=excluded.excerpt,content=excluded.content,
   cover_image_url=excluded.cover_image_url,cover_image_alt=excluded.cover_image_alt,category_id=excluded.category_id,
   author_name=excluded.author_name,tags=excluded.tags,seo_title=excluded.seo_title,seo_description=excluded.seo_description,
   direction=excluded.direction,revision=excluded.revision,media_paths=excluded.media_paths,
   related_solution=excluded.related_solution,public_author_slug=excluded.public_author_slug,
   cover_image_width=excluded.cover_image_width,cover_image_height=excluded.cover_image_height,
   updated_at=case when (to_jsonb(current_publication)-'revision'-'updated_at'-'media_paths')
     is distinct from (to_jsonb(excluded)-'revision'-'updated_at'-'media_paths')
     then excluded.updated_at else current_publication.updated_at end;
 return a;
end $$;
revoke all on function public.publish_article(uuid,bigint) from public, anon;
grant execute on function public.publish_article(uuid,bigint) to authenticated;
commit;
