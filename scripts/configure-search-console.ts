// Local operational utility; never imported by the Next.js application.
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import {
  SEARCH_CALLBACK,
  SEARCH_SITE,
  seal,
  unseal,
} from "../lib/search-console/core";
import type { GoogleCredentials } from "../lib/search-console/google";

async function main() {
  const rootKey =
    process.env.GOOGLE_SEARCH_CONSOLE_ENCRYPTION_KEY ||
    process.env.SUPABASE_SECRET_KEY;
  if (
    !rootKey ||
    rootKey.length < 32 ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SECRET_KEY
  )
    throw new Error("Server-side Supabase configuration is required");
  const input = JSON.parse(
    await readFile(".private/google-search-console-oauth.json", "utf8"),
  ).web;
  if (
    !input?.client_id?.endsWith(".apps.googleusercontent.com") ||
    typeof input.client_secret !== "string" ||
    input.client_secret.length < 10 ||
    !input.redirect_uris?.includes(SEARCH_CALLBACK)
  )
    throw new Error(
      "OAuth web credentials must contain the configured production callback",
    );
  const credentials: GoogleCredentials = {
    clientId: input.client_id,
    clientSecret: input.client_secret,
  };
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data: existing, error: readError } = await admin
    .from("seo_google_connections")
    .select("client_credentials")
    .eq("site_url", SEARCH_SITE)
    .maybeSingle();
  if (readError)
    throw new Error("Apply the Search Console database migration first");
  if (existing) {
    const current = unseal<GoogleCredentials>(
      existing.client_credentials,
      rootKey,
      "credentials",
    );
    if (
      current.clientId !== credentials.clientId ||
      current.clientSecret !== credentials.clientSecret
    )
      throw new Error(
        "A different OAuth client is configured; do not overwrite an existing connection implicitly",
      );
    console.log(
      "Search Console credentials already configured; existing authorization preserved.",
    );
  } else {
    const { error } = await admin.from("seo_google_connections").insert({
      site_url: SEARCH_SITE,
      client_credentials: seal(credentials, rootKey, "credentials"),
    });
    if (error) throw new Error("Unable to store encrypted OAuth configuration");
    console.log(
      "Search Console OAuth client stored encrypted. Google account consent is still required.",
    );
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : "Unable to configure Search Console",
  );
  process.exitCode = 1;
});
