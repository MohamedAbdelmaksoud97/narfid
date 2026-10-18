import { test } from "node:test";
import assert from "node:assert/strict";
import {
  identityBalance,
  identityProjectFields,
  identityDeliverableFields,
  type IdentityProject,
} from "../lib/identity-projects";
import {
  financeFields,
  financeSummary,
  type FinanceData,
  type FinanceEntry,
} from "../lib/finance";

const account = "00000000-0000-4000-8000-000000000001";
test("identity projects require real account IDs and validate scope, fees, revision limits and dates", () => {
  const fields = identityProjectFields({
    title: "هوية النادي",
    account_id: account,
  });
  assert.equal(fields.quote_fee_cents, null);
  assert.equal(fields.status, "inquiry");
  for (const invalid of [
    { account_id: "invalid" },
    { quote_fee_cents: 0 },
    { quote_fee_cents: 1.5 },
    { revision_limit: -1 },
    { due_on: "2026-02-30" },
    { handover_url: "https://user:pass@example.com" },
  ])
    assert.throws(() =>
      identityProjectFields({
        title: "هوية النادي",
        account_id: account,
        ...invalid,
      }),
    );
});
test("deliverables accept an initial round of zero and reject unsafe links and unsupported approvals", () => {
  assert.equal(
    identityDeliverableFields({ title: "دليل الهوية", revision_round: 0 })
      .revision_round,
    0,
  );
  assert.throws(() =>
    identityDeliverableFields({ title: "دليل الهوية", status: "done" }),
  );
  assert.throws(() =>
    identityDeliverableFields({
      title: "دليل الهوية",
      asset_url: "javascript:alert(1)",
    }),
  );
});
test("identity balances use shared finance entries, exclude cancellations and distinguish pending costs", () => {
  const project = {
    id: "p1",
    quote_status: "accepted",
    quote_fee_cents: 100001,
  } as IdentityProject;
  const entries = [
    {
      identity_project_id: "p1",
      kind: "income",
      amount_cents: 60001,
      voided: false,
    },
    {
      identity_project_id: "p1",
      kind: "income",
      amount_cents: 20000,
      voided: true,
    },
    {
      identity_project_id: "p2",
      kind: "income",
      amount_cents: 20000,
      voided: false,
    },
    {
      identity_project_id: "p1",
      kind: "expense",
      amount_cents: 10000,
      voided: false,
      paid_on: "2026-10-18",
    },
    {
      identity_project_id: "p1",
      kind: "expense",
      amount_cents: 20000,
      voided: false,
      paid_on: null,
    },
  ] as FinanceEntry[];
  assert.deepEqual(identityBalance(project, entries), {
    received: 60001,
    costs: 10000,
    remaining: 40000,
    net: 50001,
  });
  assert.equal(
    identityBalance({ ...project, quote_status: "draft" }, []).remaining,
    null,
  );
});
test("finance validates and preserves the identity project link and category", () => {
  const fields = financeFields(
    {
      kind: "income",
      title: "دفعة هوية",
      category: "visual_identity",
      amount_cents: 50001,
      account_id: account,
      identity_project_id: account,
      due_on: "2026-10-18",
      paid_on: "2026-10-18",
    },
    "2026-10-18",
  );
  assert.equal(fields.identity_project_id, account);
  assert.equal(fields.amount_cents, 50001);
});
test("accepted identity quotes join general receivables without double-counting receipts or treating unset deadlines as overdue", () => {
  const data: FinanceData = {
    accounts: [],
    contracts: [],
    payments: [],
    as_of: "2026-10-18",
    entries: [
      {
        identity_project_id: "p1",
        kind: "income",
        amount_cents: 50001,
        paid_on: "2026-10-18",
        voided: false,
      },
    ] as FinanceEntry[],
    identity_projects: [
      {
        id: "p1",
        account_id: account,
        title: "هوية معتمدة",
        quote_status: "accepted",
        quote_fee_cents: 100001,
        status: "design",
        archived: true,
        payment_due_on: null,
      },
      {
        id: "p2",
        account_id: account,
        title: "هوية أخرى",
        quote_status: "accepted",
        quote_fee_cents: 30000,
        status: "design",
        archived: false,
        payment_due_on: "2026-10-17",
      },
      {
        id: "p3",
        account_id: account,
        title: "طلب غير معتمد",
        quote_status: "draft",
        quote_fee_cents: 90000,
        status: "proposal",
        archived: false,
        payment_due_on: null,
      },
    ],
  };
  const summary = financeSummary(data, { from: "", to: "", account_id: "" });
  assert.equal(summary.outstanding, 80000);
  assert.equal(summary.overdue, 30000);
  assert.equal(summary.income, 50001);
  assert.equal(summary.identityDues.length, 2);
});
