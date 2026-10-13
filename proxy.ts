import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/login", "/board/:path*"],
};
