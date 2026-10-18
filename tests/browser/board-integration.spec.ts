import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("all board sections share navigation, private APIs and a consistent login/logout boundary", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const base = process.env.AUTH_TEST_BASE_URL || "http://127.0.0.1:3015";
  const reads = [
    "/api/board/tasks",
    "/api/board/crm/accounts?kind=lead",
    "/api/board/crm/accounts?kind=client",
    "/api/board/crm/plans",
    "/api/board/finance",
    "/api/board/identity-projects",
    "/api/board/marketing/publications?platform=snapchat",
  ];
  for (const path of reads) {
    const response = await request.get(base + path);
    expect(response.status(), path).toBe(401);
    expect(response.headers()["cache-control"], path).toContain("no-store");
  }
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const member = credentials.accounts.find(
    (row: { status: string }) => row.status === "verified",
  );
  await page.goto(base + "/login");
  await page.getByLabel("البريد الإلكتروني").fill(member.email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(member.password);
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page).toHaveURL(/\/board$/);
  const sections = [
    { label: "العملاء المحتملون", path: "leads" },
    { label: "العملاء", path: "clients" },
    { label: "الباقات", path: "plans" },
    { label: "المالية", path: "finance" },
    { label: "مشروعات الهوية", path: "identity-projects" },
    { label: "المهام القادمة", path: "tasks" },
    { label: "التسويق", path: "marketing" },
    { label: "هوية نرفد", path: "brand" },
    { label: "المقالات", path: "articles" },
    { label: "تحسين البحث", path: "seo" },
  ];
  const cards = page.locator(".board-sections");
  for (const section of sections)
    await expect(
      cards.locator(`a[href="/board/${section.path}"]`),
    ).toBeVisible();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const shell = page.locator(".board-shell");
  await shell.evaluate((node) =>
    node.setAttribute("data-integration-stable", "yes"),
  );
  for (const section of sections) {
    const nav = page.getByRole("navigation", {
      name: "أقسام لوحة الإدارة",
      exact: true,
    });
    await nav.getByRole("link", { name: section.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/board/${section.path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(nav.locator('[aria-current="page"]')).toHaveAttribute(
      "href",
      `/board/${section.path}`,
    );
    await expect(shell).toHaveAttribute("data-integration-stable", "yes");
  }
  for (const path of reads) {
    const response = await page.request.get(base + path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["cache-control"], path).toContain("no-store");
  }
  await page.goto(base + "/board/plans");
  await expect(page.getByRole("switch").first()).toBeEnabled();
  await page.route("**/api/board/crm/plans", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "تعذر تحديث الباقات للاختبار" }),
    }),
  );
  await page
    .getByRole("button", { name: "تحديث البيانات", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "تعذر تحديث الباقات" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "إضافة باقة", exact: true }),
  ).toBeDisabled();
  await expect(page.getByRole("switch").first()).toBeDisabled();
  await page.unroute("**/api/board/crm/plans");
  await page
    .getByRole("button", { name: "تحديث البيانات", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "إضافة باقة", exact: true }),
  ).toBeEnabled();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  await page.getByRole("button", { name: "تسجيل الخروج", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect((await page.request.get(base + "/api/board/crm/plans")).status()).toBe(
    401,
  );
  await page.goto(base + "/board/clients");
  await expect(page).toHaveURL(/\/login$/);
});
