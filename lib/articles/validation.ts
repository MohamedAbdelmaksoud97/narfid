import { getSchema, type JSONContent } from "@tiptap/core";
import { articleExtensions } from "./extensions";
import { UUID_RE, documentText, youtubeId, type ArticleFields } from "./types";

export class ArticleError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function safeLink(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    /[\u0000-\u0020\u007f]/.test(value)
  )
    return false;
  try {
    const url = new URL(value);
    return (
      ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export function safeMedia(value: unknown, articleId?: string): value is string {
  if (typeof value !== "string") return false;
  const match = value.match(
    /^\/media\/articles\/([0-9a-f-]{36})\/([0-9a-f-]{36})\.(png|jpg|webp|gif)$/,
  );
  return (
    !!match &&
    UUID_RE.test(match[1]) &&
    UUID_RE.test(match[2]) &&
    (!articleId || match[1] === articleId)
  );
}
const nodes = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "taskList",
  "taskItem",
  "blockquote",
  "horizontalRule",
  "codeBlock",
  "hardBreak",
  "image",
  "youtube",
  "table",
  "tableRow",
  "tableCell",
  "tableHeader",
]);
const marks = new Set([
  "bold",
  "italic",
  "underline",
  "strike",
  "code",
  "link",
  "highlight",
  "textStyle",
  "superscript",
  "subscript",
]);
const color = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const nodeAttrs = new Set([
  "dir",
  "textAlign",
  "align",
  "level",
  "start",
  "checked",
  "language",
  "src",
  "alt",
  "title",
  "caption",
  "width",
  "height",
  "startAt",
  "colspan",
  "rowspan",
  "colwidth",
]);
const markAttrs = new Set(["href", "target", "rel", "class", "color"]);
function validateAttrs(
  attrs: Record<string, unknown> | undefined,
  allowed: Set<string>,
) {
  if (!attrs) return;
  if (typeof attrs !== "object" || Array.isArray(attrs))
    throw new ArticleError("خصائص المحتوى غير صالحة.");
  for (const [key, value] of Object.entries(attrs)) {
    if (!allowed.has(key)) throw new ArticleError(`خاصية غير مدعومة: ${key}`);
    if (value === null) continue;
    if (key === "colwidth") {
      if (
        !Array.isArray(value) ||
        value.length > 30 ||
        value.some((v) => !Number.isInteger(v) || v < 0 || v > 4000)
      )
        throw new ArticleError("عرض الجدول غير صالح.");
    } else if (key === "checked") {
      if (typeof value !== "boolean")
        throw new ArticleError("قائمة المهام غير صالحة.");
    } else if (
      [
        "level",
        "start",
        "width",
        "height",
        "startAt",
        "colspan",
        "rowspan",
      ].includes(key)
    ) {
      if (
        typeof value !== "number" ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > 10000
      )
        throw new ArticleError("أبعاد المحتوى غير صالحة.");
      if (["colspan", "rowspan"].includes(key) && (value < 1 || value > 30))
        throw new ArticleError("حجم الجدول غير صالح.");
      if (key === "level" && (value < 1 || value > 6))
        throw new ArticleError("مستوى العنوان غير صالح.");
    } else {
      if (typeof value !== "string" || value.length > 2048)
        throw new ArticleError("خصائص المحتوى غير صالحة.");
      if (key === "dir" && !["rtl", "ltr", "auto"].includes(value))
        throw new ArticleError("اتجاه النص غير صالح.");
      if (
        ["textAlign", "align"].includes(key) &&
        !["left", "center", "right", "justify"].includes(value)
      )
        throw new ArticleError("محاذاة غير صالحة.");
      if (key === "color" && !color.test(value))
        throw new ArticleError("اختر لونًا بصيغة HEX.");
      if (key === "href" && !safeLink(value))
        throw new ArticleError("الرابط غير آمن أو غير صالح.");
      if (key === "target" && !["_blank", "_self"].includes(value))
        throw new ArticleError("هدف الرابط غير صالح.");
      if (key === "class" && value !== "")
        throw new ArticleError("تنسيق الرابط غير مدعوم.");
      if (key === "language" && !/^[\w+-]{0,40}$/.test(value))
        throw new ArticleError("لغة الكود غير صالحة.");
    }
  }
}
export function validateDocument(
  value: unknown,
  articleId?: string,
): JSONContent {
  if (!value || typeof value !== "object")
    throw new ArticleError("المقال غير صالح.");
  let count = 0;
  function visit(node: JSONContent, depth: number) {
    if (
      !node ||
      typeof node !== "object" ||
      depth > 30 ||
      ++count > 15000 ||
      !node.type ||
      !nodes.has(node.type)
    )
      throw new ArticleError("بنية المحتوى غير مدعومة.");
    if (
      Object.keys(node).some(
        (k) => !["type", "attrs", "text", "content", "marks"].includes(k),
      )
    )
      throw new ArticleError("المحتوى غير صالح.");
    validateAttrs(node.attrs, nodeAttrs);
    if (
      node.text !== undefined &&
      (typeof node.text !== "string" || node.text.length > 200000)
    )
      throw new ArticleError("النص غير صالح.");
    if (node.type === "image" && !safeMedia(node.attrs?.src, articleId))
      throw new ArticleError("ارفع الصورة من داخل المقال بدل رابط خارجي.");
    if (node.type === "youtube" && !youtubeId(node.attrs?.src))
      throw new ArticleError("رابط YouTube غير صالح.");
    if (node.marks) {
      if (!Array.isArray(node.marks) || node.marks.length > 12)
        throw new ArticleError("تنسيق النص غير صالح.");
      for (const mark of node.marks) {
        if (!marks.has(mark.type)) throw new ArticleError("تنسيق غير مدعوم.");
        validateAttrs(mark.attrs, markAttrs);
        if (mark.type === "link" && !safeLink(mark.attrs?.href))
          throw new ArticleError("الرابط غير صالح.");
      }
    }
    if (node.content) {
      if (!Array.isArray(node.content))
        throw new ArticleError("المحتوى غير صالح.");
      node.content.forEach((child) => visit(child, depth + 1));
    }
  }
  const doc = value as JSONContent;
  if (doc.type !== "doc") throw new ArticleError("المستند غير صالح.");
  visit(doc, 0);
  if (new TextEncoder().encode(JSON.stringify(doc)).length > 800000)
    throw new ArticleError("المقال أكبر من الحد المسموح.");
  try {
    getSchema(articleExtensions()).nodeFromJSON(doc).check();
  } catch {
    throw new ArticleError("ترتيب عناصر المقال غير صالح.");
  }
  return doc;
}
function bounded(value: unknown, max: number, label: string) {
  if (typeof value !== "string" || value.length > max)
    throw new ArticleError(`${label}: تجاوز الطول المسموح.`);
  return value.trim();
}
export function validateFields(value: unknown, id: string): ArticleFields {
  if (!value || typeof value !== "object")
    throw new ArticleError("بيانات المقال غير صالحة.");
  const v = value as Record<string, unknown>;
  const slug = bounded(v.slug, 160, "الرابط");
  if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug))
    throw new ArticleError("الرابط يقبل حروفًا وأرقامًا وشرطات بين الكلمات.");
  if (
    v.category_id !== null &&
    (typeof v.category_id !== "string" || !UUID_RE.test(v.category_id))
  )
    throw new ArticleError("التصنيف غير صالح.");
  if (v.cover_image_url !== null && !safeMedia(v.cover_image_url, id))
    throw new ArticleError("صورة الغلاف غير صالحة.");
  if (
    !Array.isArray(v.tags) ||
    v.tags.length > 10 ||
    v.tags.some(
      (tag) => typeof tag !== "string" || !tag.trim() || tag.length > 40,
    )
  )
    throw new ArticleError("بحد أقصى 10 وسوم، و40 حرفًا لكل وسم.");
  if (!["rtl", "ltr"].includes(v.direction as string))
    throw new ArticleError("اتجاه المقال غير صالح.");
  return {
    title: bounded(v.title, 200, "العنوان"),
    slug,
    excerpt: bounded(v.excerpt, 500, "الملخص"),
    content: validateDocument(v.content, id),
    cover_image_url: v.cover_image_url as string | null,
    cover_image_alt: bounded(v.cover_image_alt, 300, "وصف الصورة"),
    category_id: v.category_id as string | null,
    tags: [...new Set((v.tags as string[]).map((t) => t.trim()))],
    seo_title: bounded(v.seo_title, 70, "عنوان البحث"),
    seo_description: bounded(v.seo_description, 180, "وصف البحث"),
    direction: v.direction as "rtl" | "ltr",
  };
}
export function validatePublication(fields: ArticleFields) {
  if (!fields.title || !fields.excerpt || !documentText(fields.content).trim())
    throw new ArticleError("أضف عنوانًا وملخصًا ومحتوى قبل النشر.");
  if (fields.cover_image_url && !fields.cover_image_alt)
    throw new ArticleError("أضف وصفًا بديلًا لصورة الغلاف.");
  function check(doc: JSONContent) {
    if (doc.type === "image" && !doc.attrs?.alt?.trim())
      throw new ArticleError("أضف وصفًا بديلًا لكل صورة قبل النشر.");
    doc.content?.forEach(check);
  }
  check(fields.content);
}
export function imageFormat(
  bytes: Uint8Array,
): { type: string; extension: string } | null {
  if (bytes.length < 12) return null;
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v))
    return { type: "image/png", extension: "png" };
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return { type: "image/jpeg", extension: "jpg" };
  const head = new TextDecoder().decode(bytes.slice(0, 12));
  if (head.startsWith("GIF87a") || head.startsWith("GIF89a"))
    return { type: "image/gif", extension: "gif" };
  if (head.startsWith("RIFF") && head.slice(8) === "WEBP")
    return { type: "image/webp", extension: "webp" };
  return null;
}
