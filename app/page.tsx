import { LandingPage } from "@/components/landing-page";
import { LandingArticles } from "@/components/articles/landing-articles";
import { organizationSchema, structuredJson, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "نرفد — السند التقني للمؤسسات الرياضية",
  "منظومة لإدارة الأعضاء والاشتراكات والحجوزات ونقاط البيع والمطبخ ومخزون المنتجات والفروع. اكتشف حلول نرفد وباقات الاشتراك السنوية.",
  "/",
);

export default function Home() {
  return (
    <>
      <LandingPage articles={<LandingArticles />} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: structuredJson(organizationSchema()),
        }}
      />
    </>
  );
}
