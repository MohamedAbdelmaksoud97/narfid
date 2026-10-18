"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Plus,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  accountPath,
  dateLabel,
  money,
  todaySaudi,
  type Row,
} from "@/lib/crm/types";
import {
  expenseCategories,
  incomeCategories,
  paymentMethods,
  cashMovements,
  financeSummary,
  inPeriod,
  matchesFinance,
  type FinanceData,
  type FinanceEntry,
  type CashMovement,
} from "@/lib/finance";
import {
  CrmEditor,
  CrmStatus,
  NoRecords,
  crmRequest,
  useCrmData,
} from "./crm/crm-shared";
import { resourceForm, type FieldSpec } from "./crm/crm-fields";

type Editor = {
  mode: "income" | "expense" | "payment" | "void" | "due" | "settle";
  row: Record<string, unknown>;
  source?: "contract" | "entry";
};
const root = "/api/board/finance";
const noRecords = (
  <NoRecords
    title="لا توجد سجلات بهذه الاختيارات"
    description="غيّر الفترة أو الفلاتر، أو أضف حركة مالية جديدة."
  />
);

export function FinanceDashboard() {
  const searchParams = useSearchParams();
  const state = useCrmData<FinanceData>("", root),
    data = state.data;
  const [tab, setTab] = useState("overview"),
    [busy, setBusy] = useState(false);
  const [from, setFrom] = useState(() => `${todaySaudi().slice(0, 4)}-01-01`),
    [to, setTo] = useState(todaySaudi),
    [accountId, setAccountId] = useState(searchParams.get("account_id") ?? ""),
    [search, setSearch] = useState(""),
    [recordState, setRecordState] = useState("active"),
    [expenseState, setExpenseState] = useState("all"),
    [editor, setEditor] = useState<Editor | null>(null);
  const filter = { from, to, account_id: accountId },
    invalidPeriod = Boolean(from && to && from > to);
  const summary = data ? financeSummary(data, filter) : null;
  const locked = busy || state.loading || Boolean(state.error) || invalidPeriod;
  const clientName = (id: string | null) =>
    data?.accounts.find((row) => row.id === id)?.name ?? "مصروف أو تحصيل عام";
  const clientLink = (id: string | null) => {
    const account = data?.accounts.find((row) => row.id === id);
    return account ? (
      <Link className="crm-inline-link" href={accountPath(account)}>
        {account.name}
        {account.archived ? " · مؤرشف" : ""}
      </Link>
    ) : (
      "عام"
    );
  };
  const searchable = (row: {
    title: string;
    account_id: string | null;
    reference: string;
    counterparty: string;
  }) =>
    [row.title, clientName(row.account_id), row.reference, row.counterparty]
      .join(" ")
      .includes(search.trim());
  const statusMatch = (row: { voided: boolean }) =>
    recordState === "all" || row.voided === (recordState === "voided");
  const income = data
    ? cashMovements(data).filter(
        (row) =>
          row.kind === "income" &&
          row.paid_on <= data.as_of &&
          matchesFinance(row, filter) &&
          inPeriod(row.paid_on, filter) &&
          searchable(row) &&
          statusMatch(row),
      )
    : [];
  const expenses =
    data?.entries.filter(
      (row) =>
        row.kind === "expense" &&
        matchesFinance(row, filter) &&
        inPeriod(row.paid_on || row.due_on, filter) &&
        searchable(row) &&
        statusMatch(row) &&
        (expenseState === "all" ||
          Boolean(row.paid_on) === (expenseState === "paid")),
    ) ?? [];
  const eligibleContracts =
    data?.contracts.filter(
      (row) =>
        row.status === "signed" &&
        !data.accounts.find((account) => account.id === row.account_id)
          ?.archived &&
        (!accountId || row.account_id === accountId),
    ) ?? [];
  const payableContracts = eligibleContracts.filter((row) =>
    summary?.dues.some((due) => due.contract.id === row.id),
  );

  async function mutate(
    path: string,
    method: string,
    body: object,
    api = root,
  ) {
    setBusy(true);
    try {
      await crmRequest(path, method, body, api);
      await state.reload();
    } finally {
      setBusy(false);
    }
  }
  function add(mode: "income" | "expense") {
    const today = todaySaudi();
    setEditor({
      mode,
      row: {
        id: crypto.randomUUID(),
        _new: true,
        kind: mode,
        title: "",
        category: mode === "expense" ? "hosting" : "development",
        account_id: accountId,
        due_on: today,
        paid_on: today,
        method: "bank",
      },
    });
  }
  function payment(contract?: Row) {
    const selected = contract ?? payableContracts[0];
    const due = summary?.dues.find((row) => row.contract.id === selected?.id);
    setEditor({
      mode: "payment",
      row: {
        id: crypto.randomUUID(),
        contract_id: selected?.id ?? "",
        amount_cents: due?.remaining ?? 0,
        paid_on: todaySaudi(),
        method: "bank",
      },
    });
  }
  function cancel(row: CashMovement | FinanceEntry) {
    setEditor({
      mode: "void",
      row: { ...row },
      source: row.source === "contract" ? "contract" : "entry",
    });
  }
  const report =
    tab === "dues"
      ? "receivables"
      : tab === "expenses"
        ? "expenses"
        : tab === "income"
          ? "income"
          : "cash";
  const exportParams = new URLSearchParams({
    format: "csv",
    report,
    ...filter,
  });

  let editorFields: FieldSpec[] = [],
    editorTitle = "";
  if (editor) {
    if (editor.mode === "payment") {
      editorTitle = "تسجيل دفعة عقد";
      editorFields = resourceForm(
        "payments",
        [],
        payableContracts.map((row) => ({
          ...row,
          title: `${clientName(String(row.account_id))} · ${String(row.title)} · متبقٍ ${money(summary?.dues.find((due) => due.contract.id === row.id)?.remaining)}`,
        })),
      );
    } else if (editor.mode === "void") {
      editorTitle = "إلغاء تسجيل الحركة";
      editorFields = [
        {
          key: "reason",
          label: "سبب إلغاء التسجيل",
          type: "textarea",
          required: true,
          wide: true,
        },
      ];
    } else if (editor.mode === "due") {
      editorTitle = "تعديل موعد سداد العقد";
      editorFields = [
        {
          key: "payment_due_on",
          label: "موعد سداد العقد",
          type: "date",
          required: true,
        },
      ];
    } else if (editor.mode === "settle") {
      editorTitle = "تسجيل سداد المصروف";
      editorFields = [
        { key: "paid_on", label: "تاريخ الدفع", type: "date", required: true },
        { key: "method", label: "طريقة الدفع", options: paymentMethods },
        { key: "reference", label: "مرجع التحويل أو الإيصال" },
        { key: "notes", label: "ملاحظات", type: "textarea", wide: true },
      ];
    } else {
      const expense = editor.mode === "expense";
      editorTitle = expense
        ? editor.row._new
          ? "إضافة مصروف"
          : "تعديل مصروف منتظر"
        : "تسجيل تحصيل إضافي";
      editorFields = [
        {
          key: "title",
          label: expense ? "وصف المصروف" : "وصف التحصيل",
          required: true,
        },
        {
          key: "category",
          label: "التصنيف",
          options: expense ? expenseCategories : incomeCategories,
          required: true,
        },
        {
          key: "amount_cents",
          label: "المبلغ (ر.س)",
          type: "money",
          required: true,
        },
        {
          key: "account_id",
          label: "العميل أو الفرصة المرتبطة",
          options: {
            "": "عام · غير مرتبط بعميل",
            ...Object.fromEntries(
              (data?.accounts ?? [])
                .filter(
                  (row) => !row.archived || row.id === editor.row.account_id,
                )
                .map((row) => [
                  row.id,
                  `${row.name}${row.kind === "lead" ? " · فرصة" : ""}${row.archived ? " · مؤرشف" : ""}`,
                ]),
            ),
          },
        },
        {
          key: "counterparty",
          label: expense ? "المورد أو الجهة المستفيدة" : "الجهة الدافعة",
        },
        {
          key: "due_on",
          label: "موعد الاستحقاق",
          type: "date",
          required: true,
        },
        {
          key: "paid_on",
          label: expense ? "تاريخ الدفع" : "تاريخ القبض",
          type: "date",
          required: !expense,
          hint: expense
            ? "اتركه فارغًا إذا كان المصروف بانتظار الدفع؛ سيظهر ضمن الالتزامات."
            : undefined,
        },
        { key: "method", label: "طريقة الدفع", options: paymentMethods },
        { key: "reference", label: "مرجع التحويل أو الإيصال" },
        { key: "notes", label: "ملاحظات", type: "textarea", wide: true },
      ];
    }
  }

  return (
    <main className="crm-page finance-page container">
      <header className="crm-page-heading">
        <div>
          <p className="section-kicker">نرفد · إدارة الماديات</p>
          <h1>المالية</h1>
          <p>صورة واحدة لتحصيلات العملاء، ومصاريف نرفد، وما لك وما عليك.</p>
        </div>
        <div className="crm-actions">
          <Button
            disabled={locked || !payableContracts.length}
            onClick={() => payment()}
          >
            <Plus data-icon="inline-start" />
            تسجيل دفعة عقد
          </Button>
          <Button
            variant="outline"
            disabled={locked}
            onClick={() => add("expense")}
          >
            <Plus data-icon="inline-start" />
            إضافة مصروف
          </Button>
        </div>
      </header>
      {data && !payableContracts.length && (
        <p className="crm-help">
          تسجيل دفعة يتطلب عقدًا موقّعًا له مبلغ متبقٍ. راجع{" "}
          <Link href="/board/clients" className="crm-inline-link">
            ملفات العملاء والعقود
          </Link>{" "}
          أو غيّر العميل المختار.
        </p>
      )}

      <FieldGroup className="finance-filters">
        <Field>
          <FieldLabel htmlFor="finance-from">من تاريخ</FieldLabel>
          <Input
            id="finance-from"
            type="date"
            dir="ltr"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            aria-invalid={invalidPeriod}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="finance-to">إلى تاريخ</FieldLabel>
          <Input
            id="finance-to"
            type="date"
            dir="ltr"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            aria-invalid={invalidPeriod}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="finance-account">العميل أو الفرصة</FieldLabel>
          <NativeSelect
            id="finance-account"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
          >
            <NativeSelectOption value="">
              كل العملاء والمصروفات العامة
            </NativeSelectOption>
            {data?.accounts.map((row) => (
              <NativeSelectOption key={row.id} value={row.id}>
                {row.name}
                {row.archived ? " · مؤرشف" : ""}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </FieldGroup>
      {invalidPeriod && (
        <p className="text-destructive" role="alert">
          بداية الفترة يجب أن تسبق نهايتها.
        </p>
      )}
      <div className="crm-toolbar">
        <CrmStatus
          error={state.error}
          loading={state.loading}
          reload={() => void state.reload()}
        />
        {!locked && data && (
          <a
            href={`${root}?${exportParams}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Download data-icon="inline-start" />
            تصدير التقرير CSV
          </a>
        )}
      </div>
      <p className="crm-help">
        التصدير يشمل جميع سجلات الفترة والعميل المختار، بما فيها التسجيلات
        الملغاة وحالتها.
      </p>
      {state.loading && !data && (
        <div className="crm-stats">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}
      {summary && !invalidPeriod && (
        <>
          <div className="crm-stats finance-stats" aria-label="الملخص المالي">
            {[
              {
                title: "إجمالي المقبوض",
                value: summary.income,
                icon: ArrowDownLeft,
                id: "income",
                note: "دفعات العقود والتحصيلات الإضافية في الفترة",
              },
              {
                title: "المصروفات المدفوعة",
                value: summary.expenses,
                icon: ArrowUpRight,
                id: "expenses",
                note: "المبالغ المدفوعة فعليًا في الفترة",
              },
              {
                title: "صافي الحركة",
                value: summary.net,
                icon: Wallet,
                id: "net",
                note: "المقبوض ناقص المدفوع خلال الفترة",
              },
              {
                title: "مستحقات العملاء",
                value: summary.outstanding,
                icon: ReceiptText,
                id: "outstanding",
                note: `المتبقي من العقود الموقعة كما في ${dateLabel(data!.as_of)}`,
              },
            ].map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardDescription>
                    <item.icon aria-hidden="true" />
                    {item.title}
                  </CardDescription>
                  <CardTitle data-testid={`finance-${item.id}`}>
                    {money(item.value)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="finance-note">{item.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
            <TabsList className="crm-profile-tabs" aria-label="أقسام المالية">
              <TabsTrigger value="overview">الملخص المالي</TabsTrigger>
              <TabsTrigger value="income">التحصيلات</TabsTrigger>
              <TabsTrigger value="expenses">المصروفات</TabsTrigger>
              <TabsTrigger value="dues">المستحقات</TabsTrigger>
            </TabsList>
            {(tab === "income" || tab === "expenses") && (
              <div className="finance-record-filters">
                <Input
                  aria-label="البحث في الحركات"
                  placeholder="ابحث بالوصف أو العميل أو المرجع…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <NativeSelect
                  aria-label="حالة التسجيل"
                  value={recordState}
                  onChange={(event) => setRecordState(event.target.value)}
                >
                  <NativeSelectOption value="active">
                    الحركات غير الملغاة
                  </NativeSelectOption>
                  <NativeSelectOption value="all">
                    كل الحركات
                  </NativeSelectOption>
                  <NativeSelectOption value="voided">
                    التسجيلات الملغاة
                  </NativeSelectOption>
                </NativeSelect>
                {tab === "expenses" && (
                  <NativeSelect
                    aria-label="حالة السداد"
                    value={expenseState}
                    onChange={(event) => setExpenseState(event.target.value)}
                  >
                    <NativeSelectOption value="all">
                      كل حالات السداد
                    </NativeSelectOption>
                    <NativeSelectOption value="pending">
                      بانتظار الدفع
                    </NativeSelectOption>
                    <NativeSelectOption value="paid">مدفوع</NativeSelectOption>
                  </NativeSelect>
                )}
              </div>
            )}
            <TabsContent value="overview">
              <div className="crm-overview-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>ما لك وما عليك</CardTitle>
                    <CardDescription>
                      أرصدة مفتوحة كما في {dateLabel(data!.as_of)}، مستقلة عن
                      فترة التحصيل المختارة.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="crm-details">
                      <div>
                        <dt>مستحقات العملاء المتأخرة</dt>
                        <dd>{money(summary.overdue)}</dd>
                      </div>
                      <div>
                        <dt>مصروفات بانتظار الدفع</dt>
                        <dd>{money(summary.payable)}</dd>
                      </div>
                      <div>
                        <dt>منها مصروفات متأخرة</dt>
                        <dd>{money(summary.payableOverdue)}</dd>
                      </div>
                    </dl>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTab("dues")}
                    >
                      متابعة المستحقات
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع المصروفات المدفوعة</CardTitle>
                    <CardDescription>
                      حسب التصنيف والفترة والعميل المختار.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summary.expenses ? (
                      <ul className="finance-breakdown">
                        {Object.entries(expenseCategories).map(
                          ([key, label]) => {
                            const amount = data!.entries
                              .filter(
                                (row) =>
                                  row.category === key &&
                                  summary.movements.some(
                                    (m) =>
                                      m.source === "entry" && m.id === row.id,
                                  ),
                              )
                              .reduce(
                                (sum, row) => sum + Number(row.amount_cents),
                                0,
                              );
                            return amount ? (
                              <li key={key}>
                                <div>
                                  <span>{label}</span>
                                  <strong>{money(amount)}</strong>
                                </div>
                                <progress
                                  aria-label={label}
                                  value={amount}
                                  max={summary.expenses}
                                />
                              </li>
                            ) : null;
                          },
                        )}
                      </ul>
                    ) : (
                      <p className="finance-note">
                        سجّل أول مصروف مدفوع ليظهر توزيعه هنا.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="crm-section-heading">
                <h2>الحركة الشهرية</h2>
              </div>
              {summary.months.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الشهر</TableHead>
                      <TableHead>المقبوض</TableHead>
                      <TableHead>المدفوع</TableHead>
                      <TableHead>صافي الحركة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.months.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>
                          {new Intl.DateTimeFormat("ar-SA", {
                            calendar: "gregory",
                            month: "long",
                            year: "numeric",
                            timeZone: "Asia/Riyadh",
                          }).format(new Date(`${row.month}-15T12:00:00Z`))}
                        </TableCell>
                        <TableCell>{money(row.income)}</TableCell>
                        <TableCell>{money(row.expenses)}</TableCell>
                        <TableCell>{money(row.net)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                noRecords
              )}
              <div className="crm-section-heading">
                <h2>الحركة حسب العميل</h2>
              </div>
              <p className="crm-help">
                المصروفات العامة لا تُوزّع على العملاء تلقائيًا. صافي الحركة
                يقيس المقبوض والمدفوع المسجلين في الفترة.
              </p>
              {summary.movements.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead>المقبوض</TableHead>
                      <TableHead>المدفوع المرتبط</TableHead>
                      <TableHead>صافي الحركة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ...new Set(
                        summary.movements.map((row) => row.account_id),
                      ),
                    ].map((id) => {
                      const rows = summary.movements.filter(
                          (row) => row.account_id === id,
                        ),
                        incoming = rows
                          .filter((row) => row.kind === "income")
                          .reduce((sum, row) => sum + row.amount_cents, 0),
                        outgoing = rows
                          .filter((row) => row.kind === "expense")
                          .reduce((sum, row) => sum + row.amount_cents, 0);
                      return (
                        <TableRow key={id ?? "general"}>
                          <TableCell>{clientLink(id)}</TableCell>
                          <TableCell>{money(incoming)}</TableCell>
                          <TableCell>{money(outgoing)}</TableCell>
                          <TableCell>{money(incoming - outgoing)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                noRecords
              )}
            </TabsContent>
            <TabsContent value="income">
              <div className="crm-section-heading">
                <h2>التحصيلات</h2>
                <Button
                  variant="outline"
                  disabled={locked}
                  onClick={() => add("income")}
                >
                  <Plus data-icon="inline-start" />
                  تسجيل تحصيل إضافي
                </Button>
              </div>
              <p className="crm-help">
                دفعات العقود تظهر من ملفات العملاء تلقائيًا. استخدم التحصيل
                الإضافي للخدمات خارج العقود المسجلة، لتجنب احتساب المبلغ مرتين.
                الأرقام تخص التحصيل الفعلي.
              </p>
              {income.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>العميل والوصف</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الدفع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {income.map((row) => (
                      <TableRow key={`${row.source}-${row.id}`}>
                        <TableCell>{dateLabel(row.paid_on)}</TableCell>
                        <TableCell>
                          {clientLink(row.account_id)}
                          <small>
                            {row.title} · {row.category}
                          </small>
                          {row.counterparty && (
                            <small>{row.counterparty}</small>
                          )}
                          {row.notes && <small>{row.notes}</small>}
                        </TableCell>
                        <TableCell>{money(row.amount_cents)}</TableCell>
                        <TableCell>
                          {
                            paymentMethods[
                              row.method as keyof typeof paymentMethods
                            ]
                          }
                          <small>{row.reference || "دون مرجع"}</small>
                        </TableCell>
                        <TableCell>
                          <Badge variant={row.voided ? "secondary" : "outline"}>
                            {row.voided ? "ملغي" : "مقبوض"}
                          </Badge>
                          {row.voided && <small>{row.void_reason}</small>}
                        </TableCell>
                        <TableCell>
                          {!row.voided && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={
                                locked ||
                                (row.source === "contract" &&
                                  Boolean(
                                    data!.accounts.find(
                                      (a) => a.id === row.account_id,
                                    )?.archived,
                                  ))
                              }
                              onClick={() => cancel(row)}
                            >
                              إلغاء التسجيل
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                noRecords
              )}
            </TabsContent>
            <TabsContent value="expenses">
              <div className="crm-section-heading">
                <h2>المصروفات</h2>
                <Badge variant="secondary">
                  بانتظار الدفع: {money(summary.payable)}
                </Badge>
              </div>
              <p className="crm-help">
                المصروف المدفوع يظهر بتاريخ الدفع، والمنتظر بتاريخ استحقاقه.
                لتصحيح حركة مدفوعة، ألغِ تسجيلها ثم أضف الصحيحة. إلغاء التسجيل
                لا ينفذ استردادًا بنكيًا.
              </p>
              {expenses.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف والجهة</TableHead>
                      <TableHead>العميل</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>الموعد والدفع</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses
                      .sort((a, b) =>
                        (b.paid_on || b.due_on).localeCompare(
                          a.paid_on || a.due_on,
                        ),
                      )
                      .map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            {row.title}
                            <small>
                              {
                                expenseCategories[
                                  row.category as keyof typeof expenseCategories
                                ]
                              }
                              {row.counterparty ? ` · ${row.counterparty}` : ""}
                            </small>
                            {row.notes && <small>{row.notes}</small>}
                          </TableCell>
                          <TableCell>{clientLink(row.account_id)}</TableCell>
                          <TableCell>{money(row.amount_cents)}</TableCell>
                          <TableCell>
                            {dateLabel(row.paid_on || row.due_on)}
                            <small>
                              {row.paid_on
                                ? paymentMethods[row.method]
                                : "موعد الاستحقاق"}
                              {row.reference ? ` · ${row.reference}` : ""}
                            </small>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.voided
                                  ? "secondary"
                                  : !row.paid_on && row.due_on < data!.as_of
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {row.voided
                                ? "ملغي"
                                : row.paid_on
                                  ? "مدفوع"
                                  : row.due_on < data!.as_of
                                    ? "متأخر"
                                    : "بانتظار الدفع"}
                            </Badge>
                            {row.voided && <small>{row.void_reason}</small>}
                          </TableCell>
                          <TableCell>
                            {!row.voided && (
                              <div className="crm-row-actions">
                                {!row.paid_on && (
                                  <>
                                    <Button
                                      size="sm"
                                      disabled={locked}
                                      onClick={() =>
                                        setEditor({
                                          mode: "settle",
                                          row: {
                                            ...row,
                                            paid_on: todaySaudi(),
                                          },
                                        })
                                      }
                                    >
                                      سداد
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={locked}
                                      onClick={() =>
                                        setEditor({ mode: "expense", row })
                                      }
                                    >
                                      تعديل
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={locked}
                                  onClick={() => cancel(row)}
                                >
                                  إلغاء التسجيل
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                noRecords
              )}
            </TabsContent>
            <TabsContent value="dues">
              <div className="crm-section-heading">
                <h2>مستحقات العملاء</h2>
                <Badge variant={summary.overdue ? "destructive" : "secondary"}>
                  المتأخر: {money(summary.overdue)}
                </Badge>
              </div>
              <p className="crm-help">
                تشمل المتبقي من كل العقود الموقعة، بما فيها العملاء المؤرشفون،
                كما في {dateLabel(data!.as_of)}. تعتمد على موعد سداد العقد أو
                تاريخ بدايته إن لم يُحدد موعد؛ فلتر الفترة لا يغيّر هذا الرصيد.
              </p>
              {summary.dues.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل والعقد</TableHead>
                      <TableHead>قيمة العقد</TableHead>
                      <TableHead>المحصّل</TableHead>
                      <TableHead>المتبقي</TableHead>
                      <TableHead>موعد السداد</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.dues.map((row) => {
                      const archived = data!.accounts.find(
                        (a) => a.id === row.account_id,
                      )?.archived;
                      return (
                        <TableRow key={row.contract.id}>
                          <TableCell>
                            {clientLink(row.account_id)}
                            <small>{String(row.contract.title)}</small>
                          </TableCell>
                          <TableCell>{money(row.total)}</TableCell>
                          <TableCell>{money(row.received)}</TableCell>
                          <TableCell>{money(row.remaining)}</TableCell>
                          <TableCell>
                            {dateLabel(row.due_on)}
                            <small>
                              <Badge
                                variant={
                                  row.overdue ? "destructive" : "secondary"
                                }
                              >
                                {row.overdue ? "متأخر" : "مستحق"}
                              </Badge>
                            </small>
                          </TableCell>
                          <TableCell>
                            <div className="crm-row-actions">
                              <Button
                                size="sm"
                                disabled={locked || archived}
                                onClick={() => payment(row.contract)}
                              >
                                تسجيل دفعة
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={locked || archived}
                                onClick={() =>
                                  setEditor({
                                    mode: "due",
                                    row: {
                                      ...row.contract,
                                      payment_due_on: row.due_on,
                                    },
                                  })
                                }
                              >
                                تعديل الموعد
                              </Button>
                            </div>
                            {archived && (
                              <small>
                                استعد ملف العميل قبل تسجيل دفعة أو تعديل الموعد.
                              </small>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                noRecords
              )}
            </TabsContent>
          </Tabs>
          <p className="finance-footnote">
            كل المبالغ بالريال السعودي. الملخص مبني على السجلات المدخلة؛ صافي
            الحركة ليس رصيد الحساب البنكي أو الربح المحاسبي. سجلات القبض والصرف
            لا تصدر فواتير ضريبية.
          </p>
        </>
      )}
      {!state.loading && !data && (
        <NoRecords
          title="تعذر تحميل المالية"
          description="حدّث البيانات لإعادة المحاولة."
        />
      )}
      {editor && (
        <CrmEditor
          key={`${editor.mode}-${editor.row.id}`}
          title={editorTitle}
          fields={editorFields}
          initial={editor.row}
          description={
            editor.mode === "void"
              ? "يُستبعد التسجيل من الإجماليات، ويظل محفوظًا مع سبب الإلغاء. هذا تصحيح للسجل ولا يُجري تحويلًا أو استردادًا ماليًا."
              : editor.mode === "income"
                ? "سجّل تحصيلًا فعليًا خارج العقود الموجودة. دفعات العقود تُسجل من زر تسجيل دفعة عقد."
                : "تُحفظ الحركة في مالية نرفد وتظهر لأعضاء مجلس الإدارة المخوّلين."
          }
          onClose={() => setEditor(null)}
          onFieldChange={
            editor.mode === "payment"
              ? (key, value): Record<string, string> =>
                  key === "contract_id"
                    ? {
                        amount_cents: String(
                          (summary?.dues.find(
                            (row) => row.contract.id === value,
                          )?.remaining ?? 0) / 100,
                        ),
                      }
                    : {}
              : undefined
          }
          onSave={async (fields) => {
            if (editor.mode === "payment") {
              const contract = data!.contracts.find(
                (row) => row.id === fields.contract_id,
              );
              await mutate(
                "entries/payments",
                "POST",
                { id: editor.row.id, account_id: contract?.account_id, fields },
                "/api/board/crm",
              );
            } else if (editor.mode === "due") {
              await mutate(
                "entries/contracts",
                "PATCH",
                {
                  id: editor.row.id,
                  account_id: editor.row.account_id,
                  revision: editor.row.revision,
                  fields,
                },
                "/api/board/crm",
              );
            } else if (editor.mode === "void" && editor.source === "contract") {
              await mutate(
                "entries/payments",
                "PATCH",
                {
                  id: editor.row.id,
                  account_id: editor.row.account_id,
                  revision: editor.row.revision,
                  reason: fields.reason,
                },
                "/api/board/crm",
              );
            } else {
              await mutate("", editor.row._new ? "POST" : "PATCH", {
                id: editor.row.id,
                revision: editor.row.revision,
                action: editor.mode === "void" ? "void" : "save",
                reason: fields.reason,
                fields,
              });
            }
          }}
        />
      )}
    </main>
  );
}
