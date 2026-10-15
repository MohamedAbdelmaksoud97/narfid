import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { requireMarketingAccess } from "@/lib/marketing/server";
import {
  marketingReviewedAt,
  marketingSections,
  marketingSources,
} from "@/lib/marketing/strategy";
import { BrandSectionNavigation } from "@/components/brand/section-navigation";
import {
  AllPostsDownload,
  MarketingNavigation,
  MarketingSources,
  PlatformCards,
} from "@/components/board/marketing/marketing-shared";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "التسويق | مجلس إدارة نرفد",
  robots: { index: false, follow: false },
};
async function Workspace() {
  await requireMarketingAccess();
  return (
    <main className="brand-guide marketing-guide">
      <header className="marketing-hero container">
        <div className="marketing-meta">
          <Badge variant="secondary">دليل التنفيذ للفريق</Badge>
          <span>مراجعة: {marketingReviewedAt}</span>
        </div>
        <span className="section-kicker">تسويق يفهم تشغيل المؤسسة</span>
        <h1>
          نرفد أقرب.
          <br />
          <span>والخطوة التالية أوضح.</span>
        </h1>
        <p>
          تصور متكامل للوصول إلى المؤسسات الرياضية في السعودية، وبناء الثقة،
          وتحويل الاهتمام إلى عروض وعلاقات تستمر.
        </p>
        <div className="marketing-hero-actions">
          <Link
            href="/board/marketing/social"
            className={buttonVariants({ size: "navigation" })}
          >
            افتح السوشيال ميديا <ArrowUpLeft data-icon="inline-end" />
          </Link>
          <Link
            href="/board/tasks"
            className={buttonVariants({
              variant: "outline",
              size: "navigation",
            })}
          >
            متابعة مهام التنفيذ
          </Link>
        </div>
      </header>
      <div className="container">
        <MarketingNavigation active="strategy" />
        <div className="marketing-stats">
          <div>
            <strong>٩٠ يومًا</strong>
            <span>خطة إطلاق وتعلّم مقترحة</span>
          </div>
          <div>
            <strong>٤ منصات</strong>
            <span>دور ومحتوى مستقل لكل منصة</span>
          </div>
          <div>
            <strong>١٢٠ صورة</strong>
            <span>بمقاسات فعلية ونصوص مرافقة</span>
          </div>
          <div>
            <strong>القياس لاحقًا</strong>
            <span>بعد ربط الحسابات والأدوات</span>
          </div>
        </div>
        <PlatformCards />
      </div>
      <div className="marketing-guide-layout container">
        <aside className="brand-guide-index marketing-guide-index">
          <p>دليل التسويق</p>
          <BrandSectionNavigation
            sections={[
              ...marketingSections,
              { id: "sources", label: "المراجع" },
            ]}
            label="فصول خطة التسويق"
          />
        </aside>
        <div className="marketing-chapters">
          {marketingSections.map((section, index) => (
            <section
              className="marketing-chapter"
              id={section.id}
              key={section.id}
              aria-labelledby={`${section.id}-heading`}
            >
              <header>
                <span className="section-kicker">
                  {String(index + 1).padStart(2, "0")} / {section.label}
                </span>
                <h2 id={`${section.id}-heading`}>{section.title}</h2>
                <p>{section.intro}</p>
              </header>
              <div className="marketing-chapter-items">
                {section.items.map((item) => (
                  <article key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
              {section.id === "market" && (
                <a
                  className="marketing-source-link"
                  href={marketingSources[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  المصدر: هيئة الاتصالات — تقرير إنترنت السعودية 2025 ↗
                </a>
              )}
            </section>
          ))}
          <MarketingSources />
          <AllPostsDownload />
        </div>
      </div>
    </main>
  );
}
export default function MarketingPage() {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ فتح خطة التسويق…</p>
        </main>
      }
    >
      <Workspace />
    </Suspense>
  );
}
