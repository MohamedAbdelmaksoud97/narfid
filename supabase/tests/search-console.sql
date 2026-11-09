-- Read-only verification of the service-only credential/report boundary.
select c.relname, c.relrowsecurity,
  has_table_privilege('anon', c.oid, 'select') as anon_select,
  has_table_privilege('authenticated', c.oid, 'select') as authenticated_select,
  has_table_privilege('authenticated', c.oid, 'insert,update,delete') as authenticated_write,
  has_table_privilege('service_role', c.oid, 'select,insert,update,delete') as service_access,
  (select count(*) from pg_policy where polrelid = c.oid) as policies
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('seo_google_connections', 'seo_google_reports')
order by c.relname;
