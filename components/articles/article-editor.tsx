"use client";
import { useCallback, useRef, useState, useId } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  Eye,
  ImagePlus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { ArticleRenderer } from "./article-renderer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useArticleDraft } from "@/hooks/use-article-draft";
import { uploadArticleImageResult } from "@/lib/articles/browser";
import { slugify, type Article, type Category } from "@/lib/articles/types";
import type { JSONContent } from "@tiptap/core";
import { EditorialPanel } from "./editorial-panel";

export function ArticleEditor({
  initial,
  categories,
}: {
  initial: Article;
  categories: Category[];
}) {
  const formId = useId();
  const fieldId = (name: string) => `${formId}-${name}`;
  const { fields, article, status, error, busy, change, save, publish } =
    useArticleDraft(initial);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [tagInput, setTagInput] = useState(initial.tags.join("، "));
  const [slugTouched, setSlugTouched] = useState(
    !initial.slug.startsWith("article-"),
  );
  const coverInput = useRef<HTMLInputElement>(null);
  const onContent = useCallback(
    (content: JSONContent) => change({ content }),
    [change],
  );
  function backup() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(fields, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(fields.title) || "nerved-draft"}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function cover(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const image = await uploadArticleImageResult(initial.id, file);
      change({ cover_image_url: image.url, cover_image_width: image.width, cover_image_height: image.height });
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "تعذر رفع الغلاف.",
      );
    } finally {
      setUploading(false);
      if (coverInput.current) coverInput.current.value = "";
    }
  }
  const saving = status === "saving";
  const locked = busy || uploading;
  return (
    <main className="article-workspace">
      <header className="article-workspace-header">
        <div className="article-header-identity">
          <Link
            href="/board/articles"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
            aria-label="العودة إلى المقالات"
          >
            <ArrowRight data-icon="inline-start" />
          </Link>
          <div>
            <span className="section-kicker">مساحة النشر</span>
            <h1>محرر المقالات</h1>
          </div>
          <Badge variant="secondary">
            {article.status === "published" ? "منشور" : "مسودة"}
          </Badge>
        </div>
        <div className="article-editor-actions">
          <span
            className="article-save-status"
            role="status"
            aria-live="polite"
          >
            {status === "saved" ? (
              <>
                <Check />
                كل التعديلات محفوظة
              </>
            ) : status === "saving" ? (
              "جارٍ الحفظ…"
            ) : status === "error" ? (
              "الحفظ متوقف"
            ) : (
              "تعديلات لم تُحفظ"
            )}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() => setPreview(true)}
          >
            <Eye data-icon="inline-start" />
            معاينة
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={locked || saving}
            onClick={() => void save().catch(() => {})}
          >
            <Save data-icon="inline-start" />
            حفظ المسودة
          </Button>
          <Button
            size="sm"
            disabled={locked}
            onClick={() => void publish("publish")}
          >
            <Send data-icon="inline-start" />
            {busy
              ? "جارٍ التنفيذ…"
              : article.status === "published"
                ? "نشر التحديث"
                : "نشر المقال"}
          </Button>
        </div>
      </header>
      <div className="article-editor-layout">
        <section className="article-writing-column">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}{" "}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void save().catch(() => {})}
                >
                  إعادة محاولة الحفظ
                </Button>{" "}
                <Button variant="outline" size="sm" onClick={backup}>
                  <Download data-icon="inline-start" />
                  تنزيل نسخة من المسودة
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {article.status === "published" &&
            article.revision !== article.published_revision && (
              <Alert>
                <AlertDescription>
                  عندك تعديلات محفوظة في المسودة. النسخة العامة تظل كما هي حتى
                  تختار «نشر التحديث».
                </AlertDescription>
              </Alert>
            )}
          <FieldGroup className="article-title-fields">
            <Field>
              <FieldLabel htmlFor={fieldId("article-title")}>
                عنوان المقال
              </FieldLabel>
              <Input
                id={fieldId("article-title")}
                variant="article-title"
                placeholder="عنوان يستحق القراءة…"
                maxLength={200}
                value={fields.title}
                disabled={locked}
                onChange={(e) =>
                  change({
                    title: e.target.value,
                    ...(!slugTouched
                      ? { slug: slugify(e.target.value) || initial.slug }
                      : {}),
                  })
                }
                dir="auto"
              />
              <FieldDescription>
                {fields.title.length} / 200 حرف
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor={fieldId("article-excerpt")}>
                الملخص
              </FieldLabel>
              <Textarea
                id={fieldId("article-excerpt")}
                placeholder="الفكرة الأساسية في سطرين؛ تظهر في قائمة المقالات."
                maxLength={500}
                value={fields.excerpt}
                onChange={(e) => change({ excerpt: e.target.value })}
                disabled={locked}
                dir="auto"
              />
            </Field>
          </FieldGroup>
          <SimpleEditor
            content={initial.content}
            articleId={initial.id}
            direction={fields.direction}
            onChange={onContent}
            disabled={busy}
          />
        </section>
        <aside className="article-settings" aria-label="إعدادات المقال">
          <section className="article-settings-section">
            <h2>صورة الغلاف</h2>
            {fields.cover_image_url ? (
              <div className="article-cover-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fields.cover_image_url}
                  alt={fields.cover_image_alt || "معاينة الغلاف"}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    change({ cover_image_url: null, cover_image_alt: "", cover_image_width: null, cover_image_height: null })
                  }
                  disabled={locked}
                >
                  <Trash2 data-icon="inline-start" />
                  إزالة
                </Button>
              </div>
            ) : (
              <div className="article-cover-empty">
                <ImagePlus />
                <p>امنح المقال صورة تعبّر عنه.</p>
              </div>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={fieldId("cover-upload")}>
                  رفع صورة
                </FieldLabel>
                <Input
                  ref={coverInput}
                  id={fieldId("cover-upload")}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={locked}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void cover(file);
                  }}
                />
                <FieldDescription>
                  {uploading
                    ? "جارٍ رفع الصورة…"
                    : "PNG، JPG، WebP، GIF · حتى 5 ميجابايت."}
                </FieldDescription>
              </Field>
              {fields.cover_image_url && (
                <Field>
                  <FieldLabel htmlFor={fieldId("cover-alt")}>
                    الوصف البديل للغلاف
                  </FieldLabel>
                  <Input
                    id={fieldId("cover-alt")}
                    value={fields.cover_image_alt}
                    maxLength={300}
                    onChange={(e) =>
                      change({ cover_image_alt: e.target.value })
                    }
                    disabled={locked}
                  />
                </Field>
              )}
            </FieldGroup>
            {uploadError && (
              <Alert variant="destructive">
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </section>
          <section className="article-settings-section">
            <h2>تنظيم المقال</h2>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={fieldId("article-slug")}>
                  رابط المقال
                </FieldLabel>
                <Input
                  id={fieldId("article-slug")}
                  dir="ltr"
                  value={fields.slug}
                  maxLength={160}
                  onChange={(e) => {
                    setSlugTouched(true);
                    change({ slug: e.target.value });
                  }}
                  disabled={locked}
                />
                <FieldDescription>
                  حروف وأرقام وشرطات. تغيير رابط مقال منشور يغيّر عنوانه العام.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor={fieldId("article-category")}>
                  التصنيف
                </FieldLabel>
                <NativeSelect
                  id={fieldId("article-category")}
                  value={fields.category_id ?? ""}
                  onChange={(e) =>
                    change({ category_id: e.target.value || null })
                  }
                  disabled={locked}
                >
                  <NativeSelectOption value="">بدون تصنيف</NativeSelectOption>
                  {categories.map((category) => (
                    <NativeSelectOption key={category.id} value={category.id}>
                      {category.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field>
                <FieldLabel htmlFor={fieldId("article-tags")}>
                  الوسوم
                </FieldLabel>
                <Input
                  id={fieldId("article-tags")}
                  value={tagInput}
                  disabled={locked}
                  placeholder="الاشتراكات، الأندية، التقنية"
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    change({
                      tags: e.target.value
                        .split(/[,،]/)
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    });
                  }}
                />
                <FieldDescription>
                  افصل بفاصلة؛ بحد أقصى 10 وسوم.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel id={fieldId("article-direction-label")}>
                  اتجاه المقال
                </FieldLabel>
                <ToggleGroup
                  aria-labelledby={fieldId("article-direction-label")}
                  variant="outline"
                  value={[fields.direction]}
                  onValueChange={(values) => {
                    if (values[0])
                      change({ direction: values[0] as "rtl" | "ltr" });
                  }}
                  disabled={locked}
                >
                  <ToggleGroupItem value="rtl">العربية · RTL</ToggleGroupItem>
                  <ToggleGroupItem value="ltr">English · LTR</ToggleGroupItem>
                </ToggleGroup>
                <FieldDescription>
                  يمكن ضبط اتجاه كل فقرة أيضًا من شريط الأدوات.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </section>
          <section className="article-settings-section">
            <h2>محركات البحث</h2>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={fieldId("seo-title")}>
                  عنوان البحث (اختياري)
                </FieldLabel>
                <Input
                  id={fieldId("seo-title")}
                  value={fields.seo_title}
                  onChange={(e) => change({ seo_title: e.target.value })}
                  maxLength={70}
                  placeholder="يُستخدم عنوان المقال تلقائيًا"
                  disabled={locked}
                />
                <FieldDescription>
                  {fields.seo_title.length} / 70
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor={fieldId("seo-description")}>
                  وصف البحث (اختياري)
                </FieldLabel>
                <Textarea
                  id={fieldId("seo-description")}
                  value={fields.seo_description}
                  onChange={(e) => change({ seo_description: e.target.value })}
                  maxLength={180}
                  placeholder="يُستخدم الملخص تلقائيًا"
                  disabled={locked}
                />
                <FieldDescription>
                  {fields.seo_description.length} / 180
                </FieldDescription>
              </Field>
            </FieldGroup>
          </section>
          {article.status === "published" && (
            <p className="text-sm text-muted-foreground">عند نشر تغيير الرابط، يحوّل الرابط القديم إلى النسخة المنشورة الحالية تلقائيًا.</p>
          )}
          <EditorialPanel fields={fields} change={change} locked={locked} />
          {article.status === "published" && (
            <section className="article-settings-section">
              <h2>النشر</h2>
              <a
                href={`/articles/${encodeURIComponent(article.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                فتح المقال المنشور
              </a>
              <Button
                variant="destructive"
                size="sm"
                disabled={locked}
                onClick={() => void publish("unpublish")}
              >
                إلغاء النشر
              </Button>
              <p>
                إلغاء النشر يخفي المقال وصوره عن الزوار مع الاحتفاظ بالمسودة.
              </p>
            </section>
          )}
        </aside>
      </div>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="article-preview-dialog">
          <DialogHeader>
            <DialogTitle>معاينة المقال</DialogTitle>
            <DialogDescription>
              هذه معاينة لتعديلاتك الحالية قبل النشر.
            </DialogDescription>
          </DialogHeader>
          <article dir={fields.direction}>
            <header className="article-public-heading">
              <h1>{fields.title || "عنوان المقال"}</h1>
              <p>{fields.excerpt}</p>
            </header>
            {fields.cover_image_url && (
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="article-public-cover"
                  src={fields.cover_image_url}
                  alt={fields.cover_image_alt}
                />
              </figure>
            )}
            <ArticleRenderer
              content={fields.content}
              direction={fields.direction}
            />
          </article>
        </DialogContent>
      </Dialog>
    </main>
  );
}
