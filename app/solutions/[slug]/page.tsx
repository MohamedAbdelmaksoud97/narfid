import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { solutions, solutionBySlug } from "@/lib/solutions";
import { pageMetadata } from "@/lib/seo";
import { PublicPage, ContactCta } from "@/components/public/public-page";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { RelatedArticles } from "@/components/articles/related-articles";
import { SolutionOperatingGuides } from "@/components/articles/solution-operating-guides";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({ params }: Props) {
  const s = solutionBySlug((await params).slug);
  if (!s) notFound();
  return pageMetadata(s.title, s.description, `/solutions/${s.slug}`);
}
async function SolutionContent({ params }: Props) {
  const s = solutionBySlug((await params).slug);
  if (!s) notFound();
  return (
    <PublicPage
      title={s.title}
      description={s.description}
      path={`/solutions/${s.slug}`}
      kicker="حلول نرفد"
    >
      <p className="public-lead">{s.intro}</p>
      <div className="public-feature-sections">
        {s.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
      </div>
      <section className="public-checklist">
        <h2>أسئلة نراجعها معك في العرض</h2>
        <ul>
          {s.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <Suspense fallback={null}>
        <SolutionOperatingGuides solution={s.slug} />
      </Suspense>
      <Alert>
        <AlertTitle>نطاق واضح قبل الاتفاق</AlertTitle>
        <AlertDescription>{s.limit}</AlertDescription>
      </Alert>
      <section className="public-plan-note">
        <h2>اختيار الباقة</h2>
        <p>
          {s.plan}{" "}
          <Link href="/pricing">راجع الباقات السنوية ونطاق كل باقة.</Link>
        </p>
      </section>
      <Suspense fallback={null}>
        <RelatedArticles solution={s.slug} />
      </Suspense>
      <ContactCta />
    </PublicPage>
  );
}

export default function SolutionPage(props: Props) {
  return (
    <Suspense fallback={<main className="board-loading-page"><p role="status">جارٍ تحميل الحل…</p></main>}>
      <SolutionContent {...props} />
    </Suspense>
  );
}
