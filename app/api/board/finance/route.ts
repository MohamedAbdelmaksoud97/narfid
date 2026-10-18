import {
  allRows,
  crmBody,
  crmFailure,
  crmJson,
  crmSession,
  dbError,
} from "@/lib/crm/server";
import { CrmError, csvCell, revision, uuid } from "@/lib/crm/validation";
import { todaySaudi, type Account, type Row } from "@/lib/crm/types";
import {
  cashMovements,
  expenseCategories,
  financeFields,
  financeFilter,
  inPeriod,
  matchesFinance,
  paymentMethods,
  receivables,
  type FinanceData,
  type FinanceEntry,
} from "@/lib/finance";

export async function GET(request: Request) {
  try {
    const client = await crmSession();
    const [accounts, contracts, payments, entries] = await Promise.all([
      allRows(client, "crm_accounts"),
      allRows(client, "crm_contracts"),
      allRows(client, "crm_payments"),
      allRows(client, "finance_entries"),
    ]);
    const data: FinanceData = {
      accounts: accounts as Account[],
      contracts: contracts as Row[],
      payments: payments as Row[],
      entries: entries as FinanceEntry[],
      as_of: todaySaudi(),
    };
    const params = new URL(request.url).searchParams;
    if (params.get("format") !== "csv") return crmJson(data);
    const filter = financeFilter(params),
      report = params.get("report") ?? "cash";
    const name = (id: string | null) =>
      accounts.find((row) => row.id === id)?.name ?? "عام";
    let rows: unknown[][];
    if (report === "receivables") {
      rows = [
        [
          "العميل",
          "العقد",
          "موعد السداد",
          "قيمة العقد (ر.س)",
          "المحصّل (ر.س)",
          "المتبقي (ر.س)",
          "الحالة",
          "كما في",
        ],
      ];
      for (const row of receivables(data, filter.account_id))
        rows.push([
          name(row.account_id),
          row.contract.title,
          row.due_on,
          (row.total / 100).toFixed(2),
          (row.received / 100).toFixed(2),
          (row.remaining / 100).toFixed(2),
          row.overdue ? "متأخر" : "مستحق",
          data.as_of,
        ]);
    } else if (report === "expenses") {
      rows = [
        [
          "الوصف",
          "التصنيف",
          "العميل",
          "الجهة",
          "المبلغ (ر.س)",
          "الاستحقاق",
          "تاريخ الدفع",
          "طريقة الدفع",
          "المرجع",
          "الحالة",
          "سبب الإلغاء",
          "ملاحظات",
        ],
      ];
      for (const row of data.entries.filter(
        (row) =>
          row.kind === "expense" &&
          matchesFinance(row, filter) &&
          inPeriod(row.paid_on || row.due_on, filter),
      ))
        rows.push([
          row.title,
          expenseCategories[row.category as keyof typeof expenseCategories],
          name(row.account_id),
          row.counterparty,
          (row.amount_cents / 100).toFixed(2),
          row.due_on,
          row.paid_on,
          paymentMethods[row.method],
          row.reference,
          row.voided ? "ملغي" : row.paid_on ? "مدفوع" : "بانتظار الدفع",
          row.void_reason,
          row.notes,
        ]);
    } else if (report === "cash" || report === "income") {
      rows = [
        [
          "التاريخ",
          "نوع الحركة",
          "الوصف",
          "التصنيف",
          "العميل",
          "الجهة",
          "المبلغ (ر.س)",
          "طريقة الدفع",
          "المرجع",
          "الحالة",
          "سبب الإلغاء",
          "ملاحظات",
        ],
      ];
      for (const row of cashMovements(data).filter(
        (row) =>
          row.paid_on <= data.as_of &&
          matchesFinance(row, filter) &&
          inPeriod(row.paid_on, filter) &&
          (report !== "income" || row.kind === "income"),
      ))
        rows.push([
          row.paid_on,
          row.kind === "income" ? "قبض" : "صرف",
          row.title,
          row.category,
          name(row.account_id),
          row.counterparty,
          (row.amount_cents / 100).toFixed(2),
          paymentMethods[row.method as keyof typeof paymentMethods],
          row.reference,
          row.voided ? "ملغي" : "مسجل",
          row.void_reason,
          row.notes,
        ]);
    } else throw new CrmError("التقرير غير موجود.", 400);
    return new Response(
      "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="narfid-finance-${report}-${data.as_of}.csv"`,
          "Cache-Control": "private, no-store",
          "X-Robots-Tag": "noindex, nofollow",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    return crmFailure(error);
  }
}

async function change(request: Request) {
  try {
    const client = await crmSession(),
      body = await crmBody(request),
      id = uuid(body.id);
    let fields: Record<string, unknown>;
    if (request.method === "PATCH") {
      const { data: old, error } = await client
        .from("finance_entries")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) dbError(error);
      if (!old) throw new CrmError("الحركة غير موجودة.", 404);
      if (old.voided)
        throw new CrmError("الحركة ملغاة بالفعل. حدّث البيانات.", 409);
      if (body.action === "void") {
        const reason =
          typeof body.reason === "string" ? body.reason.trim() : "";
        if (reason.length < 2 || reason.length > 2000)
          throw new CrmError(
            "اكتب سبب إلغاء التسجيل (حرفان إلى ٢٠٠٠ حرف).",
            400,
            "reason",
          );
        fields = { voided: true, void_reason: reason };
      } else {
        if (old.paid_on)
          throw new CrmError(
            "الحركة المدفوعة لا تُعدّل؛ ألغِ التسجيل بسبب واضح وسجّل الحركة الصحيحة.",
            409,
          );
        if (
          !body.fields ||
          typeof body.fields !== "object" ||
          Array.isArray(body.fields)
        )
          throw new CrmError("بيانات الحركة غير صالحة.");
        fields = financeFields({ ...old, ...body.fields, kind: old.kind });
      }
    } else {
      if (
        !body.fields ||
        typeof body.fields !== "object" ||
        Array.isArray(body.fields)
      )
        throw new CrmError("بيانات الحركة غير صالحة.");
      fields = financeFields(body.fields as Record<string, unknown>);
    }
    const query =
      request.method === "POST"
        ? client.from("finance_entries").insert({ ...fields, id })
        : client
            .from("finance_entries")
            .update(fields)
            .eq("id", id)
            .eq("revision", revision(body.revision));
    const { data, error } = await query.select("*").maybeSingle();
    if (error?.code === "22023") {
      const messages: Record<string, string> = {
        FINANCE_FUTURE_PAYMENT:
          "تاريخ القبض أو الدفع لا يمكن أن يكون في المستقبل.",
        FINANCE_IMMUTABLE:
          "الحركة مسددة أو ملغاة؛ حدّث البيانات. لتصحيح حركة مسددة ألغِ تسجيلها أولًا.",
        FINANCE_VOID_REASON: "اكتب سبب إلغاء التسجيل.",
      };
      throw new CrmError(
        messages[error.message] ?? "راجع حالة الحركة وقيمها.",
        409,
      );
    }
    if (error) dbError(error);
    if (!data)
      throw new CrmError(
        "تغيّرت الحركة من مستخدم آخر. حدّث البيانات قبل الحفظ.",
        409,
      );
    return crmJson({ entry: data }, request.method === "POST" ? 201 : 200);
  } catch (error) {
    return crmFailure(error);
  }
}
export const POST = change;
export const PATCH = change;
