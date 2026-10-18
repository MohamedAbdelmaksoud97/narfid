import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

test("CRM follows a lead through contract, onboarding, payments, support and renewal with private access", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3015",
    api = `${base}/api/board/crm`;
  expect((await request.get(`${api}/accounts?kind=lead`)).status()).toBe(401);
  expect((await request.post(`${api}/accounts`, { data: {} })).status()).toBe(
    401,
  );
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (row: { status: string }) => row.status === "verified",
  );
  await page.goto(`${base}/login`);
  await page.getByLabel("البريد الإلكتروني").fill(account.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  const name = `CRM-QA-${Date.now()}`;
  let id = "";
  const headers = { Origin: base };
  async function snapshot() {
    const response = await page.request.get(`${api}/accounts/${id}`);
    expect(response.status()).toBe(200);
    return response.json();
  }
  async function add(resource: string, fields: object) {
    const response = await page.request.post(`${api}/entries/${resource}`, {
      headers,
      data: { id: crypto.randomUUID(), account_id: id, fields },
    });
    expect(response.status(), await response.text()).toBe(201);
    return (await response.json()).row;
  }
  try {
    await page.goto(`${base}/board/leads`);
    await page
      .getByRole("button", { name: "إضافة عميل محتمل", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog.getByLabel("اسم المؤسسة", { exact: false }).fill(name);
    await dialog.getByLabel("المدينة", { exact: true }).fill("الرياض");
    await dialog.getByLabel("مسؤول التواصل لدى المؤسسة").fill("مسؤول اختبار");
    await dialog
      .getByLabel("رقم التواصل", { exact: true })
      .fill("+966500000000");
    await dialog
      .getByLabel("ميزانية سنوية تقديرية", { exact: false })
      .fill("7200");
    await dialog
      .getByLabel("الاحتياجات ونطاق الخدمة والملاحظات")
      .fill("اشتراكات وملاعب مع تطبيق للأعضاء؛ بيانات اختبار مؤقتة.");
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(page).toHaveURL(/\/board\/leads\/[0-9a-f-]+$/);
    id = page.url().split("/").at(-1)!;
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await page.goto(`${base}/board/leads`);
    await page
      .getByRole("textbox", { name: "البحث عن مؤسسة أو جهة اتصال" })
      .fill(name);
    await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
    await page.getByRole("button", { name: /^تم التواصل/ }).click();
    await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: /^تم التواصل/ }).click();
    await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
    await page.screenshot({ path: "test-results/crm-leads-desktop.png" });
    await page.getByRole("link", { name, exact: true }).click();
    const initial = await snapshot();
    expect(
      (
        await page.request.patch(`${api}/accounts`, {
          data: {
            id,
            revision: initial.account.revision,
            fields: initial.account,
          },
        })
      ).status(),
    ).toBe(403);
    await page.getByRole("tab", { name: "جهات الاتصال", exact: true }).click();
    await page
      .getByRole("button", { name: "إضافة جهة اتصال", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("اسم جهة الاتصال").fill("جهة اتصال تجريبية");
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "جهة اتصال تجريبية" }),
    ).toBeVisible();
    const temporary = await add("contacts", { name: "جهة تُحذف للاختبار" });
    const removed = await page.request.delete(`${api}/entries/contacts`, {
      headers,
      data: { id: temporary.id, account_id: id, revision: temporary.revision },
    });
    expect(removed.status()).toBe(200);
    expect((await snapshot()).contacts).toHaveLength(1);
    await add("activities", {
      title: "اجتماع تعارف تجريبي",
      body: "تمت مناقشة المتطلبات.",
      channel: "meeting",
      occurred_on: "2026-10-18",
    });
    await page
      .getByRole("button", { name: "تحويل إلى عميل", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("قيمة الاشتراك السنوي", { exact: false })
      .fill("7200");
    await dialog
      .getByLabel("رسوم التجهيز أو التطوير", { exact: false })
      .fill("1000");
    await dialog
      .getByRole("button", { name: "تأكيد التعاقد والتحويل", exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/board/clients/${id}$`));
    let result = await snapshot();
    expect(result.contacts).toHaveLength(1);
    expect(result.activities).toHaveLength(1);
    expect(result.followups).toHaveLength(7);
    expect(result.workspaces).toHaveLength(1);
    expect(result.contracts).toHaveLength(1);
    expect(
      (
        await page.request.patch(`${api}/accounts`, {
          headers,
          data: { id, revision: 0, fields: result.account },
        })
      ).status(),
    ).toBe(409);
    await page
      .getByRole("tab", { name: "المتابعات والتجهيز", exact: true })
      .click();
    const check = page.getByRole("checkbox").first();
    await check.click();
    await expect(check).toBeChecked();
    expect(
      (await snapshot()).followups.filter(
        (row: { status: string }) => row.status === "done",
      ),
    ).toHaveLength(1);
    await page
      .getByRole("tab", { name: "العقود والدفعات", exact: true })
      .click();
    await page.getByRole("button", { name: "إضافة دفعة", exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("المبلغ المحصّل", { exact: false }).fill("2000");
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    result = await snapshot();
    expect(result.payments[0].amount_cents).toBe(200000);
    const excess = await page.request.post(`${api}/entries/payments`, {
      headers,
      data: {
        id: crypto.randomUUID(),
        account_id: id,
        fields: {
          contract_id: result.contracts[0].id,
          amount_cents: 620001,
          paid_on: "2026-10-18",
          method: "bank",
        },
      },
    });
    expect(excess.status()).toBe(409);
    await page
      .getByRole("button", { name: "إلغاء تسجيل الدفعة", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByLabel("سبب إلغاء تسجيل الدفعة").fill("دفعة تجريبية فقط");
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    result = await snapshot();
    expect(result.payments[0].voided).toBe(true);
    await page
      .getByRole("tab", { name: "التشغيل والتحديثات", exact: true })
      .click();
    await page.getByRole("button", { name: "تعديل", exact: true }).click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("رابط نظام العميل")
      .fill("https://crm-qa.example.com");
    await dialog
      .getByLabel("اسم مشروع قاعدة البيانات أو مرجعه")
      .fill("crm-qa-project");
    await dialog.getByLabel("حالة التشغيل").selectOption("live");
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText("يعمل", { exact: true })).toBeVisible();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: "test-results/crm-workspace-desktop.png" });
    await add("tickets", {
      title: "طلب دعم تجريبي",
      body: "فحص الدعم",
      status: "open",
      priority: "high",
      category: "support",
    });
    await page.reload();
    await page
      .getByRole("tab", { name: "الدعم والتطوير", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "طلب دعم تجريبي" }),
    ).toBeVisible();
    await page
      .getByRole("tab", { name: "العقود والدفعات", exact: true })
      .click();
    await page
      .getByRole("button", { name: "تجهيز تجديد", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "حفظ", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    expect((await snapshot()).contracts).toHaveLength(2);
    const csv = await page.request.get(
      `${api}/accounts?kind=client&format=csv`,
    );
    expect(csv.status()).toBe(200);
    expect(await csv.text()).toContain(name);
    await page.getByRole("tab", { name: "سجل النشاط", exact: true }).click();
    await expect(
      page.getByText("تحويل العميل المحتمل إلى عميل متعاقد", { exact: true }),
    ).toBeVisible();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({ path: "test-results/crm-profile-desktop.png" });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: "test-results/crm-profile-mobile.png" });
    await page.getByRole("button", { name: "أرشفة", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "تأكيد", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "استعادة الملف", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "استعادة الملف", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "تأكيد", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "تعديل الملف", exact: true }),
    ).toBeVisible();
  } finally {
    if (id) {
      if (!/^[0-9a-f-]{36}$/.test(id))
        throw new Error("Unexpected test identifier");
      const cleanup = `.private/crm-qa-cleanup.sql`;
      await writeFile(
        cleanup,
        `begin; do $$ begin if exists(select 1 from public.crm_accounts where id='${id}' and name not like 'CRM-QA-%') then raise exception 'Unsafe QA cleanup'; end if; end $$; update public.crm_accounts set archived=false where id='${id}'; delete from public.crm_payments where account_id='${id}'; update public.crm_contracts set status='draft' where account_id='${id}'; delete from public.crm_contracts where account_id='${id}'; delete from public.crm_accounts where id='${id}'; commit;`,
        "utf8",
      );
      execFileSync(
        process.execPath,
        ["--env-file=.env.local", "scripts/article-db.mjs", cleanup],
        { stdio: "pipe" },
      );
    }
  }
});
