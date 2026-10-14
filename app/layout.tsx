import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "@/styles/_variables.scss";
import "@/styles/_keyframe-animations.scss";
import "./globals.css";
import { NavigationGuardProvider } from "@/components/articles/navigation-guard-provider";
import { siteOrigin, indexingEnabled } from "@/lib/seo";
import { Suspense } from "react";
import { PublicAnalytics } from "@/components/public/public-analytics";

const arabicSans = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  robots: { index: indexingEnabled(), follow: indexingEnabled() },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
  title: "نرفد | السند التقني للمؤسسات الرياضية",
  description:
    "منظومة واحدة لإدارة الأعضاء والاشتراكات والحجوزات ونقاط البيع والمطبخ والمخزون والفروع. اكتشف نرفد وخطط الاشتراك السنوية للمؤسسات الرياضية.",
  applicationName: "Nerved | نرفد",
  keywords: [
    "نرفد",
    "Nerved",
    "إدارة الأندية الرياضية",
    "اشتراكات الأندية",
    "إدارة المؤسسات الرياضية",
  ],
  icons: { icon: "/logo%20symbol.png", apple: "/logo%20symbol.png" },
  openGraph: {
    title: "نرفد | كل تفاصيل ناديك، في منظومة واحدة",
    description:
      "السند التقني للمؤسسات الرياضية. إدارة متصلة وخطط سنوية تنمو مع ناديك.",
    locale: "ar_SA",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1672,
        height: 941,
        alt: "نرفد — السند التقني للمؤسسات الرياضية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "نرفد | السند التقني للمؤسسات الرياضية",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = { themeColor: "#1c1c1c" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${arabicSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavigationGuardProvider>{children}</NavigationGuardProvider>
        {indexingEnabled() &&
          /^G-[A-Z0-9]+$/.test(
            process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
          ) && (
            <Suspense fallback={null}>
              <PublicAnalytics
                measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!}
              />
            </Suspense>
          )}
      </body>
    </html>
  );
}
