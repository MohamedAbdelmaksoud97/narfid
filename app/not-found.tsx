import Link from "next/link";
import { PublicArticleHeader } from "@/components/articles/public-header";
export default function NotFound() {
  return (
    <>
      <PublicArticleHeader />
      <main className="public-detail container">
        <span className="section-kicker">404</span>
        <h1>الصفحة غير متاحة.</h1>
        <p>قد يكون الرابط غير صحيح أو أُلغي نشر المحتوى.</p>
        <Link href="/articles">تصفح المقالات المنشورة</Link>
      </main>
    </>
  );
}
