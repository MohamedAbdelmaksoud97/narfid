import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { todaySaudi, money } from "../../lib/crm/types";

test("visual identity is discoverable across the public website with separate pricing and a WhatsApp request", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const section = page.locator("#visual-identity");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("heading", { level: 2 })).toContainText(
    "شخصية مؤسستك",
  );
  await expect(section).toContainText("عرض سعر مستقل عن اشتراك المنصة");
  await expect(
    section.getByRole("link", { name: "ناقش هوية مؤسستك" }),
  ).toHaveAttribute("href", /^https:\/\/wa.me\/201066471110\?text=/);
  await page.setViewportSize({ width: 1366, height: 768 });
  await section.screenshot({
    path: "test-results/identity-landing-desktop.png",
  });
  await section
    .getByRole("link", { name: "اكتشف الخدمة", exact: true })
    .click();
  await expect(page).toHaveURL(/\/visual-identity$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "هوية تعبّر عن مؤسستك الرياضية.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/visual-identity$/,
  );
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(
    schemas
      .map((text) => JSON.parse(text))
      .some((row) => row["@type"] === "Service"),
  ).toBe(true);
  await expect(
    page.getByRole("link", { name: "اطلب عرض سعر للهوية", exact: true }),
  ).toHaveAttribute("href", /^https:\/\/wa.me\//);
  await page.screenshot({
    path: "test-results/identity-service-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/identity-service-mobile.png",
    fullPage: true,
  });
  await page.goto("/");
  await page.locator("#visual-identity").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .locator("#visual-identity")
    .screenshot({ path: "test-results/identity-landing-mobile.png" });
  for (const path of [
    "/pricing",
    "/about",
    "/contact",
    "/technology-partnership",
    "/articles",
  ]) {
    await page.goto(path);
    await expect(
      page
        .getByRole("navigation", { name: "تصفح الموقع" })
        .getByRole("link", { name: "الهوية البصرية", exact: true }),
    ).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("board manages an identity project, accepted quote, deliverables, shared finance, archives and privacy", async ({
  page,
  request,
}) => {
  test.setTimeout(240000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3018",
    api = `${base}/api/board/identity-projects`,
    headers = { Origin: base };
  expect((await request.get(api)).status()).toBe(401);
  expect((await request.get(`${api}?format=csv`)).status()).toBe(401);
  expect((await request.post(api, { data: {} })).status()).toBe(401);
  const credentials = JSON.parse(
      await readFile(".private/board-accounts.json", "utf8"),
    ),
    member = credentials.accounts.find(
      (row: { status: string }) => row.status === "verified",
    );
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(member.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(member.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  const accountId = crypto.randomUUID(),
    name = `IDENTITY-QA-${Date.now()}`,
    today = todaySaudi();
  let projectId = "";
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function snapshot() {
    const response = await page.request.get(api);
    expect(response.status()).toBe(200);
    return response.json();
  }
  async function save(method = "PATCH", endpoint = "/board/identity-projects") {
    const awaited = page.waitForResponse(
      (r) => r.url().endsWith(endpoint) && r.request().method() === method,
    );
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "حفظ", exact: true })
      .click();
    const response = await awaited;
    expect(response.status(), await response.text()).toBe(
      method === "POST" ? 201 : 200,
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    return response.json();
  }
  try {
    expect(
      (
        await page.request.post(`${base}/api/board/crm/accounts`, {
          headers,
          data: {
            id: accountId,
            kind: "lead",
            fields: { name, stage: "qualified" },
          },
        })
      ).status(),
    ).toBe(201);
    await page.goto("/board/identity-projects");
    await page
      .getByRole("button", { name: "إضافة مشروع هوية", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("اسم المشروع", { exact: false })
      .fill(`${name}-هوية`);
    await dialog
      .getByLabel("المؤسسة المرتبطة", { exact: false })
      .selectOption(accountId);
    await dialog.getByLabel("نوع الخدمة", { exact: true }).selectOption("new");
    await dialog
      .getByLabel("موجز الاحتياج والأهداف")
      .fill("هوية أكاديمية رياضية مع تطبيقات رقمية");
    const project = (await save("POST")).row;
    projectId = project.id;
    await expect(page).toHaveURL(
      new RegExp(`/board/identity-projects/${projectId}$`),
    );
    expect(
      (await snapshot()).deliverables.filter(
        (row: { project_id: string }) => row.project_id === projectId,
      ),
    ).toHaveLength(4);
    expect(
      (
        await page.request.patch(api, {
          headers,
          data: {
            id: projectId,
            revision: project.revision,
            fields: { status: "design" },
          },
        })
      ).status(),
    ).toBe(409);
    await page.getByRole("tab", { name: "عرض السعر", exact: true }).click();
    await page
      .getByRole("button", { name: "إعداد العرض وتوثيق اعتماده", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("قيمة المشروع", { exact: false }).fill("3000.25");
    await dialog
      .getByLabel("النطاق والتسليمات وشروط الدفع")
      .fill("الشعار ودليل الهوية وتطبيقات محددة؛ دفعتان حسب الاتفاق");
    await dialog.getByLabel("حالة عرض السعر").selectOption("accepted");
    await dialog.getByLabel("تاريخ اعتماد العرض").fill(today);
    await dialog
      .getByLabel("توثيق موافقة العميل")
      .fill("موافقة ممثل العميل عبر البريد — QA");
    await save();
    await expect(
      page.getByRole("button", { name: "إعداد العرض وتوثيق اعتماده" }),
    ).toBeDisabled();
    const accepted = (await snapshot()).projects.find(
      (row: { id: string }) => row.id === projectId,
    );
    expect(accepted.quote_fee_cents).toBe(300025);
    expect(
      (
        await page.request.patch(api, {
          headers,
          data: {
            id: projectId,
            revision: project.revision,
            fields: { designer: "تعديل قديم" },
          },
        })
      ).status(),
    ).toBe(409);

    await page
      .getByRole("button", { name: "تعديل المشروع", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("مرحلة المشروع")
      .selectOption("design");
    await save();
    await page.getByRole("tab", { name: "مالية المشروع", exact: true }).click();
    await page
      .getByRole("button", { name: "تسجيل دفعة للمشروع", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("المبلغ (ر.س)", { exact: false })
      .fill("1000.25");
    await save("POST", "/board/finance");
    let finance = await (
      await page.request.get(`${base}/api/board/finance`)
    ).json();
    const payment = finance.entries.find(
      (row: { identity_project_id: string; kind: string }) =>
        row.identity_project_id === projectId && row.kind === "income",
    );
    expect(payment.amount_cents).toBe(100025);
    await page.goto(`/board/finance?account_id=${accountId}`);
    await expect(page.getByTestId("finance-outstanding")).toHaveText(
      money(200000),
    );
    await page.getByRole("tab", { name: "المستحقات", exact: true }).click();
    await expect(
      page.getByText("مستحقات مشروعات الهوية", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "متابعة وتحصيل المشروع", exact: true })
      .click();
    await page.getByRole("tab", { name: "مالية المشروع", exact: true }).click();
    expect(
      (
        await page.request.post(`${base}/api/board/finance`, {
          headers,
          data: {
            id: crypto.randomUUID(),
            fields: { ...payment, amount_cents: 200001 },
          },
        })
      ).status(),
    ).toBe(409);
    await page
      .getByRole("button", { name: "تسجيل تكلفة", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("المبلغ (ر.س)", { exact: false })
      .fill("200.50");
    await save("POST", "/board/finance");
    await expect(
      page.getByText(money(20050), { exact: true }).first(),
    ).toBeVisible();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({
      path: "test-results/identity-project-finance.png",
      fullPage: true,
    });

    await page
      .getByRole("tab", { name: "التسليمات والاعتمادات", exact: true })
      .click();
    await page
      .getByRole("button", { name: "إضافة تسليم", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("اسم التسليم", { exact: false })
      .fill("تسليم تجريبي للحذف");
    await save("POST");
    const extra = page
      .locator('[data-slot="card"]')
      .filter({
        has: page.getByRole("heading", {
          name: "تسليم تجريبي للحذف",
          exact: true,
        }),
      });
    await extra
      .getByRole("button", { name: "حذف التسليم", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "تأكيد", exact: true })
      .click();
    await expect(extra).toHaveCount(0);
    for (let i = 0; i < 4; i++) {
      await page
        .getByRole("button", { name: "تعديل واعتماد", exact: true })
        .first()
        .click();
      dialog = page.getByRole("dialog");
      await dialog.getByLabel("حالة التسليم").selectOption("approved");
      await dialog
        .getByLabel("رابط ملفات التسليم")
        .fill(`https://example.com/identity-qa/${i}`);
      await dialog.getByLabel("تاريخ اعتماد العميل").fill(today);
      await dialog
        .getByLabel("توثيق اعتماد العميل")
        .fill("اعتماد فعلي موثق لغرض الاختبار");
      await save();
    }
    await page
      .getByRole("button", { name: "تعديل المشروع", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("مرحلة المشروع")
      .selectOption("completed");
    await page
      .getByRole("dialog")
      .getByLabel("رابط حزمة التسليم النهائي")
      .fill("https://example.com/identity-qa/final");
    await save();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      `${name}-هوية`,
    );
    expect(
      (await snapshot()).projects.find(
        (row: { id: string }) => row.id === projectId,
      ).status,
    ).toBe("completed");
    await page.getByRole("tab", { name: "سجل النشاط", exact: true }).click();
    await expect(
      page.getByText("تسجيل تحصيل للمشروع", { exact: true }),
    ).toBeVisible();
    const csv = await page.request.get(`${api}?format=csv`);
    expect(csv.status()).toBe(200);
    expect(await csv.text()).toContain(`${name}-هوية`);
    await page
      .getByRole("button", { name: "أرشفة المشروع", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "تأكيد", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "تعديل المشروع", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "استعادة المشروع", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "تأكيد", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "تعديل المشروع", exact: true }),
    ).toBeEnabled();
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "test-results/identity-project-mobile.png",
      fullPage: true,
    });
    finance = await (
      await page.request.get(`${base}/api/board/finance`)
    ).json();
    expect(
      finance.entries.filter(
        (row: { identity_project_id: string }) =>
          row.identity_project_id === projectId,
      ),
    ).toHaveLength(2);
    expect(errors).toEqual([]);
  } finally {
    const cleanup = ".private/identity-qa-cleanup.sql";
    await writeFile(
      cleanup,
      `begin; do $$ begin if exists(select 1 from public.crm_accounts where id='${accountId}' and name not like 'IDENTITY-QA-%') then raise exception 'Unsafe QA cleanup'; end if; end $$; delete from public.finance_entries where account_id='${accountId}'; delete from public.identity_projects where account_id='${accountId}'; delete from public.crm_accounts where id='${accountId}'; commit;`,
      "utf8",
    );
    execFileSync(
      process.execPath,
      ["--env-file=.env.local", "scripts/article-db.mjs", cleanup],
      { stdio: "pipe" },
    );
  }
});
