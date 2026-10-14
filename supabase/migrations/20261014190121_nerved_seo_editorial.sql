begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

alter table public.articles
  add column editorial_question text not null default '' check (char_length(editorial_question) <= 500),
  add column primary_keyword text not null default '' check (char_length(primary_keyword) <= 150),
  add column search_intent text not null default 'informational' check (search_intent in ('informational','commercial','transactional')),
  add column audience text not null default '' check (char_length(audience) <= 200),
  add column editorial_notes text not null default '' check (char_length(editorial_notes) <= 5000),
  add column review_due_at date,
  add column related_solution text check (related_solution in ('memberships','bookings','point-of-sale','kitchen-inventory','branches')),
  add column public_author_slug text not null default 'nerved-team' check (public_author_slug = 'nerved-team'),
  add column cover_image_width integer check (cover_image_width between 1 and 10000),
  add column cover_image_height integer check (cover_image_height between 1 and 10000);
alter table public.article_publications
  add column related_solution text check (related_solution in ('memberships','bookings','point-of-sale','kitchen-inventory','branches')),
  add column public_author_slug text not null default 'nerved-team' check (public_author_slug = 'nerved-team'),
  add column cover_image_width integer check (cover_image_width between 1 and 10000),
  add column cover_image_height integer check (cover_image_height between 1 and 10000);
create index articles_review_due_idx on public.articles(review_due_at) where review_due_at is not null;
create index publications_solution_idx on public.article_publications(related_solution, published_at desc);

-- A permanent reservation belongs to an article, never to a redirect target.
-- Lookup joins the current publication, so aliases cannot expose unpublished articles.
create table public.article_slug_registry (
  slug text primary key check (slug ~ '^[[:alnum:]][[:alnum:]-]{0,159}$'),
  article_id uuid not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index article_slug_registry_article_idx on public.article_slug_registry(article_id);
alter table public.article_slug_registry enable row level security;
revoke all on public.article_slug_registry from public, anon, authenticated;
grant select on public.article_slug_registry to anon, authenticated;
grant insert, update, delete on public.article_slug_registry to authenticated;
create policy slug_registry_public_read on public.article_slug_registry for select to anon, authenticated
  using (exists(select 1 from public.article_publications p where p.id = article_id));
create policy slug_registry_board_access on public.article_slug_registry for all to authenticated
  using (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active))
  with check (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));
insert into public.article_slug_registry(slug, article_id) select slug,id from public.article_publications;

create function public.reserve_publication_slug() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if exists(select 1 from public.articles where slug = new.slug and id <> new.id) then
    raise exception 'Slug already belongs to another article' using errcode = '23505';
  end if;
  insert into public.article_slug_registry(slug,article_id) values(new.slug,new.id) on conflict(slug) do nothing;
  if not exists(select 1 from public.article_slug_registry where slug=new.slug and article_id=new.id) then
    raise exception 'Published slug is permanently reserved' using errcode = '23505';
  end if;
  return new;
end $$;
revoke all on function public.reserve_publication_slug() from public, anon, authenticated;
create trigger reserve_publication_slug before insert or update of slug on public.article_publications
  for each row execute function public.reserve_publication_slug();
create function public.check_article_slug() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if exists(select 1 from public.article_slug_registry where slug = new.slug and article_id <> new.id) then
    raise exception 'Published slug is permanently reserved' using errcode = '23505';
  end if;
  return new;
end $$;
revoke all on function public.check_article_slug() from public, anon, authenticated;
create trigger check_article_slug before insert or update of slug on public.articles
  for each row execute function public.check_article_slug();

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
 insert into public.article_publications(id,slug,title,excerpt,content,cover_image_url,cover_image_alt,category_id,author_name,
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
   updated_at=case when (to_jsonb(public.article_publications)-'revision'-'updated_at'-'media_paths')
     is distinct from (to_jsonb(excluded)-'revision'-'updated_at'-'media_paths')
     then excluded.updated_at else public.article_publications.updated_at end;
 return a;
end $$;
revoke all on function public.publish_article(uuid,bigint) from public, anon;
grant execute on function public.publish_article(uuid,bigint) to authenticated;
commit;
