import "server-only";
import { taskBody, taskSession, TaskError } from "@/lib/tasks-server";
import {
  CrmError,
  uuid,
  revision,
  accountFields,
  resourceFields,
  paymentFields,
} from "./validation";
import {
  resources,
  type Resource,
  type Account,
  type Profile,
  type Plan,
} from "./types";

export { taskSession as crmSession, taskBody as crmBody };
export function crmJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function crmFailure(error: unknown) {
  if (error instanceof CrmError || error instanceof TaskError)
    return crmJson(
      {
        error: error.message,
        field: error instanceof CrmError ? error.field : undefined,
      },
      error.status,
    );
  console.error(
    "CRM request failed:",
    error instanceof Error ? error.name : "Unknown",
  );
  return crmJson({ error: "تعذر تنفيذ الطلب. حاول مرة أخرى." }, 503);
}
export function dbError(error: { code?: string; message?: string }) {
  if (error.code === "PT409")
    throw new CrmError(
      error.message?.includes("OVERPAYMENT")
        ? "الدفعة تتجاوز المبلغ المتبقي من العقد. حدّث الملف وراجع المبلغ."
        : "تغيّر السجل من مستخدم آخر. حدّث البيانات وراجع تعديلاتك قبل حفظها مجددًا.",
      409,
    );
  if (error.code === "23505")
    throw new CrmError(
      "هذا السجل موجود بالفعل؛ حدّث الصفحة قبل إعادة المحاولة.",
      409,
    );
  if (error.code === "42501")
    throw new CrmError("لا تملك صلاحية تنفيذ العملية.", 403);
  if (error.code === "P0002") throw new CrmError("السجل غير موجود.", 404);
  if (error.code === "23503")
    throw new CrmError(
      "السجل مرتبط ببيانات أخرى أو لم يعد موجودًا. راجع الملف أولًا.",
      409,
    );
  if (error.code === "22023" || error.code === "23514") {
    const messages: Record<string, string> = {
      CRM_CONTRACT_OVERLAP: "هناك عقد موقّع يغطي هذه الفترة بالفعل.",
      CRM_CONTRACT_HAS_PAYMENTS:
        "العقد له دفعات مسجلة؛ راجعها قبل تخفيض القيمة أو إلغاء العقد.",
      CRM_CONTRACT_KEEP_HISTORY:
        "احتفظ بالعقد الموقّع في السجل، واستخدم حالة الإلغاء عند الحاجة.",
      CRM_OWNER_INACTIVE: "المسؤول المختار لم يعد عضوًا نشطًا.",
      CRM_PLAN_UNAVAILABLE:
        "الباقة المختارة لم تعد متاحة للاشتراكات الجديدة. حدّث القائمة واختر باقة متاحة.",
      CRM_PAYMENT_CONTRACT:
        "تسجيل الدفعة يحتاج عقدًا موقّعًا تابعًا لهذا العميل.",
      CRM_PAYMENT_FUTURE:
        "تاريخ التحصيل لا يمكن أن يكون في المستقبل؛ سجّل موعد السداد في العقد.",
      CRM_ACCOUNT_UNAVAILABLE: "استعد الملف من الأرشيف قبل تعديله.",
      CRM_PAYMENT_IMMUTABLE:
        "الدفعات المسجلة لا تُعدّل؛ ألغِ التسجيل بسبب واضح ثم سجّل الدفعة الصحيحة.",
    };
    throw new CrmError(
      messages[error.message ?? ""] ??
        "راجع القيم وتواريخ العقد وحالة العميل قبل الحفظ.",
      409,
    );
  }
  throw new CrmError("تعذر حفظ البيانات. حاول مرة أخرى.", 503);
}
type Client = Awaited<ReturnType<typeof taskSession>>;
export async function allRows(
  client: Client,
  table: string,
  accountId?: string,
) {
  const result = [];
  for (let start = 0; ; start += 500) {
    let query = client
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .order("id")
      .range(start, start + 499);
    if (accountId) query = query.eq("account_id", accountId);
    const { data, error } = await query;
    if (error) throw new CrmError("تعذر تحميل بيانات إدارة العملاء.", 503);
    result.push(...data);
    if (data.length < 500) return result;
  }
}
export async function members(client: Client) {
  const { data, error } = await client
    .from("board_members")
    .select("user_id,display_name")
    .eq("active", true)
    .order("display_name");
  if (error) throw new CrmError("تعذر تحميل مسؤولي المتابعة.", 503);
  return data.map((row) => ({
    id: row.user_id as string,
    name: row.display_name as string,
  }));
}
export async function plans(client: Client) {
  const rows = await allRows(client, "crm_plans");
  return (rows as Plan[]).sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "ar"),
  );
}
export async function account(client: Client, id: string, writable = false) {
  uuid(id);
  const { data, error } = await client
    .from("crm_accounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new CrmError("تعذر تحميل الملف.", 503);
  if (!data) throw new CrmError("الملف غير موجود.", 404);
  if (writable && data.archived)
    throw new CrmError(
      "استعد الملف من الأرشيف قبل إضافة أو تعديل بياناته.",
      409,
    );
  return data as Account;
}
export async function profile(client: Client, id: string): Promise<Profile> {
  const acc = await account(client, id);
  const [entries, team, catalog] = await Promise.all([
    Promise.all(
      [...resources, "payments", "events"].map((resource) =>
        allRows(client, `crm_${resource}`, id),
      ),
    ),
    members(client),
    plans(client),
  ]);
  return {
    account: acc,
    members: team,
    plans: catalog,
    ...Object.fromEntries(
      [...resources, "payments", "events"].map((key, i) => [key, entries[i]]),
    ),
  } as Profile;
}
export async function changeAccount(request: Request) {
  const client = await taskSession(),
    body = await taskBody(request);
  const fields = body.fields;
  if (!fields || typeof fields !== "object" || Array.isArray(fields))
    throw new CrmError("بيانات الملف غير صالحة.");
  if (request.method === "POST") {
    if (body.kind !== "lead" && body.kind !== "client")
      throw new CrmError("نوع الملف غير صالح.");
    const id = uuid(body.id);
    const input = {
      ...accountFields(fields as Record<string, unknown>, body.kind),
      id,
      kind: body.kind,
    };
    const { data, error } = await client
      .from("crm_accounts")
      .insert(input)
      .select("*")
      .single();
    if (error) dbError(error);
    return crmJson({ account: data }, 201);
  }
  const acc = await account(client, uuid(body.id));
  let input: Record<string, unknown>;
  if (
    Object.keys(fields).length === 1 &&
    typeof (fields as Record<string, unknown>).archived === "boolean"
  )
    input = { archived: (fields as Record<string, unknown>).archived };
  else {
    if (acc.archived) throw new CrmError("استعد الملف قبل تعديله.", 409);
    input = accountFields(fields as Record<string, unknown>, acc.kind);
  }
  const { data, error } = await client
    .from("crm_accounts")
    .update(input)
    .eq("id", acc.id)
    .eq("revision", revision(body.revision))
    .select("*")
    .maybeSingle();
  if (error) dbError(error);
  if (!data)
    throw new CrmError(
      "تغيّر الملف. حدّثه وراجع التعديلات قبل المحاولة مجددًا.",
      409,
    );
  return crmJson({ account: data });
}
export async function changeEntry(request: Request, resource: string) {
  const client = await taskSession(),
    body = await taskBody(request);
  const acc = await account(client, uuid(body.account_id), true),
    id = uuid(body.id);
  if (![...resources, "payments"].includes(resource as Resource))
    throw new CrmError("القسم غير موجود.", 404);
  if (
    ["contracts", "workspaces", "tickets", "payments"].includes(resource) &&
    acc.kind !== "client"
  )
    throw new CrmError("هذا القسم خاص بالعملاء المتعاقدين.");
  if (resource === "payments") {
    if (request.method === "DELETE")
      throw new CrmError("استخدم إلغاء تسجيل الدفعة مع السبب.");
    if (request.method === "PATCH") {
      const reason = typeof body.reason === "string" ? body.reason.trim() : "";
      if (reason.length < 2 || reason.length > 2000)
        throw new CrmError("اكتب سبب إلغاء تسجيل الدفعة.");
      const { data, error } = await client
        .from("crm_payments")
        .update({ voided: true, void_reason: reason })
        .eq("id", id)
        .eq("account_id", acc.id)
        .eq("revision", revision(body.revision))
        .select("*")
        .maybeSingle();
      if (error) dbError(error);
      if (!data) throw new CrmError("تغيّر السجل. حدّث الملف أولًا.", 409);
      return crmJson({ row: data });
    }
  }
  if (request.method === "DELETE") {
    const { data, error } = await client
      .from(`crm_${resource}`)
      .delete()
      .eq("id", id)
      .eq("account_id", acc.id)
      .eq("revision", revision(body.revision))
      .select("id")
      .maybeSingle();
    if (error) dbError(error);
    if (!data) throw new CrmError("تغيّر السجل أو حُذف. حدّث الملف.", 409);
    return crmJson({ deleted: id });
  }
  if (
    !body.fields ||
    typeof body.fields !== "object" ||
    Array.isArray(body.fields)
  )
    throw new CrmError("بيانات السجل غير صالحة.");
  const fields =
    resource === "payments"
      ? paymentFields(body.fields as Record<string, unknown>)
      : resourceFields(
          resource as Resource,
          body.fields as Record<string, unknown>,
        );
  let query;
  if (request.method === "POST")
    query = client
      .from(`crm_${resource}`)
      .insert({ ...fields, id, account_id: acc.id });
  else
    query = client
      .from(`crm_${resource}`)
      .update(fields)
      .eq("id", id)
      .eq("account_id", acc.id)
      .eq("revision", revision(body.revision));
  const { data, error } = await query.select("*").maybeSingle();
  if (error) dbError(error);
  if (!data) throw new CrmError("تغيّر السجل. حدّث الملف وراجع تعديلاتك.", 409);
  return crmJson({ row: data }, request.method === "POST" ? 201 : 200);
}
