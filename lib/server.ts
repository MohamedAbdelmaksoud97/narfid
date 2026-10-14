import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
export async function createClient(requestTimeoutMs?: number) {
  // The Auth SDK reads the clock while initializing token expiry.
  // Keep SDK initialization at request time under Cache Components.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      ...(requestTimeoutMs
        ? {
            global: {
              fetch: (input: RequestInfo | URL, init?: RequestInit) =>
                fetch(input, {
                  ...init,
                  signal: init?.signal
                    ? AbortSignal.any([
                        init.signal,
                        AbortSignal.timeout(requestTimeoutMs),
                      ])
                    : AbortSignal.timeout(requestTimeoutMs),
                }),
            },
          }
        : {}),
      cookieOptions: {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored because the proxy refreshes
            // user sessions.
          }
        },
      },
    },
  );
}
