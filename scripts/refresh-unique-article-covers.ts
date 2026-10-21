// Separate from historical campaign importers. Default: offline verification only.
import { readFile, writeFile, rename, mkdir, open, unlink } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { isDeepStrictEqual as equal } from "node:util";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { JSONContent } from "@tiptap/core";
import { articleFields, type Article, type ArticleFields } from "../lib/articles/types";
import { validateFields, validatePublication } from "../lib/articles/validation";
import manifest from "../content/article-covers/unique/manifest.json";

const root = ".private/unique-article-covers";
const statePath = `${root}/state.json`;
const hash = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
type Progress = {
  hash: string;
  url: string;
  previous: ArticleFields;
  prepared: ArticleFields;
  originalRevision: number;
  savedRevision?: number;
  published?: boolean;
};
type State = Record<string, Progress>;
const coverKeys = new Set(["cover_image_url", "cover_image_alt", "cover_image_width", "cover_image_height", "editorial_notes"]);
// Some original articles embed the cover as their first content image.
// Keep that alias synchronized, without changing any text or other images.
function coverAlias(node: JSONContent, oldUrl: string | null, fields: ArticleFields): JSONContent {
  if (oldUrl && node.type === "image" && node.attrs?.src === oldUrl) return {...node,attrs:{...node.attrs,src:fields.cover_image_url,alt:fields.cover_image_alt,width:fields.cover_image_width,height:fields.cover_image_height}};
  return node.content ? {...node,content:node.content.map(child=>coverAlias(child,oldUrl,fields))} : node;
}
function assertUnchanged(before: ArticleFields, after: ArticleFields, slug: string) {
  for (const key of Object.keys(before) as (keyof ArticleFields)[]) {
    if (key === "content" && equal(coverAlias(before.content,before.cover_image_url,after),after.content)) continue;
    if (!coverKeys.has(key) && !equal(before[key], after[key])) throw Error(`Unrelated field changed: ${slug}/${key}`);
  }
}
function pending(fields: ArticleFields, publication: Record<string, unknown>) {
  return Object.keys(fields).filter(key => key in publication && !equal(fields[key as keyof ArticleFields], publication[key]));
}

