import Link from "next/link";
import type { ReactNode } from "react";
import { PublicArticleHeader } from "@/components/articles/public-header";
import { buttonVariants } from "@/components/ui/button";
import { breadcrumbSchema, structuredJson } from "@/lib/seo";
import { solutions } from "@/lib/solutions";
export function PublicPage({
  title,
  description,
  path,
  kicker = "السند التقني للمؤسسات الرياضية",
  children,
}: {
  title: string;
  description: string;
  path: string;
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <>
      <PublicArticleHeader />
      <main className="public-detail container">
        <nav className="public-breadcrumb" aria-label="مسار التنقل">
          <Link href="/">الرئيسية</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{title}</span>
        </nav>
        <header className="public-detail-heading">
          <span className="section-kicker">{kicker}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: structuredJson(
              breadcrumbSchema([
                { name: "الرئيسية", path: "/" },
                { name: title, path },
              ]),
            ),
          }}
        />
      </main>
      <PublicFooter />
    </>
  );
}
export function ContactCta({
  title = "خلّينا نفهم تشغيل مؤسستك.",
}: {
  title?: string;
}) {
  return (
    <section className="public-contact-cta">
      <div>
        <h2>{title}</h2>
        <p>
          اعرض علينا خدماتك وفروعك وطريقة عمل فريقك، لنناقش النطاق المناسب
          ونرتّب عرضًا توضيحيًا.
        </p>
      </div>
      <Link
        href="/contact"
        data-analytics="demo_request_start"
        className={buttonVariants({ size: "lg" })}
      >
        احجز عرضًا توضيحيًا
      </Link>
    </section>
  );
}
export function PublicFooter() {
  return (
    <footer className="public-footer container">
      <div>
        <strong>نرفد · narfid</strong>
        <p>السند التقني للمؤسسات الرياضية.</p>
      </div>
      <nav aria-label="روابط نرفد">
        {solutions.map((s) => (
          <Link key={s.slug} href={`/solutions/${s.slug}`}>
            {s.shortTitle}
          </Link>
        ))}
        <Link href="/pricing">الباقات</Link>
        <Link href="/technology-partnership">الشراكة التقنية</Link>
        <Link href="/about">عن نرفد</Link>
        <Link href="/contact">التواصل</Link>
        <Link href="/articles">المقالات</Link>
      </nav>
    </footer>
  );
}
