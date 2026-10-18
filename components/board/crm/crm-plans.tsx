"use client";
import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { money, type Plan } from "@/lib/crm/types";
import type { FieldSpec } from "./crm-fields";
import {
  CrmEditor,
  CrmConfirm,
  CrmStatus,
  NoRecords,
  crmRequest,
  useCrmData,
} from "./crm-shared";

const fields: FieldSpec[] = [
  { key: "name", label: "اسم الباقة", required: true },
  {
    key: "pricing_type",
    label: "نوع التسعير",
    options: { fixed: "سعر سنوي ثابت", custom: "حسب عرض السعر" },
  },
  {
    key: "annual_fee_cents",
    label: "السعر السنوي (ر.س)",
    type: "money",
    nullable: true,
    hint: "مطلوب للسعر الثابت. لا يُستخدم عند اختيار «حسب عرض السعر».",
  },
  {
    key: "setup_fee_cents",
    label: "رسوم التجهيز الأساسية (ر.س)",
    type: "money",
    hint: "تُراجع في كل عقد وفق الاتفاق الفعلي.",
  },
  {
    key: "active",
    label: "إتاحة الباقة",
    options: {
      true: "متاحة للاشتراكات الجديدة",
      false: "غير متاحة للاشتراكات الجديدة",
    },
  },
  { key: "sort_order", label: "ترتيب العرض", type: "number", required: true },
  { key: "description", label: "وصف الباقة", type: "textarea", wide: true },
  {
    key: "features",
    label: "مميزات الباقة",
    type: "textarea",
    required: true,
    wide: true,
    hint: "كل ميزة في سطر مستقل؛ لإزالة ميزة احذف سطرها. حتى ٥٠ ميزة، وبحد أقصى ٢٠٠ حرف لكل ميزة.",
  },
];
type Catalog = {
  plans: Plan[];
  usage: Record<string, { accounts: number; contracts: number }>;
};
export function CrmPlans() {
  const state = useCrmData<Catalog>("plans");
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [editor, setEditor] = useState<Record<string, unknown> | null>(null),
    [deleting, setDeleting] = useState<Plan | null>(null);
  const plans = state.data?.plans ?? [];
  const locked = busy || state.loading || Boolean(state.error);
  async function mutate(method: string, body: object) {
    setBusy(true);
    setError("");
    try {
      await crmRequest("plans", method, body);
      await state.reload();
    } finally {
      setBusy(false);
    }
  }
  const visible = plans.filter(
    (plan) =>
      (filter === "all" || plan.active === (filter === "active")) &&
      [plan.name, plan.description, ...plan.features]
        .join(" ")
        .includes(search.trim()),
  );
  return (
    <main className="crm-page container">
      <header className="crm-page-heading">
        <div>
          <p className="section-kicker">الخدمات والاشتراكات · نرفد</p>
          <h1>الباقات</h1>
          <p>
            حدّد ما تقدمه كل باقة وسعرها، ثم اخترها من ملف العميل وعند إعداد
            العقد.
          </p>
        </div>
        <Button
          disabled={locked}
          onClick={() =>
            setEditor({
              id: crypto.randomUUID(),
              _new: true,
              name: "",
              pricing_type: "fixed",
              annual_fee_cents: null,
              setup_fee_cents: 0,
              sort_order: plans.length + 1,
              active: true,
              features: "",
            })
          }
        >
          <Plus data-icon="inline-start" />
          إضافة باقة
        </Button>
      </header>
      <div className="crm-toolbar">
        <Input
          className="crm-plan-search"
          aria-label="البحث في الباقات"
          placeholder="ابحث باسم الباقة أو إحدى مميزاتها…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Field className="crm-plan-filter">
          <FieldLabel htmlFor="crm-plan-availability">الإتاحة</FieldLabel>
          <NativeSelect
            id="crm-plan-availability"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <NativeSelectOption value="all">كل الباقات</NativeSelectOption>
            <NativeSelectOption value="active">
              المتاحة للاشتراك
            </NativeSelectOption>
            <NativeSelectOption value="inactive">
              غير المتاحة
            </NativeSelectOption>
          </NativeSelect>
        </Field>
        <CrmStatus
          error={state.error}
          loading={state.loading}
          reload={() => void state.reload()}
        />
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <p className="crm-help">
        الأسعار سنوية بالريال السعودي. تُحفظ قيمة العقد ومميزات الباقة وقت
        التعاقد؛ تعديل الباقة لاحقًا يخص الاتفاقات الجديدة.
      </p>
      <div className="crm-card-grid crm-plans-grid">
        {visible.map((plan) => {
          const usage = state.data?.usage[plan.id],
            linked = Boolean(usage && (usage.accounts || usage.contracts));
          return (
            <Card key={plan.id}>
              <CardHeader>
                <div className="crm-heading-badges">
                  <Badge variant={plan.active ? "secondary" : "outline"}>
                    {plan.active ? "متاحة للاشتراك" : "غير متاحة للجدد"}
                  </Badge>
                  <span className="crm-plan-order">
                    ترتيب {plan.sort_order}
                  </span>
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="crm-plan-price">
                  {plan.pricing_type === "custom"
                    ? "حسب عرض السعر"
                    : money(plan.annual_fee_cents)}
                  {plan.pricing_type === "fixed" && <small> / سنويًا</small>}
                </p>
                <p className="crm-help">
                  رسوم التجهيز الأساسية: {money(plan.setup_fee_cents)}
                </p>
                <ul className="crm-plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <Check aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {linked && (
                  <p className="crm-help">
                    مرتبطة بـ{usage!.accounts} ملف و{usage!.contracts} عقد.
                  </p>
                )}
              </CardContent>
              <CardFooter className="crm-plan-footer">
                <div className="crm-row-actions">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={locked}
                    onClick={() =>
                      setEditor({ ...plan, features: plan.features.join("\n") })
                    }
                  >
                    <Pencil data-icon="inline-start" />
                    تعديل
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={locked || linked}
                    aria-label={`حذف باقة ${plan.name}`}
                    onClick={() => setDeleting(plan)}
                  >
                    <Trash2 data-icon="inline-start" />
                    حذف
                  </Button>
                </div>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor={`plan-active-${plan.id}`}>
                    متاحة للجدد
                  </FieldLabel>
                  <Switch
                    dir="ltr"
                    id={`plan-active-${plan.id}`}
                    aria-label={`إتاحة باقة ${plan.name}`}
                    checked={plan.active}
                    disabled={locked}
                    onCheckedChange={async (active) => {
                      try {
                        await mutate("PATCH", {
                          id: plan.id,
                          revision: plan.revision,
                          fields: { ...plan, active },
                        });
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : "تعذر تحديث الإتاحة.",
                        );
                      }
                    }}
                  />
                </Field>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {!state.loading && !visible.length && (
        <NoRecords
          title={plans.length ? "لا توجد باقات تطابق البحث" : "أضف أول باقة"}
          description="حدّد اسم الباقة وسعرها ومميزاتها لتظهر في اختيار خطة العميل."
        />
      )}
      {editor && (
        <CrmEditor
          title={editor._new ? "إضافة باقة" : "تعديل الباقة"}
          description="راجع السعر والنطاق وإتاحة الباقة للاشتراكات الجديدة."
          fields={fields}
          initial={editor}
          onClose={() => setEditor(null)}
          onSave={async (fields) => {
            await mutate(editor._new ? "POST" : "PATCH", {
              id: editor.id,
              revision: editor.revision,
              fields,
            });
          }}
        />
      )}
      {deleting && (
        <CrmConfirm
          title={`حذف باقة ${deleting.name}؟`}
          description="تُحذف الباقة إذا لم تكن مرتبطة بعملاء أو عقود. يمكنك إيقاف إتاحتها للاشتراكات الجديدة مع الاحتفاظ بتاريخها."
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await mutate("DELETE", {
              id: deleting.id,
              revision: deleting.revision,
            });
          }}
        />
      )}
    </main>
  );
}
