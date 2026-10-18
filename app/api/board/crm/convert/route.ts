import {
  crmSession,
  crmBody,
  crmFailure,
  crmJson,
  dbError,
} from "@/lib/crm/server";
import { CrmError, uuid, revision, resourceFields } from "@/lib/crm/validation";
export async function POST(request: Request) {
  try {
    const client = await crmSession(),
      body = await crmBody(request);
    if (
      !body.contract ||
      typeof body.contract !== "object" ||
      Array.isArray(body.contract)
    )
      throw new CrmError("أكمل بيانات العقد عند تأكيد التعاقد.");
    const contract = resourceFields("contracts", {
      ...body.contract,
      status: "signed",
    });
    const { data, error } = await client.rpc("convert_crm_lead", {
      p_id: uuid(body.id),
      p_revision: revision(body.revision),
      p_contract: contract,
    });
    if (error) dbError(error);
    return crmJson({ account: data });
  } catch (error) {
    return crmFailure(error);
  }
}
