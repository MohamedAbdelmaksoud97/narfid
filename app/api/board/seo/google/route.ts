import {
  parseCountry,
  validateInspectionUrl,
  SearchConsoleError,
} from "@/lib/search-console/core";
import {
  disconnectGoogle,
  inspectPage,
  loadDashboard,
  searchBody,
  searchFailure,
  searchJson,
  searchSession,
} from "@/lib/search-console/server";

export async function GET(request: Request) {
  try {
    await searchSession();
    return searchJson(
      await loadDashboard(
        parseCountry(new URL(request.url).searchParams.get("country")),
      ),
    );
  } catch (error) {
    return searchFailure(error);
  }
}

export async function POST(request: Request) {
  try {
    await searchSession();
    const body = await searchBody(request);
    if (body.action === "refresh")
      return searchJson(await loadDashboard(parseCountry(body.country), true));
    if (body.action === "inspect")
      return searchJson({
        inspection: await inspectPage(validateInspectionUrl(body.url)),
      });
    if (body.action === "disconnect")
      return searchJson({ ok: true, ...(await disconnectGoogle()) });
    throw new SearchConsoleError("العملية غير معروفة.");
  } catch (error) {
    return searchFailure(error);
  }
}
