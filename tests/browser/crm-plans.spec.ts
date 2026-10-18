import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

test("board manages plans and selects them for leads, clients and contracts without changing contract history", async ({
  page,
  request,
}) => {
  test.setTimeout(240000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3015",
    api = `${base}/api/board/crm`,
    headers = { Origin: base };
  expect((await request.get(`${api}/plans`)).status()).toBe(401);
  expect((await request.post(`${api}/plans`, { data: {} })).status()).toBe(401);
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const member = credentials.accounts.find(
    (row: { status: string }) => row.status === "verified",
  );
  await page.goto(`${base}/login`);
  await page.getByLabel("البريد الإلكتروني").fill(member.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(member.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  const suffix = Date.now(),
    planName = `CRM-PLAN-QA-${suffix}`,
    accountName = `CRM-QA-PLAN-${suffix}`;
  let planId = "",
    leadId = "",
    directId = "",
    spareId = "";
  async function catalog() {
    const response = await page.request.get(`${api}/plans`);
    expect(response.status()).toBe(200);
    return response.json();
  }
  async function profile(id: string) {
    const response = await page.request.get(`${api}/accounts/${id}`);
    expect(response.status()).toBe(200);
    return response.json();
  }
  try {
    await page.goto(`${base}/board/plans`);
    await page.getByRole("button", { name: "إضافة باقة", exact: true }).click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("اسم الباقة", { exact: false }).fill(planName);
    await dialog.getByLabel("السعر السنوي", { exact: false }).fill("5000.25");
    await dialog
      .getByLabel("رسوم التجهيز الأساسية", { exact: false })
      .fill("1000.75");
    await dialog
      .getByLabel("مميزات الباقة", { exact: false })
      .fill("إدارة الأعضاء\nحجز الملاعب\nتطبيق للأعضاء");
    const created = page.waitForResponse(
      (response) =>
        response.url().endsWith("/crm/plans") &&
        response.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    const createdResponse = await created;
    expect(createdResponse.status()).toBe(201);
    planId = (await createdResponse.json()).plan.id;
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: planName, exact: true }),
    ).toBeVisible();
    const initialPlan = (await catalog()).plans.find(
      (row: { id: string }) => row.id === planId,
    );
    expect(initialPlan.annual_fee_cents).toBe(500025);
    expect(initialPlan.features).toHaveLength(3);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: "test-results/crm-plans-desktop.png" });
    await page.goto(`${base}/board/leads`);
    await page
      .getByRole("button", { name: "إضافة عميل محتمل", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("اسم المؤسسة", { exact: false }).fill(accountName);
    await dialog
      .getByLabel("الخطة المرشحة", { exact: true })
      .selectOption(planId);
    const leadCreated = page.waitForResponse(
      (response) =>
        response.url().endsWith("/crm/accounts") &&
        response.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    const leadResponse = await leadCreated;
    leadId = (await leadResponse.json()).account.id;
    await expect(page).toHaveURL(new RegExp(`/board/leads/${leadId}$`));
    expect((await profile(leadId)).account.plan_id).toBe(planId);
    await page
      .getByRole("button", { name: "تحويل إلى عميل", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("باقة العقد", { exact: true })).toHaveValue(
      planId,
    );
    await expect(
      dialog.getByLabel("قيمة الاشتراك السنوي", { exact: false }),
    ).toHaveValue("5000.25");
    await expect(
      dialog.getByLabel("رسوم التجهيز أو التطوير", { exact: false }),
    ).toHaveValue("1000.75");
    await expect(
      dialog.getByLabel("النطاق والتخصيصات والدعم المتفق عليه"),
    ).toHaveValue("إدارة الأعضاء\nحجز الملاعب\nتطبيق للأعضاء");
    await dialog
      .getByRole("button", { name: "تأكيد التعاقد والتحويل", exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/board/clients/${leadId}$`));
    let snapshot = await profile(leadId);
    expect(snapshot.account.plan_id).toBe(planId);
    expect(snapshot.contracts[0].plan_id).toBe(planId);
    expect(snapshot.contracts[0].plan_features).toHaveLength(3);
    await page.goto(`${base}/board/plans`);
    let card = page.locator('[data-slot="card"]').filter({
      has: page.getByRole("heading", { name: planName, exact: true }),
    });
    await card.getByRole("button", { name: "تعديل", exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("السعر السنوي", { exact: false }).fill("6000.99");
    await dialog
      .getByLabel("مميزات الباقة", { exact: false })
      .fill("ميزة جديدة\nحجز الملاعب");
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    snapshot = await profile(leadId);
    expect(snapshot.contracts[0].annual_fee_cents).toBe(500025);
    expect(snapshot.contracts[0].plan_features).toEqual(initialPlan.features);
    const stale = await page.request.patch(`${api}/plans`, {
      headers,
      data: { id: planId, revision: initialPlan.revision, fields: initialPlan },
    });
    expect(stale.status()).toBe(409);
    expect(
      (
        await page.request.delete(`${api}/plans`, {
          headers,
          data: {
            id: planId,
            revision: (await catalog()).plans.find(
              (row: { id: string }) => row.id === planId,
            ).revision,
          },
        })
      ).status(),
    ).toBe(409);
    await page.goto(`${base}/board/clients`);
    await page.getByRole("button", { name: "إضافة عميل", exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("اسم المؤسسة", { exact: false })
      .fill(`${accountName}-DIRECT`);
    await dialog
      .getByLabel("خطة الاشتراك", { exact: true })
      .selectOption(planId);
    const clientCreated = page.waitForResponse(
      (response) =>
        response.url().endsWith("/crm/accounts") &&
        response.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    const directResponse = await clientCreated;
    directId = (await directResponse.json()).account.id;
    await expect(page).toHaveURL(new RegExp(`/board/clients/${directId}$`));
    expect((await profile(directId)).account.plan_id).toBe(planId);
    await page
      .getByRole("button", { name: "تعديل الملف", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    const otherPlan = (await catalog()).plans.find(
      (row: { id: string; active: boolean }) => row.id !== planId && row.active,
    );
    await dialog
      .getByLabel("اسم المؤسسة", { exact: false })
      .fill(`${accountName}-DIRECT-EDITED`);
    await dialog.getByLabel("المدينة", { exact: true }).fill("الدمام");
    await dialog
      .getByLabel("خطة الاشتراك", { exact: true })
      .selectOption(otherPlan.id);
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.reload();
    const changedClient = await profile(directId);
    expect(changedClient.account.name).toBe(`${accountName}-DIRECT-EDITED`);
    expect(changedClient.account.city).toBe("الدمام");
    expect(changedClient.account.plan_id).toBe(otherPlan.id);
    await page
      .getByRole("button", { name: "تعديل الملف", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("خطة الاشتراك", { exact: true })
      .selectOption(planId);
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect((await profile(directId)).account.plan_id).toBe(planId);
    await page.goto(`${base}/board/plans`);
    card = page.locator('[data-slot="card"]').filter({
      has: page.getByRole("heading", { name: planName, exact: true }),
    });
    await expect(
      card.getByRole("button", { name: `حذف باقة ${planName}` }),
    ).toBeDisabled();
    const toggle = card.getByRole("switch");
    await toggle.click();
    await expect(toggle).not.toBeChecked();
    await page.goto(`${base}/board/leads`);
    await page
      .getByRole("button", { name: "إضافة عميل محتمل", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await expect(
      dialog.getByLabel("الخطة المرشحة").locator(`option[value="${planId}"]`),
    ).toHaveCount(0);
    await dialog.getByRole("button", { name: "إلغاء", exact: true }).click();
    await page.goto(`${base}/board/clients/${directId}`);
    await page
      .getByRole("button", { name: "تعديل الملف", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("خطة الاشتراك")).toHaveValue(planId);
    await dialog.getByRole("button", { name: "إلغاء", exact: true }).click();
    const spare = await page.request.post(`${api}/plans`, {
      headers,
      data: {
        id: crypto.randomUUID(),
        fields: {
          name: `${planName}-UNUSED`,
          pricing_type: "custom",
          features: ["نطاق مخصص"],
          active: true,
          sort_order: 10,
        },
      },
    });
    expect(spare.status()).toBe(201);
    spareId = (await spare.json()).plan.id;
    await page.goto(`${base}/board/plans`);
    await page
      .getByRole("button", { name: `حذف باقة ${planName}-UNUSED`, exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "تأكيد", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect(
      (await catalog()).plans.some((row: { id: string }) => row.id === spareId),
    ).toBe(false);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: "test-results/crm-plans-mobile.png" });
  } finally {
    const ids = [leadId, directId].filter(Boolean),
      planIds = [planId, spareId].filter(Boolean);
    if ([...ids, ...planIds].some((id) => !/^[0-9a-f-]{36}$/.test(id)))
      throw new Error("Unexpected QA identifier");
    if (ids.length || planIds.length) {
      const cleanup = `begin; ${ids.map((id) => `do $$ begin if exists(select 1 from public.crm_accounts where id='${id}' and name not like 'CRM-QA-PLAN-%') then raise exception 'Unsafe account cleanup'; end if; end $$; update public.crm_accounts set archived=false where id='${id}'; delete from public.crm_payments where account_id='${id}'; update public.crm_contracts set status='draft' where account_id='${id}'; delete from public.crm_contracts where account_id='${id}'; delete from public.crm_accounts where id='${id}';`).join("\n")} ${planIds.map((id) => `do $$ begin if exists(select 1 from public.crm_plans where id='${id}' and name not like 'CRM-PLAN-QA-%') then raise exception 'Unsafe plan cleanup'; end if; end $$; delete from public.crm_plans where id='${id}';`).join("\n")} commit;`;
      await writeFile(".private/crm-plan-qa-cleanup.sql", cleanup, "utf8");
      execFileSync(
        process.execPath,
        [
          "--env-file=.env.local",
          "scripts/article-db.mjs",
          ".private/crm-plan-qa-cleanup.sql",
        ],
        { stdio: "pipe" },
      );
    }
  }
});
