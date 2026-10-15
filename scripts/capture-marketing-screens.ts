// Capture the reference application's real UI with isolated, fictional data.
// No customer credentials, backend calls, database writes, or GO source edits.
import { chromium } from "@playwright/test";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const org = "00000000-0000-4000-8000-000000000001";
const branch = "00000000-0000-4000-8000-000000000002";
const at = "2026-10-15T09:00:00Z";
const output = "content/marketing/source/screens";
const base = process.env.MARKETING_REFERENCE_URL || "http://127.0.0.1:3014";
const id = (i: number) =>
  `00000000-0000-4000-8000-${String(i + 10).padStart(12, "0")}`;
const names = [
  "عضو تجريبي أ",
  "عضو تجريبي ب",
  "عضو تجريبي ج",
  "عضو تجريبي د",
  "عضو تجريبي هـ",
];
const list = <T extends object>(make: (i: number) => T) =>
  names.map((_, i) => ({
    id: id(i),
    branchId: branch,
    version: 1,
    ...make(i),
  }));
const members = list((i) => ({
  name: names[i],
  fullNameAr: names[i],
  memberName: names[i],
  fullName: names[i],
  memberNumber: `DEMO-00${i + 1}`,
  phoneE164: "—",
  branchName: "نرفد · الفرع الرئيسي",
  registeredOn: "2026-10-01",
  accountStatus: "ACTIVE",
  status: "ACTIVE",
}));
const subscriptions = list((i) => ({
  subscriptionNumber: `SUB-DEMO-0${i + 1}`,
  memberName: names[i],
  packageName: ["لياقة شهرية", "لياقة ربع سنوية", "تدريب شخصي"][i % 3],
  startsOn: "2026-10-01",
  endsOn: "2027-01-01",
  status: i === 2 ? "FROZEN" : "ACTIVE",
  memberId: id(i),
  remainingDays: 78,
}));
const branches = [
  {
    id: branch,
    name: "نرفد · الفرع الرئيسي",
    nameAr: "نرفد · الفرع الرئيسي",
    code: "MAIN",
    status: "ACTIVE",
    timezone: "Asia/Riyadh",
  },
  {
    id: id(9),
    name: "نرفد · الفرع الثاني",
    nameAr: "نرفد · الفرع الثاني",
    code: "SECOND",
    status: "ACTIVE",
    timezone: "Asia/Riyadh",
  },
];
const meals = list((i) => ({
  name: [
    "دجاج مشوي وأرز",
    "لحم وخضار",
    "سلطة بروتين",
    "وجبة نباتية",
    "عصير طازج",
  ][i],
  code: `MEAL-${i + 1}`,
  categoryId: id(60),
  kind: "MEAL",
  status: "ACTIVE",
  portionClass: "STANDARD_150G",
  nutrition: {
    caloriesKcal: 450,
    proteinGrams: 35,
    carbohydratesGrams: 50,
    fatGrams: 12,
    fiberGrams: 5,
    sugarGrams: 2,
    sodiumMilligrams: 200,
  },
  allergens: [],
}));
const fixtures: [RegExp, unknown][] = [
  [/\/available-branches$/, branches],
  [/\/branches$/, branches],
  [/\/members$/, members],
  [/\/subscriptions$/, subscriptions],
  [
    /\/attendance-attempts$/,
    list((i) => ({
      memberName: names[i],
      memberNumber: `DEMO-00${i + 1}`,
      occurredAt: at,
      method: "MANUAL",
      branchName: branches[0].nameAr,
      decision: i === 3 ? "DENY" : "ALLOW",
    })),
  ],
  [
    /\/reservations$/,
    list((i) => ({
      reservationNumber: `RSV-DEMO-0${i + 1}`,
      customerName: names[i],
      customerPhone: "—",
      resourceName: ["ملعب بادل", "حصة لياقة", "تدريب شخصي"][i % 3],
      startsAt: at,
      endsAt: "2026-10-15T10:00:00Z",
      seats: i + 1,
      grossMinor: 15000,
      status: "CONFIRMED",
    })),
  ],
  [
    /\/employees$/,
    list((i) => ({
      fullNameAr: `موظف تجريبي ${i + 1}`,
      employeeNumber: `EMP-DEMO-0${i + 1}`,
      positionName: ["استقبال", "مدرب", "مدير فرع"][i % 3],
      branchName: branches[0].nameAr,
      shiftSummary: "الفترة الصباحية",
      attendanceAt: at,
      status: "ACTIVE",
    })),
  ],
  [
    /\/(?:restaurant\/orders|restaurant-orders)$/,
    list((i) => ({
      orderNumber: `ORD-DEMO-0${i + 1}`,
      memberName: names[i],
      memberNumber: `DEMO-00${i + 1}`,
      sourceType: "MEAL_PLAN",
      itemSummary: "دجاج مشوي وأرز وخضار",
      lines: [{ id: id(i), quote: { targetName: meals[i].name, quantity: 1 } }],
      createdAt: at,
      grossMinor: "3500",
      currency: "SAR",
      status: ["PREPARING", "READY", "PLACED"][i % 3],
    })),
  ],
  [
    /\/restaurant\/meal-categories$/,
    [{ id: id(60), name: "وجبات صحية", status: "ACTIVE" }],
  ],
  [/\/restaurant\/meals$/, meals],
  [
    /\/daily-menus\/\d{4}-\d{2}-\d{2}$/,
    {
      businessDate: "2026-10-15",
      status: "PUBLISHED",
      version: 1,
      items: meals.map((meal, i) => ({
        mealId: meal.id,
        enabled: true,
        availableQuantity: 20,
        preparedQuantity: 20,
        reservedQuantity: 2,
        soldQuantity: i + 2,
        remainingQuantity: 16 - i,
        specialPriceMinor: "3500",
      })),
    },
  ],
  [
    /\/retail\/inventory$/,
    list((i) => ({
      productId: id(i),
      productName: [
        "منشفة تدريب",
        "عبوة رياضية",
        "حبل مقاومة",
        "قفازات تدريب",
        "سجادة تمرين",
      ][i],
      branchName: branches[0].nameAr,
      quantityOnHand: 20 + i * 3,
      quantityReserved: 2,
      quantityAvailable: 18 + i * 3,
      reorderLevel: 10,
      stockStatus: "متوفر",
      updatedAt: at,
      status: "ACTIVE",
    })),
  ],
  [
    /\/retail\/products$/,
    list((i) => ({
      nameAr: [
        "منشفة تدريب",
        "عبوة رياضية",
        "حبل مقاومة",
        "قفازات تدريب",
        "سجادة تمرين",
      ][i],
      sku: `DEMO-0${i + 1}`,
      status: "ACTIVE",
    })),
  ],
  [
    /\/roles$/,
    [
      {
        id: id(20),
        name: "مدير الفرع",
        nameAr: "مدير الفرع",
        code: "BRANCH_MANAGER",
        status: "ACTIVE",
        permissions: ["members.read", "subscriptions.read"],
      },
      {
        id: id(21),
        name: "موظف الاستقبال",
        nameAr: "موظف الاستقبال",
        code: "RECEPTION",
        status: "ACTIVE",
        permissions: ["members.read"],
      },
    ],
  ],
  [
    /\/services$/,
    [
      {
        id: id(71),
        name: "دخول صالة اللياقة",
        code: "FITNESS",
        fulfillmentKind: "FACILITY_ACCESS",
        status: "ACTIVE",
      },
      {
        id: id(72),
        name: "تدريب شخصي",
        code: "PT",
        fulfillmentKind: "SESSION",
        status: "ACTIVE",
      },
      {
        id: id(73),
        name: "اشتراك وجبات",
        code: "MEALS",
        fulfillmentKind: "MEAL_PLAN",
        status: "ACTIVE",
      },
    ],
  ],
  [
    new RegExp(`/organizations/${org}$`),
    {
      id: org,
      name: "نرفد",
      code: "DEMO",
      timezone: "Asia/Riyadh",
      status: "ACTIVE",
    },
  ],
  [
    /\/invoices$/,
    list((i) => ({
      invoiceNumber: `INV-DEMO-0${i + 1}`,
      buyerName: names[i],
      grossMinor: 30000,
      paidMinor: 25000,
      outstandingMinor: 5000,
      status: "PARTIALLY_PAID",
      issuedAt: at,
    })),
  ],
  [
    /\/dashboard\/summary$/,
    {
      totalMembers: 5,
      activeMembers: 4,
      activeSubscriptions: 4,
      todayRevenueMinor: 150000,
      collectedMinor: 150000,
      attendanceAccepted: 4,
      todayAttendance: 4,
      expiringSubscriptions: 1,
      totalOutstandingMinor: 25000,
    },
  ],
  [
    /\/reports\/revenue-trend$/,
    Array.from({ length: 14 }, (_, i) => ({
      businessDate: `2026-10-${String(i + 1).padStart(2, "0")}`,
      invoicedGrossMinor: 10000 + (i % 5) * 12000,
      totalRevenueMinor: 10000 + (i % 5) * 12000,
    })),
  ],
  [
    /\/reports\/subscription-status-chart$/,
    [
      { status: "ACTIVE", count: 4 },
      { status: "FROZEN", count: 1 },
    ],
  ],
  [
    /\/reports\/service-activity-chart$/,
    [
      { serviceId: id(1), serviceName: "لياقة", attempts: 5, accepted: 4 },
      { serviceId: id(2), serviceName: "تدريب شخصي", attempts: 3, accepted: 3 },
    ],
  ],
];
const captures = [
  ["overview", "/"],
  ["members", "/members"],
  ["subscriptions", "/subscriptions"],
  ["attendance", "/attendance"],
  ["bookings", "/bookings"],
  ["staff", "/staff"],
  ["inventory", "/system-settings/retail-inventory"],
  ["branches", "/system-settings/branches"],
  ["roles", "/system-settings/roles"],
  ["restaurant", "/restaurant"],
  ["finance", "/finance"],
  ["services", "/system-settings/services"],
  ["kitchen", "/restaurant", "المطبخ"],
  ["meals", "/restaurant", "الوجبات والأسعار"],
] as const;

