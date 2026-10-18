import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { money, todaySaudi } from "../../lib/crm/types";

test("finance connects contract receipts, expenses, due dates, cancellation history and exports", async ({
  page,
  request,
}) => {
  test.setTimeout(240000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3018",
    headers = { Origin: base };
  expect((await request.get(`${base}/api/board/finance`)).status()).toBe(401);
  expect(
    (await request.get(`${base}/api/board/finance?format=csv`)).status(),
  ).toBe(401);
  expect(
    (await request.post(`${base}/api/board/finance`, { data: {} })).status(),
  ).toBe(401);
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
  const id = crypto.randomUUID(),
    contractId = crypto.randomUUID(),
    name = `FINANCE-QA-${Date.now()}`;
  const today = todaySaudi(),
    yesterday = new Date(Date.parse(`${today}T12:00:00Z`) - 86400000)
      .toISOString()
      .slice(0, 10),
    tomorrow = new Date(Date.parse(`${today}T12:00:00Z`) + 86400000)
      .toISOString()
      .slice(0, 10),
    end = `${Number(today.slice(0, 4)) + 1}${today.slice(4)}`;
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function snapshot() {
    const response = await page.request.get(`${base}/api/board/finance`);
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toContain("no-store");
    return response.json();
  }
  async function save(endpoint: string, method = "POST") {
    const response = page.waitForResponse(
      (response) =>
        response.url().endsWith(endpoint) &&
        response.request().method() === method,
    );
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "حفظ", exact: true })
      .click();
    const result = await response;
    expect(result.status(), await result.text()).toBe(
      method === "POST" ? 201 : 200,
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    return result.json();
  }
  try {
    let response = await page.request.post(`${base}/api/board/crm/accounts`, {
      headers,
      data: { id, kind: "client", fields: { name, stage: "onboarding" } },
    });
    expect(response.status()).toBe(201);
    response = await page.request.post(
      `${base}/api/board/crm/entries/contracts`,
      {
        headers,
        data: {
          id: contractId,
          account_id: id,
          fields: {
            title: `${name}-عقد`,
            starts_on: yesterday,
            ends_on: end,
            payment_due_on: yesterday,
            annual_fee_cents: 100000,
            setup_fee_cents: 10000,
            status: "signed",
          },
        },
      },
    );
    expect(response.status()).toBe(201);
    response = await page.request.post(
      `${base}/api/board/crm/entries/payments`,
      {
        headers,
        data: {
          id: crypto.randomUUID(),
          account_id: id,
          fields: {
            contract_id: contractId,
            amount_cents: 100,
            paid_on: tomorrow,
            method: "bank",
          },
        },
      },
    );
    expect(response.status()).toBe(400);
    await page.goto(`${base}/board/clients/${id}`);
    await page
      .getByRole("link", { name: "مالية المؤسسة", exact: true })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/board/finance\\?account_id=${id}$`),
    );
    await expect(
      page.getByLabel("العميل أو الفرصة", { exact: true }),
    ).toHaveValue(id);
    await expect(page.getByTestId("finance-outstanding")).toHaveText(
      money(110000),
    );
    await page
      .getByRole("button", { name: "تسجيل دفعة عقد", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("المبلغ المحصّل", { exact: false })
      .fill("300.25");
    const payment = (await save("/crm/entries/payments")).row;
    await expect(page.getByTestId("finance-income")).toHaveText(money(30025));
    await expect(page.getByTestId("finance-outstanding")).toHaveText(
      money(79975),
    );

    await page
      .getByRole("button", { name: "إضافة مصروف", exact: true })
      .click();
    let dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("وصف المصروف", { exact: false })
      .fill(`${name}-استضافة`);
    await dialog.getByLabel("المبلغ (ر.س)", { exact: false }).fill("200.25");
    await dialog.getByLabel("تاريخ الدفع", { exact: true }).fill("");
    await dialog.getByLabel("موعد الاستحقاق", { exact: false }).fill(yesterday);
    const expense = (await save("/board/finance")).entry;
    expect(expense.paid_on).toBeNull();
    await expect(page.getByTestId("finance-expenses")).toHaveText(money(0));
    await page.getByRole("tab", { name: "المصروفات", exact: true }).click();
    let expenseRow = page
      .getByRole("row")
      .filter({ hasText: `${name}-استضافة` });
    await expenseRow
      .getByRole("button", { name: "تعديل", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("المبلغ (ر.س)", { exact: false })
      .fill("200.50");
    const edited = (await save("/board/finance", "PATCH")).entry;
    expect(edited.amount_cents).toBe(20050);
    response = await page.request.patch(`${base}/api/board/finance`, {
      headers,
      data: {
        id: expense.id,
        revision: expense.revision,
        fields: { notes: "تعديل متعارض" },
      },
    });
    expect(response.status()).toBe(409);
    await expenseRow.getByRole("button", { name: "سداد", exact: true }).click();
    const settled = (await save("/board/finance", "PATCH")).entry;
    expect(settled.paid_on).toBe(today);
    await expect(page.getByTestId("finance-expenses")).toHaveText(money(20050));
    response = await page.request.patch(`${base}/api/board/finance`, {
      headers,
      data: {
        id: expense.id,
        revision: settled.revision,
        fields: { amount_cents: 1 },
      },
    });
    expect(response.status()).toBe(409);
    expect(
      (
        await page.request.delete(`${base}/api/board/finance`, {
          headers,
          data: { id: expense.id },
        })
      ).status(),
    ).toBe(405);

    await page.getByRole("tab", { name: "التحصيلات", exact: true }).click();
    await page
      .getByRole("button", { name: "تسجيل تحصيل إضافي", exact: true })
      .click();
    dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("وصف التحصيل", { exact: false })
      .fill(`${name}-تطبيق`);
    await dialog.getByLabel("التصنيف", { exact: false }).selectOption("mobile");
    await dialog.getByLabel("المبلغ (ر.س)", { exact: false }).fill("150.75");
    await save("/board/finance");
    await expect(page.getByTestId("finance-income")).toHaveText(money(45100));
    await expect(page.getByTestId("finance-net")).toHaveText(money(25050));
    const csv = await page.request.get(
      `${base}/api/board/finance?format=csv&report=cash&account_id=${id}&from=${today.slice(0, 4)}-01-01&to=${today}`,
    );
    expect(csv.status()).toBe(200);
    expect(await csv.text()).toContain('"300.25"');
    expect(await csv.text()).toContain(`${name}-تطبيق`);
    const dueCsv = await page.request.get(
      `${base}/api/board/finance?format=csv&report=receivables&account_id=${id}`,
    );
    expect(dueCsv.status()).toBe(200);
    expect(await dueCsv.text()).toContain('"799.75"');
    const expenseCsv = await page.request.get(
      `${base}/api/board/finance?format=csv&report=expenses&account_id=${id}`,
    );
    expect(expenseCsv.status()).toBe(200);
    expect(await expenseCsv.text()).toContain('"200.50"');
    expect(
      (
        await page.request.get(
          `${base}/api/board/finance?format=csv&from=2026-12-01&to=2026-01-01`,
        )
      ).status(),
    ).toBe(400);

    await page.getByRole("tab", { name: "المستحقات", exact: true }).click();
    await page
      .getByRole("button", { name: "تعديل الموعد", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("موعد سداد العقد", { exact: false })
      .fill(tomorrow);
    await save("/crm/entries/contracts", "PATCH");
    expect(
      (await snapshot()).contracts.find(
        (row: { id: string }) => row.id === contractId,
      ).payment_due_on,
    ).toBe(tomorrow);
    await expect(
      page
        .getByRole("row")
        .filter({ hasText: `${name}-عقد` })
        .getByText("مستحق", { exact: true }),
    ).toBeVisible();

    await page.getByRole("tab", { name: "المصروفات", exact: true }).click();
    expenseRow = page.getByRole("row").filter({ hasText: `${name}-استضافة` });
    await expenseRow
      .getByRole("button", { name: "إلغاء التسجيل", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("سبب إلغاء التسجيل", { exact: false })
      .fill("تصحيح تسجيل الاختبار");
    await save("/board/finance", "PATCH");
    await expect(page.getByTestId("finance-expenses")).toHaveText(money(0));
    await page.getByLabel("حالة التسجيل", { exact: true }).selectOption("all");
    await expect(expenseRow.getByText("ملغي", { exact: true })).toBeVisible();

    await page.getByRole("tab", { name: "التحصيلات", exact: true }).click();
    await page
      .getByRole("row")
      .filter({ hasText: `${name}-عقد` })
      .getByRole("button", { name: "إلغاء التسجيل", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("سبب إلغاء التسجيل", { exact: false })
      .fill("إلغاء تسجيل الدفعة التجريبية");
    await save("/crm/entries/payments", "PATCH");
    await expect(page.getByTestId("finance-income")).toHaveText(money(15075));
    await expect(page.getByTestId("finance-outstanding")).toHaveText(
      money(110000),
    );
    const profile = await (
      await page.request.get(`${base}/api/board/crm/accounts/${id}`)
    ).json();
    expect(
      profile.payments.find((row: { id: string }) => row.id === payment.id)
        .voided,
    ).toBe(true);
    await page.getByRole("tab", { name: "الملخص المالي", exact: true }).click();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.screenshot({
      path: "test-results/finance-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "test-results/finance-mobile.png",
      fullPage: true,
    });
    expect(errors).toEqual([]);

    response = await page.request.post(`${base}/api/board/finance`, {
      headers: { Origin: "https://outside.example" },
      data: {},
    });
    expect(response.status()).toBe(403);
    await page.route("**/api/board/finance", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "تعذر تحديث المالية للاختبار" }),
      }),
    );
    await page
      .getByRole("button", { name: "تحديث البيانات", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "تعذر تحديث المالية" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "إضافة مصروف", exact: true }),
    ).toBeDisabled();
    await page.unroute("**/api/board/finance");
  } finally {
    const cleanup = ".private/finance-qa-cleanup.sql";
    await writeFile(
      cleanup,
      `begin; do $$ begin if exists(select 1 from public.crm_accounts where id='${id}' and name not like 'FINANCE-QA-%') then raise exception 'Unsafe QA cleanup'; end if; end $$; delete from public.finance_entries where account_id='${id}'; update public.crm_accounts set archived=false where id='${id}'; delete from public.crm_payments where account_id='${id}'; update public.crm_contracts set status='draft' where account_id='${id}'; delete from public.crm_contracts where account_id='${id}'; delete from public.crm_accounts where id='${id}'; commit;`,
      "utf8",
    );
    execFileSync(
      process.execPath,
      ["--env-file=.env.local", "scripts/article-db.mjs", cleanup],
      { stdio: "pipe" },
    );
  }
});
