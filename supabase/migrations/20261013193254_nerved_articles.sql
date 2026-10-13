begin;

-- Live board membership is separate from editable profile metadata and JWT age.
create table public.board_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
insert into public.board_members(user_id)
select id from auth.users
where lower(email) in ('chairman@nerfed.example', 'operations@nerfed.example',
  'finance@nerfed.example', 'technology@nerfed.example', 'strategy@nerfed.example')
  and raw_app_meta_data ->> 'narfid_board_member' = 'true';
alter table public.board_members enable row level security;
revoke all on public.board_members from anon, authenticated;
grant select on public.board_members to authenticated;
create policy board_members_self on public.board_members for select to authenticated
  using (user_id = (select auth.uid()));

create table public.article_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (char_length(slug) between 1 and 100)
);
-- Editorial taxonomy; there are deliberately no example articles.
insert into public.article_categories(name, slug) values
 ('إدارة المؤسسات الرياضية', 'sports-management'),
 ('التقنية والتحول الرقمي', 'technology'),
 ('أخبار نرفد', 'nerved-news');
alter table public.article_categories enable row level security;
revoke all on public.article_categories from anon, authenticated;
grant select on public.article_categories to anon, authenticated;
create policy categories_read on public.article_categories for select to anon, authenticated using (true);

create table public.articles (
 id uuid primary key default gen_random_uuid(),
 title text not null default '' check (char_length(title) <= 200),
 slug text not null unique check (slug ~ '^[[:alnum:]][[:alnum:]-]{0,159}$'),
 excerpt text not null default '' check (char_length(excerpt) <= 500),
 content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb
   check (jsonb_typeof(content) = 'object' and content ->> 'type' = 'doc' and octet_length(content::text) <= 1048576),
 cover_image_url text,
 cover_image_alt text not null default '' check (char_length(cover_image_alt) <= 300),
 category_id uuid references public.article_categories(id) on delete set null,
 author_id uuid not null default auth.uid() references auth.users(id),
 author_name text not null default 'فريق نرفد' check (char_length(author_name) <= 120),
 status text not null default 'draft' check (status in ('draft', 'published')),
 tags text[] not null default '{}' check (cardinality(tags) <= 10),
 seo_title text not null default '' check (char_length(seo_title) <= 70),
 seo_description text not null default '' check (char_length(seo_description) <= 180),
 direction text not null default 'rtl' check (direction in ('rtl', 'ltr')),
 revision bigint not null default 1,
 published_revision bigint not null default 0,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 published_at timestamptz
);
create index articles_updated_idx on public.articles(updated_at desc);
create index articles_category_idx on public.articles(category_id);
create index articles_author_idx on public.articles(author_id);
alter table public.articles enable row level security;
revoke all on public.articles from anon, authenticated;
grant select, insert, update, delete on public.articles to authenticated;
create policy articles_board_select on public.articles for select to authenticated
 using (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));
create policy articles_board_insert on public.articles for insert to authenticated
 with check (author_id = (select auth.uid()) and exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));
create policy articles_board_update on public.articles for update to authenticated
 using (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active))
 with check (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));
create policy articles_board_delete on public.articles for delete to authenticated
 using (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));

-- Public reads never touch working drafts, including edits to published articles.
create table public.article_publications (
 id uuid primary key references public.articles(id) on delete cascade,
 slug text not null unique,
 title text not null,
 excerpt text not null,
 content jsonb not null,
 cover_image_url text,
 cover_image_alt text not null,
 category_id uuid references public.article_categories(id) on delete set null,
 author_name text not null,
 tags text[] not null,
 seo_title text not null,
 seo_description text not null,
 direction text not null check (direction in ('rtl', 'ltr')),
 revision bigint not null,
 published_at timestamptz not null,
 updated_at timestamptz not null,
 media_paths text[] not null default '{}'
);
create index publications_date_idx on public.article_publications(published_at desc);
create index publications_category_idx on public.article_publications(category_id);
alter table public.article_publications enable row level security;
revoke all on public.article_publications from anon, authenticated;
grant select on public.article_publications to anon, authenticated;
grant insert, update, delete on public.article_publications to authenticated;
create policy publications_read on public.article_publications for select to anon, authenticated using (true);
create policy publications_insert on public.article_publications for insert to authenticated
 with check (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));
