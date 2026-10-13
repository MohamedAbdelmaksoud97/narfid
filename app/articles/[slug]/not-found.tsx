import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
export default function ArticleNotFound() {
  return (
    <main className="articles-manager container">
      <h1>المقال غير متاح</h1>
      <p>قد يكون رابط المقال تغير أو تم إلغاء نشره.</p>
      <Link href="/articles" className={buttonVariants({ variant: "outline" })}>
        العودة إلى المقالات
      </Link>
    </main>
  );
}
