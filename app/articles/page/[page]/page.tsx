import { Suspense } from "react";
import { PublicArticleLibrary } from "@/components/articles/public-library";
import { publishedArticleSlugs } from "@/lib/articles/server";
import { pageMetadata } from "@/lib/seo";
import { pageNumber } from "@/lib/articles/types";

type Props = { params: Promise<{ page: string }> };
export async function generateStaticParams() {
  const count = (await publishedArticleSlugs()).length;
  return Array.from({ length: Math.max(1, Math.ceil(count / 12)) }, (_, i) => ({ page: String(i + 1) }));
}
export async function generateMetadata({ params }: Props) {
  const page = pageNumber((await params).page);
  return pageMetadata(
    `مقالات إدارة المؤسسات الرياضية${page > 1 ? ` — صفحة ${page}` : ""}`,
    "أدلة عملية من فريق نرفد لإدارة الاشتراكات والحجوزات ونقاط البيع والوجبات والمخزون والفروع واختيار النظام المناسب.",
    page > 1 ? `/articles?page=${page}` : "/articles",
  );
}
async function Library({ params }: Props) {
  return <PublicArticleLibrary page={pageNumber((await params).page)} />;
}
export default function Page(props: Props) {
  return <Suspense fallback={<main className="board-loading-page"><p role="status">جارٍ تحميل المقالات…</p></main>}><Library {...props} /></Suspense>;
}
