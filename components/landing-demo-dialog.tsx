"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpLeft, Copy, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { plans, salesPhone } from "@/lib/landing-content";

type DemoDraft = { name: string; club: string; branches: string; plan: string };

export default function DemoDialog({
  open,
  onOpenChange,
  initialPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan: string;
}) {
  const [draft, setDraft] = useState<DemoDraft | null>(null);
  const [editingDraft, setEditingDraft] = useState<DemoDraft | null>(null);
  const [errors, setErrors] = useState<{ name?: string; club?: string }>({});
  const [copyStatus, setCopyStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function changeOpen(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setDraft(null);
      setEditingDraft(null);
      setErrors({});
      setCopyStatus("");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextDraft = {
      name: String(form.get("name") ?? "").trim(),
      club: String(form.get("club") ?? "").trim(),
      branches: String(form.get("branches") ?? "فرع واحد"),
      plan: String(form.get("plan") ?? "أحتاج مساعدة في الاختيار"),
    };
    const nextErrors = {
      ...(nextDraft.name.length < 2
        ? { name: "اكتب اسمك من حرفين على الأقل." }
        : {}),
      ...(nextDraft.club.length < 2
        ? { club: "اكتب اسم المؤسسة من حرفين على الأقل." }
        : {}),
    };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current
        ?.querySelector<HTMLInputElement>(
          nextErrors.name ? "#demo-name" : "#demo-club",
        )
        ?.focus();
      return;
    }
    setDraft(nextDraft);
  }

  const message = draft
    ? [
        "مرحبًا نرفد، أرغب في حجز عرض توضيحي للمنصة.",
        "الاسم: " + draft.name,
        "المؤسسة: " + draft.club,
        "عدد الفروع: " + draft.branches,
        "الباقة محل الاهتمام: " + draft.plan,
        "أرجو التواصل لترتيب الموعد ومناقشة احتياجات المؤسسة.",
      ].join("\n")
    : "";

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus("تم نسخ تفاصيل الطلب.");
    } catch {
      setCopyStatus("تعذّر النسخ. يمكنك فتح الطلب مباشرةً في واتساب.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="demo-dialog" dir="rtl">
        <DialogHeader>
          <span className="dialog-eyebrow">
            <MessageCircle /> لنتعرّف على ناديك
          </span>
          <DialogTitle>
            {draft ? "طلبك جاهز. نكمل على واتساب؟" : "خطوتك الأولى مع نرفد"}
          </DialogTitle>
          <DialogDescription>
            {draft
              ? "راجع التفاصيل، ثم افتح واتساب لإرسال الطلب وترتيب العرض."
              : "أخبرنا قليلًا عن مؤسستك، لنرتّب عرضًا يناسب احتياجك."}
          </DialogDescription>
        </DialogHeader>
        {draft ? (
          <div className="request-review">
            <dl>
              <div>
                <dt>الاسم</dt>
                <dd>{draft.name}</dd>
              </div>
              <div>
                <dt>المؤسسة</dt>
                <dd>{draft.club}</dd>
              </div>
              <div>
                <dt>الفروع</dt>
                <dd>{draft.branches}</dd>
              </div>
              <div>
                <dt>الباقة</dt>
                <dd>{draft.plan}</dd>
              </div>
            </dl>
            <a
              href={
                "https://wa.me/" +
                salesPhone +
                "?text=" +
                encodeURIComponent(message)
              }
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "marketing" })}
            >
              <MessageCircle data-icon="inline-start" /> متابعة عبر واتساب{" "}
              <ArrowUpLeft data-icon="inline-end" />
            </a>
            <div className="review-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingDraft(draft);
                  setDraft(null);
                  setCopyStatus("");
                }}
              >
                تعديل التفاصيل
              </Button>
              <Button variant="outline" onClick={copyRequest}>
                <Copy data-icon="inline-start" />
                نسخ الطلب
              </Button>
            </div>
            {copyStatus && (
              <Alert>
                <AlertDescription>{copyStatus}</AlertDescription>
              </Alert>
            )}
            <p className="form-note">الطلب يُرسل عندما تضغط إرسال في واتساب.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate ref={formRef}>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="demo-name">اسمك</FieldLabel>
                <Input
                  id="demo-name"
                  name="name"
                  defaultValue={editingDraft?.name}
                  autoComplete="name"
                  placeholder="كيف نناديك؟"
                  required
                  maxLength={80}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <FieldError id="name-error">{errors.name}</FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(errors.club)}>
                <FieldLabel htmlFor="demo-club">
                  اسم المؤسسة الرياضية
                </FieldLabel>
                <Input
                  id="demo-club"
                  name="club"
                  defaultValue={editingDraft?.club}
                  autoComplete="organization"
                  placeholder="اسم النادي أو المركز"
                  required
                  maxLength={120}
                  aria-invalid={Boolean(errors.club)}
                  aria-describedby={errors.club ? "club-error" : undefined}
                />
                {errors.club && (
                  <FieldError id="club-error">{errors.club}</FieldError>
                )}
              </Field>
              <FieldGroup className="form-columns">
                <Field>
                  <FieldLabel htmlFor="demo-branches">عدد الفروع</FieldLabel>
                  <NativeSelect
                    id="demo-branches"
                    name="branches"
                    defaultValue={editingDraft?.branches}
                  >
                    <NativeSelectOption>فرع واحد</NativeSelectOption>
                    <NativeSelectOption>فرعان</NativeSelectOption>
                    <NativeSelectOption>٣ فروع</NativeSelectOption>
                    <NativeSelectOption>أكثر من ٣ فروع</NativeSelectOption>
                    <NativeSelectOption>أخطط لافتتاح مؤسسة</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor="demo-plan">
                    الباقة محل الاهتمام
                  </FieldLabel>
                  <NativeSelect
                    id="demo-plan"
                    name="plan"
                    defaultValue={editingDraft?.plan ?? initialPlan}
                  >
                    <NativeSelectOption>
                      أحتاج مساعدة في الاختيار
                    </NativeSelectOption>
                    {plans.map((plan) => (
                      <NativeSelectOption key={plan.name}>
                        {plan.name}
                      </NativeSelectOption>
                    ))}
                    <NativeSelectOption>شراكة تقنية</NativeSelectOption>
                  </NativeSelect>
                </Field>
              </FieldGroup>
              <Field>
                <Button type="submit" size="marketing" className="w-full">
                  راجع طلب العرض <ArrowLeft data-icon="inline-end" />
                </Button>
                <FieldDescription>
                  التفاصيل التي تدخلها تُشارك معنا عبر واتساب عند إرسال الطلب.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
