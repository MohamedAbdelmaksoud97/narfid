import type { JSONContent } from "@tiptap/core";
import bodies from "@/content/seo-campaign/articles.json";
import oldCovers from "@/content/article-covers/manifest.json";
import newCovers from "@/content/seo-campaign/covers/manifest.json";
import { campaignBriefs, campaignKeywords, campaignReviewedAt, type CampaignBrief } from "@/lib/seo-campaign";
import { validateFields, validatePublication } from "./validation";

const text = (value: string): JSONContent => ({ type: "text", text: value });
const paragraph = (value: string): JSONContent => ({ type: "paragraph", content: [text(value)] });
const heading = (value: string): JSONContent => ({ type: "heading", attrs: { level: 1 }, content: [text(value)] });
const link = (label: string, href: string): JSONContent => ({ type: "paragraph", content: [{ ...text(label), marks: [{ type: "link", attrs: { href } }] }] });

export function campaignCover(brief: CampaignBrief) {
  const fresh = newCovers.find((c) => c.slug === brief.cover);
  const cover = fresh ?? oldCovers.find((c) => c.slug === brief.cover);
  if (!cover) throw new Error(`Missing cover: ${brief.slug}`);
  return { ...cover, path: `${fresh ? "content/seo-campaign/covers" : "content/article-covers"}/${brief.cover}.webp`, license: "https://www.pexels.com/license/" };
}
export function campaignMediaFile(brief: CampaignBrief) {
  return `${brief.id.replace(/^6c/, "7c")}.webp`;
}
export function campaignFields(brief: CampaignBrief, categoryId: string | null, dimensions: { width: number; height: number }) {
  const body = bodies.find((b) => b.slug === brief.slug);
  if (!body) throw new Error(`Missing body: ${brief.slug}`);
  const cover = campaignCover(brief);
  const primary = campaignKeywords.find((k) => k.id === brief.primaryKeywordId)!;
  const content: JSONContent[] = [paragraph(body.intro)];
  body.sections.forEach((section) => {
    content.push(heading(section.title), ...section.paragraphs.map(paragraph));
    if (section.list) content.push({ type: "bulletList", content: section.list.map((item) => ({ type: "listItem", content: [paragraph(item)] })) });
  });
  content.push(heading("طبّق الخطوة التالية في مؤسستك"));
  content.push(link("راجع نطاق حل نرفد المرتبط بهذا الإجراء", `/solutions/${brief.solution}`));
  body.links.forEach(([label, href]) => content.push(link(label, href)));
  content.push(link("اطلب عرضًا عمليًا بسيناريو من تشغيل مؤسستك", "/contact"));
  const sources = campaignKeywords.filter((k) => brief.keywordIds.includes(k.id)).map((k) => `#${k.id}: ${k.reviewedSource.url}`).join("\n");
  const fields = validateFields({
    title: brief.title, slug: brief.slug, excerpt: brief.excerpt,
    content: { type: "doc", content },
    cover_image_url: `/media/articles/${brief.id}/${campaignMediaFile(brief)}`,
    cover_image_alt: cover.alt, cover_image_width: dimensions.width, cover_image_height: dimensions.height,
    category_id: categoryId, tags: ["تشغيل المؤسسات الرياضية", primary.cluster],
    seo_title: brief.title, seo_description: brief.excerpt, direction: "rtl",
    public_author_slug: "nerved-team", related_solution: brief.solution,
    editorial_question: brief.question, primary_keyword: primary.phrase,
    search_intent: primary.intent === "تجاري" ? "commercial" : "informational",
    audience: primary.audience, review_due_at: brief.reviewDue,
    editorial_notes: `حملة 2026-10؛ مراجعة تحريرية ${campaignReviewedAt}. أمثلة أصلية توضيحية وليست نتائج عملاء. مصدر ادعاءات المنتج: docs/platform-backend-audit.md وdocs/platform-frontend-audit.md وlib/solutions.ts؛ الباقات من lib/landing-content.ts. لا تتضمن المقالات أسعار بيع ثابتة أو وعود تكامل غير مثبتة.\nمصادر تحليل نية البحث (ليست مصادر لنقل نص المقال):\n${sources}\nالغلاف: ${cover.source}؛ المصور: ${cover.photographer}؛ الترخيص: ${cover.license}. صورة توضيحية لا تمثل عميل نرفد.`,
  }, brief.id);
  validatePublication(fields);
  return fields;
}

export function assertCampaignInventory() {
  if (campaignBriefs.length !== 20 || bodies.length !== 20 || campaignKeywords.length !== 50) throw new Error("Incomplete campaign");
  for (const key of ["id", "slug", "title"] as const) if (new Set(campaignBriefs.map((b) => b[key])).size !== 20) throw new Error(`Duplicate ${key}`);
  if (new Set(bodies.map((b) => b.slug)).size !== 20) throw new Error("Duplicate bodies");
  for (const brief of campaignBriefs) {
    if (!brief.keywordIds.includes(brief.primaryKeywordId)) throw new Error(`Primary keyword mismatch: ${brief.slug}`);
    for (const id of brief.keywordIds) if (!campaignKeywords.some((k) => k.id === id && k.target === `/articles/${brief.slug}`)) throw new Error(`Keyword destination mismatch: ${id}`);
  }
}
