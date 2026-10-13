// Operational utility. Never imported by the application or sent to the browser.
import { readFile } from "node:fs/promises";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
setDefaultAutoSelectFamilyAttemptTimeout(3000);
const project = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(
  ".",
)[0];
if (!process.env.SUPABASE_ACCESS_TOKEN)
  throw new Error("SUPABASE_ACCESS_TOKEN is required locally");
const file = process.argv[2];
const advisors = file === "--advisors";
const record = file === "--record";
const query = record
  ? await readFile(process.argv[3], "utf8")
  : file === "--details"
    ? "select jsonb_build_object('active_members',(select count(*) from public.board_members where active),'bucket',(select jsonb_build_object('public',public,'limit',file_size_limit) from storage.buckets where id='article-media'),'migration_table',to_regclass('supabase_migrations.schema_migrations'),'functions',(select jsonb_agg(jsonb_build_object('name',proname,'definer',prosecdef,'config',proconfig)) from pg_proc join pg_namespace n on n.oid=pronamespace where n.nspname='public' and proname in ('publish_article','unpublish_article','article_revision')),'arabic_slug_valid',('إدارة-الاشتراكات' ~ '^[[:alnum:]][[:alnum:]-]{0,159}$')) as verification"
    : !file || advisors
      ? "select tablename, rowsecurity from pg_tables where schemaname='public' order by tablename"
      : await readFile(file, "utf8");
const response = await fetch(
  `https://api.supabase.com/v1/projects/${project}/${advisors ? "advisors/security" : record ? "database/migrations" : "database/query"}`,
  {
    signal: AbortSignal.timeout(30000),
    method: advisors ? "GET" : record ? "PUT" : "POST",
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    ...(advisors
      ? {}
      : {
          body: JSON.stringify(
            record ? { query, name: "nerved_articles" } : { query },
          ),
        }),
  },
);
const result = await response.json();
if (!response.ok)
  throw new Error(
    `Database query failed (${response.status}): ${JSON.stringify(result)}`,
  );
console.log(
  JSON.stringify(
    advisors
      ? {
          lints: result.lints?.map((x) => ({
            name: x.name,
            level: x.level,
            detail: x.detail,
          })),
        }
      : result,
  ),
);
