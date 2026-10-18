import {
  clientStages,
  leadStages,
  priorities,
  sources,
  todaySaudi,
  type AccountKind,
  type Resource,
} from "./types";

export class CrmError extends Error {
  constructor(
    message: string,
    public status = 400,
    public field?: string,
  ) {
    super(message);
  }
}
export function uuid(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new CrmError("معرّف السجل غير صالح.");
  return value;
}
export function revision(value: unknown) {
  if (!Number.isSafeInteger(value) || Number(value) < 0)
    throw new CrmError("رقم المراجعة غير صالح.");
  return Number(value);
}
type Input = Record<string, unknown>;
function text(input: Input, key: string, max = 200, required = false) {
  const value = input[key] ?? "";
  if (
    typeof value !== "string" ||
    value.trim().length > max ||
    (required && value.trim().length < 2)
  )
    throw new CrmError(
      required
        ? "أكمل هذا الحقل (حرفان على الأقل)."
        : `الحد الأقصى ${max} حرفًا.`,
      400,
      key,
    );
  return value.trim();
}
function option(input: Input, key: string, options: object, fallback: string) {
  const value = input[key] ?? fallback;
  if (typeof value !== "string" || !Object.hasOwn(options, value))
    throw new CrmError("اختر قيمة صحيحة.", 400, key);
  return value;
}
function date(input: Input, key: string, required = false) {
  const value = input[key];
  if ((value === "" || value == null) && !required) return null;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(`${value}T12:00:00Z`)) ||
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value ||
    value < "2000-01-01" ||
    value > "2100-12-31"
  )
    throw new CrmError("أدخل تاريخًا صحيحًا.", 400, key);
  return value;
}
function owner(input: Input, key = "owner_id") {
  return input[key] ? uuid(input[key]) : null;
}
function number(input: Input, key: string, fallback = 0, max = 100000000000) {
  const value = input[key] ?? fallback;
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > max)
    throw new CrmError("أدخل رقمًا صحيحًا ضمن النطاق المسموح.", 400, key);
  return Number(value);
}
function contact(input: Input) {
  const email = text(input, "email", 254),
    phone = text(input, "phone", 32);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new CrmError("أدخل بريدًا صحيحًا.", 400, "email");
  if (phone && !/^\+?[\d ()-]{5,32}$/.test(phone))
    throw new CrmError("أدخل رقم تواصل صحيحًا.", 400, "phone");
  return { email, phone };
}
function url(input: Input, key: string) {
  const value = text(input, key, 1000);
  if (!value) return "";
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password)
      throw new Error();
  } catch {
    throw new CrmError("استخدم رابط HTTPS بدون بيانات دخول.", 400, key);
  }
  return value;
}
export function parseMoney(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/[٠-٩]/g, (n) => String("٠١٢٣٤٥٦٧٨٩".indexOf(n)))
    .replace("٫", ".");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(normalized))
    throw new CrmError("أدخل مبلغًا صحيحًا بالريال (حتى منزلتين عشريتين).");
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
export function accountFields(input: Input, kind: AccountKind) {
  const fields = {
    name: text(input, "name", 200, true),
    stage: option(
      input,
      "stage",
      kind === "lead" ? leadStages : clientStages,
      kind === "lead" ? "new" : "onboarding",
    ),
    owner_id: owner(input),
    plan_id: owner(input, "plan_id"),
    priority: option(input, "priority", priorities, "normal"),
    source: option(input, "source", sources, "other"),
    city: text(input, "city", 100),
    institution_type: text(input, "institution_type", 100),
    branches: number(input, "branches", 1, 10000),
    contact_name: text(input, "contact_name", 150),
    contact_role: text(input, "contact_role", 100),
    ...contact(input),
    website: url(input, "website"),
    needs: text(input, "needs", 10000),
    annual_budget_cents:
      input.annual_budget_cents == null || input.annual_budget_cents === ""
        ? null
        : number(input, "annual_budget_cents"),
    expected_close_on: date(input, "expected_close_on"),
    next_follow_up_on: date(input, "next_follow_up_on"),
    lost_reason: text(input, "lost_reason", 2000),
  };
  if (!fields.branches)
    throw new CrmError("عدد الفروع يبدأ من ١.", 400, "branches");
  if (fields.stage === "lost" && !fields.lost_reason)
    throw new CrmError("اذكر سبب عدم الاتفاق.", 400, "lost_reason");
  return fields;
}
export function resourceFields(resource: Resource, input: Input) {
  const common = () => ({ title: text(input, "title", 200, true) });
  switch (resource) {
    case "contacts":
      return {
        name: text(input, "name", 150, true),
        role: text(input, "role", 100),
        ...contact(input),
        notes: text(input, "notes", 4000),
      };
    case "activities":
      return {
        ...common(),
        body: text(input, "body", 10000),
        channel: option(
          input,
          "channel",
          { note: 1, call: 1, whatsapp: 1, email: 1, meeting: 1, demo: 1 },
          "note",
        ),
        occurred_on: date(input, "occurred_on", true),
      };
    case "followups":
      return {
        ...common(),
        details: text(input, "details", 4000),
        due_on: date(input, "due_on"),
        owner_id: owner(input),
        status: option(input, "status", { open: 1, done: 1 }, "open"),
        category: option(
          input,
          "category",
          { followup: 1, onboarding: 1 },
          "followup",
        ),
      };
    case "contracts": {
      const starts = date(input, "starts_on", true)!,
        ends = date(input, "ends_on", true)!;
      if (ends < starts)
        throw new CrmError("نهاية العقد تسبق بدايته.", 400, "ends_on");
      return {
        ...common(),
        reference: text(input, "reference", 150),
        plan_id: owner(input, "plan_id"),
        starts_on: starts,
        ends_on: ends,
        payment_due_on: date(input, "payment_due_on"),
        annual_fee_cents: number(input, "annual_fee_cents"),
        setup_fee_cents: number(input, "setup_fee_cents"),
        status: option(
          input,
          "status",
          { draft: 1, signed: 1, cancelled: 1 },
          "draft",
        ),
        scope: text(input, "scope", 10000),
        document_url: url(input, "document_url"),
      };
    }
    case "workspaces": {
      const database_ref = text(input, "database_ref", 200);
      if (
        /postgres(?:ql)?:\/\/|sb_secret|service_role|password\s*=|bearer\s/i.test(
          database_ref,
        )
      )
        throw new CrmError(
          "سجّل اسم المشروع أو مرجعه فقط؛ بيانات الدخول تحفظ في مدير أسرار.",
          400,
          "database_ref",
        );
      const fields = {
        environment: option(
          input,
          "environment",
          { production: 1, staging: 1 },
          "production",
        ),
        status: option(
          input,
          "status",
          {
            planned: 1,
            configuring: 1,
            testing: 1,
            live: 1,
            maintenance: 1,
            retired: 1,
          },
          "planned",
        ),
        app_url: url(input, "app_url"),
        database_ref,
        repository_url: url(input, "repository_url"),
        release_ref: text(input, "release_ref", 200),
        hosting_provider: text(input, "hosting_provider", 150),
        backup_status: option(
          input,
          "backup_status",
          { unknown: 1, configured: 1, verified: 1 },
          "unknown",
        ),
        backup_checked_on: date(input, "backup_checked_on"),
        notes: text(input, "notes", 5000),
      };
      if (fields.status === "live" && (!fields.app_url || !fields.database_ref))
        throw new CrmError(
          "سجّل رابط التطبيق ومرجع قاعدة البيانات قبل اعتماد التشغيل.",
          400,
          "app_url",
        );
      if (fields.backup_status === "verified" && !fields.backup_checked_on)
        throw new CrmError(
          "سجّل تاريخ اختبار الاستعادة.",
          400,
          "backup_checked_on",
        );
      return fields;
    }
    case "tickets":
      return {
        ...common(),
        body: text(input, "body", 10000),
        category: option(
          input,
          "category",
          { support: 1, bug: 1, change: 1, integration: 1 },
          "support",
        ),
        priority: option(input, "priority", priorities, "normal"),
        status: option(
          input,
          "status",
          { open: 1, in_progress: 1, waiting: 1, resolved: 1 },
          "open",
        ),
        owner_id: owner(input),
        due_on: date(input, "due_on"),
        resolution: text(input, "resolution", 5000),
      };
  }
}
export function paymentFields(input: Input) {
  const amount = number(input, "amount_cents");
  if (!amount)
    throw new CrmError(
      "قيمة الدفعة يجب أن تكون أكبر من صفر.",
      400,
      "amount_cents",
    );
  const paid_on = date(input, "paid_on", true)!;
  if (paid_on > todaySaudi())
    throw new CrmError(
      "تاريخ التحصيل لا يمكن أن يكون في المستقبل؛ سجّل موعد السداد في العقد.",
      400,
      "paid_on",
    );
  return {
    contract_id: uuid(input.contract_id),
    amount_cents: amount,
    paid_on,
    method: option(
      input,
      "method",
      { bank: 1, cash: 1, card: 1, other: 1 },
      "bank",
    ),
    reference: text(input, "reference", 150),
    notes: text(input, "notes", 4000),
  };
}
export function csvCell(value: unknown) {
  let result = String(value ?? "");
  if (/^[\s]*[=+\-@\t\r]/.test(result)) result = `'${result}`;
  return `"${result.replaceAll('"', '""')}"`;
}

