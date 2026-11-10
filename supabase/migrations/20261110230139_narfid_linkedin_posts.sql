begin;

alter table public.social_post_publications
  drop constraint social_post_publications_platform_check,
  add constraint social_post_publications_platform_check
    check (platform in ('snapchat', 'instagram', 'x', 'facebook', 'linkedin'));

insert into public.social_post_publications (platform, post_id)
select 'linkedin', lpad(post_number::text, 2, '0')
from generate_series(1, 10) as posts(post_number)
on conflict (platform, post_id) do nothing;

commit;
