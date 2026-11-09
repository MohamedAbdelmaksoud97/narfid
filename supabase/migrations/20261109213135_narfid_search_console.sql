begin;

-- These tables are accessed exclusively by the server's service-role client.
-- Board membership is checked against live Auth and board_members on every request.
create table public.seo_google_connections (
  site_url text primary key check (site_url = 'https://www.narfid.com/'),
  client_credentials text not null check (length(client_credentials) between 32 and 16000),
  refresh_token text check (refresh_token is null or length(refresh_token) between 32 and 24000),
  generation uuid not null default gen_random_uuid(),
  granted_scopes text[] not null default '{}',
  connected_at timestamptz,
  connected_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint seo_google_connection_state check ((refresh_token is null) = (connected_at is null))
);

create table public.seo_google_reports (
  site_url text not null references public.seo_google_connections(site_url) on delete cascade,
  country text not null check (country in ('sau', 'all')),
  generation uuid not null,
  report jsonb not null check (jsonb_typeof(report) = 'object' and octet_length(report::text) < 500000),
  updated_at timestamptz not null default now(),
  primary key (site_url, country)
);

alter table public.seo_google_connections enable row level security;
alter table public.seo_google_reports enable row level security;
revoke all on public.seo_google_connections, public.seo_google_reports from public, anon, authenticated;
grant select, insert, update, delete on public.seo_google_connections, public.seo_google_reports to service_role;

comment on table public.seo_google_connections is 'Server-only, purpose-bound AES-GCM-encrypted Google OAuth client credentials and refresh token; never returned to browsers.';
comment on table public.seo_google_reports is 'Server-only Search Console snapshots; a connection generation prevents showing reports from a previous authorization.';

commit;
