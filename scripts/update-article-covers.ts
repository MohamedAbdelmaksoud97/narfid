// Content-only operator: dry run by default; uses board RLS and the normal publisher.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { JSONContent } from "@tiptap/core";
import {
  articleFields,
  type Article,
  type ArticleFields,
} from "../lib/articles/types";
import {
  validateFields,
  validatePublication,
} from "../lib/articles/validation";
import manifest from "../content/article-covers/manifest.json";

type State = Record<
  string,
  {
    hash: string;
    url: string;
    previous: ArticleFields;
    prepared?: ArticleFields;
    savedRevision?: number;
    published?: boolean;
  }
>;
const apply = process.argv.includes("--apply");
const statePath = ".private/article-cover-update-state.json";

function updateImage(
  node: JSONContent,
  oldUrl: string | null,
  url: string,
  alt: string,
): JSONContent {
  if (node.type === "image" && node.attrs?.src === oldUrl) {
    return {
      ...node,
      attrs: {
        ...node.attrs,
        src: url,
        alt,
        width: 1600,
        height: 1000,
        caption: "",
      },
    };
  }
  return node.content
    ? {
        ...node,
        content: node.content.map((child) =>
          updateImage(child, oldUrl, url, alt),
        ),
      }
    : node;
}

async function main() {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (row: { status: string }) => row.status === "verified",
  );
  if (!account) throw new Error("No verified local board account");
  const { data: auth, error: loginError } =
    await client.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
  if (loginError || !auth.user) throw new Error("Board sign-in failed");
  try {
    const { data: member, error: memberError } = await client
      .from("board_members")
      .select("active")
      .eq("user_id", auth.user.id)
      .single();
    if (memberError || !member?.active)
      throw new Error("Active board membership required");
    let state: State;
    try {
      state = JSON.parse(await readFile(statePath, "utf8"));
    } catch {
      state = {};
    }
    const persist = async () => {
      await mkdir(".private", { recursive: true });
      await writeFile(statePath, JSON.stringify(state, null, 2));
    };
    const plan = [];
    // Preflight the whole batch before changing any article. Never publish someone else's pending draft.
    for (const entry of manifest) {
      const bytes = await readFile(`content/article-covers/${entry.slug}.webp`);
      const image = await sharp(bytes).metadata();
      if (
        image.format !== "webp" ||
        image.width !== 1600 ||
        image.height !== 1000 ||
        bytes.length > 5 * 1024 * 1024
      )
        throw new Error(`Invalid image: ${entry.slug}`);
      const hash = createHash("sha256").update(bytes).digest("hex");
      const { data: article, error } = await client
        .from("articles")
        .select("*")
        .eq("slug", entry.slug)
        .single();
      if (error || !article || article.status !== "published")
        throw new Error(`Published article required: ${entry.slug}`);
      const { data: publication, error: publicError } = await client
        .from("article_publications")
        .select("*")
        .eq("id", article.id)
        .single();
      if (publicError || !publication)
        throw new Error(`Missing publication: ${entry.slug}`);
      const current = articleFields(article as Article);
      const savedState = state[entry.slug];
      if (
        savedState?.hash === hash &&
        article.cover_image_url === savedState.url &&
        publication.cover_image_url === savedState.url
      ) {
        console.log(`Already updated: ${entry.slug}`);
        continue;
      }
      const resuming =
        savedState?.hash === hash &&
        savedState.savedRevision === article.revision &&
        isDeepStrictEqual(current, savedState.prepared);
      const changed = Object.keys(current).filter(
        (key) =>
          key in publication &&
          !isDeepStrictEqual(
            current[key as keyof ArticleFields],
            publication[key],
          ),
      );
      if (changed.length && !resuming)
        throw new Error(
          `Unpublished edits preserved in ${entry.slug}: ${changed.join(", ")}`,
        );
      plan.push({
        entry,
        bytes,
        hash,
        article: article as Article,
        current,
        resuming,
      });
      console.log(
        `${apply ? "Apply" : "Plan"}: ${entry.slug} (${Math.round(bytes.length / 1024)} KiB)`,
      );
    }
    if (!apply) {
      console.log(
        `Dry run: ${plan.length} covers ready. Pass --apply to upload and publish.`,
      );
      return;
    }
    for (const item of plan) {
      const { entry, article, hash, bytes } = item;
      if (!item.resuming) {
        const file = `${randomUUID()}.webp`;
        const url = `/media/articles/${article.id}/${file}`;
        const fields = validateFields(
          {
            ...item.current,
            cover_image_url: url,
            cover_image_alt: entry.alt,
            cover_image_width: 1600,
            cover_image_height: 1000,
            content: updateImage(
              item.current.content,
              item.current.cover_image_url,
              url,
              entry.alt,
            ),
          },
          article.id,
        );
        validatePublication(fields);
        state[entry.slug] = {
          hash,
          url,
          previous: item.current,
          prepared: fields,
        };
        await persist();
        const { error: uploadError } = await client.storage
          .from("article-media")
          .upload(`${article.id}/${file}`, bytes, {
            contentType: "image/webp",
            cacheControl: "0",
            upsert: false,
          });
        if (uploadError)
          throw new Error(`Upload ${entry.slug}: ${uploadError.message}`);
        const { data: saved, error: saveError } = await client
          .from("articles")
          .update(fields)
          .eq("id", article.id)
          .eq("revision", article.revision)
          .select("revision")
          .single();
        if (saveError || !saved)
          throw new Error(
            `Save conflict: ${entry.slug}. No publication was changed; inspect before retrying.`,
          );
        state[entry.slug].savedRevision = saved.revision;
        await persist();
      }
      const { error: publishError } = await client.rpc("publish_article", {
        article_id: article.id,
        expected_revision: state[entry.slug].savedRevision,
      });
      if (publishError)
        throw new Error(
          `Publish ${entry.slug}: ${publishError.message}. Prepared update saved locally for retry.`,
        );
      const { data: check, error: checkError } = await client
        .from("article_publications")
        .select("cover_image_url,media_paths")
        .eq("id", article.id)
        .single();
      if (
        checkError ||
        check?.cover_image_url !== state[entry.slug].url ||
        !check.media_paths.includes(
          state[entry.slug].url.replace("/media/articles/", ""),
        )
      )
        throw new Error(`Publication verification failed: ${entry.slug}`);
      state[entry.slug].published = true;
      await persist();
      console.log(`Published and verified: ${entry.slug}`);
    }
  } finally {
    await client.auth.signOut({ scope: "local" });
  }
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Cover update failed");
  process.exitCode = 1;
});
