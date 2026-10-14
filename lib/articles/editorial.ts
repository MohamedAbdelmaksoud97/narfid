import type { JSONContent } from "@tiptap/core";
import { documentText, slugify, type ArticleFields } from "./types";
export function articleHeadings(doc: JSONContent) {
  const result: { id: string; text: string; level: number }[] = [];
  const counts = new Map<string, number>();
  function visit(node: JSONContent) {
    if (node.type === "heading") {
      const text = documentText(node).trim();
      const base = slugify(text).slice(0, 80) || "heading";
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      result.push({
        id: `section-${base}${count > 1 ? `-${count}` : ""}`,
        text,
        level: Math.min(Number(node.attrs?.level ?? 1) + 1, 6),
      });
    }
    node.content?.forEach(visit);
  }
  visit(doc);
  return result;
}
export function editorialWarnings(fields: ArticleFields) {
  const warnings: string[] = [];
  if (!fields.editorial_question?.trim())
    warnings.push("حدّد سؤال القارئ حتى يجيب المقال عن احتياج واضح.");
  if (!fields.audience?.trim())
    warnings.push("حدّد صاحب القرار أو المستخدم الذي تخاطبه.");
  if (!articleHeadings(fields.content).length)
    warnings.push("قسّم المقال بعناوين تساعد القارئ على الوصول إلى الإجابة.");
  if (!fields.related_solution)
    warnings.push("اربط المقال بالحل المناسب عندما يخدم ذلك القارئ.");
  if (!fields.review_due_at)
    warnings.push("حدّد موعدًا لمراجعة المعلومات والروابط.");
  if (fields.cover_image_url && !fields.cover_image_alt.trim())
    warnings.push("أضف وصفًا بديلًا للغلاف قبل النشر.");
  let internalLink = false;
  function visit(node: JSONContent) {
    if (
      node.marks?.some(
        (mark) =>
          mark.type === "link" && /^\/(?!\/)/.test(String(mark.attrs?.href)),
      )
    )
      internalLink = true;
    node.content?.forEach(visit);
  }
  visit(fields.content);
  if (!internalLink)
    warnings.push("أضف رابطًا داخليًا مفيدًا في النص، دون حشو أو تكرار.");
  return warnings;
}
