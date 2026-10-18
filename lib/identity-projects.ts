import type { Account, Member, Row } from "@/lib/crm/types";
import type { FinanceEntry } from "@/lib/finance";
import { financeDate } from "@/lib/finance";
import { CrmError, uuid } from "@/lib/crm/validation";

export const identityStages = {
  inquiry: "طلب جديد",
  brief: "فهم الاحتياج",
  proposal: "عرض السعر",
  design: "التصميم",
  review: "مراجعة العميل",
  delivery: "التسليم",
  completed: "مكتمل",
  on_hold: "معلّق",
  cancelled: "ملغي",
};
export const identityTypes = {
  refresh: "تطوير هوية قائمة",
  new: "تأسيس هوية جديدة",
  digital: "تطبيق الهوية رقميًا",
};
export const quoteStatuses = {
  draft: "مسودة",
  sent: "تم إرسال العرض",
  accepted: "معتمد من العميل",
  declined: "لم يُعتمد",
};
export const deliverableStatuses = {
  planned: "مخطط",
  in_progress: "قيد التنفيذ",
  review: "بانتظار المراجعة",
  approved: "معتمد",
};
export type IdentityProject = Row & {
  title: string;
  account_id: string;
  status: keyof typeof identityStages;
  service_type: keyof typeof identityTypes;
  owner_id: string | null;
  designer: string;
  brief: string;
  audience: string;
  scope: string;
  exclusions: string;
  quote_status: keyof typeof quoteStatuses;
  quote_fee_cents: number | null;
  quote_reference: string;
  acceptance_note: string;
  accepted_on: string | null;
  revision_limit: number;
  due_on: string | null;
  handover_url: string;
  notes: string;
  archived: boolean;
  payment_due_on: string | null;
};
export type IdentityDeliverable = Row & {
  project_id: string;
  title: string;
  status: keyof typeof deliverableStatuses;
  due_on: string | null;
  asset_url: string;
  approval_note: string;
  approved_on: string | null;
  revision_round: number;
  notes: string;
};
export type IdentityData = {
  projects: IdentityProject[];
  deliverables: IdentityDeliverable[];
  events: Row[];
  entries: FinanceEntry[];
  accounts: Account[];
  members: Member[];
};
type Input = Record<string, unknown>;
function text(input: Input, key: string, max: number, required = false) {
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
function integer(value: unknown, key: string, max = 100) {
  if (!Number.isSafeInteger(value) || Number(value) < 0 || Number(value) > max)
    throw new CrmError("أدخل عددًا صحيحًا ضمن النطاق المسموح.", 400, key);
  return Number(value);
}
function url(input: Input, key: string) {
  const value = text(input, key, 1000);
  if (value) {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:" || parsed.username || parsed.password)
        throw new Error();
    } catch {
      throw new CrmError("استخدم رابط HTTPS بدون بيانات دخول.", 400, key);
    }
  }
  return value;
}
export function identityProjectFields(input: Input) {
  const fee =
    input.quote_fee_cents == null || input.quote_fee_cents === ""
      ? null
      : integer(input.quote_fee_cents, "quote_fee_cents", 100000000000);
  if (fee === 0)
    throw new CrmError(
      "أدخل قيمة عرض أكبر من صفر أو اتركه حتى التسعير.",
      400,
      "quote_fee_cents",
    );
  return {
    title: text(input, "title", 200, true),
    account_id: uuid(input.account_id),
    service_type: option(input, "service_type", identityTypes, "refresh"),
    status: option(input, "status", identityStages, "inquiry"),
    owner_id:
      input.owner_id == null || input.owner_id === ""
        ? null
        : uuid(input.owner_id),
    designer: text(input, "designer", 200),
    brief: text(input, "brief", 10000),
    audience: text(input, "audience", 3000),
    scope: text(input, "scope", 10000),
    exclusions: text(input, "exclusions", 5000),
    quote_status: option(input, "quote_status", quoteStatuses, "draft"),
    quote_fee_cents: fee,
    quote_reference: text(input, "quote_reference", 1000),
    acceptance_note: text(input, "acceptance_note", 2000),
    accepted_on: financeDate(input.accepted_on, "accepted_on", false),
    revision_limit: integer(input.revision_limit ?? 2, "revision_limit"),
    due_on: financeDate(input.due_on, "due_on", false),
    payment_due_on: financeDate(input.payment_due_on, "payment_due_on", false),
    handover_url: url(input, "handover_url"),
    notes: text(input, "notes", 10000),
  };
}
export function identityDeliverableFields(input: Input) {
  return {
    title: text(input, "title", 200, true),
    status: option(input, "status", deliverableStatuses, "planned"),
    due_on: financeDate(input.due_on, "due_on", false),
    asset_url: url(input, "asset_url"),
    approval_note: text(input, "approval_note", 2000),
    approved_on: financeDate(input.approved_on, "approved_on", false),
    revision_round: integer(input.revision_round ?? 0, "revision_round"),
    notes: text(input, "notes", 5000),
  };
}
export function identityBalance(
  project: IdentityProject,
  entries: FinanceEntry[],
) {
  const own = entries.filter(
    (row) => row.identity_project_id === project.id && !row.voided,
  );
  const received = own
    .filter((row) => row.kind === "income")
    .reduce((sum, row) => sum + Number(row.amount_cents), 0);
  const costs = own
    .filter((row) => row.kind === "expense" && row.paid_on)
    .reduce((sum, row) => sum + Number(row.amount_cents), 0);
  return {
    received,
    costs,
    remaining:
      project.quote_status === "accepted"
        ? Math.max(0, Number(project.quote_fee_cents) - received)
        : null,
    net: received - costs,
  };
}
