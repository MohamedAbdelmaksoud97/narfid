import Link from "next/link";
import { ArrowUpLeft, Download, LayoutGrid, Megaphone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { socialPlatforms, type PlatformId } from "@/lib/marketing/social";
import { marketingSources } from "@/lib/marketing/strategy";

export function MarketingNavigation({
  active,
}: {
  active: "strategy" | "social" | PlatformId;
}) {
  return (
    <nav className="marketing-navigation" aria-label="أقسام التسويق">
      <Link
        href="/board/marketing"
        aria-current={active === "strategy" ? "page" : undefined}
      >
        <Megaphone aria-hidden="true" />
        الخطة التسويقية
      </Link>
      <Link
        href="/board/marketing/social"
        aria-current={active === "social" ? "page" : undefined}
      >
        <LayoutGrid aria-hidden="true" />
        السوشيال ميديا
      </Link>
      {socialPlatforms.map((platform) => (
        <Link
          key={platform.id}
          href={`/board/marketing/social/${platform.id}`}
          aria-current={active === platform.id ? "page" : undefined}
        >
          {platform.name}
        </Link>
      ))}
    </nav>
  );
}

export function PlatformCards() {
  return (
    <div className="marketing-platform-grid">
      {socialPlatforms.map((platform) => (
        <Card key={platform.id}>
          <CardHeader>
            <CardDescription>{platform.english}</CardDescription>
            <CardTitle as="h2">{platform.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{platform.role}</p>
            <span className="marketing-dimensions" dir="ltr">
              {platform.width} × {platform.height} px
            </span>
            <p className="text-muted-foreground">
              ٣٠ صورة + النصوص + تصور الصور والفيديو
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href={`/board/marketing/social/${platform.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              افتح خطة {platform.name}
              <ArrowUpLeft data-icon="inline-end" />
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function MarketingSources() {
  return (
    <section
      id="sources"
      className="marketing-sources"
      aria-labelledby="marketing-sources-heading"
    >
      <h2 id="marketing-sources-heading">المراجع وحدود التحقق</h2>
      <p>
        الاستراتيجية والتوقيت والتوزيع اقتراحات لنرفد تُختبر ببياناتها. المقاسات
        الحالية اختيارات تنفيذية للحزمة، وتُراجع شروط كل موضع وقت النشر أو
        الترويج.
      </p>
      <ul>
        {marketingSources.map((source) => (
          <li key={source.id}>
            <a href={source.href} target="_blank" rel="noopener noreferrer">
              {source.title} ↗
            </a>
            <p>{source.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AllPostsDownload() {
  return (
    <a
      href="/api/board/marketing/assets/all-posts.zip"
      download
      className={buttonVariants({ size: "navigation" })}
    >
      <Download data-icon="inline-start" />
      تحميل الحزمة كاملة — ١٢٠ صورة
    </a>
  );
}
