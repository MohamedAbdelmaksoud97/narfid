begin;
create function public.resolve_article_slug(requested_slug text) returns text
language sql stable security invoker set search_path = '' as $$
  select p.slug from public.article_publications p
  join public.article_slug_registry r on r.article_id = p.id
  where r.slug = requested_slug limit 1;
$$;
revoke all on function public.resolve_article_slug(text) from public;
grant execute on function public.resolve_article_slug(text) to anon, authenticated;
commit;
