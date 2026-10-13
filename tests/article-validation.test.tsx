import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { ArticleRenderer } from "../components/articles/article-renderer";
import {
  validateDocument,
  validateFields,
  validatePublication,
  safeLink,
  imageFormat,
} from "../lib/articles/validation";
import { slugify, type ArticleFields } from "../lib/articles/types";
const id = "55555555-5555-4555-8555-555555555555";
const image = `/media/articles/${id}/11111111-1111-4111-8111-111111111111.png`;
const fields: ArticleFields = {
  title: "إدارة الاشتراكات",
  slug: "إدارة-الاشتراكات",
  excerpt: "مقال عن إدارة الأندية",
  content: {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "نرفد يدعم فريقك." }],
      },
    ],
  },
  cover_image_url: null,
  cover_image_alt: "",
  category_id: null,
  tags: [],
  seo_title: "",
  seo_description: "",
  direction: "rtl",
};
test("Unicode slugs and Arabic / English canonical documents validate", () => {
  assert.equal(slugify(" إدارة الأندية & SaaS "), "إدارة-الأندية-saas");
  assert.equal(validateFields(fields, id).slug, fields.slug);
  assert.doesNotThrow(() =>
    validateDocument({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 6, dir: "ltr" },
          content: [{ type: "text", text: "English" }],
        },
        {
          type: "paragraph",
          attrs: { dir: "rtl" },
          content: [
            {
              type: "text",
              text: "العربية",
              marks: [
                { type: "bold" },
                { type: "textStyle", attrs: { color: "#3ecf8e" } },
              ],
            },
          ],
        },
      ],
    }),
  );
});
test("executable links, external images, foreign article media and unknown nodes fail closed", () => {
  assert.equal(safeLink("javascript:alert(1)"), false);
  assert.equal(safeLink("https://example.com"), true);
  for (const node of [
    { type: "iframe" },
    { type: "image", attrs: { src: "data:image/png;base64,AAAA" } },
    {
      type: "image",
      attrs: { src: image.replace(id, "22222222-2222-4222-8222-222222222222") },
    },
    { type: "paragraph", attrs: { onclick: "alert(1)" } },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "x",
          marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
        },
      ],
    },
  ])
    assert.throws(() => validateDocument({ type: "doc", content: [node] }, id));
});
test("invalid schema structure and oversized/deep documents are rejected", () => {
  assert.throws(() =>
    validateDocument({ type: "doc", content: [{ type: "tableCell" }] }),
  );
  let node: unknown = { type: "paragraph" };
  for (let n = 0; n < 35; n++) node = { type: "blockquote", content: [node] };
  assert.throws(() => validateDocument({ type: "doc", content: [node] }));
  assert.throws(() =>
    validateFields({ ...fields, tags: Array(11).fill("tag") }, id),
  );
});
test("current TableKit cell attributes round-trip, including alignment and widths", () => {
  assert.doesNotThrow(() =>
    validateDocument({
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: [160],
                    align: "right",
                    dir: "rtl",
                  },
                  content: [{ type: "paragraph" }],
                },
              ],
            },
          ],
        },
      ],
    }),
  );
});
test("publishing requires actual copy and accessible images", () => {
  assert.doesNotThrow(() => validatePublication(fields));
  assert.throws(() => validatePublication({ ...fields, title: "" }));
  assert.throws(() =>
    validatePublication({ ...fields, cover_image_url: image }),
  );
  assert.throws(() =>
    validatePublication({
      ...fields,
      content: {
        type: "doc",
        content: [{ type: "image", attrs: { src: image, alt: "" } }],
      },
    }),
  );
});
test("public static rendering escapes text and creates semantic safe media", () => {
  const html = renderToStaticMarkup(
    <ArticleRenderer
      content={{
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "<script>alert(1)</script>" }],
          },
          {
            type: "image",
            attrs: { src: image, alt: "اختبار", caption: "شرح الصورة" },
          },
          {
            type: "youtube",
            attrs: { src: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          },
        ],
      }}
    />,
  );
  assert.match(html, /<h2/);
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<figcaption>شرح الصورة<\/figcaption>/);
  assert.match(html, /youtube-nocookie.com\/embed\/dQw4w9WgXcQ/);
});
test("file signatures reject SVG or forged raster MIME", () => {
  assert.equal(
    imageFormat(new TextEncoder().encode("<svg>malicious</svg>")),
    null,
  );
  assert.equal(
    imageFormat(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]))
      ?.type,
    "image/png",
  );
});
