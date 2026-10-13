import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpLeft, BookOpen } from "lucide-react";
import { publicClient } from "@/lib/articles/server";
import { safeMedia } from "@/lib/articles/validation";
import { PublicArticleHeader } from "@/components/articles/public-header";
import { RefreshOnReturn } from "@/components/articles/refresh-on-return";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { pageNumber, type Publication } from "@/lib/articles/types";
import { buttonVariants } from "@/components/ui/button";
export const metadata: Metadata = {
  title: "مقالات نرفد | التقنية وإدارة المؤسسات الرياضية",
  description: "أفكار ورؤى من نرفد حول إدارة المؤسسات الرياضية والتحول الرقمي.",
  alternates: { canonical: "/articles" },
};
type Props = { searchParams: Promise<{ page?: string | string[] }> };
async function Library({ searchParams }: Props) {
  const page = pageNumber((await searchParams).page);
  const size = 12;
  const supabase = await publicClient();
  const { data, error, count } = await supabase
    .from("article_publications")
    .select(
      "id,title,slug,excerpt,cover_image_url,cover_image_alt,tags,author_name,published_at",
      { count: "exact" },
    )
    .order("published_at", { ascending: false })
    .range((page - 1) * size, page * size - 1);
  if (error) throw new Error("Article library unavailable");
  if (page > Math.max(1, Math.ceil((count ?? 0) / size)))
    redirect(`/articles?page=${Math.max(1, Math.ceil((count ?? 0) / size))}`);
  const articles = data as Publication[];
  return (
    <>
      <PublicArticleHeader />
      <RefreshOnReturn />
      <main className="articles-public container">
        <header className="articles-public-intro">
          <span className="section-kicker">من فريق نرفد</span>
          <h1>
            معرفة تدعم
            <br />
            <span>خطوتك القادمة.</span>
          </h1>
          <p>
            عن التقنية، وإدارة المؤسسات الرياضية، وما يساعد فريقك على العمل
            بصورة أفضل.
          </p>
        </header>
        {articles.length ? (
          <div className="articles-public-grid">
            {articles.map((article) => (
              <Link
                href={`/articles/${encodeURIComponent(article.slug)}`}
                key={article.id}
                className="article-public-card"
              >
                {safeMedia(article.cover_image_url) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={article.cover_image_url}
                    alt={article.cover_image_alt}
                    loading="lazy"
                  />
                ) : (
                  <div className="article-public-card-placeholder">
                    <BookOpen />
                  </div>
                )}
                <div>
                  <span>
                    {new Intl.DateTimeFormat("ar-SA", {
                      dateStyle: "medium",
                    }).format(new Date(article.published_at))}
                  </span>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>
                  <span className="article-read-link">
                    قراءة المقال <ArrowUpLeft />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen />
              </EmptyMedia>
              <EmptyTitle>مقالاتنا في الطريق.</EmptyTitle>
              <EmptyDescription>
                سنشارك هنا خبراتنا وأفكارنا مع مجتمع المؤسسات الرياضية.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/">اكتشف نرفد</Link>
            </EmptyContent>
          </Empty>
        )}
        {(count ?? 0) > size && (
          <nav className="article-pagination" aria-label="صفحات المقالات">
            {page > 1 && (
              <Link
                href={`/articles?page=${page - 1}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                السابق
              </Link>
            )}
            <span>صفحة {page}</span>
            {page * size < (count ?? 0) && (
              <Link
                href={`/articles?page=${page + 1}`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                التالي
              </Link>
            )}
          </nav>
        )}
      </main>
    </>
  );
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ تحميل المقالات…</p>
        </main>
      }
    >
      <Library {...props} />
    </Suspense>
  );
}
