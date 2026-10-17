"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  Download,
  Expand,
  RefreshCw,
  Trash2,
  Undo2,
} from "lucide-react";
import { socialCategories } from "@/lib/marketing/categories";
import { usePublications } from "./use-publications";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
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
  DialogFooter,
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
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<SocialPost | null>(null);
  const publication = usePublications(platform.id);
  const activePosts = posts.filter(
    (post) =>
      !publication.rows?.find((row) => row.post_id === post.id)?.deleted,
  );
  const deletedPosts = posts.filter(
    (post) => publication.rows?.find((row) => row.post_id === post.id)?.deleted,
  );
  const catalogue = filter === "deleted" ? deletedPosts : activePosts;
  const categories = [
    {
      id: "all",
      name: "الكل",
      description:
        "وازن بين التعريف والتعليم والمحتوى الذي يساعد صاحب القرار؛ اختر موضوعًا ثم راجع سجل النشر قبل الاستخدام.",
    },
    ...socialCategories,
  ];
  const publishedCount = publication.rows?.filter(
    (row) => row.published && !row.deleted,
  ).length;
  const publicationFor = (id: string) =>
    publication.rows?.find((row) => row.post_id === id);
  function publicationControl(post: SocialPost, inPreview = false) {
    const row = publicationFor(post.id);
    const controlId = `published-${platform.id}-${post.id}${inPreview ? "-preview" : ""}`;
    return (
      <div
        className="social-publication"
        data-published={Boolean(row?.published)}
      >
        <div>
          <label htmlFor={controlId}>
            {publication.pending === post.id
              ? "جارٍ الحفظ…"
              : !row || publication.error
                ? "حالة النشر غير متاحة"
                : row.published
                  ? "تم نشره"
                  : "لم يُنشر بعد"}
          </label>
          <p>
            {row?.published_at ? (
              <>
                سُجّل في{" "}
                <time dateTime={row.published_at}>
                  {new Intl.DateTimeFormat("ar-SA", {
                    dateStyle: "medium",
                    timeZone: "Asia/Riyadh",
                    calendar: "gregory",
                  }).format(new Date(row.published_at))}
                </time>
              </>
            ) : (
              "فعّله بعد نشره على الحساب"
            )}
          </p>
        </div>
        <Switch
          id={controlId}
          dir="ltr"
          checked={row?.published ?? false}
          disabled={
            !row ||
            row.deleted ||
            Boolean(publication.error) ||
            Boolean(publication.pending)
          }
          aria-label={`تم نشر المنشور ${post.id}`}
          onCheckedChange={(checked) => {
            setStatus("");
            void publication.toggle(post.id, checked);
          }}
        />
      </div>
    );
  }
  const previewTitle = useRef<HTMLHeadingElement>(null);
  async function copy(text: string, key: string) {
    publication.clearNotice();
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
            مكتبة المحتوى / {activePosts.length.toLocaleString("ar-SA")} منشورًا
            مصورًا
          </span>
          <h2 id="social-library-heading">مكتبة {platform.name}</h2>
          <p>
            معاينة أصل الصورة، والنص المرافق، والوصف البديل، وترتيب أسبوعي
            مقترح، موزّعة حسب موضوعات التشغيل والتطوير. تشمل المكتبة منشورات
            بلقطات من واجهات النظام بهوية نرفد وبيانات عرض تجريبية. سجّل النشر
            بعد استخدام كل منشور.
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
      <div className="social-library-tools">
        <div className="social-publication-summary" aria-live="polite">
          <Badge variant="secondary">
            {publishedCount === undefined
              ? "جارٍ تحميل السجل…"
              : `${publishedCount.toLocaleString("ar-SA")} تم نشره · ${(activePosts.length - publishedCount).toLocaleString("ar-SA")} لم يُنشر · ${deletedPosts.length.toLocaleString("ar-SA")} محذوف`}
          </Badge>
          <span>
            السجل مشترك بين أعضاء الإدارة، ويتحدّث دوريًا وعند العودة للصفحة.
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={publication.refreshing || Boolean(publication.pending)}
          onClick={() => void publication.refresh()}
        >
          <RefreshCw data-icon="inline-start" />
          {publication.refreshing ? "جارٍ التحديث…" : "تحديث سجل النشر"}
        </Button>
      </div>
      {publication.error && (
        <Alert variant="destructive">
          <AlertTitle>تعذر التحقق من حالة النشر</AlertTitle>
          <AlertDescription>
            {publication.error} لا تعتمد على الحالة المعروضة حتى تحديث السجل
            بنجاح.
          </AlertDescription>
        </Alert>
      )}
      <p className="marketing-small-note">
        الزر يسجّل النشر اليدوي داخل نرفد ولا ينشر على حسابات التواصل. راجع
        السجل قبل النشر، ثم فعّل الزر فور الانتهاء لتفادي إعادة استخدام البوست.
      </p>
      <p role="status" aria-live="polite" className="marketing-copy-status">
        {publication.notice || status}
      </p>
      <Tabs
        value={category}
        onValueChange={(value) => setCategory(String(value))}
        className="social-category-tabs"
      >
        <TabsList
          aria-label="تصنيفات المنشورات"
          className="social-category-list"
        >
          {categories.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.name}
              <span>
                {(item.id === "all"
                  ? catalogue.length
                  : catalogue.filter((post) => post.category === item.id).length
                ).toLocaleString("ar-SA")}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="social-library-filter">
          <ToggleGroup
            aria-label="تصفية حسب حالة النشر"
            value={[filter]}
            onValueChange={(values) => {
              if (values.length) setFilter(String(values[0]));
            }}
            variant="outline"
            size="sm"
            disabled={!publication.rows || Boolean(publication.error)}
          >
            <ToggleGroupItem value="all">كل الحالات</ToggleGroupItem>
            <ToggleGroupItem value="unpublished">لم يُنشر</ToggleGroupItem>
            <ToggleGroupItem value="published">تم نشره</ToggleGroupItem>
            <ToggleGroupItem value="deleted">المحذوفات</ToggleGroupItem>
          </ToggleGroup>
        </div>
        {categories.map((item) => {
          const visiblePosts = catalogue.filter(
            (post) =>
              (item.id === "all" || post.category === item.id) &&
              (filter === "all" ||
                filter === "deleted" ||
                (filter === "published"
                  ? publicationFor(post.id)?.published === true
                  : publicationFor(post.id)?.published === false)),
          );
          return (
            <TabsContent key={item.id} value={item.id}>
              <div className="social-category-intro">
                <p>{item.description}</p>
                <span>
                  {visiblePosts.length.toLocaleString("ar-SA")} منشورًا في العرض
                  الحالي
                </span>
              </div>
              {!visiblePosts.length && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>لا توجد منشورات بهذه التصفية</EmptyTitle>
                    <EmptyDescription>
                      غيّر حالة النشر أو اختر تصنيفًا آخر لاستعراض بقية المكتبة.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <div className="social-post-grid">
                {visiblePosts.map((post) => (
                  <Card
                    className="social-post-card"
                    key={post.id}
                    data-post-id={post.id}
                    data-category={post.category}
                  >
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
                        height={Math.round(
                          (480 * platform.height) / platform.width,
                        )}
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
                        <Badge variant="secondary">
                          {
                            socialCategories.find(
                              (category) => category.id === post.category,
                            )!.name
                          }
                        </Badge>
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
                      {publicationControl(post)}
                    </CardContent>
                    <CardFooter className="social-post-actions">
                      {publicationFor(post.id)?.deleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            Boolean(publication.pending) ||
                            Boolean(publication.error)
                          }
                          onClick={() => void publication.restore(post.id)}
                        >
                          <Undo2 data-icon="inline-start" />
                          استعادة المنشور
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          aria-label={`حذف المنشور ${post.id}`}
                          disabled={
                            !publicationFor(post.id) ||
                            Boolean(publication.pending) ||
                            Boolean(publication.error)
                          }
                          onClick={() => {
                            setDeleteTarget(post);
                            publication.clearNotice();
                          }}
                        >
                          <Trash2 data-icon="inline-start" />
                          حذف
                        </Button>
                      )}
                      <a
                        href={`${postAsset(post)}?download=1`}
                        download
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Download data-icon="inline-start" />
                        تحميل PNG
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          void copy(post.caption, `caption-${post.id}`)
                        }
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
            </TabsContent>
          );
        })}
      </Tabs>
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
                {publicationControl(selected, true)}
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
                  {publication.notice || status}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !publication.pending) setDeleteTarget(null);
        }}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>
              حذف المنشور {deleteTarget?.id} من {platform.name}؟
            </DialogTitle>
            <DialogDescription>
              سيختفي من المكتبة وحزمة التحميل لدى جميع أعضاء الإدارة. يمكنك
              استعادته من «المحذوفات». هذا الإجراء لا يحذف منشورًا من حسابات
              التواصل.
            </DialogDescription>
          </DialogHeader>
          <p>{deleteTarget?.headline.replaceAll("\n", " ")}</p>
          <p role="status">{publication.notice}</p>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={Boolean(publication.pending)}
              onClick={() => setDeleteTarget(null)}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(publication.pending)}
              onClick={async () => {
                if (
                  deleteTarget &&
                  (await publication.remove(deleteTarget.id))
                ) {
                  setSelected(null);
                  setDeleteTarget(null);
                }
              }}
            >
              <Trash2 data-icon="inline-start" />
              {publication.pending ? "جارٍ الحذف…" : "تأكيد الحذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
