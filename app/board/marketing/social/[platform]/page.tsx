import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { requireMarketingAccess } from "@/lib/marketing/server";
import {
  findPlatform,
  postsFor,
  socialPlatforms,
} from "@/lib/marketing/social";
import { MarketingNavigation } from "@/components/board/marketing/marketing-shared";
import { SocialLibrary } from "@/components/board/marketing/social-library";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ platform: string }> };
export function generateStaticParams() {
  return socialPlatforms.map(({ id }) => ({ platform: id }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const platform = findPlatform((await params).platform);
  return {
    title: `${platform?.name ?? "المنصة"} | تسويق نرفد`,
    robots: { index: false, follow: false },
  };
}
async function Workspace({ params }: Props) {
  await requireMarketingAccess();
  const platform = findPlatform((await params).platform);
  if (!platform) notFound();
  const sections = [
    { id: "audience", title: "الجمهور ودور المنصة", text: platform.audience },
    {
      id: "voice",
      title: "النبرة وصياغة النص",
      text: `${platform.tone}\n\n${platform.captionGuide}`,
    },
    {
      id: "images",
      title: "التصور الكامل للصور",
      text: `${platform.imageDirection}\n\nمساحات الأمان: ${platform.safeArea}`,
    },
    {
      id: "videos",
      title: "التصور الكامل للفيديو",
      text: `${platform.videoDirection}\n\n${platform.videoLength}`,
    },
    {
      id: "cadence",
      title: "النشر والتوزيع",
      text: `${platform.cadence}\n\n${platform.distribution}`,
    },
    {
      id: "community",
      title: "الردود وتحويل الاهتمام إلى طلب",
      text: platform.community,
    },
  ];
  return (
    <main className="marketing-social container">
      <header className="marketing-page-heading">
        <span className="section-kicker">
          السوشيال ميديا / {platform.english}
        </span>
        <h1>{platform.name}</h1>
        <p>{platform.role}</p>
        <div className="marketing-hero-actions">
          <Badge variant="secondary">٣٠ صورة جاهزة للمراجعة</Badge>
          <span className="marketing-dimensions" dir="ltr">
            {platform.width} × {platform.height} px
          </span>
          <a
            href={`/api/board/marketing/assets/${platform.id}-posts.zip`}
            download
            className={buttonVariants({
              variant: "outline",
              size: "navigation",
            })}
          >
            <Download data-icon="inline-start" />
            تحميل حزمة {platform.name}
          </a>
        </div>
      </header>
      <MarketingNavigation active={platform.id} />
      <section
        className="marketing-platform-brief"
        aria-labelledby="platform-brief-heading"
      >
        <h2 id="platform-brief-heading">دليل المحتوى والإنتاج</h2>
        <Accordion multiple defaultValue={["images"]}>
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>
                <p className="marketing-long-copy">{section.text}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <div className="marketing-detail-grid">
        <section>
          <h2>وصف حساب مقترح</h2>
          <p className="marketing-long-copy">{platform.bio}</p>
          <p className="marketing-small-note">
            يُراجع مع حدّ الحقل المتاح للحساب، وتُضاف وسيلة التواصل الفعلية. لم
            تُنشأ حسابات أو أسماء مستخدمين باسم نرفد هنا.
          </p>
        </section>
        <section>
          <h2>سلاسل المحتوى</h2>
          <ul>
            {platform.series.map((series) => (
              <li key={series}>{series}</li>
            ))}
          </ul>
          <h3>ما نراقبه؟</h3>
          <ul>
            {platform.metrics.map((metric) => (
              <li key={metric}>{metric}</li>
            ))}
          </ul>
        </section>
      </div>
      <section
        className="marketing-storyboard"
        aria-labelledby="storyboard-heading"
      >
        <header>
          <span className="section-kicker">تصور للتصوير لاحقًا</span>
          <h2 id="storyboard-heading">سيناريو فيديو نموذجي</h2>
          <p>{platform.videoLength}</p>
        </header>
        <ol>
          {platform.scenes.map((scene) => (
            <li key={scene.time}>
              <span>{scene.time}</span>
              <div>
                <h3>{scene.visual}</h3>
                <p>
                  <strong>التعليق المقترح:</strong> {scene.voice}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <SocialLibrary platform={platform} posts={postsFor(platform.id)} />
    </main>
  );
}
export default function PlatformPage(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ فتح خطة المنصة…</p>
        </main>
      }
    >
      <Workspace {...props} />
    </Suspense>
  );
}
