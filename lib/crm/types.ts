export type AccountKind = "lead" | "client";
export const leadStages = {
  new: "جديد",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  demo: "عرض توضيحي",
  proposal: "عرض سعر",
  negotiation: "تفاوض",
  lost: "لم يتم الاتفاق",
};
export const clientStages = {
  onboarding: "قيد التجهيز",
  active: "نشط",
  paused: "متوقف مؤقتًا",
  churned: "انتهت العلاقة",
};
export const priorities = {
  low: "منخفضة",
  normal: "عادية",
  high: "عالية",
  urgent: "عاجلة",
};
export const sources = {
  referral: "ترشيح",
  website: "الموقع",
  whatsapp: "واتساب",
  social: "السوشيال ميديا",
  outbound: "تواصل مباشر",
  event: "فعالية",
  other: "أخرى",
};
export const resources = [
  "contacts",
  "activities",
  "followups",
  "contracts",
  "workspaces",
  "tickets",
] as const;
export type Resource = (typeof resources)[number];
export type Row = {
  id: string;
  revision: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};
export type Account = Row & {
  kind: AccountKind;
  name: string;
  stage: string;
  owner_id: string | null;
  priority: keyof typeof priorities;
  source: keyof typeof sources;
  city: string;
  institution_type: string;
  branches: number;
  contact_name: string;
  contact_role: string;
  email: string;
  phone: string;
  website: string;
  needs: string;
  annual_budget_cents: number | null;
  expected_close_on: string | null;
  next_follow_up_on: string | null;
  lost_reason: string;
  archived: boolean;
  converted_at: string | null;
  plan_id: string | null;
};
export type Member = { id: string; name: string };
export type Plan = Row & {
  name: string;
  description: string;
  pricing_type: "fixed" | "custom";
  annual_fee_cents: number | null;
  setup_fee_cents: number;
  features: string[];
  active: boolean;
  sort_order: number;
};
export type CrmData = {
  plans: Plan[];
  accounts: Account[];
  members: Member[];
  followups: Row[];
  contracts: Row[];
  payments: Row[];
  tickets: Row[];
};
export type Profile = {
  plans: Plan[];
  account: Account;
  members: Member[];
  contacts: Row[];
  activities: Row[];
  followups: Row[];
  contracts: Row[];
  workspaces: Row[];
  tickets: Row[];
  payments: Row[];
  events: Row[];
};
export function todaySaudi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function money(cents: unknown) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(Number(cents ?? 0) / 100);
}
export function dateLabel(date: unknown) {
  return typeof date === "string" && date
    ? new Intl.DateTimeFormat("ar-SA", {
        calendar: "gregory",
        dateStyle: "medium",
        timeZone: "Asia/Riyadh",
      }).format(new Date(date.length === 10 ? `${date}T12:00:00Z` : date))
    : "—";
}
export function accountPath(account: Pick<Account, "kind" | "id">) {
  return `/board/${account.kind === "lead" ? "leads" : "clients"}/${account.id}`;
}
export function contractBalance(contract: Row, payments: Row[]) {
  const paid = payments
    .filter((payment) => payment.contract_id === contract.id && !payment.voided)
    .reduce((sum, payment) => sum + Number(payment.amount_cents), 0);
  return {
    paid,
    total: Number(contract.annual_fee_cents) + Number(contract.setup_fee_cents),
    remaining:
      Number(contract.annual_fee_cents) +
      Number(contract.setup_fee_cents) -
      paid,
  };
}
export function renewalDate(end: string) {
  const next = new Date(`${end}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const starts = next.toISOString().slice(0, 10);
  const year = next.getUTCFullYear() + 1,
    month = next.getUTCMonth(),
    day = next.getUTCDate();
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const finish = new Date(Date.UTC(year, month, Math.min(day, last)));
  finish.setUTCDate(finish.getUTCDate() - 1);
  return { starts_on: starts, ends_on: finish.toISOString().slice(0, 10) };
}
