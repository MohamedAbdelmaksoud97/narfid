import type { Metadata } from "next";
import { Suspense } from "react";
import { pageNumber } from "@/lib/articles/types";
import { pageMetadata } from "@/lib/seo";
import { PublicArticleLibrary } from "@/components/articles/public-library";
type Props = { searchParams: Promise<{ page?: string | string[] }> };
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const page = pageNumber((await searchParams).page);
  return pageMetadata(
    `مقالات إدارة المؤسسات الرياضية${page > 1 ? ` — صفحة ${page}` : ""}`,
    "أدلة عملية من فريق نرفد لإدارة الاشتراكات والحجوزات ونقاط البيع والوجبات والمخزون والفروع واختيار النظام المناسب.",
    page > 1 ? `/articles?page=${page}` : "/articles",
  );
}
async function Library({ searchParams }: Props) {
  return <PublicArticleLibrary page={pageNumber((await searchParams).page)} />;
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
