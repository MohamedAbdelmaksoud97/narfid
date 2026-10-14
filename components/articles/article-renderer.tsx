import { createElement } from "react";
import { renderToReactElement } from "@tiptap/static-renderer/pm/react";
import type { JSONContent } from "@tiptap/core";
import { articleExtensions } from "@/lib/articles/extensions";
import { articleHeadings } from "@/lib/articles/editorial";
import { imageSrcSet, imageVariant } from "@/lib/articles/media";
import {
  validateDocument,
  youtubeSafeLink,
} from "@/lib/articles/renderer-safety";

export function ArticleRenderer({
  content,
  direction = "rtl",
}: {
  content: JSONContent;
  direction?: "rtl" | "ltr";
}) {
  // Revalidate on read too: direct database writes cannot turn into executable HTML.
  let safe: JSONContent;
  try {
    safe = validateDocument(content);
  } catch {
    return <p role="alert">تعذر عرض محتوى المقال بصيغته الحالية.</p>;
  }
  const headings = articleHeadings(safe);
  let headingIndex = 0;
  const element = renderToReactElement({
    content: safe,
    extensions: articleExtensions(),
    staticEditorOptions: { textDirection: "auto" },
    options: {
      nodeMapping: {
        heading: ({ node, children }) =>
          createElement(
            `h${Math.min(Number(node.attrs.level) + 1, 6)}`,
            {
              id: headings[headingIndex++]?.id,
              dir: node.attrs.dir,
              style: { textAlign: node.attrs.textAlign ?? undefined },
            },
            children,
          ),
        image: ({ node }) => (
          <figure
            className="article-figure"
            data-align={node.attrs.textAlign}
            data-layout={node.attrs.layout ?? "block"}
            style={
              node.attrs.layout === "wrap"
                ? { width: node.attrs.width ?? undefined }
                : undefined
            }
          >
            {/* Authenticated drafts need browser cookies; the Next image optimizer cannot forward them. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageVariant(node.attrs.src, 960)}
              srcSet={imageSrcSet(node.attrs.src)}
              sizes="(max-width: 700px) calc(100vw - 40px), 860px"
              alt={node.attrs.alt ?? ""}
              width={node.attrs.width ?? undefined}
              height={node.attrs.height ?? undefined}
              loading="lazy"
              decoding="async"
            />
            {node.attrs.caption && (
              <figcaption>{node.attrs.caption}</figcaption>
            )}
          </figure>
        ),
        youtube: ({ node }) => (
          <div className="article-video">
            <iframe
              src={youtubeSafeLink(node.attrs.src)}
              title="فيديو مرفق بالمقال"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ),
        table: ({ node, children }) => {
          const widths: Array<number | null> = [];
          node.firstChild?.forEach((cell) => {
            for (let col = 0; col < cell.attrs.colspan; col++)
              widths.push(cell.attrs.colwidth?.[col] ?? null);
          });
          return (
            <div
              className="article-table-wrap"
              role="region"
              aria-label="جدول المقال"
              tabIndex={0}
            >
              <table>
                <colgroup>
                  {widths.map((width, index) => (
                    <col key={index} style={width ? { width } : undefined} />
                  ))}
                </colgroup>
                <tbody>{children}</tbody>
              </table>
            </div>
          );
        },
        taskItem: ({ node, children }) => (
          <li className="article-task" data-checked={node.attrs.checked}>
            <span aria-label={node.attrs.checked ? "مكتمل" : "غير مكتمل"}>
              {node.attrs.checked ? "☑" : "☐"}
            </span>
            <div>{children}</div>
          </li>
        ),
      },
      markMapping: {
        link: ({ mark, children }) => (
          <a
            href={mark.attrs.href}
            target={
              String(mark.attrs.href).startsWith("/") ||
              String(mark.attrs.href).startsWith("#")
                ? undefined
                : "_blank"
            }
            rel={
              String(mark.attrs.href).startsWith("/") ||
              String(mark.attrs.href).startsWith("#")
                ? undefined
                : "noopener noreferrer"
            }
          >
            {children}
          </a>
        ),
      },
    },
  });
  return (
    <div className="article-prose" dir={direction}>
      {element}
    </div>
  );
}
