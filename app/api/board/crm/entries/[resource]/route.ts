import { changeEntry, crmFailure } from "@/lib/crm/server";
type Context = { params: Promise<{ resource: string }> };
async function change(request: Request, context: Context) {
  try {
    return await changeEntry(request, (await context.params).resource);
  } catch (error) {
    return crmFailure(error);
  }
}
export const POST = change;
export const PATCH = change;
export const DELETE = change;