async function main() {
  const ids = new Set<string>(), photos = new Set<number>(), hashes = new Set<string>(), pixels = new Set<string>();
  for (const entry of manifest) {
    if (ids.has(entry.id) || photos.has(entry.photoId) || hashes.has(entry.sha256)) throw Error(`Duplicate cover identity: ${entry.slug}`);
    ids.add(entry.id); photos.add(entry.photoId); hashes.add(entry.sha256);
    const bytes = await readFile(entry.file);
    const meta = await sharp(bytes).metadata();
    const pixelHash = hash(await sharp(bytes).raw().toBuffer());
    if (pixels.has(pixelHash)) throw Error(`Duplicate decoded image: ${entry.slug}`);
    pixels.add(pixelHash);
    if (hash(bytes) !== entry.sha256 || meta.format !== "webp" || meta.width !== entry.width || meta.height !== entry.height || bytes.length > 5 * 1024 * 1024) throw Error(`Invalid cover file: ${entry.slug}`);
    if (!entry.alt.trim() || !entry.photographer || !entry.source.startsWith("https://www.pexels.com/photo/") || entry.license !== "https://www.pexels.com/license/") throw Error(`Missing cover evidence: ${entry.slug}`);
  }
  console.log(`Verified ${manifest.length} distinct source photos, file hashes, decoded images, dimensions and credits.`);
  const apply = process.argv.includes("--apply"), verify = process.argv.includes("--verify-live");
  if (!apply && !verify && !process.argv.includes("--plan")) return;
  await mkdir(root, { recursive: true });
  const lockPath = `${root}/refresh.lock`;
  const lock = await open(lockPath, "wx");
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    await lock.writeFile(String(process.pid));
    const accounts = JSON.parse(await readFile(".private/board-accounts.json", "utf8"));
    const account = accounts.accounts.find((a: {status: string}) => a.status === "verified");
    if (!account) throw Error("No verified local board account");
    const { data: auth, error: loginError } = await client.auth.signInWithPassword({ email: account.email, password: account.password });
    if (loginError || !auth.user) throw Error("Board sign-in failed");
    const { data: member, error: memberError } = await client.from("board_members").select("active").eq("user_id", auth.user.id).single();
    if (memberError || !member?.active) throw Error("Active board membership required");
    const inventory = async () => {
      const [a,p] = await Promise.all([client.from("articles").select("*").order("id"), client.from("article_publications").select("*").order("id")]);
      if (a.error || p.error || !a.data || !p.data) throw Error("Cannot read article inventory");
      return { articles: a.data as Article[], publications: p.data as Record<string, unknown>[] };
    };
    const current = await inventory();
    if (current.publications.length !== manifest.length || current.publications.some(p => !ids.has(String(p.id)))) throw Error("Published inventory changed; review the cover catalog before applying");
    let state: State = {};
    try { state = JSON.parse(await readFile(statePath, "utf8")); } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
    const persist = async () => { await writeFile(`${statePath}.tmp`, JSON.stringify(state,null,2)); await rename(`${statePath}.tmp`, statePath); };
    let baseline: typeof current;
    try { baseline = JSON.parse(await readFile(`${root}/baseline.json`, "utf8")); }
    catch (e) {
      if ((e as NodeJS.ErrnoException).code !== "ENOENT" || Object.keys(state).length) throw e;
      baseline = current;
      if (apply) await writeFile(`${root}/baseline.json`, JSON.stringify(baseline,null,2), {flag:"wx"});
    }
    const plan: { entry: typeof manifest[number]; article: Article; progress: Progress }[] = [];
    // Check the entire batch before uploading or saving anything.
    for (const entry of manifest) {
      const article = current.articles.find(a => a.id === entry.id);
      const publication = current.publications.find(p => p.id === entry.id)!;
      if (!article || article.status !== "published" || article.slug !== entry.slug) throw Error(`Article identity changed: ${entry.slug}`);
      const fields = articleFields(article), saved = state[entry.slug];
      if (saved && saved.hash !== entry.sha256) throw Error(`Source changed after planning: ${entry.slug}`);
      if (entry.action === "retain" || saved?.published || verify) continue;
      if (saved && equal(fields, saved.prepared) && publication.cover_image_url === saved.url) {
        if (article.revision !== (saved.savedRevision ?? saved.originalRevision + 1) + 1) throw Error(`Unexpected publication revision: ${entry.slug}`);
        saved.published = true;
        if (apply) await persist();
        continue;
      }
      const resumingSave = saved && equal(fields, saved.prepared) && article.revision === (saved.savedRevision ?? saved.originalRevision + 1);
      if (pending(fields, publication).length && !resumingSave) throw Error(`Unpublished editorial changes preserved: ${entry.slug}`);
      if (saved && !resumingSave && (article.revision !== saved.originalRevision || !equal(fields, saved.previous))) throw Error(`Revision conflict: ${entry.slug}`);
      if (resumingSave) saved.savedRevision = article.revision;
      const url = saved?.url ?? `/media/articles/${article.id}/${randomUUID()}.webp`;
      const credit = `Cover review ${entry.reviewedAt}: ${entry.photographer}; ${entry.source}; license ${entry.license}. Illustrative stock photo; not a narfid customer.`;
      const replacement = { ...fields, cover_image_url: url, cover_image_alt: entry.alt, cover_image_width: entry.width, cover_image_height: entry.height, editorial_notes: `${fields.editorial_notes}\n${credit}`.trim() };
      const prepared = saved?.prepared ?? validateFields({...replacement,content:coverAlias(fields.content,fields.cover_image_url,replacement)},article.id);
      assertUnchanged(saved?.previous ?? fields, prepared, entry.slug);
      validatePublication(prepared);
      plan.push({entry,article,progress: saved ?? {hash:entry.sha256,url,previous:fields,prepared,originalRevision:article.revision}});
    }
    console.log(`${apply ? "Apply" : "Plan"}: ${plan.length} cover replacements; ${manifest.filter(e=>e.action === "retain").length} retained.`);
    if (!apply && !verify) return;
    if (apply) for (const {entry, article, progress} of plan) {
      state[entry.slug] = progress;
      await persist();
      const mediaPath = progress.url.replace("/media/articles/", "");
      if (!progress.savedRevision) {
        const bytes = await readFile(entry.file);
        const {error:uploadError} = await client.storage.from("article-media").upload(mediaPath,bytes,{contentType:"image/webp",cacheControl:"0",upsert:false});
        if (uploadError) {
          const existing = await client.storage.from("article-media").download(mediaPath);
          if (existing.error || !existing.data || hash(new Uint8Array(await existing.data.arrayBuffer())) !== entry.sha256) throw Error(`Upload failed: ${entry.slug}: ${uploadError.message}`);
        }
        const {data:saved,error:saveError} = await client.from("articles").update(progress.prepared).eq("id",article.id).eq("revision",progress.originalRevision).select("revision").single();
        if (saveError || !saved) throw Error(`Save conflict: ${entry.slug}; retry only after reviewing latest revision`);
        progress.savedRevision = saved.revision;
        await persist();
      }
      const {error:publishError} = await client.rpc("publish_article",{article_id:article.id,expected_revision:progress.savedRevision});
      if (publishError) throw Error(`Publish failed: ${entry.slug}: ${publishError.message}`);
      const {data:publication,error:checkError} = await client.from("article_publications").select("*").eq("id",article.id).single();
      if (checkError || !publication || pending(progress.prepared,publication).length || !publication.media_paths.includes(mediaPath)) throw Error(`Publication verification failed: ${entry.slug}`);
      progress.published = true;
      await persist();
      console.log(`Published and verified: ${entry.slug}`);
    }
    const after = await inventory();
    const remoteHashes = new Set<string>();
    for (const entry of manifest) {
      const article = after.articles.find(a=>a.id===entry.id)!;
      const publication = after.publications.find(p=>p.id===entry.id)!;
      const before = baseline.articles.find(a=>a.id===entry.id)!;
      if (entry.action === "retain") {
        if (!equal(before,article) || !equal(baseline.publications.find(p=>p.id===entry.id),publication)) throw Error(`Retained article changed: ${entry.slug}`);
      } else {
        if (!state[entry.slug]?.published || !equal(articleFields(article),state[entry.slug].prepared) || pending(state[entry.slug].prepared,publication).length) throw Error(`Live cover mismatch: ${entry.slug}`);
        assertUnchanged(articleFields(before),articleFields(article),entry.slug);
      }
      const downloaded = await client.storage.from("article-media").download(String(publication.cover_image_url).replace("/media/articles/",""));
      if (downloaded.error || !downloaded.data) throw Error(`Cannot download published cover: ${entry.slug}`);
      const remoteHash = hash(new Uint8Array(await downloaded.data.arrayBuffer()));
      if (remoteHash !== entry.sha256 || remoteHashes.has(remoteHash)) throw Error(`Live cover hash mismatch or duplicate: ${entry.slug}`);
      remoteHashes.add(remoteHash);
    }
    const baselineDrafts = baseline.articles.filter(a=>!ids.has(a.id));
    if (!equal(baselineDrafts.sort((a,b)=>a.id.localeCompare(b.id)),after.articles.filter(a=>!ids.has(a.id)).sort((a,b)=>a.id.localeCompare(b.id)))) throw Error("Unrelated drafts changed");
    const report = { verifiedAt:new Date().toISOString(), publications:after.publications.length, uniquePhotos:remoteHashes.size, replaced:Object.values(state).filter(p=>p.published).length, retained:manifest.filter(e=>e.action==="retain").length, preservedDrafts:baselineDrafts.length };
    await writeFile(`${root}/verification.json`,JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
  } finally {
    await client.auth.signOut({scope:"local"});
    await lock.close();
    await unlink(lockPath);
  }
}
main().catch(e=>{ console.error(e instanceof Error ? e.message : "Cover refresh failed"); process.exitCode=1; });
