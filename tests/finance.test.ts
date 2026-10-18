import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cashMovements,
  financeFields,
  financeFilter,
  financeSummary,
  receivables,
  type FinanceData,
  type FinanceEntry,
} from "../lib/finance";
import type { Account, Row } from "../lib/crm/types";
import { paymentFields, resourceFields } from "../lib/crm/validation";

const account = "00000000-0000-4000-8000-000000000001";
const other = "00000000-0000-4000-8000-000000000002";
const row = (fields: object) =>
  ({
    id: "row",
    revision: 0,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    ...fields,
  }) as Row;
const entry = (fields: object) =>
  ({
    ...row({}),
    kind: "expense",
    title: "استضافة",
    category: "hosting",
    account_id: null,
    amount_cents: 12550,
    due_on: "2026-10-15",
    paid_on: "2026-10-15",
    method: "bank",
    counterparty: "",
    notes: "",
    reference: "",
    voided: false,
    void_reason: "",
    ...fields,
  }) as FinanceEntry;
function fixture(): FinanceData {
  return {
    as_of: "2026-10-18",
    accounts: [{ id: account, archived: true }] as Account[],
    contracts: [
      row({
        id: "contract",
        account_id: account,
        status: "signed",
        title: "عقد سنوي",
        starts_on: "2026-10-01",
        payment_due_on: "2026-10-20",
        annual_fee_cents: 360000,
        setup_fee_cents: 50000,
      }),
      row({
        id: "draft",
        account_id: other,
        status: "draft",
        starts_on: "2026-01-01",
        annual_fee_cents: 999999,
        setup_fee_cents: 0,
      }),
      row({
        id: "legacy",
        account_id: other,
        status: "signed",
        starts_on: "2026-10-01",
        annual_fee_cents: 10000,
        setup_fee_cents: 0,
      }),
    ],
    payments: [
      row({
        id: "payment",
        account_id: account,
        contract_id: "contract",
        amount_cents: 200000,
        paid_on: "2026-10-05",
        method: "bank",
        reference: "P1",
        notes: "",
        voided: false,
        void_reason: "",
      }),
      row({
        id: "void",
        account_id: account,
        contract_id: "contract",
        amount_cents: 50000,
        paid_on: "2026-10-06",
        voided: true,
      }),
      row({
        id: "future",
        account_id: account,
        contract_id: "contract",
        amount_cents: 10000,
        paid_on: "2026-11-01",
        voided: false,
      }),
    ],
    entries: [
      entry({ id: "expense", account_id: account }),
      entry({
        id: "pending",
        account_id: account,
        paid_on: null,
        amount_cents: 30000,
      }),
      entry({ id: "voidexpense", voided: true, amount_cents: 5000 }),
      entry({
        id: "income",
        kind: "income",
        category: "mobile",
        account_id: account,
        amount_cents: 60000,
      }),
      entry({ id: "old", paid_on: "2026-09-01", amount_cents: 10000 }),
    ],
  };
}
const filter = { from: "2026-10-01", to: "2026-10-31", account_id: "" };
test("cash summary excludes voids, future cash and unpaid expenses, without double-counting contract values", () => {
  const result = financeSummary(fixture(), filter);
  assert.equal(result.income, 260000);
  assert.equal(result.expenses, 12550);
  assert.equal(result.net, 247450);
  assert.equal(result.outstanding, 220000);
  assert.equal(result.overdue, 10000);
  assert.equal(result.payable, 30000);
  assert.equal(result.payableOverdue, 30000);
  assert.deepEqual(result.months, [
    { month: "2026-10", income: 260000, expenses: 12550, net: 247450 },
  ]);
});
test("receivables retain archived customers, ignore draft contracts and use the agreed due date with legacy fallback", () => {
  const due = receivables(fixture());
  assert.equal(due.length, 2);
  assert.equal(due[0].contract.id, "legacy");
  assert.equal(due[0].overdue, true);
  assert.equal(due[1].remaining, 210000);
  assert.equal(due[1].overdue, false);
  assert.equal(
    financeSummary(fixture(), {
      ...filter,
      from: "2025-01-01",
      to: "2025-01-02",
    }).outstanding,
    220000,
  );
});
test("account filters consistently scope cash, unpaid expenses and balances", () => {
  const result = financeSummary(fixture(), { ...filter, account_id: other });
  assert.equal(result.income, 0);
  assert.equal(result.expenses, 0);
  assert.equal(result.outstanding, 10000);
  assert.equal(result.payable, 0);
});
test("cash movements preserve void history and distinguish original contract receipts from manual entries", () => {
  const movements = cashMovements(fixture());
  assert.equal(
    movements.some((row) => row.id === "pending"),
    false,
  );
  assert.equal(
    movements.find((row) => row.id === "payment")?.source,
    "contract",
  );
  assert.equal(movements.find((row) => row.id === "void")?.voided, true);
  assert.equal(
    movements.find((row) => row.id === "income")?.category,
    "تطبيقات الجوال",
  );
});
test("entry validation accepts exact halalas and future commitments while rejecting invalid categories, zero amounts and future cash", () => {
  const input = { ...entry({}), paid_on: null, due_on: "2027-01-01" };
  assert.equal(financeFields(input, "2026-10-18").amount_cents, 12550);
  for (const change of [
    { amount_cents: 0 },
    { amount_cents: 1.5 },
    { amount_cents: "500" },
    { amount_cents: 100000000001 },
    { paid_on: "2026-10-19" },
    { due_on: "2026-02-30" },
    { kind: "expense", category: "mobile" },
    { kind: "income", category: "mobile", paid_on: null },
  ])
    assert.throws(() => financeFields({ ...input, ...change }, "2026-10-18"));
  assert.equal(
    financeFields(
      { ...input, kind: "income", category: "mobile", paid_on: "2026-10-18" },
      "2026-10-18",
    ).kind,
    "income",
  );
});
test("report filters reject reversed ranges and invalid identifiers; contract validation preserves payment deadlines", () => {
  assert.throws(() =>
    financeFilter(new URLSearchParams("from=2026-11-01&to=2026-01-01")),
  );
  assert.throws(() =>
    financeFilter(new URLSearchParams("account_id=anything")),
  );
  assert.throws(() => financeFilter(new URLSearchParams("from=2026-02-30")));
  const contract = resourceFields("contracts", {
    title: "عقد سنوي",
    starts_on: "2026-10-18",
    ends_on: "2027-10-17",
    payment_due_on: "2026-11-01",
  });
  assert.equal(
    (contract as Record<string, unknown>).payment_due_on,
    "2026-11-01",
  );
});
test("contract receipts reject future cash dates consistently with manual income", () => {
  assert.throws(() =>
    paymentFields({
      contract_id: account,
      amount_cents: 100,
      paid_on: "2100-12-31",
    }),
  );
});
