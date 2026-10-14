import type { Metadata } from "next";
import { Suspense, cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublication } from "@/lib/articles/server";
import { documentText } from "@/lib/articles/types";
import { safeMedia } from "@/lib/articles/validation";
import { PublicArticleHeader } from "@/components/articles/public-header";
import { ArticleRenderer } from "@/components/articles/article-renderer";
import { RefreshOnReturn } from "@/components/articles/refresh-on-return";
import {
  absoluteUrl,
  publicAuthor,
  breadcrumbSchema,
  structuredJson,
} from "@/lib/seo";
import { articleHeadings } from "@/lib/articles/editorial";
import { imageSrcSet, imageVariant } from "@/lib/articles/media";
import { RelatedArticles } from "@/components/articles/related-articles";
import { ContactCta, PublicFooter } from "@/components/public/public-page";
import { solutionBySlug } from "@/lib/solutions";
const getArticle = cache(getPublication);
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const url = `/articles/${encodeURIComponent(article.slug)}`;
  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt;
  const images = safeMedia(article.cover_image_url)
    ? [{ url: article.cover_image_url, alt: article.cover_image_alt }]
    : [{ url: "/logo.png", alt: "نرفد" }];
  return {
    title: `${title} | نرفد`,
    description,
    alternates: { canonical: url },
    keywords: article.tags,
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [absoluteUrl(publicAuthor.path)],
      images,
      locale: "ar_SA",
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
async function PublishedArticle({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const structured = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    inLanguage: "ar",
    author: {
      "@type": "Organization",
      name: publicAuthor.name,
      url: absoluteUrl(publicAuthor.path),
    },
    publisher: {
      "@type": "Organization",
      name: "نرفد",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: absoluteUrl(
      `/articles/${encodeURIComponent(article.slug)}`,
    ),
    ...(safeMedia(article.cover_image_url)
      ? { image: absoluteUrl(article.cover_image_url) }
      : {}),
  };
  const reading = Math.max(
    1,
    Math.ceil(documentText(article.content).trim().split(/\s+/u).length / 200),
  );
  const headings = articleHeadings(article.content);
  const solution = solutionBySlug(article.related_solution);
  const coverInBody = article.content.content
    ?.slice(0, 2)
    .some(
      (node) =>
        node.type === "image" && node.attrs?.src === article.cover_image_url,
    );
  return (
    <>
      <PublicArticleHeader />
      <RefreshOnReturn />
      <main className="article-public-page container">
        <Link href="/articles" className="article-back-link">
          كل المقالات
        </Link>
        <article dir={article.direction}>
          <header className="article-public-heading">
            <div className="article-public-meta">
              <Link href={publicAuthor.path}>{publicAuthor.name}</Link>
              <time dateTime={article.published_at}>
                {new Intl.DateTimeFormat(
                  article.direction === "rtl" ? "ar-SA" : "en",
                  { dateStyle: "long" },
                ).format(new Date(article.published_at))}
              </time>
              <span>
                {reading}{" "}
                {article.direction === "rtl" ? "دقائق قراءة" : "min read"}
              </span>
            </div>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>
          </header>
          {safeMedia(article.cover_image_url) && !coverInBody && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="article-public-cover"
                src={imageVariant(article.cover_image_url, 1440)}
                srcSet={imageSrcSet(article.cover_image_url)}
                sizes="(max-width: 700px) calc(100vw - 40px), 860px"
                width={article.cover_image_width ?? undefined}
                height={article.cover_image_height ?? undefined}
                alt={article.cover_image_alt}
                fetchPriority="high"
              />
            </figure>
          )}
          {headings.length > 1 && (
            <nav className="article-toc" aria-label="محتويات المقال">
              <h2>في هذا المقال</h2>
              <ol>
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <ArticleRenderer
            content={article.content}
            direction={article.direction}
          />
          {article.tags.length > 0 && (
            <footer className="article-public-tags" aria-label="وسوم المقال">
              {article.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </footer>
          )}
        </article>
        {solution && (
          <section className="article-solution-link">
            <h2>من المعرفة إلى التشغيل</h2>
            <p>{solution.description}</p>
            <Link href={`/solutions/${solution.slug}`}>
              اكتشف حل {solution.shortTitle} من نرفد ←
            </Link>
          </section>
        )}
        <RelatedArticles
          solution={article.related_solution}
          exclude={article.id}
        />
        <ContactCta />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredJson([
              structured,
              breadcrumbSchema([
                { name: "الرئيسية", path: "/" },
                { name: "المقالات", path: "/articles" },
                {
                  name: article.title,
                  path: `/articles/${encodeURIComponent(article.slug)}`,
                },
              ]),
            ]),
          }}
        />
      </main>
      <PublicFooter />
    </>
  );
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ تحميل المقال…</p>
        </main>
      }
    >
      <PublishedArticle {...props} />
    </Suspense>
  );
}
