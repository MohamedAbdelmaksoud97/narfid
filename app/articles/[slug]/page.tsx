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
const getArticle = cache(getPublication);
type Props = { params: Promise<{ slug: string }> };
function origin() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
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
      authors: [article.author_name],
      images,
      locale: article.direction === "rtl" ? "ar_SA" : "en_US",
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
    inLanguage: article.direction === "rtl" ? "ar" : "en",
    author: { "@type": "Organization", name: article.author_name },
    publisher: {
      "@type": "Organization",
      name: "نرفد",
      logo: {
        "@type": "ImageObject",
        url: new URL("/logo.png", origin()).href,
      },
    },
    mainEntityOfPage: new URL(
      `/articles/${encodeURIComponent(article.slug)}`,
      origin(),
    ).href,
    ...(safeMedia(article.cover_image_url)
      ? { image: new URL(article.cover_image_url, origin()).href }
      : {}),
  };
  const reading = Math.max(
    1,
    Math.ceil(documentText(article.content).trim().split(/\s+/u).length / 200),
  );
  return (
    <>
      <PublicArticleHeader />
      <RefreshOnReturn />
      <main className="article-public-page container">
        <Link href="/articles" className="article-back-link">
          كل المقالات
        </Link>
        <article
          dir={article.direction}
          lang={article.direction === "rtl" ? "ar" : "en"}
        >
          <header className="article-public-heading">
            <div className="article-public-meta">
              <span>{article.author_name}</span>
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
          {safeMedia(article.cover_image_url) && (
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="article-public-cover"
                src={article.cover_image_url}
                alt={article.cover_image_alt}
                fetchPriority="high"
              />
            </figure>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
          }}
        />
      </main>
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
