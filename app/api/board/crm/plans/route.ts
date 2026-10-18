import {
  crmSession,
  crmBody,
  crmFailure,
  crmJson,
  plans,
  dbError,
  allRows,
} from "@/lib/crm/server";
import { CrmError, uuid, revision, planFields } from "@/lib/crm/validation";

export async function GET() {
  try {
    const client = await crmSession();
    const [catalog, accounts, contracts] = await Promise.all([
      plans(client),
      allRows(client, "crm_accounts"),
      allRows(client, "crm_contracts"),
    ]);
    return crmJson({
      plans: catalog,
      usage: Object.fromEntries(
        catalog.map((plan) => [
          plan.id,
          {
            accounts: accounts.filter((row) => row.plan_id === plan.id).length,
            contracts: contracts.filter((row) => row.plan_id === plan.id)
              .length,
          },
        ]),
      ),
    });
  } catch (error) {
    return crmFailure(error);
  }
}
async function change(request: Request) {
  try {
    const client = await crmSession(),
      body = await crmBody(request),
      id = uuid(body.id);
    if (request.method === "DELETE") {
      const { data, error } = await client
        .from("crm_plans")
        .delete()
        .eq("id", id)
        .eq("revision", revision(body.revision))
        .select("id")
        .maybeSingle();
      if (error?.code === "23503")
        throw new CrmError(
          "هذه الباقة مرتبطة بعملاء أو عقود؛ أوقف إتاحتها للاشتراكات الجديدة للاحتفاظ بالتاريخ.",
          409,
        );
      if (error) dbError(error);
      if (!data)
        throw new CrmError("تغيّرت الباقة أو حُذفت. حدّث البيانات.", 409);
      return crmJson({ deleted: id });
    }
    if (
      !body.fields ||
      typeof body.fields !== "object" ||
      Array.isArray(body.fields)
    )
      throw new CrmError("بيانات الباقة غير صالحة.");
    const fields = planFields(body.fields as Record<string, unknown>);
    const query =
      request.method === "POST"
        ? client.from("crm_plans").insert({ ...fields, id })
        : client
            .from("crm_plans")
            .update(fields)
            .eq("id", id)
            .eq("revision", revision(body.revision));
    const { data, error } = await query.select("*").maybeSingle();
    if (error?.code === "23505")
      throw new CrmError(
        "اسم الباقة مستخدم بالفعل. اختر اسمًا مختلفًا.",
        409,
        "name",
      );
    if (error) dbError(error);
    if (!data)
      throw new CrmError(
        "تغيّرت الباقة من مستخدم آخر. حدّث البيانات قبل الحفظ.",
        409,
      );
    return crmJson({ plan: data }, request.method === "POST" ? 201 : 200);
  } catch (error) {
    return crmFailure(error);
  }
}
export const POST = change;
export const PATCH = change;
export const DELETE = change;
