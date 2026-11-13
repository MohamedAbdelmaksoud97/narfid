import { articleSession } from "@/lib/articles/server";
import { failure, json, verifyMutation } from "@/lib/articles/http";
import { refreshPublicSite } from "@/lib/articles/public-refresh";

export async function POST(request: Request) {
  try {
    verifyMutation(request);
    await articleSession();
    return json({ publicRefresh: await refreshPublicSite() });
  } catch (error) {
    return failure(error);
  }
}
