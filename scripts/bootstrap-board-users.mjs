import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { BOARD_ACCOUNTS, isBoardUser } from "../lib/auth/board-accounts.ts";

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const adminKey =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const privateDirectory = fileURLToPath(
  new URL("../.private/", import.meta.url),
);
const credentialsPath = fileURLToPath(
  new URL("../.private/board-accounts.json", import.meta.url),
);
const handoverPath = fileURLToPath(
  new URL("../.private/board-accounts.md", import.meta.url),
);

if (!projectUrl || !publicKey)
  throw new Error("The Supabase URL and publishable key are required.");

await mkdir(privateDirectory, { recursive: true });
let credentials;
try {
  credentials = JSON.parse(await readFile(credentialsPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  credentials = {
    projectUrl,
    accounts: BOARD_ACCOUNTS.map((account) => ({
      ...account,
      password: randomBytes(18).toString("base64url") + "!7Aa",
      status: "pending",
    })),
  };
}

if (credentials.projectUrl !== projectUrl)
  throw new Error("Credential file belongs to another Supabase project.");
if (
  credentials.accounts.length !== 5 ||
  BOARD_ACCOUNTS.some(
    (account) =>
      !credentials.accounts.some((item) => item.email === account.email),
  )
) {
  throw new Error(
    "Credential file does not match the five configured board accounts.",
  );
}

async function saveCredentials() {
  await writeFile(
    credentialsPath,
    JSON.stringify(credentials, null, 2) + "\n",
    { mode: 0o600 },
  );
  const rows = credentials.accounts.map(
    (account) =>
      "| " +
      account.name +
      " | " +
      account.email +
      " | `" +
      account.password +
      "` | " +
      account.status +
      " |",
  );
  await writeFile(
    handoverPath,
    [
      "# بيانات دخول مجلس إدارة نرفد",
      "",
      "ملف محلي خاص خارج Git. لا تنشره أو تنسخه إلى public أو docs.",
      "الإيميلات افتراضية وليست صناديق بريد. لا يتطلب الدخول تأكيدًا بالبريد.",
      "حالة pending تعني أن الحساب لم يُنشأ بعد. حالة verified تعني نجاح إنشاء الحساب واختبار تسجيل دخوله في Supabase.",
      "",
      "| الحساب | الإيميل | كلمة المرور | الحالة |",
      "| --- | --- | --- | --- |",
      ...rows,
      "",
      "تسجيل الدخول: /login — المساحة الداخلية: /board.",
    ].join("\n") + "\n",
    { mode: 0o600 },
  );
}

await saveCredentials();
if (!adminKey) {
  console.error(
    "Passwords prepared locally; Supabase users have NOT been created. Add SUPABASE_SECRET_KEY to .env.local and rerun npm run auth:bootstrap.",
  );
  process.exitCode = 1;
} else {
  const admin = createClient(projectUrl, adminKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const existingUsers = new Map();
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error)
      throw new Error(
        "Cannot read Auth users: " + (error.code || error.status),
      );
    for (const user of data.users) {
      if (BOARD_ACCOUNTS.some((account) => account.email === user.email))
        existingUsers.set(user.email, user);
    }
    if (data.users.length < 200) break;
  }

  for (const account of credentials.accounts) {
    let user = existingUsers.get(account.email);
    if (user && !isBoardUser(user))
      throw new Error(
        "An existing account is not an authorized board account: " +
          account.email,
      );
    if (!user) {
      const { data, error } = await admin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        app_metadata: { narfid_board_member: true },
        user_metadata: { display_name: account.name },
      });
      if (error || !data.user)
        throw new Error(
          "Cannot create " +
            account.email +
            ": " +
            (error?.code || error?.status || "missing user"),
        );
      user = data.user;
      account.userId = user.id;
      account.status = "created";
      await saveCredentials();
    }

    const client = createClient(projectUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
    if (error || !isBoardUser(data.user)) {
      throw new Error(
        "Login verification failed for " +
          account.email +
          ". Existing passwords were not reset.",
      );
    }
    const { error: logoutError } = await client.auth.signOut({
      scope: "local",
    });
    if (logoutError)
      throw new Error(
        "Verification session logout failed for " + account.email,
      );
    account.userId = user.id;
    account.status = "verified";
    await saveCredentials();
    console.log("Verified board account: " + account.email);
  }
  console.log(
    "All five Supabase board accounts are ready. Private handover: .private/board-accounts.md",
  );
}
