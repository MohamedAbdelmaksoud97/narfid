import {
  clientStages,
  leadStages,
  priorities,
  sources,
  todaySaudi,
  renewalDate,
  type AccountKind,
  type Member,
  type Resource,
  type Plan,
  money,
} from "@/lib/crm/types";
export type FieldSpec = {
  key: string;
  label: string;
  type?: "text" | "email" | "date" | "number" | "url" | "textarea" | "money";
  options?: Record<string, string>;
  required?: boolean;
  hint?: string;
  wide?: boolean;
  nullable?: boolean;
};
const field = (
  key: string,
  label: string,
  extra: Omit<FieldSpec, "key" | "label"> = {},
): FieldSpec => ({ key, label, ...extra });
const owner = (members: Member[]) =>
  field("owner_id", "مسؤول المتابعة في نرفد", {
    options: {
      "": "غير معيّن",
      ...Object.fromEntries(members.map((member) => [member.id, member.name])),
    },
  });
export function planOptions(plans: Plan[], current?: unknown) {
  return {
    "": "لم تُحدد بعد",
    ...Object.fromEntries(
      plans
        .filter((plan) => plan.active || plan.id === current)
        .map((plan) => [
          plan.id,
          `${plan.name} · ${plan.pricing_type === "custom" ? "حسب عرض السعر" : `${money(plan.annual_fee_cents)} سنويًا`}${plan.active ? "" : " · غير متاحة للجدد"}`,
        ]),
    ),
  };
}
export function planContractDefaults(plan?: Plan) {
  return plan
    ? {
        plan_id: plan.id,
        title: `اشتراك ${plan.name}`,
        annual_fee_cents: plan.annual_fee_cents,
        setup_fee_cents: plan.setup_fee_cents,
        scope: plan.features.join("\n"),
      }
    : { plan_id: "" };
}
export function contractPlanChange(
  plans: Plan[],
  key: string,
  value: string,
): Record<string, string> {
  if (key !== "plan_id") return {};
  const plan = plans.find((item) => item.id === value && item.active);
  return plan
    ? {
        title: `اشتراك ${plan.name}`,
        annual_fee_cents:
          plan.annual_fee_cents == null
            ? ""
            : String(plan.annual_fee_cents / 100),
        setup_fee_cents: String(plan.setup_fee_cents / 100),
        scope: plan.features.join("\n"),
      }
    : {};
}
export function accountForm(
  kind: AccountKind,
  members: Member[],
  plans: Plan[] = [],
  currentPlan?: unknown,
): FieldSpec[] {
  return [
    field("name", "اسم المؤسسة", { required: true }),
    field("plan_id", kind === "lead" ? "الخطة المرشحة" : "خطة الاشتراك", {
      options: planOptions(plans, currentPlan),
      hint: "تُدار الباقات وأسعارها ومميزاتها من قسم الباقات.",
    }),
    field("stage", kind === "lead" ? "مرحلة البيع" : "حالة العميل", {
      options: kind === "lead" ? leadStages : clientStages,
    }),
    owner(members),
    field("priority", "الأولوية", { options: priorities }),
    field("source", "مصدر التعارف", { options: sources }),
    field("institution_type", "نوع المؤسسة", {
      hint: "نادي لياقة، أكاديمية، ملاعب…",
    }),
    field("city", "المدينة"),
    field("branches", "عدد الفروع", { type: "number", required: true }),
    field("contact_name", "مسؤول التواصل لدى المؤسسة"),
    field("contact_role", "المسمى الوظيفي"),
    field("phone", "رقم التواصل"),
    field("email", "البريد الإلكتروني", { type: "email" }),
    field("website", "موقع المؤسسة", { type: "url" }),
    ...(kind === "lead"
      ? [
          field("annual_budget_cents", "ميزانية سنوية تقديرية (ر.س)", {
            type: "money",
            hint: "تقدير فرصة وليس إيرادًا متعاقدًا عليه.",
          }),
          field("expected_close_on", "موعد التعاقد المتوقع", { type: "date" }),
        ]
      : []),
    field("next_follow_up_on", "المتابعة القادمة", { type: "date" }),
    field("needs", "الاحتياجات ونطاق الخدمة والملاحظات", {
      type: "textarea",
      wide: true,
      hint: "الخدمات والفروع والتخصيصات المطلوبة؛ لا تسجل كلمات مرور أو مفاتيح وصول.",
    }),
    ...(kind === "lead"
      ? [
          field("lost_reason", "سبب عدم الاتفاق", {
            type: "textarea",
            wide: true,
            hint: "مطلوب عند اختيار «لم يتم الاتفاق».",
          }),
        ]
      : []),
  ];
}
export const resourceNames: Record<Resource | "payments", string> = {
  contacts: "جهة اتصال",
  activities: "تواصل أو ملاحظة",
  followups: "مهمة متابعة",
  contracts: "عقد",
  workspaces: "بيئة تشغيل",
  tickets: "طلب دعم أو تطوير",
  payments: "دفعة",
};
export const labels = {
  note: "ملاحظة",
  call: "مكالمة",
  whatsapp: "واتساب",
  email: "بريد إلكتروني",
  meeting: "اجتماع",
  demo: "عرض توضيحي",
  open: "مفتوح",
  done: "مكتمل",
  followup: "متابعة",
  onboarding: "تجهيز",
  draft: "مسودة",
  signed: "موقّع",
  cancelled: "ملغي",
  production: "إنتاج",
  staging: "اختبار",
  planned: "مخطط",
  configuring: "قيد الإعداد",
  testing: "قيد الاختبار",
  live: "يعمل",
  maintenance: "صيانة",
  retired: "خارج الخدمة",
  unknown: "لم يُسجّل",
  configured: "تم الإعداد",
  verified: "تم اختبار الاستعادة",
  support: "دعم",
  bug: "مشكلة تقنية",
  change: "طلب تطوير",
  integration: "تكامل",
  in_progress: "قيد التنفيذ",
  waiting: "بانتظار الرد",
  resolved: "مغلق",
  bank: "تحويل بنكي",
  cash: "نقدي",
  card: "بطاقة",
  other: "أخرى",
  ...priorities,
};
export function resourceForm(
  resource: Resource | "payments",
  members: Member[],
  contracts: { id: string; title?: unknown; status?: unknown }[] = [],
  plans: Plan[] = [],
  currentPlan?: unknown,
): FieldSpec[] {
  const title = field("title", "العنوان", { required: true }),
    body = field("body", "التفاصيل", { type: "textarea", wide: true });
  switch (resource) {
    case "contacts":
      return [
        field("name", "اسم جهة الاتصال", { required: true }),
        field("role", "الدور أو المسمى"),
        field("phone", "رقم التواصل"),
        field("email", "البريد الإلكتروني", { type: "email" }),
        field("notes", "ملاحظات التواصل", { type: "textarea", wide: true }),
      ];
    case "activities":
      return [
        title,
        field("channel", "نوع التواصل", {
          options: {
            note: labels.note,
            call: labels.call,
            whatsapp: labels.whatsapp,
            email: labels.email,
            meeting: labels.meeting,
            demo: labels.demo,
          },
        }),
        field("occurred_on", "تاريخ التواصل", { type: "date", required: true }),
        body,
      ];
    case "followups":
      return [
        title,
        owner(members),
        field("due_on", "موعد الاستحقاق", { type: "date" }),
        field("status", "حالة المهمة", {
          options: { open: labels.open, done: labels.done },
        }),
        field("category", "نوع المهمة", {
          options: { followup: labels.followup, onboarding: labels.onboarding },
        }),
        field("details", "تفاصيل المهمة", { type: "textarea", wide: true }),
      ];
    case "contracts":
      return [
        field("plan_id", "باقة العقد", {
          options: planOptions(plans, currentPlan),
          hint: "اختيار باقة يملأ سعرها ومميزاتها. راجع القيم المتفق عليها قبل الحفظ.",
        }),
        field("title", "اسم العقد أو الباقة", { required: true }),
        field("reference", "رقم أو مرجع العقد"),
        field("starts_on", "بداية العقد", { type: "date", required: true }),
        field("ends_on", "نهاية العقد", { type: "date", required: true }),
        field("annual_fee_cents", "قيمة الاشتراك السنوي (ر.س)", {
          type: "money",
          required: true,
        }),
        field("setup_fee_cents", "رسوم التجهيز أو التطوير (ر.س)", {
          type: "money",
          hint: "تُفصل عن قيمة الاشتراك السنوية.",
        }),
        field("status", "حالة العقد", {
          options: {
            draft: labels.draft,
            signed: labels.signed,
            cancelled: labels.cancelled,
          },
        }),
        field("document_url", "رابط مستند العقد", {
          type: "url",
          hint: "رابط مستند محفوظ بصلاحيات مناسبة في خدمة الملفات الخاصة بكم.",
        }),
        field("scope", "النطاق والتخصيصات والدعم المتفق عليه", {
          type: "textarea",
          wide: true,
        }),
      ];
    case "workspaces":
      return [
        field("environment", "البيئة", {
          options: { production: labels.production, staging: labels.staging },
        }),
        field("status", "حالة التشغيل", {
          options: {
            planned: labels.planned,
            configuring: labels.configuring,
            testing: labels.testing,
            live: labels.live,
            maintenance: labels.maintenance,
            retired: labels.retired,
          },
        }),
        field("app_url", "رابط نظام العميل", { type: "url" }),
        field("database_ref", "اسم مشروع قاعدة البيانات أو مرجعه", {
          hint: "مرجع فقط؛ تحفظ بيانات الدخول في مدير أسرار.",
        }),
        field("repository_url", "رابط المستودع", { type: "url" }),
        field("release_ref", "الإصدار أو الفرع المعتمد"),
        field("hosting_provider", "مزود الاستضافة"),
        field("backup_status", "حالة النسخ الاحتياطي", {
          options: {
            unknown: labels.unknown,
            configured: labels.configured,
            verified: labels.verified,
          },
        }),
        field("backup_checked_on", "آخر اختبار استعادة", { type: "date" }),
        field("notes", "ملاحظات التشغيل والتحديث", {
          type: "textarea",
          wide: true,
        }),
      ];
    case "tickets":
      return [
        title,
        field("category", "نوع الطلب", {
          options: {
            support: labels.support,
            bug: labels.bug,
            change: labels.change,
            integration: labels.integration,
          },
        }),
        field("priority", "أولوية الطلب", { options: priorities }),
        field("status", "حالة الطلب", {
          options: {
            open: labels.open,
            in_progress: labels.in_progress,
            waiting: labels.waiting,
            resolved: labels.resolved,
          },
        }),
        owner(members),
        field("due_on", "موعد المتابعة", { type: "date" }),
        body,
        field("resolution", "الإجراء المنفّذ أو ملخص الحل", {
          type: "textarea",
          wide: true,
        }),
      ];
    case "payments":
      return [
        field("contract_id", "العقد", {
          options: Object.fromEntries(
            contracts
              .filter((c) => c.status === "signed")
              .map((c) => [c.id, String(c.title)]),
          ),
          required: true,
        }),
        field("amount_cents", "المبلغ المحصّل (ر.س)", {
          type: "money",
          required: true,
        }),
        field("paid_on", "تاريخ التحصيل", { type: "date", required: true }),
        field("method", "طريقة التحصيل", {
          options: {
            bank: labels.bank,
            cash: labels.cash,
            card: labels.card,
            other: labels.other,
          },
        }),
        field("reference", "مرجع التحويل أو الإيصال"),
        field("notes", "ملاحظات الدفعة", { type: "textarea", wide: true }),
      ];
  }
}
export function defaults(
  resource: Resource | "payments" | "account",
  kind: AccountKind = "lead",
) {
  const today = todaySaudi();
  return resource === "account"
    ? {
        stage: kind === "lead" ? "new" : "onboarding",
        priority: "normal",
        source: "other",
        branches: 1,
      }
    : resource === "contracts"
      ? {
          ...renewalDate(
            new Date(Date.parse(`${today}T12:00:00Z`) - 86400000)
              .toISOString()
              .slice(0, 10),
          ),
          annual_fee_cents: 0,
          setup_fee_cents: 0,
          status: "draft",
        }
      : resource === "activities"
        ? { channel: "note", occurred_on: today }
        : resource === "followups"
          ? { status: "open", category: "followup" }
          : resource === "tickets"
            ? { status: "open", priority: "normal", category: "support" }
            : resource === "payments"
              ? { paid_on: today, method: "bank" }
              : resource === "workspaces"
                ? {
                    environment: "production",
                    status: "planned",
                    backup_status: "unknown",
                  }
                : {};
}