create policy publications_update on public.article_publications for update to authenticated
 using (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active))
 with check (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));
create policy publications_delete on public.article_publications for delete to authenticated
 using (exists(select 1 from public.board_members where user_id = (select auth.uid()) and active));

create function public.article_revision() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
 new.id := old.id; new.author_id := old.author_id; new.created_at := old.created_at;
 new.revision := old.revision + 1; new.updated_at := now();
 return new;
end $$;
revoke all on function public.article_revision() from public, anon, authenticated;
create trigger article_revision before update on public.articles for each row execute function public.article_revision();

-- Both RPCs execute with the caller's privileges. RLS is never bypassed.
create function public.publish_article(article_id uuid, expected_revision bigint)
returns public.articles language plpgsql security invoker set search_path = '' as $$
declare a public.articles; media text[];
begin
 update public.articles set status = 'published', published_at = coalesce(published_at, now()),
   published_revision = revision + 1
 where id = article_id and revision = expected_revision and char_length(trim(title)) > 0
 returning * into a;
 if a.id is null then raise exception 'Article changed or cannot be published' using errcode = 'P0001'; end if;
 select coalesce(array_agg(o.name), '{}') into media from storage.objects o
 where o.bucket_id = 'article-media' and split_part(o.name, '/', 1) = a.id::text
   and (a.cover_image_url = '/media/articles/' || o.name
     or position('/media/articles/' || o.name in a.content::text) > 0);
 insert into public.article_publications(id, slug, title, excerpt, content, cover_image_url, cover_image_alt,
   category_id, author_name, tags, seo_title, seo_description, direction, revision, published_at, updated_at, media_paths)
 values (a.id,a.slug,a.title,a.excerpt,a.content,a.cover_image_url,a.cover_image_alt,a.category_id,a.author_name,
   a.tags,a.seo_title,a.seo_description,a.direction,a.revision,a.published_at,a.updated_at,media)
 on conflict (id) do update set slug=excluded.slug,title=excluded.title,excerpt=excluded.excerpt,
   content=excluded.content,cover_image_url=excluded.cover_image_url,cover_image_alt=excluded.cover_image_alt,
   category_id=excluded.category_id,author_name=excluded.author_name,tags=excluded.tags,seo_title=excluded.seo_title,
   seo_description=excluded.seo_description,direction=excluded.direction,revision=excluded.revision,
   updated_at=excluded.updated_at,media_paths=excluded.media_paths;
 return a;
end $$;
create function public.unpublish_article(article_id uuid, expected_revision bigint)
returns public.articles language plpgsql security invoker set search_path = '' as $$
declare a public.articles;
begin
 update public.articles set status = 'draft', published_revision = 0
 where id = article_id and revision = expected_revision returning * into a;
 if a.id is null then raise exception 'Article changed or not authorized' using errcode = 'P0001'; end if;
 delete from public.article_publications where id = article_id;
 return a;
end $$;
revoke all on function public.publish_article(uuid,bigint), public.unpublish_article(uuid,bigint) from public, anon;
grant execute on function public.publish_article(uuid,bigint), public.unpublish_article(uuid,bigint) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values ('article-media','article-media',false,5242880,array['image/jpeg','image/png','image/webp','image/gif']);
-- Names contain article UUID / file UUID only. No SVG, path traversal or overwrite.
create policy article_media_board_read on storage.objects for select to authenticated
 using (bucket_id='article-media' and exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));
create policy article_media_public_read on storage.objects for select to anon, authenticated
 using (bucket_id='article-media' and exists(select 1 from public.article_publications p where name = any(p.media_paths)));
create policy article_media_board_insert on storage.objects for insert to authenticated
 with check (bucket_id='article-media'
   and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(png|jpg|webp|gif)$'
   and exists(select 1 from public.articles a where a.id::text = split_part(name,'/',1))
   and exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));
create policy article_media_board_delete on storage.objects for delete to authenticated
 using (bucket_id='article-media' and exists(select 1 from public.board_members where user_id=(select auth.uid()) and active));

commit;
