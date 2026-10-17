import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpLeft, BookOpen } from "lucide-react";
import { publicClient } from "@/lib/articles/server";
import { imageSrcSet, imageVariant } from "@/lib/articles/media";
import { safeMedia } from "@/lib/articles/validation";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

function ArticlesPlaceholder({
  unavailable = false,
}: {
  unavailable?: boolean;
}) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpen />
        </EmptyMedia>
        <EmptyTitle>
          {unavailable
            ? "تعذّر تحميل أحدث المقالات الآن."
            : "مقالاتنا في الطريق."}
        </EmptyTitle>
        <EmptyDescription>
          {unavailable
            ? "يمكنك المحاولة مرة أخرى أو الانتقال إلى مكتبة المقالات."
            : "سنشارك هنا أدلة وأفكارًا تساعدك في إدارة مؤسستك الرياضية."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function ArticlesLoading() {
  return (
    <div
      className="landing-articles-grid"
      role="status"
      aria-label="جارٍ تحميل أحدث المقالات"
    >
      {[1, 2, 3].map((item) => (
        <div key={item} className="landing-article-loading" aria-hidden="true">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

async function LatestArticleCards() {
  const client = await publicClient();
  const { data, error } = await client
    .from("article_publications")
    .select(
      "id,title,slug,excerpt,cover_image_url,cover_image_alt,cover_image_width,cover_image_height,tags,published_at",
    )
    .order("published_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(3);

  if (error) return <ArticlesPlaceholder unavailable />;
  if (!data?.length) return <ArticlesPlaceholder />;

  return (
    <div className="landing-articles-grid">
      {data.map((article) => (
        <article key={article.id}>
          <Link
            href={`/articles/${encodeURIComponent(article.slug)}`}
            className="landing-article-link"
          >
            <Card className="landing-article-card">
              {safeMedia(article.cover_image_url) ? (
                /* Reuse the protected article image variants, including their publication checks. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={imageVariant(article.cover_image_url!, 640)}
                  srcSet={imageSrcSet(article.cover_image_url!)}
                  sizes="(max-width: 719px) calc(100vw - 40px), (max-width: 959px) 45vw, 400px"
                  width={article.cover_image_width ?? 640}
                  height={article.cover_image_height ?? 400}
                  alt={article.cover_image_alt}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className="landing-article-cover-placeholder"
                  aria-hidden="true"
                >
                  <BookOpen />
                </div>
              )}
              <CardHeader>
                <CardDescription className="landing-article-meta">
                  <time dateTime={article.published_at}>
                    {new Intl.DateTimeFormat("ar-SA", {
                      dateStyle: "medium",
                      timeZone: "Asia/Riyadh",
                    }).format(new Date(article.published_at))}
                  </time>
                  {article.tags?.[0] && (
                    <Badge variant="secondary">{article.tags[0]}</Badge>
                  )}
                </CardDescription>
                <CardTitle as="h3">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="landing-article-excerpt">{article.excerpt}</p>
              </CardContent>
              <CardFooter>
                <span className="landing-article-read">
                  قراءة المقال
                  <ArrowUpLeft aria-hidden="true" />
                </span>
              </CardFooter>
            </Card>
          </Link>
        </article>
      ))}
    </div>
  );
}

export function LandingArticles() {
  return (
    <section
      id="insights"
      className="landing-articles container section-space"
      aria-labelledby="landing-articles-heading"
    >
      <div className="section-heading landing-articles-heading">
        <div>
          <p className="section-kicker">من مكتبة نرفد</p>
          <h2 id="landing-articles-heading">
            معرفة ترفد <span>خطوتك القادمة.</span>
          </h2>
          <p>
            أدلة عملية عن الاشتراكات والحجوزات والتقنية، تساعدك في إدارة مؤسستك
            الرياضية.
          </p>
        </div>
        <Link
          href="/articles"
          className={buttonVariants({ variant: "outline", size: "marketing" })}
        >
          جميع المقالات
          <ArrowUpLeft data-icon="inline-end" />
        </Link>
      </div>
      <Suspense fallback={<ArticlesLoading />}>
        <LatestArticleCards />
      </Suspense>
    </section>
  );
}
