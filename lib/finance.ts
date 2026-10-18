import type { Account, Row } from "@/lib/crm/types";
import { todaySaudi } from "@/lib/crm/types";
import { CrmError, uuid } from "@/lib/crm/validation";

export const expenseCategories = {
  hosting: "الاستضافة وقواعد البيانات",
  software: "الأدوات والاشتراكات التقنية",
  marketing: "التسويق والإعلانات",
  people: "الفريق والمستقلون",
  operations: "التشغيل والإدارة",
  equipment: "الأجهزة والمعدات",
  other_expense: "مصروفات أخرى",
};
export const incomeCategories = {
  development: "تطوير مخصص",
  mobile: "تطبيقات الجوال",
  gates: "تكامل بوابات الدخول",
  consulting: "خدمات واستشارات",
  other_income: "تحصيلات أخرى",
};
export const paymentMethods = {
  bank: "تحويل بنكي",
  cash: "نقدي",
  card: "بطاقة",
  other: "أخرى",
};
export type FinanceEntry = Row & {
  kind: "income" | "expense";
  title: string;
  category: keyof typeof expenseCategories | keyof typeof incomeCategories;
  amount_cents: number;
  account_id: string | null;
  counterparty: string;
  due_on: string;
  paid_on: string | null;
  method: keyof typeof paymentMethods;
  reference: string;
  notes: string;
  voided: boolean;
  void_reason: string;
};
export type FinanceData = {
  accounts: Account[];
  contracts: Row[];
  payments: Row[];
  entries: FinanceEntry[];
  as_of: string;
};
export type FinanceFilter = { from: string; to: string; account_id: string };
export type CashMovement = {
  id: string;
  source: "contract" | "entry";
  kind: "income" | "expense";
  title: string;
  category: string;
  amount_cents: number;
  paid_on: string;
  account_id: string | null;
  contract_id?: string;
  counterparty: string;
  method: string;
  reference: string;
  notes: string;
  voided: boolean;
  void_reason: string;
  revision: number;
};
export function financeDate(
  value: unknown,
  key: string,
  required = true,
): string | null {
  if ((value == null || value === "") && !required) return null;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "2000-01-01" ||
    value > "2100-12-31" ||
    !Number.isFinite(Date.parse(`${value}T12:00:00Z`)) ||
    new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value
  )
    throw new CrmError("أدخل تاريخًا صحيحًا.", 400, key);
  return value;
}
function text(
  input: Record<string, unknown>,
  key: string,
  max: number,
  required = false,
) {
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
export function financeFields(
  input: Record<string, unknown>,
  asOf = todaySaudi(),
) {
  const kind = input.kind;
  if (kind !== "income" && kind !== "expense")
    throw new CrmError("نوع الحركة غير صالح.", 400, "kind");
  const categories = kind === "expense" ? expenseCategories : incomeCategories;
  if (
    typeof input.category !== "string" ||
    !Object.hasOwn(categories, input.category)
  )
    throw new CrmError("اختر تصنيفًا مناسبًا للحركة.", 400, "category");
  if (
    !Number.isSafeInteger(input.amount_cents) ||
    Number(input.amount_cents) < 1 ||
    Number(input.amount_cents) > 100000000000
  )
    throw new CrmError(
      "أدخل مبلغًا أكبر من صفر بالريال السعودي.",
      400,
      "amount_cents",
    );
  const paid_on = financeDate(input.paid_on, "paid_on", kind === "income");
  if (paid_on && paid_on > asOf)
    throw new CrmError(
      "تاريخ القبض أو الدفع لا يمكن أن يكون في المستقبل.",
      400,
      "paid_on",
    );
  const method = input.method ?? "bank";
  if (typeof method !== "string" || !Object.hasOwn(paymentMethods, method))
    throw new CrmError("اختر طريقة دفع صحيحة.", 400, "method");
  return {
    kind,
    title: text(input, "title", 200, true),
    category: input.category,
    amount_cents: Number(input.amount_cents),
    account_id:
      input.account_id == null || input.account_id === ""
        ? null
        : uuid(input.account_id),
    counterparty: text(input, "counterparty", 200),
    due_on: financeDate(input.due_on, "due_on")!,
    paid_on,
    method,
    reference: text(input, "reference", 150),
    notes: text(input, "notes", 4000),
  };
}
export function financeFilter(params: URLSearchParams): FinanceFilter {
  const from = params.get("from") || "",
    to = params.get("to") || "",
    account_id = params.get("account_id") || "";
  if (from) financeDate(from, "from");
  if (to) financeDate(to, "to");
  if (from && to && from > to)
    throw new CrmError("بداية الفترة يجب أن تسبق نهايتها.", 400, "from");
  if (account_id) uuid(account_id);
  return { from, to, account_id };
}
export function cashMovements(data: FinanceData): CashMovement[] {
  const contracts = new Map(data.contracts.map((row) => [row.id, row]));
  return [
    ...data.payments.map(
      (row): CashMovement => ({
        id: row.id,
        source: "contract",
        kind: "income",
        title: String(
          contracts.get(String(row.contract_id))?.title ?? "دفعة عقد",
        ),
        category: "دفعة عقد",
        amount_cents: Number(row.amount_cents),
        paid_on: String(row.paid_on),
        account_id: String(row.account_id),
        contract_id: String(row.contract_id),
        counterparty: "",
        method: String(row.method),
        reference: String(row.reference),
        notes: String(row.notes),
        voided: Boolean(row.voided),
        void_reason: String(row.void_reason),
        revision: row.revision,
      }),
    ),
    ...data.entries
      .filter((row) => row.paid_on)
      .map(
        (row): CashMovement => ({
          ...row,
          source: "entry",
          paid_on: row.paid_on!,
          category: { ...expenseCategories, ...incomeCategories }[row.category],
        }),
      ),
  ].sort(
    (a, b) => b.paid_on.localeCompare(a.paid_on) || a.id.localeCompare(b.id),
  );
}
export function matchesFinance(
  row: { account_id: string | null },
  filter: FinanceFilter,
) {
  return !filter.account_id || row.account_id === filter.account_id;
}
export function inPeriod(date: string, filter: FinanceFilter) {
  return (
    (!filter.from || date >= filter.from) && (!filter.to || date <= filter.to)
  );
}
export function receivables(data: FinanceData, accountId = "") {
  const paid = new Map<string, number>();
  for (const row of data.payments) {
    if (!row.voided && String(row.paid_on) <= data.as_of) {
      const key = String(row.contract_id);
      paid.set(key, (paid.get(key) ?? 0) + Number(row.amount_cents));
    }
  }
  return data.contracts
    .filter(
      (row) =>
        row.status === "signed" && (!accountId || row.account_id === accountId),
    )
    .map((row) => {
      const total = Number(row.annual_fee_cents) + Number(row.setup_fee_cents),
        received = paid.get(row.id) ?? 0,
        due_on = String(row.payment_due_on || row.starts_on);
      return {
        contract: row,
        account_id: String(row.account_id),
        total,
        received,
        remaining: Math.max(0, total - received),
        due_on,
        overdue: due_on < data.as_of,
      };
    })
    .filter((row) => row.remaining > 0)
    .sort((a, b) => a.due_on.localeCompare(b.due_on));
}
export function financeSummary(data: FinanceData, filter: FinanceFilter) {
  const movements = cashMovements(data).filter(
    (row) =>
      !row.voided &&
      row.paid_on <= data.as_of &&
      matchesFinance(row, filter) &&
      inPeriod(row.paid_on, filter),
  );
  const income = movements
      .filter((row) => row.kind === "income")
      .reduce((sum, row) => sum + row.amount_cents, 0),
    expenses = movements
      .filter((row) => row.kind === "expense")
      .reduce((sum, row) => sum + row.amount_cents, 0),
    dues = receivables(data, filter.account_id),
    pending = data.entries.filter(
      (row) =>
        row.kind === "expense" &&
        !row.voided &&
        !row.paid_on &&
        matchesFinance(row, filter),
    );
  const months = new Map<
    string,
    { month: string; income: number; expenses: number; net: number }
  >();
  for (const row of movements) {
    const month = row.paid_on.slice(0, 7),
      item = months.get(month) ?? { month, income: 0, expenses: 0, net: 0 };
    item[row.kind === "income" ? "income" : "expenses"] += row.amount_cents;
    item.net = item.income - item.expenses;
    months.set(month, item);
  }
  return {
    income,
    expenses,
    net: income - expenses,
    outstanding: dues.reduce((sum, row) => sum + row.remaining, 0),
    overdue: dues
      .filter((row) => row.overdue)
      .reduce((sum, row) => sum + row.remaining, 0),
    payable: pending.reduce((sum, row) => sum + row.amount_cents, 0),
    payableOverdue: pending
      .filter((row) => row.due_on < data.as_of)
      .reduce((sum, row) => sum + row.amount_cents, 0),
    movements,
    dues,
    pending,
    months: [...months.values()].sort((a, b) => a.month.localeCompare(b.month)),
  };
}
