import type { JSONContent } from "@tiptap/core";
import part1 from "@/content/article-expansion-20261021/articles-01.json";
import part2 from "@/content/article-expansion-20261021/articles-02.json";
import part3 from "@/content/article-expansion-20261021/articles-03.json";
import part4 from "@/content/article-expansion-20261021/articles-04.json";
import part5 from "@/content/article-expansion-20261021/articles-05.json";
import part6 from "@/content/article-expansion-20261021/articles-06.json";
import registry from "@/.agents/skills/narfid-seo/references/keyword-opportunities.json";
import oldCovers from "@/content/article-covers/manifest.json";
import freshCovers from "@/content/seo-campaign/covers/manifest.json";
import { validateFields, validatePublication } from "./validation";

export type ExpansionArticle = {
  number: number; slug: string; title: string; excerpt: string; question: string;
  audience: string; categoryKey: string; cover: string; nearest: string; distinctValue: string;
  intro: string;
  sections: { title: string; paragraphs: string[]; list?: string[] }[];
};
export const expansionArticles: ExpansionArticle[] = [...part1, ...part2, ...part3, ...part4, ...part5, ...part6];
export const expansionReviewedAt = "2026-10-21";
export const expansionCategoryNames: Record<string, string> = {
  "operations-team": "الإدارة والتشغيل وفرق العمل",
  "member-experience": "الاشتراكات وخدمة الأعضاء",
  "academy-bookings": "الأكاديميات والتدريب والحجوزات",
  "finance-collections": "المالية والتحصيل",
  "inventory-meals": "المخزون والوجبات",
  "growth-marketing": "التسويق ونمو المؤسسات الرياضية",
  technology: "التقنية والتحول الرقمي",
};
export const expansionId = (article: ExpansionArticle) => `8d71f284-9540-4ce7-9b30-${String(article.number).padStart(12, "0")}`;
export const expansionMediaFile = (article: ExpansionArticle) => `${expansionId(article).replace(/^8d/, "9d")}.webp`;
export const expansionCategorySlug = (article: ExpansionArticle) => article.categoryKey === "technology" ? "technology" : "sports-management";
export function expansionOpportunity(article: ExpansionArticle) {
  const opportunity = registry.opportunities.find((o) => o.id === `opportunity-20261021-expansion-${String(article.number).padStart(2, "0")}`);
  if (!opportunity || opportunity.target !== `/articles/${article.slug}` || opportunity.categoryKey !== article.categoryKey) throw new Error(`Research mapping missing: ${article.slug}`);
  return opportunity;
}
export function expansionCover(article: ExpansionArticle) {
  const fresh = freshCovers.find((c) => c.slug === article.cover);
  const cover = fresh ?? oldCovers.find((c) => c.slug === article.cover);
  if (!cover) throw new Error(`Missing cover: ${article.slug}`);
  return { ...cover, path: `${fresh ? "content/seo-campaign/covers" : "content/article-covers"}/${article.cover}.webp`, license: "https://www.pexels.com/license/" };
}
// Source paragraphs can contain local links; only validated Tiptap JSON is saved.
export function expansionInline(value: string): JSONContent[] {
  const nodes: JSONContent[] = [];
  const pattern = /\[([^\]]+)\]\((\/[^\s)]+)\)/g;
  let offset = 0;
  for (const match of value.matchAll(pattern)) {
    if (match.index! > offset) nodes.push({ type: "text", text: value.slice(offset, match.index) });
    nodes.push({ type: "text", text: match[1], marks: [{ type: "link", attrs: { href: match[2] } }] });
    offset = match.index! + match[0].length;
  }
  if (offset < value.length) nodes.push({ type: "text", text: value.slice(offset) });
  return nodes;
}
const paragraph = (value: string): JSONContent => ({ type: "paragraph", content: expansionInline(value) });
export function expansionFields(article: ExpansionArticle, categoryId: string | null, dimensions: { width: number; height: number }) {
  const opportunity = expansionOpportunity(article);
  const cover = expansionCover(article);
  const sources = registry.researchSessions.filter((s) => opportunity.researchIds.includes(s.id)).flatMap((s) => s.pageChecks.filter((p) => p.status === "opened").map((p) => p.url));
  const content: JSONContent[] = [paragraph(article.intro)];
  for (const section of article.sections) {
    content.push({ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: section.title }] });
    content.push(...section.paragraphs.map(paragraph));
    if (section.list) content.push({ type: "bulletList", content: section.list.map((item) => ({ type: "listItem", content: [paragraph(item)] })) });
  }
  const fields = validateFields({
    title: article.title, slug: article.slug, excerpt: article.excerpt,
    content: { type: "doc", content }, category_id: categoryId,
    tags: [expansionCategoryNames[article.categoryKey]], direction: "rtl",
    cover_image_url: `/media/articles/${expansionId(article)}/${expansionMediaFile(article)}`,
    cover_image_alt: cover.alt, cover_image_width: dimensions.width, cover_image_height: dimensions.height,
    seo_title: article.title, seo_description: article.excerpt,
    public_author_slug: "nerved-team", related_solution: null,
    editorial_question: article.question, primary_keyword: opportunity.phrase,
    search_intent: "informational", audience: article.audience, review_due_at: "2027-01-21",
    editorial_notes: [
      `توسعة تحريرية 2026-10-21؛ مراجعة ${expansionReviewedAt}. البحث: ${opportunity.id}. المحور: ${article.categoryKey}؛ تصنيف النظام: ${expansionCategorySlug(article)}.`,
      `قرار بحث جديد: ${opportunity.reason}\nالتميّز عن /articles/${article.nearest}: ${article.distinctValue}`,
      "المحتوى إجراء تحريري أصلي؛ الأمثلة والأرقام افتراضية وليست نتائج عملاء أو سياسات ملزمة. لا تتضمن النصوص نصيحة علاجية أو قانونية أو قيودًا محاسبية. المصادر التالية لبحث النية ومراجعة السياق وليست نصوصًا منقولة:",
      ...new Set(sources),
      "حجم البحث وصعوبة الكلمات وترتيب Google السعودية غير متحققين. توثيق المنتج عند ذكره: docs/platform-backend-audit.md وdocs/platform-frontend-audit.md وlib/solutions.ts؛ لا وعود وظائف غير مثبتة.",
      `الغلاف: ${cover.source}؛ المصور: ${cover.photographer}؛ الترخيص: ${cover.license}. صورة توضيحية لا تمثل عميل نرفد؛ أعيد فحصها بصريًا لهذه الدفعة.`,
    ].join("\n"),
  }, expansionId(article));
  validatePublication(fields);
  return fields;
}

export function assertExpansionInventory() {
  if (expansionArticles.length !== 30) throw new Error("Expected 30 expansion articles");
  for (const key of ["number", "slug", "title", "question"] as const) {
    if (new Set(expansionArticles.map((a) => a[key])).size !== 30) throw new Error(`Duplicate ${key}`);
  }
  for (const article of expansionArticles) {
    if (!Number.isInteger(article.number) || article.number < 1 || article.number > 30 || !expansionCategoryNames[article.categoryKey]) throw new Error(`Invalid brief: ${article.slug}`);
    const opportunity = expansionOpportunity(article);
    if (!opportunity.distinctValue || !opportunity.researchIds.length || !opportunity.researchIds.every((id) => registry.researchSessions.some((s) => s.id === id))) throw new Error(`Incomplete evidence: ${article.slug}`);
  }
}
