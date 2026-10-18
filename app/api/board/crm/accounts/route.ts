import {
  allRows,
  changeAccount,
  crmFailure,
  crmJson,
  crmSession,
  members,
  plans,
} from "@/lib/crm/server";
import { clientStages, leadStages, type Account } from "@/lib/crm/types";
import { csvCell } from "@/lib/crm/validation";

export async function GET(request: Request) {
  try {
    const client = await crmSession(),
      params = new URL(request.url).searchParams,
      kind = params.get("kind");
    if (kind !== "lead" && kind !== "client")
      return crmJson({ error: "نوع القائمة غير صالح." }, 400);
    const [
      allAccounts,
      team,
      followups,
      contracts,
      payments,
      tickets,
      catalog,
    ] = await Promise.all([
      allRows(client, "crm_accounts"),
      members(client),
      allRows(client, "crm_followups"),
      allRows(client, "crm_contracts"),
      allRows(client, "crm_payments"),
      allRows(client, "crm_tickets"),
      plans(client),
    ]);
    const accounts = allAccounts.filter(
      (item) => item.kind === kind,
    ) as Account[];
    const ids = new Set(accounts.map((acc) => acc.id));
    if (params.get("format") === "csv") {
      const stageLabels = kind === "lead" ? leadStages : clientStages;
      const rows = [
        [
          "المؤسسة",
          "المرحلة",
          "الخطة",
          "المدينة",
          "الفروع",
          "مسؤول التواصل",
          "البريد",
          "الجوال",
          "مسؤول نرفد",
          "المتابعة القادمة",
          "مؤرشف",
        ],
        ...accounts
          .filter((acc) => !acc.archived)
          .map((acc) => [
            acc.name,
            stageLabels[acc.stage as keyof typeof stageLabels] ?? acc.stage,
            catalog.find((plan) => plan.id === acc.plan_id)?.name ?? "",
            acc.city,
            acc.branches,
            acc.contact_name,
            acc.email,
            acc.phone,
            team.find((m) => m.id === acc.owner_id)?.name ?? "",
            acc.next_follow_up_on,
            acc.archived ? "نعم" : "لا",
          ]),
      ];
      return new Response(
        "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
        {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="narfid-${kind === "lead" ? "leads" : "clients"}.csv"`,
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex, nofollow",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }
    const own = (values: Record<string, unknown>[]) =>
      values.filter((row) => ids.has(row.account_id as string));
    return crmJson({
      accounts,
      members: team,
      plans: catalog,
      followups: own(followups),
      contracts: own(contracts),
      payments: own(payments),
      tickets: own(tickets),
    });
  } catch (error) {
    return crmFailure(error);
  }
}
export async function POST(request: Request) {
  try {
    return await changeAccount(request);
  } catch (error) {
    return crmFailure(error);
  }
}
export async function PATCH(request: Request) {
  try {
    return await changeAccount(request);
  } catch (error) {
    return crmFailure(error);
  }
}
