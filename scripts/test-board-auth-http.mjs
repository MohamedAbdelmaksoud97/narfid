import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3012";
const cookies = new Map();

function cookieHeader() {
  return [...cookies].map(([name, value]) => name + "=" + value).join("; ");
}

async function request(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    redirect: "manual",
    headers: { Cookie: cookieHeader(), ...options.headers },
  });
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";", 1)[0];
    const splitAt = pair.indexOf("=");
    const name = pair.slice(0, splitAt);
    const value = pair.slice(splitAt + 1);
    if (!value || /max-age=0(?:;|$)/i.test(cookie)) cookies.delete(name);
    else cookies.set(name, value);
  }
  return response;
}

function decodeAttribute(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function actionForm(html) {
  const form = html.match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0];
  assert.ok(form, "Expected a progressive-enhancement action form");
  const data = new FormData();
  for (const input of form.matchAll(/<input\b[^>]*>/g)) {
    const attributes = Object.fromEntries(
      [...input[0].matchAll(/([\w:$-]+)="([^"]*)"/g)].map((match) => [
        match[1],
        decodeAttribute(match[2]),
      ]),
    );
    if (attributes.type === "hidden" && attributes.name)
      data.append(attributes.name, attributes.value ?? "");
  }
  assert.ok(
    [...data.keys()].some((name) => name.startsWith("$ACTION")),
    "Missing action identifier",
  );
  return data;
}

const home = await request("/");
assert.equal(home.status, 200);
assert.ok((await home.text()).includes("دخول الإدارة"));
console.log("PASS: public landing links to board login");

const denied = await request("/board");
assert.equal(denied.status, 307);
assert.equal(new URL(denied.headers.get("location"), base).pathname, "/login");
assert.match(denied.headers.get("cache-control"), /no-store/);
console.log("PASS: anonymous board access redirects without caching");

const login = await request("/login");
assert.equal(login.status, 200);
assert.match(login.headers.get("cache-control"), /no-store/);
const loginHtml = await login.text();
assert.ok(loginHtml.includes('name="password"'));
assert.ok(!loginHtml.includes('href="/signup"'));

const outsiderForm = actionForm(loginHtml);
outsiderForm.append("email", "outsider@nerfed.example");
outsiderForm.append("password", "not-a-board-password");
const outsider = await request("/login", {
  method: "POST",
  body: outsiderForm,
  headers: { Origin: base },
});
assert.equal(outsider.status, 200);
assert.ok(
  (await outsider.text()).includes("الإيميل أو كلمة المرور غير صحيحين"),
);
assert.equal(cookies.size, 0);
console.log("PASS: an unlisted email is rejected by the server action");

const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(
  ".",
)[0];
cookies.set(
  "sb-" + ref + "-auth-token",
  "base64-" +
    Buffer.from(
      JSON.stringify({
        access_token: "forged-token",
        refresh_token: "forged-token",
      }),
    ).toString("base64url"),
);
const forged = await request("/board");
assert.equal(forged.status, 307);
assert.equal(new URL(forged.headers.get("location"), base).pathname, "/login");
cookies.clear();
console.log("PASS: a fabricated session cookie does not grant access");

const credentials = JSON.parse(
  await readFile(
    new URL("../.private/board-accounts.json", import.meta.url),
    "utf8",
  ),
);
const account = credentials.accounts.find((item) => item.status === "verified");
if (!account) {
  console.log(
    "SKIPPED: successful login/logout — Supabase accounts are not provisioned yet.",
  );
} else {
  const wrongPasswordPage = await request("/login");
  const wrongPasswordForm = actionForm(await wrongPasswordPage.text());
  wrongPasswordForm.append("email", account.email);
  wrongPasswordForm.append("password", account.password + "-incorrect");
  const wrongPassword = await request("/login", {
    method: "POST",
    body: wrongPasswordForm,
    headers: { Origin: base },
  });
  assert.equal(wrongPassword.status, 200);
  assert.ok((await wrongPassword.text()).includes("الإيميل أو كلمة المرور غير صحيحين"));
  assert.equal(cookies.size, 0);
  console.log("PASS: an incorrect password is rejected without creating a session");

  const freshLogin = await request("/login");
  const loginForm = actionForm(await freshLogin.text());
  loginForm.append("email", account.email);
  loginForm.append("password", account.password);
  const signedIn = await request("/login", {
    method: "POST",
    body: loginForm,
    headers: { Origin: base },
  });
  assert.equal(signedIn.status, 303);
  assert.equal(
    new URL(signedIn.headers.get("location"), base).pathname,
    "/board",
  );
  const authCookies = signedIn.headers
    .getSetCookie()
    .filter((cookie) => cookie.includes("-auth-token"));
  assert.ok(authCookies.length);
  for (const cookie of authCookies) {
    assert.match(cookie, /httponly/i);
    assert.match(cookie, /samesite=lax/i);
  }
  const workspace = await request("/board");
  assert.equal(workspace.status, 200);
  const workspaceHtml = await workspace.text();
  assert.ok(workspaceHtml.includes(account.email));
  console.log("PASS: login creates protected cookies and grants board access");

  const logoutForm = actionForm(workspaceHtml);
  const signedOut = await request("/board", {
    method: "POST",
    body: logoutForm,
    headers: { Origin: base },
  });
  assert.equal(signedOut.status, 303);
  assert.equal(
    new URL(signedOut.headers.get("location"), base).pathname,
    "/login",
  );
  const afterLogout = await request("/board");
  assert.equal(afterLogout.status, 307);
  console.log("PASS: logout removes session access");
}
