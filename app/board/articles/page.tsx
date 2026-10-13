import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { requireArticleSession } from "@/lib/articles/server";
import { ArticleError } from "@/lib/articles/validation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { NewArticleButton } from "@/components/articles/new-article-button";
import { RefreshOnReturn } from "@/components/articles/refresh-on-return";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { pageNumber, type Article } from "@/lib/articles/types";
export const metadata: Metadata = {
  title: "المقالات | مجلس إدارة نرفد",
  robots: { index: false, follow: false },
};
type Props = { searchParams: Promise<{ page?: string | string[] }> };
async function Workspace({ searchParams }: Props) {
  const { supabase } = await requireArticleSession();
  const page = pageNumber((await searchParams).page);
  const size = 20;
  const { data, error, count } = await supabase
    .from("articles")
    .select(
      "id,title,slug,status,revision,published_revision,updated_at,author_name",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range((page - 1) * size, page * size - 1);
  if (error) throw new ArticleError("تعذر تحميل المقالات. حاول مرة أخرى.", 503);
  if (page > Math.max(1, Math.ceil((count ?? 0) / size)))
    redirect(
      `/board/articles?page=${Math.max(1, Math.ceil((count ?? 0) / size))}`,
    );
  const articles = data as Article[];
  return (
    <main className="articles-manager container">
      <RefreshOnReturn />
      <header className="articles-manager-header">
        <div>
          <Link href="/board" className="article-back-link">
            <ArrowRight />
            مجلس الإدارة
          </Link>
          <span className="section-kicker">محتوى نرفد</span>
          <h1>المقالات</h1>
          <p>
            من أول فكرة إلى مقال منشور. مسودات الفريق وتحديثاته في مكان واحد.
          </p>
        </div>
        <NewArticleButton />
      </header>
      <div className="articles-manager-summary">
        <span>{count ?? articles.length} مقال</span>
        <Link
          href="/articles"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          زيارة مكتبة المقالات
        </Link>
      </div>
      {articles.length ? (
        <div className="article-list">
          {articles.map((article) => (
            <Link
              href={`/board/articles/${article.id}/edit`}
              className="article-list-item"
              key={article.id}
            >
              <span className="article-list-icon">
                <FileText />
              </span>
              <div>
                <h2>{article.title || "مسودة بدون عنوان"}</h2>
                <p>
                  {article.author_name} · آخر تعديل{" "}
                  {new Intl.DateTimeFormat("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(article.updated_at))}
                </p>
              </div>
              <Badge
                variant={
                  article.status === "published" ? "default" : "secondary"
                }
              >
                {article.status === "published" ? "منشور" : "مسودة"}
              </Badge>
              {article.status === "published" &&
                article.revision !== article.published_revision && (
                  <Badge variant="outline">تعديلات غير منشورة</Badge>
                )}
            </Link>
          ))}
        </div>
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>هنا تبدأ قصص نرفد.</EmptyTitle>
            <EmptyDescription>
              أنشئ أول مسودة واكتب عن التقنية وإدارة المؤسسات الرياضية.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <NewArticleButton />
          </EmptyContent>
        </Empty>
      )}
      {(count ?? 0) > size && (
        <nav className="article-pagination" aria-label="صفحات المقالات">
          {page > 1 && (
            <Link
              href={`/board/articles?page=${page - 1}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              السابق
            </Link>
          )}
          <span>صفحة {page}</span>
          {page * size < (count ?? 0) && (
            <Link
              href={`/board/articles?page=${page + 1}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              التالي
            </Link>
          )}
        </nav>
      )}
    </main>
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
      <Workspace {...props} />
    </Suspense>
  );
}
