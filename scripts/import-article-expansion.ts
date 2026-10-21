// Default: offline validation. --prepare records the reviewed source manifest.
// --apply uses a normal active board session and the existing publication RPC.
import { readFile, writeFile, mkdir, rename, open, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { expansionArticles, expansionId, expansionCategorySlug, assertExpansionInventory, expansionCover, expansionFields, expansionMediaFile } from "../lib/articles/article-expansion-content";
import { articleFields, type Article, type ArticleFields } from "../lib/articles/types";

const briefs = expansionArticles.map((brief) => ({ ...brief, id: expansionId(brief) }));

setDefaultAutoSelectFamilyAttemptTimeout(3000);
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]));
  return value;
}
export const fingerprint = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
const bytesHash = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");
function publicFingerprint(fields: ArticleFields) {
  return fingerprint(Object.fromEntries(Object.entries(fields).filter(([key]) => !["editorial_question", "primary_keyword", "search_intent", "audience", "editorial_notes", "review_due_at"].includes(key))));
}
type Progress = { sourceHash: string; phase: "planned" | "created" | "saved" | "published"; revision?: number; publicationRevision?: number };
const folder = ".private/article-expansion-20261021";
const statePath = `${folder}/state.json`;
const manifestPath = "content/article-expansion-20261021/manifest.json";
async function jsonFile<T>(path: string, fallback: T): Promise<T> {
  try { return JSON.parse(await readFile(path, "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback; throw error; }
}
async function main() {
  assertExpansionInventory();
  const prepared = await Promise.all(briefs.map(async (brief) => {
    const cover = expansionCover(brief);
    const bytes = await readFile(cover.path);
    const meta = await sharp(bytes).metadata();
    if (meta.format !== "webp" || !meta.width || !meta.height || bytes.length > 5 * 1024 * 1024) throw new Error(`Invalid image: ${brief.slug}`);
    const dimensions = { width: meta.width, height: meta.height };
    const fields = expansionFields(brief, null, dimensions);
    return { brief, cover, bytes, dimensions, fields, sourceHash: fingerprint({ fields, imageHash: bytesHash(bytes) }) };
  }));
  const manifest = prepared.map((p) => ({ id: p.brief.id, slug: p.brief.slug, sourceHash: p.sourceHash, imageHash: bytesHash(p.bytes), image: p.cover.path, imageSource: p.cover.source, reviewedAt: "2026-10-21" }));
  if (process.argv.includes("--prepare")) {
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log("Prepared manifest for 30 validated articles; no database changes.");
    return;
  }
  const checkedManifest = await jsonFile(manifestPath, null);
  if (fingerprint(checkedManifest) !== fingerprint(manifest)) throw new Error("Source changed or manifest missing; review content and run --prepare before applying.");
  console.log("Validated 30 articles, covers, metadata and the reviewed manifest.");
  if (!process.argv.includes("--apply")) return;
  await mkdir(folder, { recursive: true });
  const lock = await open(`${folder}/import.lock`, "wx");
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  try {
    const state = await jsonFile<Record<string, Progress>>(statePath, {});
    const persist = async () => { await writeFile(`${statePath}.tmp`, JSON.stringify(state, null, 2)); await rename(`${statePath}.tmp`, statePath); };
    const credentials = JSON.parse(await readFile(".private/board-accounts.json", "utf8"));
    const account = credentials.accounts.find((a: { status: string }) => a.status === "verified");
    if (!account) throw new Error("No verified board account");
    const { data: auth, error } = await client.auth.signInWithPassword({ email: account.email, password: account.password });
    if (error || !auth.user) throw new Error("Board sign-in failed");
    const { data: member, error: memberError } = await client.from("board_members").select("active").eq("user_id", auth.user.id).single();
    if (memberError || !member?.active) throw new Error("Active board membership required");
    const { data: categories, error: categoryError } = await client.from("article_categories").select("id,slug");
    if (categoryError || !categories) throw new Error("Category lookup failed");
    const { data: inventory, error: inventoryError } = await client.from("articles").select("id,slug,revision,status");
    if (inventoryError) throw new Error("Inventory lookup failed");
    // Never overwrite this baseline on resume; it proves unrelated records were preserved.
    try { await writeFile(`${folder}/baseline.json`, JSON.stringify(inventory, null, 2), { flag: "wx" }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
    for (const p of prepared) {
      const { brief, sourceHash, bytes } = p;
      const category = categories.find((c) => c.slug === expansionCategorySlug(brief));
      if (!category) throw new Error(`Missing category: ${brief.slug}`);
      const fields = expansionFields(brief, category.id, p.dimensions);
      const fetchArticle = async () => {
        const { data, error } = await client.from("articles").select("*").eq("id", brief.id).maybeSingle();
        if (error) throw new Error(`Lookup failed: ${brief.slug}`);
        return data as Article | null;
      };
      let existing = await fetchArticle();
      const { data: collision, error: slugError } = await client.from("articles").select("id").eq("slug", brief.slug).maybeSingle();
      if (slugError || (collision && collision.id !== brief.id)) throw new Error(`Slug collision: ${brief.slug}`);
      if (!state[brief.id]) {
        if (existing) throw new Error(`Unowned article ID: ${brief.slug}`);
        state[brief.id] = { sourceHash, phase: "planned" };
        await persist();
      }
      const progress = state[brief.id];
      if (progress.sourceHash !== sourceHash) throw new Error(`Source changed after import began: ${brief.slug}`);
      if (progress.phase === "published") {
        console.log(`Previously published; preserving current editorial state: ${brief.slug}`);
        continue;
      }
      if (!existing) {
        if (progress.phase !== "planned") throw new Error(`Article removed after import began: ${brief.slug}`);
        const { error } = await client.from("articles").insert({ id: brief.id, slug: brief.slug, author_id: auth.user.id, author_name: "فريق نرفد" });
        if (error) throw new Error(`Create failed (${error.code}): ${brief.slug}`);
        existing = await fetchArticle();
      }
      if (!existing) throw new Error(`Missing created article: ${brief.slug}`);
      const matches = fingerprint(articleFields(existing)) === fingerprint(fields);
      if (progress.phase === "saved" && matches && existing.status === "published" && existing.revision === (progress.revision ?? 0) + 1) {
        const { data: recovered, error } = await client.from("article_publications").select("*").eq("id", brief.id).single();
        if (error || recovered.revision !== existing.revision || publicFingerprint(articleFields(recovered as Article)) !== publicFingerprint(fields)) throw new Error(`Cannot recover publication: ${brief.slug}`);
        progress.phase = "published"; progress.publicationRevision = recovered.revision; await persist();
        console.log(`Recovered verified publication: ${brief.slug}`); continue;
      }
      // Recover a lost save/publish response only when the entire stored document matches.
      if (progress.phase === "planned") {
        if (existing.revision !== 1 || existing.title || existing.status !== "draft") throw new Error(`Unexpected edits after creation: ${brief.slug}`);
        progress.phase = "created"; progress.revision = existing.revision; await persist();
      }
      const path = `${brief.id}/${expansionMediaFile(brief)}`;
      const { error: uploadError } = await client.storage.from("article-media").upload(path, bytes, { contentType: "image/webp", cacheControl: "0", upsert: false });
      if (uploadError) {
        const { data, error } = await client.storage.from("article-media").download(path);
        if (error || !data || bytesHash(new Uint8Array(await data.arrayBuffer())) !== bytesHash(bytes)) throw new Error(`Existing image differs or upload failed: ${brief.slug}`);
      }
      if (!matches) {
        if (progress.phase !== "created" || existing.revision !== progress.revision || existing.status !== "draft") throw new Error(`Editorial conflict: ${brief.slug}`);
        const { data: saved, error } = await client.from("articles").update(fields).eq("id", brief.id).eq("revision", progress.revision).select("revision").single();
        if (error || !saved) throw new Error(`Revision conflict/save failed: ${brief.slug}`);
        progress.revision = saved.revision;
      } else if (progress.phase === "saved" && existing.revision !== progress.revision) {
        throw new Error(`Revision changed after save: ${brief.slug}`);
      } else if (progress.phase === "created" && existing.revision !== (progress.revision ?? 0) + 1) {
        throw new Error(`Unexpected revision during recovery: ${brief.slug}`);
      } else progress.revision = existing.revision;
      progress.phase = "saved"; await persist();
      const { data: publication, error: pubReadError } = await client.from("article_publications").select("revision").eq("id", brief.id).maybeSingle();
      if (pubReadError) throw new Error(`Publication lookup failed: ${brief.slug}`);
      if (!publication || publication.revision !== progress.revision) {
        const { error } = await client.rpc("publish_article", { article_id: brief.id, expected_revision: progress.revision });
        if (error) throw new Error(`Publish failed (${error.code}): ${brief.slug}`);
      }
      const { data: verified, error: verifyError } = await client.from("article_publications").select("*").eq("id", brief.id).single();
      if (verifyError || !verified || publicFingerprint(articleFields(verified as Article)) !== publicFingerprint(fields)) throw new Error(`Publication verification failed: ${brief.slug}`);
      progress.phase = "published"; progress.publicationRevision = verified.revision; await persist();
      console.log(`Published and verified: ${brief.slug}`);
    }
  } finally {
    await client.auth.signOut({ scope: "local" });
    await lock.close();
    await unlink(`${folder}/import.lock`);
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Campaign import failed"); process.exitCode = 1; });
