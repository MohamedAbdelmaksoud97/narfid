"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Check, Copy, Download, Expand } from "lucide-react";
import {
  postAsset,
  suggestedWeek,
  trackedDestination,
  type SocialPlatform,
  type SocialPost,
} from "@/lib/marketing/social";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function SocialLibrary({
  platform,
  posts,
}: {
  platform: SocialPlatform;
  posts: SocialPost[];
}) {
  const [selected, setSelected] = useState<SocialPost | null>(null);
  const [copied, setCopied] = useState("");
  const [status, setStatus] = useState("");
  const previewTitle = useRef<HTMLHeadingElement>(null);
  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setStatus("تم النسخ.");
    } catch {
      setStatus(
        "النسخ التلقائي غير متاح. يمكنك تحديد النص الظاهر ونسخه يدويًا.",
      );
    }
  }
  return (
    <section
      id="posts"
      className="social-library"
      aria-labelledby="social-library-heading"
    >
      <header className="social-library-header">
        <div>
          <span className="section-kicker">
            مكتبة المحتوى / {posts.length.toLocaleString("ar-SA")} منشورًا
            مصورًا
          </span>
          <h2 id="social-library-heading">مكتبة {platform.name}</h2>
          <p>
            معاينة أصل الصورة، والنص المرافق، والوصف البديل، وترتيب أسبوعي
            مقترح. تشمل المكتبة ١٠ منشورات تعريفية و٢٠ منشورًا بلقطات من واجهات
            النظام بهوية نرفد وبيانات عرض تجريبية. كل ملف قابل للتحميل.
          </p>
        </div>
        <a
          href={`/api/board/marketing/assets/${platform.id}-posts.zip`}
          download
          className={buttonVariants({ variant: "outline", size: "navigation" })}
        >
          <Download data-icon="inline-start" />
          تحميل الصور والنصوص
        </a>
      </header>
      <p role="status" aria-live="polite" className="marketing-copy-status">
        {status}
      </p>
      <div className="social-post-grid">
        {posts.map((post) => (
          <Card className="social-post-card" key={post.id}>
            <button
              type="button"
              className="social-post-thumbnail"
              aria-label={`معاينة المنشور ${post.id}: ${post.headline.replaceAll("\n", " ")}`}
              onClick={() => {
                setSelected(post);
                setStatus("");
              }}
            >
              <Image
                src={postAsset(post, true)}
                alt={post.alt}
                width={480}
                height={Math.round((480 * platform.height) / platform.width)}
                unoptimized
                loading="lazy"
              />
              <span>
                <Expand aria-hidden="true" />
                معاينة الصورة
              </span>
            </button>
            <CardHeader>
              <div className="social-post-meta">
                <Badge variant="secondary">{post.goal}</Badge>
                <span>
                  الأسبوع {suggestedWeek(post)} · منشور {post.id}
                </span>
              </div>
              <CardTitle as="h3">
                {post.headline.replaceAll("\n", " ")}
              </CardTitle>
              <CardDescription>{post.audience}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="social-caption-excerpt">{post.caption}</p>
            </CardContent>
            <CardFooter className="social-post-actions">
              <a
                href={`${postAsset(post)}?download=1`}
                download
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Download data-icon="inline-start" />
                تحميل PNG
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void copy(post.caption, `caption-${post.id}`)}
              >
                {copied === `caption-${post.id}` ? (
                  <Check data-icon="inline-start" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                نسخ النص
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="social-post-dialog"
          dir="rtl"
          initialFocus={previewTitle}
        >
          <DialogHeader>
            <DialogTitle ref={previewTitle} tabIndex={-1}>
              {platform.name} · منشور {selected?.id}
            </DialogTitle>
            <DialogDescription>
              الملف الأصلي بمقاس {platform.width} × {platform.height} بكسل. راجع
              النص والرابط قبل النشر.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="social-preview-body">
              <div className="social-preview-image">
                <Image
                  src={postAsset(selected)}
                  alt={selected.alt}
                  width={platform.width}
                  height={platform.height}
                  unoptimized
                />
              </div>
              <div className="social-preview-copy">
                <Badge variant="secondary">
                  {selected.goal} · الأسبوع {suggestedWeek(selected)}
                </Badge>
                <h3>{selected.headline.replaceAll("\n", " ")}</h3>
                <p className="marketing-long-copy">{selected.caption}</p>
                <div className="social-post-actions">
                  <Button
                    onClick={() =>
                      void copy(selected.caption, `caption-${selected.id}`)
                    }
                  >
                    <Copy data-icon="inline-start" />
                    نسخ النص المرافق
                  </Button>
                  <a
                    href={`${postAsset(selected)}?download=1`}
                    download
                    className={buttonVariants({ variant: "outline" })}
                  >
                    <Download data-icon="inline-start" />
                    تحميل الصورة
                  </a>
                </div>
                <h4>الوصف البديل المقترح</h4>
                <p>{selected.alt}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void copy(selected.alt, `alt-${selected.id}`)}
                >
                  <Copy data-icon="inline-start" />
                  نسخ الوصف البديل
                </Button>
                <h4>الوجهة المقترحة والتتبع</h4>
                <p className="marketing-small-note">
                  أضف الدومين المعتمد عند النشر. رابط الملف أو القصة أو المنشور
                  يختلف بحسب المنصة؛ لا يوجد نشر تلقائي هنا.
                </p>
                <code className="social-destination" dir="ltr">
                  {trackedDestination(selected)}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void copy(
                      trackedDestination(selected),
                      `link-${selected.id}`,
                    )
                  }
                >
                  <Copy data-icon="inline-start" />
                  نسخ المسار مع التتبع
                </Button>
                <p role="status" aria-live="polite">
                  {status}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
