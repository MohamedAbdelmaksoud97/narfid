import { test } from "node:test";
import assert from "node:assert/strict";
import {
  accountFields,
  csvCell,
  parseMoney,
  paymentFields,
  resourceFields,
} from "../lib/crm/validation";
import { contractBalance, renewalDate } from "../lib/crm/types";

test("account validation distinguishes sales stages, preserves lost reasons and rejects malformed contacts", () => {
  assert.equal(accountFields({ name: "نادي الاختبار" }, "lead").stage, "new");
  assert.equal(
    accountFields({ name: "نادي الاختبار" }, "client").stage,
    "onboarding",
  );
  for (const fields of [
    { stage: "active" },
    { stage: "lost" },
    { email: "bad" },
    { branches: 0 },
    { phone: "abc" },
    { website: "javascript:alert(1)" },
  ])
    assert.throws(() =>
      accountFields({ name: "نادي الاختبار", ...fields }, "lead"),
    );
  assert.equal(
    accountFields(
      { name: "نادي الاختبار", stage: "lost", lost_reason: "تأجيل القرار" },
      "lead",
    ).lost_reason,
    "تأجيل القرار",
  );
});
test("money uses exact halalas and validates amounts before saving", () => {
  assert.equal(parseMoney("3600.99"), 360099);
  assert.equal(parseMoney("٣٦٠٠٫٥"), 360050);
  for (const input of ["1.001", "-20", "1e4", "abc", ""])
    assert.throws(() => parseMoney(input));
  assert.throws(() =>
    paymentFields({
      contract_id: "00000000-0000-4000-8000-000000000001",
      amount_cents: 0,
      paid_on: "2026-10-18",
    }),
  );
});
test("workspace metadata rejects connection secrets and requires evidence before live/verified statuses", () => {
  assert.throws(() =>
    resourceFields("workspaces", {
      database_ref: "postgres://name:secret@host/db",
    }),
  );
  assert.throws(() =>
    resourceFields("workspaces", {
      app_url: "https://name:password@example.com",
    }),
  );
  assert.throws(() => resourceFields("workspaces", { status: "live" }));
  assert.throws(() =>
    resourceFields("workspaces", { backup_status: "verified" }),
  );
  const workspace = resourceFields("workspaces", {
    app_url: "https://club.example.com",
    database_ref: "project-ref",
    status: "live",
  });
  assert.ok("status" in workspace && workspace.status === "live");
});
test("contracts reject impossible dates; annual renewals and balances preserve financial history", () => {
  assert.throws(() =>
    resourceFields("contracts", {
      title: "سنوي",
      starts_on: "2026-02-30",
      ends_on: "2027-02-28",
    }),
  );
  assert.throws(() =>
    resourceFields("contracts", {
      title: "سنوي",
      starts_on: "2027-01-01",
      ends_on: "2026-01-01",
    }),
  );
  assert.deepEqual(renewalDate("2027-10-17"), {
    starts_on: "2027-10-18",
    ends_on: "2028-10-17",
  });
  assert.deepEqual(renewalDate("2028-02-28"), {
    starts_on: "2028-02-29",
    ends_on: "2029-02-27",
  });
  const base = {
    id: "contract",
    revision: 0,
    created_at: "",
    updated_at: "",
    annual_fee_cents: 360000,
    setup_fee_cents: 100000,
  };
  assert.deepEqual(
    contractBalance(base, [
      {
        ...base,
        id: "p1",
        contract_id: "contract",
        amount_cents: 50000,
        voided: false,
      },
      {
        ...base,
        id: "p2",
        contract_id: "contract",
        amount_cents: 100000,
        voided: true,
      },
    ]),
    { paid: 50000, total: 460000, remaining: 410000 },
  );
});
test("CSV protects spreadsheet formulas and escapes quoted business names", () => {
  assert.equal(csvCell('نادي "اختبار"'), '"نادي ""اختبار"""');
  assert.equal(csvCell("=HYPERLINK(1)"), '"\'=HYPERLINK(1)"');
  assert.equal(csvCell("+966500000000"), '"\'+966500000000"');
});
