"use client";
import { useMemo, useState } from "react";
import { Copy, Download, Film, RefreshCw } from "lucide-react";
import { videoBriefs, suggestedVideoOrder } from "@/lib/marketing/video-briefs";
import {
  productionStatuses,
  sonicSignature,
  videoPillars,
  videoPlatforms,
  videoScript,
  type VideoBrief,
} from "@/lib/marketing/video-plan";
import { findPlatform, type PlatformId } from "@/lib/marketing/social";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideos } from "./use-videos";

export function VideoLibrary() {
  const records = useVideos();
  const [query, setQuery] = useState("");
  const [pillar, setPillar] = useState("all");
  const [status, setStatus] = useState("all");
  const [platform, setPlatform] = useState<PlatformId>("instagram");
  const [published, setPublished] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState("");
  const productions = useMemo(
    () => new Map(records.state?.productions.map((row) => [row.video_id, row])),
    [records.state],
  );
  const publications = useMemo(
    () =>
      new Map(
        records.state?.publications.map((row) => [
          `${row.video_id}:${row.platform}`,
          row,
        ]),
      ),
    [records.state],
  );
  const ordered = useMemo(
    () =>
      suggestedVideoOrder.map(
        (id) => videoBriefs.find((video) => video.id === id)!,
      ),
    [],
  );
  const filtered = ordered.filter((video) => {
    const row = productions.get(video.id),
      pub = publications.get(`${video.id}:${platform}`);
    return (
      (pillar === "all" || video.pillar === pillar) &&
      (status === "all" || row?.status === status) &&
      (published === "all" ||
        (pub && pub.published === (published === "published"))) &&
      `${video.id} ${video.title} ${video.topic} ${video.audience} ${video.caption}`.includes(
        query.trim(),
      )
    );
  });
  const current = videoBriefs.find((video) => video.id === selected);
  const disabled = Boolean(records.error || records.pending || !records.state);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice("نُسخ النص.");
    } catch {
      setCopyNotice("تعذر النسخ. يمكنك تحديد النص ونسخه يدويًا.");
    }
  }
  function publicationControl(
    video: VideoBrief,
    destination: PlatformId,
    detail = false,
  ) {
    const row = publications.get(`${video.id}:${destination}`);
    return (
      <div className="video-publication" key={destination}>
        <label
          htmlFor={`${detail ? "detail" : "card"}-${video.id}-${destination}`}
        >
          {findPlatform(destination)?.name}
        </label>
        <Switch
          id={`${detail ? "detail" : "card"}-${video.id}-${destination}`}
          aria-label={`تم نشر ${video.id} على ${findPlatform(destination)?.name}`}
          checked={row?.published ?? false}
          disabled={disabled || !row}
          onCheckedChange={(value) => {
            if (row)
              void records.change({
                kind: "publication",
                video_id: video.id,
                platform: destination,
                published: value,
                revision: row.revision,
              });
          }}
        />
        {row?.published_at && (
          <time dateTime={row.published_at}>
            {new Date(row.published_at).toLocaleDateString("ar-SA")}
          </time>
        )}
      </div>
    );
  }
  return (
    <div className="video-workspace">
      <div className="video-summary" aria-label="ملخص خطة الفيديو">
        <Card>
          <CardHeader>
            <CardDescription>خطة جديدة مستقلة</CardDescription>
            <CardTitle>٥٠ فيديو</CardTitle>
          </CardHeader>
          <CardContent>التجارب السابقة خارج هذه الخطة.</CardContent>
          <CardFooter>٢٥–٤٥ ثانية · رأسي 9:16</CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>الإنتاج</CardDescription>
            <CardTitle>
              {records.state ? (
                `${records.state.productions.filter((row) => row.status === "ready").length.toLocaleString("ar-SA")} جاهز`
              ) : (
                <Skeleton className="h-6 w-20" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>ترتيب إنتاج مقترح يتناوب بين الموضوعات.</CardContent>
          <CardFooter>دون مواعيد نشر ملزمة</CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>التوقيع الصوتي الثابت</CardDescription>
            <CardTitle>{sonicSignature.phrase}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{sonicSignature.direction}</p>
            <p>{sonicSignature.soundSource}</p>
          </CardContent>
          <CardFooter>{sonicSignature.assetStatus}</CardFooter>
        </Card>
      </div>
      <Alert>
        <Film />
        <AlertTitle>نصوص جاهزة للإنتاج لاحقًا</AlertTitle>
        <AlertDescription>
          لكل فكرة افتتاحية وسيناريو بتوقيت المشاهد ونص الشاشة والموسيقى
          والمؤثرات ووصف منشور. تنقل النصوص والحركة الرسالة دون تعليق صوتي.
          اكتمال الإنتاج لا يغيّر حالة النشر.
        </AlertDescription>
      </Alert>
      <FieldGroup className="video-filters">
        <Field>
          <FieldLabel htmlFor="video-search">ابحث في الأفكار</FieldLabel>
          <Input
            id="video-search"
            placeholder="عنوان، موضوع، جمهور، أو رقم فيديو"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="video-pillar">نوع المحتوى</FieldLabel>
          <NativeSelect
            id="video-pillar"
            value={pillar}
            onChange={(event) => setPillar(event.target.value)}
          >
            <NativeSelectOption value="all">كل الأنواع (٥٠)</NativeSelectOption>
            {videoPillars.map((item) => (
              <NativeSelectOption key={item.id} value={item.id}>
                {item.name} ({item.count})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="video-status">حالة الإنتاج</FieldLabel>
          <NativeSelect
            id="video-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <NativeSelectOption value="all">
              كل حالات الإنتاج
            </NativeSelectOption>
            {Object.entries(productionStatuses).map(([key, label]) => (
              <NativeSelectOption key={key} value={key}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="video-platform">منصة النشر</FieldLabel>
          <NativeSelect
            id="video-platform"
            value={platform}
            onChange={(event) => setPlatform(event.target.value as PlatformId)}
          >
            {videoPlatforms.map((id) => (
              <NativeSelectOption key={id} value={id}>
                {findPlatform(id)?.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="video-published">
            حالة النشر على المنصة
          </FieldLabel>
          <NativeSelect
            id="video-published"
            value={published}
            onChange={(event) => setPublished(event.target.value)}
          >
            <NativeSelectOption value="all">كل حالات النشر</NativeSelectOption>
            <NativeSelectOption value="unpublished">
              لم يُنشر
            </NativeSelectOption>
            <NativeSelectOption value="published">تم نشره</NativeSelectOption>
          </NativeSelect>
        </Field>
      </FieldGroup>
      <div className="video-toolbar">
        <p>
          {filtered.length.toLocaleString("ar-SA")} فكرة · مرتبة للتنويع بين
          الأنواع
        </p>
        <Button
          variant="outline"
          onClick={() => void records.refresh()}
          disabled={records.refreshing || Boolean(records.pending)}
        >
          <RefreshCw data-icon="inline-start" />
          تحديث سجل الفيديو
        </Button>
      </div>
      {records.error && (
        <Alert variant="destructive">
          <AlertTitle>تعذر التحقق من الحالات</AlertTitle>
          <AlertDescription>
            {records.error} مفاتيح التعديل معطّلة حتى نجاح التحديث.
          </AlertDescription>
        </Alert>
      )}
      <p className="video-notice" role="status" aria-live="polite">
        {records.notice || copyNotice}
      </p>
      <div className="video-grid">
        {filtered.map((video) => {
          const row = productions.get(video.id);
          return (
            <Card
              key={video.id}
              className="video-card"
              data-video-id={video.id}
            >
              <CardHeader>
                <CardDescription>
                  <bdi>{video.id}</bdi> ·{" "}
                  {videoPillars.find((item) => item.id === video.pillar)?.name}
                </CardDescription>
                <CardTitle as="h2">{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="video-card-meta">
                  <Badge
                    variant={row?.status === "ready" ? "default" : "secondary"}
                  >
                    {row ? productionStatuses[row.status] : "جارٍ التحقق"}
                  </Badge>
                  <Badge variant="outline">{video.durationSeconds} ثانية</Badge>
                  <Badge variant="outline">{video.topic}</Badge>
                </div>
                <p>{video.scenes[0].message}</p>
                <p className="text-muted-foreground">{video.audience}</p>
                {publicationControl(video, platform)}
              </CardContent>
              <CardFooter>
                <Button onClick={() => setSelected(video.id)}>
                  <Film data-icon="inline-start" />
                  السيناريو والنصوص
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`نسخ وصف ${video.id}`}
                  onClick={() => void copy(video.caption)}
                >
                  <Copy />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {!filtered.length && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>لا توجد أفكار بهذه الفلاتر</EmptyTitle>
            <EmptyDescription>
              جرّب تغيير البحث أو نوع المحتوى أو الحالة.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <Dialog
        open={Boolean(current)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="video-dialog" dir="rtl">
          <DialogHeader>
            <DialogTitle>
              {current?.id} — {current?.title}
            </DialogTitle>
            <DialogDescription>
              سيناريو إنتاج قابل للتعديل ·{" "}
              <bdi dir="ltr">1080 × 1920 · 30fps</bdi> ·{" "}
              {current?.durationSeconds} ثانية
            </DialogDescription>
          </DialogHeader>
          {current && (
            <>
              <p>
                <strong>الجمهور:</strong> {current.audience}
              </p>
              <p>
                <strong>الهدف:</strong> {current.goal}
              </p>
              <p>
                <strong>المعالجة:</strong> {current.treatment}
              </p>
              <div className="video-detail-actions">
                <Button
                  variant="outline"
                  onClick={() => void copy(videoScript(current))}
                >
                  <Copy data-icon="inline-start" />
                  نسخ السيناريو كاملًا
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    void copy(
                      current.scenes.map((item) => item.onScreen).join("\n"),
                    )
                  }
                >
                  نسخ نصوص الشاشة
                </Button>
              </div>
              <p role="status">{copyNotice}</p>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="video-production-change">
                    حالة إنتاج {current.id}
                  </FieldLabel>
                  <NativeSelect
                    id="video-production-change"
                    value={productions.get(current.id)?.status ?? "planned"}
                    disabled={disabled}
                    onChange={(event) => {
                      const row = productions.get(current.id);
                      if (row)
                        void records.change({
                          kind: "production",
                          video_id: current.id,
                          status: event.target.value,
                          revision: row.revision,
                        });
                    }}
                  >
                    {Object.entries(productionStatuses).map(([key, label]) => (
                      <NativeSelectOption
                        key={key}
                        value={key}
                        disabled={key === "ready"}
                      >
                        {label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <p className="text-muted-foreground">
                    يُسجّل «جاهز» تلقائيًا بعد التحقق من ملف الإنتاج ورفعه؛
                    يمكنك تسجيل بدء العمل أو طلب التعديل.
                  </p>
                </Field>
              </FieldGroup>
              {productions.get(current.id)?.notes && (
                <Alert>
                  <AlertTitle>ملاحظة الإنتاج</AlertTitle>
                  <AlertDescription>
                    {productions.get(current.id)?.notes}
                  </AlertDescription>
                </Alert>
              )}
              {productions.get(current.id)?.output_path && (
                <div className="video-preview">
                  <video
                    key={productions.get(current.id)?.output_path}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={`معاينة ${current.id}`}
                    src={`/api/board/marketing/videos/${current.id}/asset`}
                  />
                  <a
                    className={buttonVariants({ variant: "outline" })}
                    href={`/api/board/marketing/videos/${current.id}/asset?download=1`}
                  >
                    <Download data-icon="inline-start" />
                    تحميل MP4
                  </a>
                  <p>
                    آخر ملف إنتاج محفوظ؛ قد تكون حالته الحالية قيد المراجعة.
                  </p>
                </div>
              )}
              <ol className="video-scenes">
                {current.scenes.map((item, index) => {
                  const start = current.scenes
                    .slice(0, index)
                    .reduce((sum, item) => sum + item.seconds, 0);
                  return (
                    <li key={index}>
                      <header>
                        <Badge variant="outline">
                          {start}–{start + item.seconds} ثانية
                        </Badge>
                        <h3>{item.onScreen}</h3>
                      </header>
                      <p>
                        <strong>المعنى المطلوب بصريًا:</strong> {item.message}
                      </p>
                      <p>
                        <strong>المشهد والحركة:</strong> {item.visual}
                      </p>
                      <p>
                        <strong>الصوت:</strong> {item.sound}
                      </p>
                    </li>
                  );
                })}
              </ol>
              <section className="video-caption">
                <h3>وصف المنشور</h3>
                <p>{current.caption}</p>
                <p>
                  <strong>الدعوة:</strong> {current.cta}
                </p>
                <Button
                  variant="outline"
                  onClick={() => void copy(current.caption)}
                >
                  <Copy data-icon="inline-start" />
                  نسخ وصف المنشور
                </Button>
              </section>
              <section className="video-publishing">
                <h3>تسجيل النشر لكل منصة</h3>
                <p>
                  فعّل بعد النشر الفعلي. التاريخ وقت تسجيل الحالة، ويمكن إلغاؤها
                  عند الخطأ. يُكيّف الوصف لمتطلبات المنصة وقت النشر.
                </p>
                {videoPlatforms.map((destination) =>
                  publicationControl(current, destination, true),
                )}
              </section>
              {records.notice && <p role="status">{records.notice}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
