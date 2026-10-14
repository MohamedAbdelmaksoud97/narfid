"use client";
import Link from "next/link";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { solutions } from "@/lib/solutions";
import { publicAuthor } from "@/lib/seo";
import { editorialWarnings } from "@/lib/articles/editorial";
import type { ArticleFields } from "@/lib/articles/types";
export function EditorialPanel({
  fields,
  change,
  locked,
}: {
  fields: ArticleFields;
  change: (patch: Partial<ArticleFields>) => void;
  locked: boolean;
}) {
  const warnings = editorialWarnings(fields);
  return (
    <>
      <section className="article-settings-section">
        <h2>موجز التحرير والمراجعة</h2>
        <p className="text-sm text-muted-foreground">
          السؤال والجمهور والملاحظات وموعد المراجعة داخلية؛ لا تظهر للزائر.
        </p>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="editorial-question">سؤال القارئ</FieldLabel>
            <Textarea
              id="editorial-question"
              value={fields.editorial_question ?? ""}
              maxLength={500}
              disabled={locked}
              onChange={(e) => change({ editorial_question: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="primary-keyword">
              الموضوع أو العبارة الرئيسية
            </FieldLabel>
            <Input
              id="primary-keyword"
              value={fields.primary_keyword ?? ""}
              maxLength={150}
              disabled={locked}
              onChange={(e) => change({ primary_keyword: e.target.value })}
            />
            <FieldDescription>
              موضوع طبيعي يخدم القارئ؛ لا نستخدم كثافة كلمات أو درجة ترتيب
              تقديرية.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="search-intent">نية البحث</FieldLabel>
            <NativeSelect
              id="search-intent"
              value={fields.search_intent ?? "informational"}
              disabled={locked}
              onChange={(e) =>
                change({
                  search_intent: e.target
                    .value as ArticleFields["search_intent"],
                })
              }
            >
              <NativeSelectOption value="informational">
                معرفة وحل مشكلة
              </NativeSelectOption>
              <NativeSelectOption value="commercial">
                مقارنة واختيار حل
              </NativeSelectOption>
              <NativeSelectOption value="transactional">
                طلب خدمة أو عرض
              </NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="editorial-audience">
              الجمهور المقصود
            </FieldLabel>
            <Input
              id="editorial-audience"
              value={fields.audience ?? ""}
              maxLength={200}
              disabled={locked}
              onChange={(e) => change({ audience: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="related-solution">
              الحل المرتبط بالمقال
            </FieldLabel>
            <NativeSelect
              id="related-solution"
              value={fields.related_solution ?? ""}
              disabled={locked}
              onChange={(e) =>
                change({ related_solution: e.target.value || null })
              }
            >
              <NativeSelectOption value="">بدون حل محدد</NativeSelectOption>
              {solutions.map((s) => (
                <NativeSelectOption key={s.slug} value={s.slug}>
                  {s.shortTitle}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor="review-due">موعد المراجعة التالية</FieldLabel>
            <Input
              id="review-due"
              type="date"
              dir="ltr"
              value={fields.review_due_at ?? ""}
              disabled={locked}
              onChange={(e) =>
                change({ review_due_at: e.target.value || null })
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="editorial-notes">
              مصادر وملاحظات المراجعة
            </FieldLabel>
            <Textarea
              id="editorial-notes"
              value={fields.editorial_notes ?? ""}
              maxLength={5000}
              disabled={locked}
              onChange={(e) => change({ editorial_notes: e.target.value })}
            />
          </Field>
        </FieldGroup>
        <p className="text-sm">
          الكاتب العام:{" "}
          <Link
            href={publicAuthor.path}
            target="_blank"
            rel="noopener noreferrer"
          >
            {publicAuthor.name}
          </Link>
          . حساب الحفظ داخل الإدارة مستقل عن اسم الكاتب العام.
        </p>
      </section>
      <section className="article-settings-section">
        <h2>معاينة نتيجة البحث</h2>
        <div className="seo-snippet">
          <span>نرفد › المقالات › {fields.slug}</span>
          <h3>{fields.seo_title || fields.title || "عنوان المقال"} | نرفد</h3>
          <p>
            {fields.seo_description ||
              fields.excerpt ||
              "أضف وصفًا يوضح الفائدة للقارئ."}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          معاينة تقريبية؛ قد يعيد Google صياغة العنوان والوصف.
        </p>
      </section>
      <section className="article-settings-section">
        <Alert>
          <AlertTitle>مراجعة تحريرية قبل النشر</AlertTitle>
          <AlertDescription>
            {warnings.length ? (
              <ul className="seo-bullets">
                {warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            ) : (
              "الحقول الأساسية للمراجعة مكتملة. راجع صحة المعلومات واللغة والروابط قبل النشر."
            )}
          </AlertDescription>
        </Alert>
        <h3>روابط داخلية مقترحة</h3>
        <p className="text-sm text-muted-foreground">
          اختر ما يخدم الفقرة، ثم أضف الرابط من شريط أدوات المحرر.
        </p>
        <ul className="editorial-links">
          {solutions
            .filter(
              (s) =>
                !fields.related_solution || s.slug === fields.related_solution,
            )
            .map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/solutions/${s.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.shortTitle}
                </Link>
                <code dir="ltr">/solutions/{s.slug}</code>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