export function planFields(input: Input) {
  const raw =
    typeof input.features === "string"
      ? input.features.split(/\r?\n/)
      : input.features;
  if (!Array.isArray(raw) || raw.some((value) => typeof value !== "string"))
    throw new CrmError("أضف المميزات، كل ميزة في سطر مستقل.", 400, "features");
  const features = [
    ...new Set((raw as string[]).map((value) => value.trim()).filter(Boolean)),
  ];
  if (
    !features.length ||
    features.length > 50 ||
    features.some((value) => value.length > 200)
  )
    throw new CrmError(
      "أضف من ميزة إلى ٥٠ ميزة، وبحد أقصى ٢٠٠ حرف لكل ميزة.",
      400,
      "features",
    );
  const pricing_type = option(
    input,
    "pricing_type",
    { fixed: 1, custom: 1 },
    "fixed",
  );
  if (pricing_type === "fixed" && input.annual_fee_cents == null)
    throw new CrmError("أدخل السعر السنوي للباقة.", 400, "annual_fee_cents");
  if (
    input.active !== true &&
    input.active !== false &&
    input.active !== "true" &&
    input.active !== "false"
  )
    throw new CrmError("اختر حالة إتاحة صحيحة.", 400, "active");
  const sort_order = number(input, "sort_order", 1, 10000);
  if (!sort_order)
    throw new CrmError("ترتيب العرض يبدأ من ١.", 400, "sort_order");
  return {
    name: text(input, "name", 150, true),
    description: text(input, "description", 2000),
    pricing_type,
    annual_fee_cents:
      pricing_type === "custom" ? null : number(input, "annual_fee_cents"),
    setup_fee_cents: number(input, "setup_fee_cents"),
    features,
    sort_order,
    active: input.active === true || input.active === "true",
  };
}
