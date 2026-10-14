import { test, expect } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

test("board tasks support CRUD, nested completion, persistence and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  test.setTimeout(180000);
  page.on("pageerror", (error) => errors.push(error.message));
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (value: { status: string }) => value.status === "verified",
  );
  let rootId: string | undefined;
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(account.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  await page
    .getByRole("navigation", { name: "أقسام لوحة الإدارة", exact: true })
    .getByRole("link", { name: "المهام القادمة", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "المهام القادمة", exact: true }),
  ).toBeVisible();
  const origin = new URL(page.url()).origin;
  const rootTitle = `اختبار خطة نرفد ${Date.now()}`;
  async function save() {
    const pending = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/board/tasks") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: "حفظ المهمة", exact: true }).click();
    const response = await pending;
    expect(response.status(), await response.text()).toBe(200);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    return response.json();
  }
  try {
    await expect(
      page.getByRole("heading", {
        name: "إطلاق موقع نرفد رسميًا",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.getByRole("heading", { level: 2 }).count(),
    ).toBeGreaterThanOrEqual(6);
    await mkdir(".private/tasks-qa", { recursive: true });
    await page.screenshot({
      path: ".private/tasks-qa/desktop.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "إضافة مهمة", exact: true }).click();
    await page.getByLabel("عنوان المهمة", { exact: true }).fill(rootTitle);
    await page
      .getByLabel("التفاصيل ومعيار الإنجاز")
      .fill("مهمة تجريبية للتأكد من الحفظ.");
    const created = await save();
    rootId = created.tasks.find(
      (task: { title: string }) => task.title === rootTitle,
    ).id;
    let root = page.locator(`[data-task-id="${rootId}"]`);
    for (const title of ["خطوة الاختبار الأولى", "خطوة الاختبار الثانية"]) {
      await root
        .getByRole("button", { name: "إضافة مهمة فرعية", exact: true })
        .click();
      await page.getByLabel("عنوان المهمة", { exact: true }).fill(title);
      await page
        .getByLabel("التفاصيل ومعيار الإنجاز")
        .fill("وصف الخطوة التجريبية");
      await save();
    }
    await root
      .getByRole("button", { name: `تعديل ${rootTitle}`, exact: true })
      .click();
    await page
      .getByLabel("التفاصيل ومعيار الإنجاز")
      .fill("تم تعديل وصف المهمة وحفظه.");
    await save();
    await expect(root).toContainText("تم تعديل وصف المهمة وحفظه.");
    await root
      .getByRole("checkbox", {
        name: "إكمال خطوة الاختبار الأولى",
        exact: true,
      })
      .click();
    await expect(
      root.getByRole("checkbox", {
        name: `إكمال ${rootTitle} وكل مهامها الفرعية`,
        exact: true,
      }),
    ).toHaveAttribute("aria-checked", "mixed");
    await page.getByRole("button", { name: "مكتملة", exact: true }).click();
    await expect(
      root.getByRole("heading", { name: "خطوة الاختبار الأولى", exact: true }),
    ).toBeVisible();
    await expect(
      root.getByRole("heading", { name: "خطوة الاختبار الثانية", exact: true }),
    ).toHaveCount(0);
    await page.getByRole("button", { name: "الكل", exact: true }).click();
    await root
      .getByRole("checkbox", {
        name: "إكمال خطوة الاختبار الثانية",
        exact: true,
      })
      .click();
    await expect(
      root.getByRole("checkbox", {
        name: `إعادة فتح ${rootTitle} وكل مهامها الفرعية`,
        exact: true,
      }),
    ).toBeChecked();
    await page.reload();
    root = page.locator(`[data-task-id="${rootId}"]`);
    await expect(
      root.getByRole("checkbox", {
        name: `إعادة فتح ${rootTitle} وكل مهامها الفرعية`,
        exact: true,
      }),
    ).toBeChecked();
    await root
      .getByRole("checkbox", {
        name: `إعادة فتح ${rootTitle} وكل مهامها الفرعية`,
        exact: true,
      })
      .click();
    await expect(
      root.getByRole("checkbox", {
        name: `إكمال ${rootTitle} وكل مهامها الفرعية`,
        exact: true,
      }),
    ).not.toBeChecked();
    await root
      .getByRole("button", { name: `عرض خطوات ${rootTitle}`, exact: true })
      .click();
    await expect(
      root.getByRole("checkbox", {
        name: "إكمال خطوة الاختبار الأولى",
        exact: true,
      }),
    ).not.toBeChecked();
    const stateResponse = await page.request.get("/api/board/tasks");
    const state = await stateResponse.json();
    const task = state.tasks.find(
      (value: { id: string }) => value.id === rootId,
    );
    const headers = { Origin: origin };
    const stale = await page.request.post("/api/board/tasks", {
      headers,
      data: {
        action: "delete",
        payload: { id: task.id, revision: task.revision - 1 },
      },
    });
    expect(stale.status()).toBe(409);
    const crossOrigin = await page.request.post("/api/board/tasks", {
      headers: { Origin: "https://other.example" },
      data: {
        action: "delete",
        payload: { id: task.id, revision: task.revision },
      },
    });
    expect(crossOrigin.status()).toBe(403);
    await page.getByLabel("البحث في المهام").fill(rootTitle);
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(1);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      (document.activeElement as HTMLElement)?.blur();
      window.scrollTo(0, 0);
    });
    await expect
      .poll(
        async () =>
          (
            await page
              .getByRole("banner", { name: "شريط لوحة الإدارة" })
              .boundingBox()
          )?.y,
      )
      .toBe(0);
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({
      path: ".private/tasks-qa/mobile.png",
      fullPage: true,
    });
    await root
      .getByRole("button", { name: "حذف خطوة الاختبار الثانية", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText(
      "خطوة الاختبار الثانية",
    );
    await page.getByRole("button", { name: "إلغاء", exact: true }).click();
    await expect(root).toContainText("خطوة الاختبار الثانية");
    await root
      .getByRole("button", { name: "حذف خطوة الاختبار الثانية", exact: true })
      .click();
    await page
      .getByRole("button", { name: "تأكيد الحذف", exact: true })
      .click();
    await expect(
      root.getByRole("heading", { name: "خطوة الاختبار الثانية", exact: true }),
    ).toHaveCount(0);
    await root
      .getByRole("button", { name: `حذف ${rootTitle}`, exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText("ومعها 1 مهمة فرعية");
    await page
      .getByRole("button", { name: "تأكيد الحذف", exact: true })
      .click();
    await expect(root).toHaveCount(0);
    expect(errors).toEqual([]);
  } finally {
    // Cleanup does not depend on a browser session or a stale task revision.
    // The filter is unique to this test; the roadmap and user tasks are untouched.
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const cleanup = await admin
      .from("board_tasks")
      .delete()
      .eq("title", rootTitle)
      .is("parent_id", null)
      .abortSignal(AbortSignal.timeout(15000));
    expect(cleanup.error).toBeNull();
  }
});

test("anonymous and unrelated authenticated users cannot access board tasks", async ({
  request,
}) => {
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3012";
  expect((await request.get(`${base}/api/board/tasks`)).status()).toBe(401);
  const config = { auth: { persistSession: false, autoRefreshToken: false } };
  const anonymous = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    config,
  );
  expect((await anonymous.from("board_tasks").select("id")).error).toBeTruthy();
  expect(
    (
      await anonymous.rpc("mutate_board_task", {
        action: "delete",
        payload: { id: crypto.randomUUID(), revision: 1 },
      })
    ).error,
  ).toBeTruthy();
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    config,
  );
  const email = `tasks-qa-${crypto.randomUUID()}@example.com`;
  const password = `${crypto.randomUUID()}Aa!9`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { narfid_board_member: true },
  });
  expect(error).toBeNull();
  try {
    const outsider = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      config,
    );
    expect(
      (await outsider.auth.signInWithPassword({ email, password })).error,
    ).toBeNull();
    const read = await outsider.from("board_tasks").select("id");
    expect(read.error).toBeNull();
    expect(read.data).toEqual([]);
    expect(
      (await outsider.from("board_tasks").insert({ title: "ممنوع" })).error
        ?.code,
    ).toBe("42501");
    expect(
      (
        await outsider
          .from("board_tasks")
          .update({ title: "ممنوع" })
          .eq("id", "a1400000-0000-4000-8000-000000000001")
      ).error?.code,
    ).toBe("42501");
    expect(
      (
        await outsider
          .from("board_tasks")
          .delete()
          .eq("id", "a1400000-0000-4000-8000-000000000001")
      ).error?.code,
    ).toBe("42501");
    expect(
      (
        await outsider.rpc("mutate_board_task", {
          action: "delete",
          payload: { id: "a1400000-0000-4000-8000-000000000001", revision: 1 },
        })
      ).error?.code,
    ).toBe("42501");
    await outsider.auth.signOut({ scope: "local" });
  } finally {
    if (data.user)
      expect(
        (await admin.auth.admin.deleteUser(data.user.id)).error,
      ).toBeNull();
  }
});
