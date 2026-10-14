// Operator command: authenticated board account, validated documents, normal publication RPC.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import type { JSONContent } from "@tiptap/core";
import {
  validateFields,
  validatePublication,
} from "../lib/articles/validation";
import { launchArticles } from "../content/seo-articles.ar.mjs";
setDefaultAutoSelectFamilyAttemptTimeout(3000);
type Section = { title: string; paragraphs: string[]; list?: string[] };
type Entry = {
  slug: string;
  title: string;
  excerpt: string;
  solution: string;
  intent: string;
  keyword: string;
  audience: string;
  question: string;
  screenshot: string;
  alt: string;
  sections: Section[];
  related: string[];
};
async function main() {
  const entries = launchArticles as Entry[];
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (a: { status: string }) => a.status === "verified",
  );
  if (!account) throw new Error("No verified local board account");
  const { data: auth, error: loginError } =
    await client.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
  if (loginError || !auth.user) throw new Error("Board sign-in failed");
  const { data: member } = await client
    .from("board_members")
    .select("active")
    .eq("user_id", auth.user.id)
    .single();
  if (!member?.active) throw new Error("Inactive board account");
  const { data: cats, error: catError } = await client
    .from("article_categories")
    .select("id,slug");
  if (catError) throw new Error(`Categories: ${catError.code}`);
  await mkdir(".private", { recursive: true });
  const statePath = ".private/seo-seed-state.json";
  let state: Record<string, { id: string; file: string; published?: boolean }>;
  try {
    state = JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    state = {};
  }
  const persist = () => writeFile(statePath, JSON.stringify(state, null, 2));
  const text = (value: string): JSONContent => ({ type: "text", text: value });
  const paragraph = (value: string): JSONContent => ({
    type: "paragraph",
    content: [text(value)],
  });
  const heading = (value: string): JSONContent => ({
    type: "heading",
    attrs: { level: 1 },
    content: [text(value)],
  });
  const link = (label: string, href: string): JSONContent => ({
    type: "paragraph",
    content: [{ ...text(label), marks: [{ type: "link", attrs: { href } }] }],
  });
  for (const entry of entries) {
    const { data: existing, error: lookupError } = await client
      .from("articles")
      .select("id,status,revision")
      .eq("slug", entry.slug)
      .maybeSingle();
    if (lookupError) throw new Error(`Lookup: ${lookupError.code}`);
    if (existing && existing.id !== state[entry.slug]?.id)
      throw new Error(`Existing slug is not owned by this seed: ${entry.slug}`);
    if (existing?.status === "published") {
      console.log(`Already published: ${entry.slug}`);
      continue;
    }
    if (state[entry.slug]?.published) {
      console.log(`Preserving later edits/unpublication: ${entry.slug}`);
      continue;
    }
    if (!state[entry.slug]) {
      state[entry.slug] = { id: randomUUID(), file: `${randomUUID()}.png` };
      await persist();
    }
    const { id, file } = state[entry.slug];
    let revision = existing?.revision;
    if (!revision) {
      const { data: created, error } = await client
        .from("articles")
        .insert({
          id,
          slug: entry.slug,
          author_id: auth.user.id,
          author_name: "فريق نرفد",
        })
        .select("revision")
        .single();
      if (error) throw new Error(`Create ${entry.slug}: ${error.code}`);
      revision = created.revision;
    }
    const source = resolve(
      process.env.GO_SCREENSHOT_DIRECTORY ||
        "../go/go/public/guide/screenshots",
      entry.screenshot,
    );
    const bytes = await readFile(source);
    const metadata = await sharp(bytes).metadata();
    const path = `${id}/${file}`;
    const { error: uploadError } = await client.storage
      .from("article-media")
      .upload(path, bytes, {
        contentType: "image/png",
        cacheControl: "0",
        upsert: false,
      });
    if (uploadError && !["409", "400"].includes(String(uploadError.statusCode)))
      throw new Error(`Upload: ${uploadError.message}`);
    if (uploadError) {
      const { data, error } = await client.storage
        .from("article-media")
        .download(path);
      if (error || !data || data.size !== bytes.length)
        throw new Error("Unable to verify existing upload");
    }
    const url = `/media/articles/${path}`;
    const content: JSONContent[] = [
      paragraph(entry.excerpt),
      {
        type: "image",
        attrs: {
          src: url,
          alt: entry.alt,
          width: metadata.width,
          height: metadata.height,
          textAlign: "center",
          layout: "block",
          caption:
            "لقطة توثيقية من النظام المرجعي Go Fitness، أول عميل للنظام. تُعرض لشرح الوظيفة؛ لا تتضمن بيانات أعضاء أو نتائج أداء تجارية.",
        },
      },
    ];
    for (const section of entry.sections) {
      content.push(
        heading(section.title),
        ...section.paragraphs.map(paragraph),
      );
      if (section.list)
        content.push({
          type: "bulletList",
          content: section.list.map((item) => ({
            type: "listItem",
            content: [paragraph(item)],
          })),
        });
    }
    content.push(
      heading("خطوتك التالية"),
      link("راجع حل نرفد المرتبط بهذا الموضوع", `/solutions/${entry.solution}`),
    );
    for (const slug of entry.related) {
      const other = entries.find((a) => a.slug === slug)!;
      content.push(link(other.title, `/articles/${slug}`));
    }
    content.push(link("ناقش احتياج مؤسستك مع فريق نرفد", "/contact"));
    const fields = validateFields(
      {
        title: entry.title,
        slug: entry.slug,
        excerpt: entry.excerpt,
        content: { type: "doc", content },
        cover_image_url: url,
        cover_image_alt: entry.alt,
        cover_image_width: metadata.width,
        cover_image_height: metadata.height,
        category_id: cats!.find(
          (c) =>
            c.slug ===
            (entry.slug === "club-data-migration-checklist"
              ? "technology"
              : "sports-management"),
        )!.id,
        tags: [
          "إدارة المؤسسات الرياضية",
          entry.solution === "kitchen-inventory"
            ? "المطبخ والمخزون"
            : entry.solution === "bookings"
              ? "الحجوزات"
              : entry.solution === "branches"
                ? "الفروع"
                : entry.solution === "point-of-sale"
                  ? "نقاط البيع"
                  : "الاشتراكات",
        ],
        seo_title: entry.title,
        seo_description: entry.excerpt,
        direction: "rtl",
        public_author_slug: "nerved-team",
        related_solution: entry.solution,
        editorial_question: entry.question,
        primary_keyword: entry.keyword,
        search_intent: entry.intent,
        audience: entry.audience,
        review_due_at: "2027-01-14",
        editorial_notes: `مصدر الوظائف: تدقيق النظام المرجعي في docs/platform-backend-audit.md وdocs/platform-frontend-audit.md، وواجهة GO: ${entry.screenshot}. الأمثلة الحسابية والتشغيلية توضيحية وليست نتائج عميل. راجع حدود الوظائف والباقات والروابط قبل موعد المراجعة أو عند تغيير المنتج.`,
      },
      id,
    );
    validatePublication(fields);
    const { data: saved, error: saveError } = await client
      .from("articles")
      .update(fields)
      .eq("id", id)
      .eq("revision", revision)
      .select("revision")
      .single();
    if (saveError) throw new Error(`Save ${entry.slug}: ${saveError.code}`);
    const { error: publishError } = await client.rpc("publish_article", {
      article_id: id,
      expected_revision: saved.revision,
    });
    if (publishError)
      throw new Error(
        `Publish ${entry.slug}: ${publishError.code} ${publishError.message}`,
      );
    state[entry.slug].published = true;
    await persist();
    console.log(`Published: ${entry.slug}`);
  }
  await client.auth.signOut({ scope: "local" });
  console.log(
    "Launch articles verified; existing articles were not overwritten.",
  );
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Unable to seed articles",
  );
  process.exitCode = 1;
});
