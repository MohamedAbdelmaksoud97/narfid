import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpLeft, BookOpen, Search, ShieldCheck } from "lucide-react";
import { requireBoardMember } from "@/lib/auth/session";
import { BrandSectionNavigation } from "@/components/brand/section-navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  seoAudit,
  seoReviewedAt,
  seoRoadmap,
  seoSections,
  seoSources,
  seoTools,
  seoNextActions,
} from "@/lib/seo-guide";
import { requireArticleSession } from "@/lib/articles/server";
import { indexingEnabled } from "@/lib/seo";
import { campaignBriefs } from "@/lib/seo-campaign";
import { KeywordRegister, CampaignArticles } from "@/components/seo/campaign-register";

export const metadata: Metadata = {
  title: "تحسين الظهور في البحث | مجلس الإدارة",
  robots: { index: false, follow: false },
};

function SourceLinks({ ids }: { ids: readonly string[] }) {
  if (!ids.length) return null;
  return (
    <p className="seo-source-links">
      مرجع الخطوة:{" "}
      {seoSources
        .filter((source) => ids.includes(source.id))
        .map((source) => (
          <a
            key={source.id}
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.title}
          </a>
        ))}
    </p>
  );
}

function GuideSection({
  section,
  index,
  children,
}: {
  section: (typeof seoSections)[number];
  index: number;
  children?: ReactNode;
}) {
  return (
    <section
      id={section.id}
      className="brand-guide-section"
      aria-labelledby={`${section.id}-heading`}
    >
      <header className="brand-section-heading">
        <span className="section-kicker">
          <span dir="ltr">{String(index + 1).padStart(2, "0")}</span> /{" "}
          {section.label}
        </span>
        <h2 id={`${section.id}-heading`}>{section.title}</h2>
        <p>{section.intro}</p>
      </header>
      {children}
      {section.items.length > 0 && (
        <ol className="seo-action-list">
          {section.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      )}
      <SourceLinks ids={section.sources} />
    </section>
  );
}

async function SeoWorkspace() {
  await requireBoardMember();
  const { supabase } = await requireArticleSession();
  const [published, reviews, campaignDrafts, campaignPublications] = await Promise.all([
    supabase
      .from("article_publications")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("id,title,review_due_at")
      .eq("status", "published")
      .not("review_due_at", "is", null)
      .order("review_due_at")
      .limit(100),
    supabase.from("articles").select("id,title,slug,revision").in("id", campaignBriefs.map((b) => b.id)),
    supabase.from("article_publications").select("id,title,slug,revision").in("id", campaignBriefs.map((b) => b.id)),
  ]);
  return (
    <main className="seo-guide brand-guide">
      <header className="brand-guide-hero container">
        <div className="brand-guide-meta">
          <Badge variant="secondary">
            <ShieldCheck data-icon="inline-start" /> دليل الفريق
          </Badge>
          <span>مراجعة المرجع: {seoReviewedAt}</span>
        </div>
        <span className="section-kicker">تحسين الظهور في البحث</span>
        <h1>
          معرفة تصل.
          <br />
          <span>وعملاء يجدون نرفد.</span>
        </h1>
        <p>
          خطة عملية لفهم SEO، وتطوير الموقع والمقالات، ومتابعة النتائج خطوة
          بخطوة في السوق السعودي.
        </p>
        <div className="brand-guide-hero-bottom">
          <p>ابدأ بالتجهيز، ثم المحتوى، ثم التحسين المستمر.</p>
          <Link
            href="/board/articles"
            className={buttonVariants({
              variant: "outline",
              size: "navigation",
            })}
          >
            إلى مساحة المقالات <ArrowUpLeft data-icon="inline-end" />
          </Link>
        </div>
      </header>
      <div className="container">
        <Alert>
          <Search />
          <AlertTitle>
            مرحلتنا الحالية: الأساس والمحتوى مجهزان — ننتظر الإطلاق
          </AlertTitle>
          <AlertDescription>
            سجل بحث يضم 50 عبارة وحملة من 20 مقالًا إضافيًا، مع الحفاظ على المحتوى السابق.
            حالات النشر والأعداد أدناه من قاعدة البيانات. نتائج بحث الويب موثقة؛
            ترتيب Google السعودية وحجم الطلب لم يُتحقق منهما. الإطلاق وربط Google
            والقياس الفعلي ما زالت خطوات مطلوبة.
          </AlertDescription>
        </Alert>
        <div className="seo-status-grid">
          <Card>
            <CardHeader>
              <CardDescription>المقالات المنشورة الآن</CardDescription>
              <CardTitle>
                {published.error
                  ? "تعذر التحقق"
                  : `${published.count ?? 0} مقالات`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>قراءة مباشرة من النسخ العامة في قاعدة البيانات.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>إعداد الفهرسة</CardDescription>
              <CardTitle>
                {indexingEnabled() ? "مفعّلة في الإعداد" : "محجوبة قبل الإطلاق"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>تفعيل الإعداد يسمح بالزحف؛ لا يثبت إدراج الصفحات في Google.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Search Console وGA4</CardDescription>
              <CardTitle>البيانات غير متاحة</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                لا حسابات مربوطة بتقارير حية. نحتاج الدومين وإثبات الملكية
                ومعرّف القياس.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="brand-guide-layout container">
        <aside className="brand-guide-index">
          <p>في هذا الدليل</p>
          <BrandSectionNavigation
            sections={seoSections}
            label="أقسام تحسين الظهور في البحث"
          />
          <span>
            الهدف: طلبات عروض مؤهلة من المؤسسات الرياضية، ومحتوى يساعد صاحب
            القرار فعلًا.
          </span>
        </aside>
        <div className="brand-guide-content">
          {seoSections.map((section, index) => (
            <GuideSection section={section} index={index} key={section.id}>
              {section.id === "seo-start" && (
                <div className="brand-grid brand-grid-two">
                  {seoAudit.map((finding) => (
                    <Card key={finding.title}>
                      <CardHeader>
                        <CardDescription>{finding.state}</CardDescription>
                        <CardTitle>{finding.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{finding.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              {section.id === "seo-roadmap" && (
                <>
                  <h3>الخطوات القادمة بالترتيب</h3>
                  <ol className="seo-action-list">
                    {seoNextActions.map((action) => (
                      <li key={action.title}>
                        <h3>{action.title}</h3>
                        <p>{action.text}</p>
                      </li>
                    ))}
                  </ol>
                  <div className="brand-grid brand-grid-two">
                    {seoRoadmap.map((phase) => (
                      <Card key={phase.period}>
                        <CardHeader>
                          <CardDescription>{phase.period}</CardDescription>
                          <CardTitle>{phase.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="seo-owner">المسؤول: {phase.owner}</p>
                          <ul className="seo-bullets">
                            {phase.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ul>
                        </CardContent>
                        <CardFooter>
                          <p>مخرج المرحلة: {phase.done}</p>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </>
              )}
              {section.id === "seo-topics" && <KeywordRegister />}
              {section.id === "seo-calendar" && (
                <>
                  <CampaignArticles drafts={campaignDrafts.data ?? []} publications={campaignPublications.data ?? []} error={Boolean(campaignDrafts.error || campaignPublications.error)} />
                  <h3>مواعيد مراجعة المقالات المنشورة</h3>
                  {reviews.error ? (
                    <p>تعذر تحميل مواعيد المراجعة.</p>
                  ) : (
                    <ul className="seo-review-list">
                      {reviews.data?.map((article) => (
                        <li key={article.id}>
                          <Link href={`/board/articles/${article.id}/edit`}>
                            {article.title}
                          </Link>{" "}
                          ·{" "}
                          <time dateTime={article.review_due_at}>
                            {new Intl.DateTimeFormat("ar-SA", {
                              dateStyle: "medium",
                            }).format(
                              new Date(article.review_due_at + "T12:00:00Z"),
                            )}
                          </time>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p>
                    راجع هذه المواعيد عند تغيير المنتج أو المعلومات، حتى لو لم
                    يصل موعد المراجعة. راجع ما نُشر وبيانات البحث قبل إنشاء مقال جديد.
                  </p>
                </>
              )}
              {section.id === "seo-tools" && (
                <div className="seo-tool-links">
                  {seoTools.map((tool) => (
                    <a
                      key={tool.href}
                      href={tool.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: "outline",
                        size: "navigation",
                      })}
                    >
                      {tool.title} <ArrowUpLeft data-icon="inline-end" />
                    </a>
                  ))}
                </div>
              )}
            </GuideSection>
          ))}
        </div>
      </div>
      <footer className="brand-guide-footer container">
        <span>
          مرجع نرفد — تُراجع الأولويات بعد الإطلاق وبناء خط أساس حقيقي.
        </span>
        <Link href="/board/articles">
          <BookOpen aria-hidden="true" /> ابدأ من مقالات نرفد
        </Link>
      </footer>
    </main>
  );
}

export default function SeoPage() {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ فتح دليل تحسين البحث…</p>
        </main>
      }
    >
      <SeoWorkspace />
    </Suspense>
  );
}
