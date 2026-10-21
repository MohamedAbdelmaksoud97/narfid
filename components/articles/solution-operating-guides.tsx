import Link from "next/link";
import { publicClient } from "@/lib/articles/server";
import { solutionOperatingGuides } from "@/lib/solutions";

export async function SolutionOperatingGuides({ solution }: { solution: string }) {
  const guide = solutionOperatingGuides[solution];
  if (!guide) return null;
  const client = await publicClient();
  const { data, error } = await client.from("article_publications").select("id,slug,title").in("slug", guide.articles);
  return <section className="public-checklist">
    <h2>{guide.question}</h2><p>{guide.text}</p>
    {!error && Boolean(data?.length) && <ul>{guide.articles.map((slug) => {
      const article = data?.find((a) => a.slug === slug);
      return article ? <li key={article.id}><Link href={`/articles/${encodeURIComponent(article.slug)}`}>{article.title}</Link></li> : null;
    })}</ul>}
  </section>;
}
