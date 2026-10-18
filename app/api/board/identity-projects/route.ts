import {
  allRows,
  account,
  crmBody,
  crmFailure,
  crmJson,
  crmSession,
  dbError,
  members,
} from "@/lib/crm/server";
import { CrmError, uuid, revision, csvCell } from "@/lib/crm/validation";
import {
  identityProjectFields,
  identityDeliverableFields,
  identityStages,
  identityTypes,
  quoteStatuses,
  identityBalance,
  type IdentityProject,
} from "@/lib/identity-projects";
import type { FinanceEntry } from "@/lib/finance";

export async function GET(request: Request) {
  try {
    const client = await crmSession();
    const [projects, deliverables, events, entries, accounts, team] =
      await Promise.all([
        allRows(client, "identity_projects"),
        allRows(client, "identity_deliverables"),
        allRows(client, "identity_events"),
        allRows(client, "finance_entries"),
        allRows(client, "crm_accounts"),
        members(client),
      ]);
    if (new URL(request.url).searchParams.get("format") === "csv") {
      const rows = [
        [
          "المشروع",
          "المؤسسة",
          "نوع الخدمة",
          "المرحلة",
          "حالة العرض",
          "قيمة العرض (ر.س)",
          "المحصل (ر.س)",
          "المتبقي (ر.س)",
          "المسؤول",
          "التسليم",
          "مؤرشف",
        ],
        ...(projects as IdentityProject[]).map((p) => {
          const balance = identityBalance(p, entries as FinanceEntry[]);
          return [
            p.title,
            accounts.find((a) => a.id === p.account_id)?.name,
            identityTypes[p.service_type],
            identityStages[p.status],
            quoteStatuses[p.quote_status],
            p.quote_fee_cents == null
              ? ""
              : (Number(p.quote_fee_cents) / 100).toFixed(2),
            (balance.received / 100).toFixed(2),
            balance.remaining == null
              ? ""
              : (balance.remaining / 100).toFixed(2),
            team.find((m) => m.id === p.owner_id)?.name,
            p.due_on,
            p.archived ? "نعم" : "لا",
          ];
        }),
      ];
      return new Response(
        "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
        {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition":
              'attachment; filename="narfid-identity-projects.csv"',
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        },
      );
    }
    return crmJson({
      projects,
      deliverables,
      events,
      entries: entries.filter((row) => row.identity_project_id),
      accounts,
      members: team,
    });
  } catch (error) {
    return crmFailure(error);
  }
}
function failure(error: { code?: string; message?: string }) {
  const messages: Record<string, string> = {
    IDENTITY_ACCOUNT_UNAVAILABLE:
      "استعد ملف المؤسسة من الأرشيف قبل العمل على مشروعها.",
    IDENTITY_IMMUTABLE:
      "المؤسسة المرتبطة بالمشروع لا تتغير؛ أنشئ مشروعًا مستقلًا عند الحاجة.",
    IDENTITY_ARCHIVED: "استعد المشروع من الأرشيف قبل تعديله.",
    IDENTITY_QUOTE_LOCKED:
      "عرض السعر المعتمد محفوظ بنطاقه وقيمته. الإضافات تحتاج مشروعًا أو اتفاقًا جديدًا.",
    IDENTITY_QUOTE_INCOMPLETE:
      "حدّد نطاق العمل وقيمة العرض قبل تسجيل إرساله أو اعتماده.",
    IDENTITY_ACCEPTANCE_REQUIRED:
      "وثّق اعتماد العميل للعرض، بتاريخ وملاحظة، قبل بدء التنفيذ.",
    IDENTITY_DELIVERY_INCOMPLETE:
      "اعتمد جميع التسليمات وأضف رابط حزمة التسليم النهائي قبل إكمال المشروع.",
    IDENTITY_PROJECT_CLOSED: "استعد المشروع أو أعد فتحه قبل تعديل التسليمات.",
    IDENTITY_APPROVAL_LOCKED:
      "التسليم المعتمد محفوظ. أضف تسليمًا جديدًا لأي نسخة إضافية.",
    IDENTITY_REVISION_LIMIT: "جولة التعديل تتجاوز العدد المتفق عليه في العرض.",
    IDENTITY_APPROVAL_REQUIRED:
      "أضف رابط الملفات وتاريخ وملاحظة اعتماد العميل قبل اعتماد التسليم.",
  };
  if (error.code === "22023")
    throw new CrmError(
      messages[error.message ?? ""] ?? "راجع بيانات المشروع وحالته.",
      409,
    );
  dbError(error);
}
async function change(request: Request) {
  try {
    const client = await crmSession(),
      body = await crmBody(request),
      id = uuid(body.id);
    const resource = body.resource ?? "projects";
    if (resource !== "projects" && resource !== "deliverables")
      throw new CrmError("القسم غير موجود.", 404);
    const table =
      resource === "projects" ? "identity_projects" : "identity_deliverables";
    if (request.method === "DELETE") {
      if (resource !== "deliverables")
        throw new CrmError("استخدم أرشفة المشروع للاحتفاظ بتاريخه.", 405);
      const { data, error } = await client
        .from(table)
        .delete()
        .eq("id", id)
        .eq("revision", revision(body.revision))
        .select("id")
        .maybeSingle();
      if (error) failure(error);
      if (!data) throw new CrmError("تغيّر السجل أو حُذف. حدّث البيانات.", 409);
      return crmJson({ deleted: id });
    }
    if (
      !body.fields ||
      typeof body.fields !== "object" ||
      Array.isArray(body.fields)
    )
      throw new CrmError("بيانات السجل غير صالحة.");
    const input = body.fields as Record<string, unknown>;
    let fields: Record<string, unknown>;
    if (resource === "projects") {
      if (
        request.method === "PATCH" &&
        Object.keys(input).length === 1 &&
        typeof input.archived === "boolean"
      )
        fields = { archived: input.archived };
      else {
        let merged = input;
        if (request.method === "PATCH") {
          const { data: old, error } = await client
            .from(table)
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (error) dbError(error);
          if (!old) throw new CrmError("المشروع غير موجود.", 404);
          merged = { ...old, ...input };
        }
        fields = identityProjectFields(merged);
        await account(client, String(fields.account_id), true);
      }
    } else {
      fields = identityDeliverableFields(input);
      if (request.method === "POST") fields.project_id = uuid(body.project_id);
    }
    const query =
      request.method === "POST"
        ? client.from(table).insert({ ...fields, id })
        : client
            .from(table)
            .update(fields)
            .eq("id", id)
            .eq("revision", revision(body.revision));
    const { data, error } = await query.select("*").maybeSingle();
    if (error) failure(error);
    if (!data)
      throw new CrmError(
        "تغيّر السجل من مستخدم آخر. حدّث البيانات قبل الحفظ.",
        409,
      );
    return crmJson({ row: data }, request.method === "POST" ? 201 : 200);
  } catch (error) {
    return crmFailure(error);
  }
}
export const POST = change;
export const PATCH = change;
export const DELETE = change;
