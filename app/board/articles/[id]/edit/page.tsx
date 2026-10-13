import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  categories,
  loadArticle,
  requireArticleSession,
} from "@/lib/articles/server";
import { UUID_RE } from "@/lib/articles/types";
import { ArticleEditor } from "@/components/articles/article-editor";
export const metadata: Metadata = {
  title: "محرر المقالات | نرفد",
  robots: { index: false, follow: false },
};
type Props = { params: Promise<{ id: string }> };
async function EditorPage({ params }: Props) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase } = await requireArticleSession();
  const [article, items] = await Promise.all([
    loadArticle(id, supabase),
    categories(supabase),
  ]);
  if (!article) notFound();
  return <ArticleEditor key={article.id} initial={article} categories={items} />;
}
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ فتح المسودة…</p>
        </main>
      }
    >
      <EditorPage {...props} />
    </Suspense>
  );
}
