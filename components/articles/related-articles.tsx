import Link from "next/link";
import { publicClient } from "@/lib/articles/server";
export async function RelatedArticles({
  solution,
  exclude,
}: {
  solution?: string | null;
  exclude?: string;
}) {
  const client = await publicClient();
  let query = client
    .from("article_publications")
    .select("id,slug,title,excerpt")
    .order("published_at", { ascending: false })
    .limit(3);
  if (exclude) query = query.neq("id", exclude);
  if (solution) query = query.eq("related_solution", solution);
  const { data, error } = await query;
  if (error || !data?.length) return null;
  return (
    <section
      className="article-related"
      aria-labelledby="related-articles-heading"
    >
      <h2 id="related-articles-heading">قراءات تساعدك في الخطوة التالية</h2>
      <div className="article-related-grid">
        {data.map((a) => (
          <Link key={a.id} href={`/articles/${encodeURIComponent(a.slug)}`}>
            <h3>{a.title}</h3>
            <p>{a.excerpt}</p>
            <span>اقرأ المقال ←</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
