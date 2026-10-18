import { crmFailure, crmJson, crmSession, profile } from "@/lib/crm/server";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    return crmJson(await profile(await crmSession(), (await params).id));
  } catch (error) {
    return crmFailure(error);
  }
}
