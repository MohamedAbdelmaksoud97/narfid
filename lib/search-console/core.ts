import {
  createCipheriv,
  createDecipheriv,
  createHash,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import type { SearchPeriod } from "./types";

export const SEARCH_SITE = "https://www.narfid.com/";
export const SEARCH_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";
export const SEARCH_CALLBACK =
  "https://www.narfid.com/api/board/seo/google/callback";
export const STATE_COOKIE = "narfid_gsc_oauth";

export class SearchConsoleError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "invalid_request",
  ) {
    super(message);
  }
}

// Purpose-bound encryption: credentials, refresh tokens and state cannot be interchanged.
export function seal(value: unknown, rootKey: string, purpose: string) {
  if (rootKey.length < 32)
    throw new Error("Search Console encryption key is unavailable");
  const key = Buffer.from(
    hkdfSync("sha256", rootKey, SEARCH_SITE, "narfid-gsc-v1", 32),
  );
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(purpose));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
  ].join(".");
}

export function unseal<T>(value: string, rootKey: string, purpose: string): T {
  if (rootKey.length < 32 || value.length > 32000)
    throw new Error("Invalid encrypted value");
  const [version, iv, encrypted, tag, extra] = value.split(".");
  if (version !== "v1" || extra !== undefined || !iv || !encrypted || !tag)
    throw new Error("Invalid encrypted value");
  const key = Buffer.from(
    hkdfSync("sha256", rootKey, SEARCH_SITE, "narfid-gsc-v1", 32),
  );
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64url"),
  );
  decipher.setAAD(Buffer.from(purpose));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(encrypted, "base64url")),
      decipher.final(),
    ]).toString("utf8"),
  ) as T;
}

export type OAuthState = {
  nonce: string;
  verifier: string;
  memberId: string;
  generation: string;
  createdAt: number;
};

export function createOAuthState(
  memberId: string,
  generation: string,
  now = Date.now(),
): OAuthState {
  return {
    nonce: randomBytes(32).toString("base64url"),
    verifier: randomBytes(48).toString("base64url"),
    memberId,
    generation,
    createdAt: now,
  };
}

export function validateOAuthState(
  state: OAuthState,
  nonce: string | null,
  memberId: string,
  generation: string,
  now = Date.now(),
) {
  if (
    !nonce ||
    !state ||
    typeof state.nonce !== "string" ||
    typeof state.verifier !== "string" ||
    state.verifier.length < 43 ||
    state.memberId !== memberId ||
    state.generation !== generation ||
    !Number.isFinite(state.createdAt) ||
    now - state.createdAt > 600000 ||
    now < state.createdAt
  ) {
    throw new SearchConsoleError(
      "انتهت محاولة الربط أو لم تطابق جلستك. ابدأ الربط من جديد.",
      400,
      "invalid_state",
    );
  }
  const expected = Buffer.from(state.nonce);
  const received = Buffer.from(nonce);
  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  )
    throw new SearchConsoleError(
      "محاولة الربط غير صالحة. ابدأ من جديد.",
      400,
      "invalid_state",
    );
}

export function authorizationUrl(clientId: string, state: OAuthState) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: SEARCH_CALLBACK,
    response_type: "code",
    scope: SEARCH_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: state.nonce,
    code_challenge: createHash("sha256")
      .update(state.verifier)
      .digest("base64url"),
    code_challenge_method: "S256",
  }).toString();
  return url.href;
}

export function searchPeriods(now = new Date()): {
  current: SearchPeriod;
  previous: SearchPeriod;
} {
  // Search Console dates use Pacific Time, independently of the board user's zone.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    Number(parts.find((p) => p.type === type)!.value);
  const midnight = new Date(
    Date.UTC(part("year"), part("month") - 1, part("day")),
  );
  const date = (daysAgo: number) =>
    new Date(midnight.getTime() - daysAgo * 86400000)
      .toISOString()
      .slice(0, 10);
  return {
    current: { startDate: date(28), endDate: date(1) },
    previous: { startDate: date(56), endDate: date(29) },
  };
}

export function validateInspectionUrl(input: unknown) {
  if (typeof input !== "string" || input.length > 2048)
    throw new SearchConsoleError("أدخل رابط صفحة عامة من موقع نرفد.");
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new SearchConsoleError("الرابط غير صالح.");
  }
  const publicPath =
    /^\/(?:articles(?:\/[^/]+)?|solutions\/[^/]+|pricing|about|contact|technology-partnership|visual-identity|authors\/nerved-team)?\/?$/;
  if (
    url.origin !== new URL(SEARCH_SITE).origin ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !publicPath.test(url.pathname)
  )
    throw new SearchConsoleError(
      "الفحص متاح للصفحات العامة على www.narfid.com فقط.",
    );
  return url.href;
}

export function parseCountry(value: unknown): "sau" | "all" {
  if (value === undefined || value === null || value === "sau") return "sau";
  if (value === "all") return "all";
  throw new SearchConsoleError("فلتر البلد غير صالح.");
}