async function main() {
  await mkdir(output, { recursive: true });
  const permissions = [
    ...new Set(
      [
        ...(await readFile("../go/go/lib/permissions.ts", "utf8")).matchAll(
          /"([a-z][a-z-]*(?:\.[a-z-]+)+)"/g,
        ),
      ].map((m) => m[1]),
    ),
  ];
  const logo = `data:image/png;base64,${(await sharp("public/logo.png").trim().png().toBuffer()).toString("base64")}`;
  let fontCss = "";
  for (const name of await readdir(".next/static/chunks")) {
    if (!name.endsWith(".css")) continue;
    for (const face of (
      await readFile(`.next/static/chunks/${name}`, "utf8")
    ).matchAll(/@font-face\{[^}]*font-family:Tajawal;[^}]*\}/g)) {
      const file = face[0].match(/url\(\.\.\/media\/([^)]*)\)/)?.[1];
      if (file)
        fontCss += face[0].replace(
          /url\([^)]+\)/,
          `url(data:font/woff2;base64,${(await readFile(`.next/static/media/${file}`)).toString("base64")})`,
        );
    }
  }
  const browser = await chromium.launch({
    channel: "chromium",
    headless: true,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    });
    await context.addCookies([
      { name: "go_access_token", value: "isolated-marketing-demo", url: base },
    ]);
    await context.addInitScript(() => {
      localStorage.setItem("go-theme", "dark");
    });
    await context.route(/^https:\/\/fonts\./, (route) => route.abort());
    const unmatched = new Set<string>();
    await context.route("**/api/**", async (route) => {
      const path = new URL(route.request().url()).pathname.replace(
        /^\/api\/backend\/api\/v1/,
        "",
      );
      if (route.request().method() !== "GET")
        return route.fulfill({
          status: 405,
          json: { error: "Read-only capture" },
        });
      let data: unknown;
      if (path === "/me")
        data = {
          userAccountId: id(50),
          grants: permissions.map((permission) => ({
            organizationId: org,
            permission,
            scopeType: "ORGANIZATION",
            branchIds: [],
          })),
        };
      else if (path === "/self")
        data = {
          employees: [
            {
              organizationId: org,
              employeeId: id(51),
              employeeNumber: "DEMO",
              name: "فريق نرفد",
              status: "ACTIVE",
            },
          ],
          members: [],
        };
      else if (path === "/self/account") data = { displayName: "فريق نرفد" };
      else if (path.endsWith("/account-notifications"))
        data = { items: [], unreadCount: 0 };
      else {
        const fixture = fixtures.find(([pattern]) => pattern.test(path));
        data = fixture?.[1] ?? [];
        if (!fixture) unmatched.add(path);
      }
      await route.fulfill({ status: 200, json: { data } });
    });
    const page = await context.newPage();
    for (const [key, route, tab] of captures) {
      await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      await page.locator("main").waitFor({ state: "visible" });
      await page
        .locator("main .animate-spin")
        .waitFor({ state: "hidden" })
        .catch(() => {});
      if (tab)
        await page.getByRole("button", { name: tab, exact: true }).click();
      await page.evaluate(
        ({ logo }) => {
          document.documentElement.classList.add("dark");
          document
            .querySelectorAll<HTMLImageElement>("img")
            .forEach((image) => {
              if (/go.fitness|go-fitness/i.test(image.alt + image.src)) {
                image.srcset = "";
                image.src = logo;
                image.alt = "نرفد";
                image.style.cssText =
                  "width:130px;height:46px;object-fit:contain;filter:none";
              }
            });
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.parentElement?.closest("script,style")) continue;
            if (node.textContent)
              node.textContent = node.textContent
                .replace(/GO Fitness[^\n<]*/gi, "نرفد")
                .replace(/\bGO\b/g, "نرفد");
          }
          window.scrollTo(0, 0);
        },
        { logo },
      );
      await page.addStyleTag({
        content: `:root,.dark{--primary:#3ecf8e;--primary-foreground:#10291d;--background:#1c1c1c;--foreground:#ededed;--card:#252525;--card-foreground:#ededed;--sidebar:#202020;--sidebar-primary:#3ecf8e;--sidebar-primary-foreground:#10291d;--accent:#234334;--ring:#3ecf8e;--border:#383838;--chart-1:#3ecf8e} [class*=text-amber],[class*=text-yellow]{color:#3ecf8e!important}[class*=bg-amber],[class*=bg-yellow]{background-color:#234334!important}[class*=border-amber],[class*=border-yellow]{border-color:#3ecf8e66!important} iframe,nextjs-portal{display:none!important} *{animation:none!important;transition:none!important} svg [fill="#ffcc00"]{fill:#3ecf8e!important} svg [stroke="#ffcc00"]{stroke:#3ecf8e!important}`,
      });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((img) => img.decode().catch(() => {})),
        );
      });
      await page.addStyleTag({
        content:
          fontCss +
          "body,button,input,select,textarea{font-family:Tajawal,sans-serif!important}",
      });
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      const text = await page.locator("body").innerText();
      if (
        /تعذر عرض البيانات|تعذر عرض الصفحة|Application error|Internal Server Error|GO Fitness/i.test(
          text,
        )
      )
        throw new Error(`Capture failed: ${key}`);
      await page.screenshot({
        path: resolve(output, `${key}.png`),
        animations: "disabled",
      });
      await page.screenshot({
        path: resolve(output, `${key}.focus.png`),
        clip: { x: 24, y: 96, width: 1120, height: 850 },
        animations: "disabled",
      });
      console.log(`Captured ${key}: actual UI with fictional demo data`);
    }
    await writeFile(
      `${output}/provenance.json`,
      JSON.stringify(
        {
          capturedAt: "2026-10-15",
          source: "go/go",
          mode: "Actual reference UI; browser-only identity styling; isolated fictional API fixtures; no backend access",
          screens: captures.map(([key, route]) => ({
            key,
            route,
            file: `${key}.png`,
          })),
          unmatchedEndpoints: [...unmatched],
        },
        null,
        2,
      ) + "\n",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
