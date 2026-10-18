"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowRight,
  CheckCheck,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  accountPath,
  clientStages,
  contractBalance,
  dateLabel,
  leadStages,
  money,
  priorities,
  renewalDate,
  sources,
  todaySaudi,
  type AccountKind,
  type Profile,
  type Resource,
  type Row,
} from "@/lib/crm/types";
import {
  accountForm,
  defaults,
  labels,
  resourceForm,
  resourceNames,
  planContractDefaults,
  contractPlanChange,
} from "./crm-fields";
import {
  CrmConfirm,
  CrmEditor,
  CrmStatus,
  NoRecords,
  crmRequest,
  useCrmData,
} from "./crm-shared";

type Editor = {
  resource: Resource | "payments" | "account" | "convert" | "void";
  row: Record<string, unknown>;
};
const titleFor = (resource: string) =>
  ({
    contacts: "جهات الاتصال",
    activities: "التواصل والملاحظات",
    followups: "المتابعات والتجهيز",
    contracts: "العقود والدفعات",
    workspaces: "التشغيل والتحديثات",
    tickets: "الدعم والتطوير",
    events: "سجل النشاط",
  })[resource] ?? resource;
const label = (value: unknown) =>
  labels[String(value) as keyof typeof labels] ?? String(value ?? "—");

export function CrmProfile({ id, kind }: { id: string; kind: AccountKind }) {
  const router = useRouter(),
    state = useCrmData<Profile>(`accounts/${id}`);
  const [editor, setEditor] = useState<Editor | null>(null),
    [confirm, setConfirm] = useState<{
      title: string;
      description: string;
      run: () => Promise<void>;
    } | null>(null);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("overview");
  const data = state.data,
    acc = data?.account,
    today = todaySaudi();
  async function mutate(path: string, method: string, body: object) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await crmRequest(path, method, body);
      await state.reload();
      setNotice("تم حفظ التحديث.");
      return result;
    } finally {
      setBusy(false);
    }
  }
  function add(resource: Resource | "payments") {
    setEditor({
      resource,
      row: {
        ...defaults(resource, kind),
        ...(resource === "contracts"
          ? planContractDefaults(
              data?.plans.find(
                (plan) => plan.id === acc?.plan_id && plan.active,
              ),
            )
          : {}),
        id: crypto.randomUUID(),
        _new: true,
        ...(resource === "payments"
          ? {
              contract_id:
                data?.contracts.find((c) => c.status === "signed")?.id ?? "",
            }
          : {}),
      },
    });
  }
  function edit(resource: Resource, row: Row) {
    setEditor({ resource, row });
  }
  function remove(resource: Resource, row: Row) {
    setConfirm({
      title: `حذف ${resourceNames[resource]}؟`,
      description:
        "سيُحذف هذا السجل من ملف الإدارة، ويُسجّل الإجراء في سجل النشاط. لا ينفذ هذا الإجراء تغييرًا في نظام العميل.",
      run: async () => {
        await mutate(`entries/${resource}`, "DELETE", {
          id: row.id,
          account_id: id,
          revision: row.revision,
        });
      },
    });
  }
  const editable = Boolean(acc && !acc.archived && !busy);
  function actions(resource: Resource, row: Row) {
    return !editable ? null : (
      <div className="crm-row-actions">
        <Button variant="ghost" size="sm" onClick={() => edit(resource, row)}>
          <Pencil data-icon="inline-start" />
          تعديل
        </Button>
        {(resource !== "contracts" || row.status === "draft") && (
          <Button
            variant="destructive"
            size="sm"
            aria-label={`حذف ${resourceNames[resource]} ${String(row.title ?? row.name ?? "")}`}
            onClick={() => remove(resource, row)}
          >
            <Trash2 data-icon="inline-start" />
            حذف
          </Button>
        )}
      </div>
    );
  }
  function sectionHeader(resource: Resource | "payments", title?: string) {
    return (
      <div className="crm-section-heading">
        <div>
          <h2>{title ?? titleFor(resource)}</h2>
        </div>
        {editable && (
          <Button size="sm" onClick={() => add(resource)}>
            <Plus data-icon="inline-start" />
            إضافة {resourceNames[resource]}
          </Button>
        )}
      </div>
    );
  }
  if (!data || !acc)
    return (
      <main className="crm-page container">
        <CrmStatus
          error={state.error}
          loading={state.loading}
          reload={() => void state.reload()}
        />
        <p role="status">
          {state.loading ? "جارٍ فتح ملف المؤسسة…" : "تعذر فتح الملف."}
        </p>
      </main>
    );
  if (acc.kind !== kind)
    return (
      <main className="crm-page container">
        <NoRecords
          title="انتقل هذا الملف إلى قسم آخر"
          description="يمكنك متابعة الملف وتاريخه من قسم العملاء."
        />
        <Link className={buttonVariants({})} href={accountPath(acc)}>
          فتح الملف الحالي
        </Link>
      </main>
    );
  const stages = kind === "lead" ? leadStages : clientStages;
  const onboarding = data.followups.filter(
      (row) => row.category === "onboarding",
    ),
    done = onboarding.filter((row) => row.status === "done").length;
  const balances = data.contracts
    .filter((row) => row.status === "signed")
    .map((row) => contractBalance(row, data.payments));
  const tabs = [
    "overview",
    "contacts",
    "activities",
    "followups",
    ...(kind === "client" ? ["contracts", "workspaces", "tickets"] : []),
    "events",
  ];
  async function save(fields: Record<string, unknown>) {
    if (!editor) return;
    if (editor.resource === "account")
      await mutate("accounts", "PATCH", {
        id,
        revision: editor.row.revision,
        fields,
      });
    else if (editor.resource === "convert") {
      const result = await mutate("convert", "POST", {
        id,
        revision: editor.row._account_revision,
        contract: fields,
      });
      router.push(accountPath(result.account));
    } else if (editor.resource === "void")
      await mutate("entries/payments", "PATCH", {
        id: editor.row.id,
        account_id: id,
        revision: editor.row.revision,
        reason: fields.reason,
      });
    else
      await mutate(
        `entries/${editor.resource}`,
        editor.row._new ? "POST" : "PATCH",
        {
          id: editor.row.id,
          account_id: id,
          revision: editor.row.revision,
          fields,
        },
      );
  }
  return (
    <main className="crm-page crm-profile container">
      <Link
        href={`/board/${kind === "lead" ? "leads" : "clients"}`}
        className="crm-back"
      >
        <ArrowRight aria-hidden="true" />
        {kind === "lead" ? "كل العملاء المحتملين" : "كل العملاء"}
      </Link>
      <header className="crm-page-heading">
        <div>
          <div className="crm-heading-badges">
            <Badge variant="secondary">
              {stages[acc.stage as keyof typeof stages] ?? acc.stage}
            </Badge>
            <Badge variant="outline">{priorities[acc.priority]}</Badge>
            {acc.archived && <Badge variant="outline">مؤرشف</Badge>}
          </div>
          <h1>{acc.name}</h1>
          <p>
            {[acc.city, acc.institution_type, `${acc.branches} فرع`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="crm-actions">
          {editable && (
            <Button
              variant="outline"
              onClick={() => setEditor({ resource: "account", row: acc })}
            >
              <Pencil data-icon="inline-start" />
              تعديل الملف
            </Button>
          )}
          {kind === "lead" && editable && (
            <Button
              onClick={() =>
                setEditor({
                  resource: "convert",
                  row: {
                    ...defaults("contracts"),
                    id: crypto.randomUUID(),
                    title: "اشتراك سنوي",
                    ...planContractDefaults(
                      data.plans.find(
                        (plan) => plan.id === acc.plan_id && plan.active,
                      ),
                    ),
                    status: "signed",
                    _account_revision: acc.revision,
                  },
                })
              }
            >
              <CheckCheck data-icon="inline-start" />
              تحويل إلى عميل
            </Button>
          )}
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() =>
              setConfirm({
                title: acc.archived ? "استعادة الملف؟" : "أرشفة الملف؟",
                description: acc.archived
                  ? "سيعود الملف إلى قائمة العملاء الحالية ويمكن متابعة تعديله."
                  : "يُنقل الملف للأرشيف مع الاحتفاظ بتاريخه وعقوده ودفعاته. يمكنك استعادته لاحقًا.",
                run: async () => {
                  await mutate("accounts", "PATCH", {
                    id,
                    revision: acc.revision,
                    fields: { archived: !acc.archived },
                  });
                },
              })
            }
          >
            {acc.archived ? (
              <RotateCcw data-icon="inline-start" />
            ) : (
              <Archive data-icon="inline-start" />
            )}
            {acc.archived ? "استعادة الملف" : "أرشفة"}
          </Button>
        </div>
      </header>
      <div className="crm-profile-summary">
        <span>
          مسؤول نرفد:{" "}
          <strong>
            {data.members.find((m) => m.id === acc.owner_id)?.name ??
              "غير معيّن"}
          </strong>
        </span>
        <span>
          المتابعة: <strong>{dateLabel(acc.next_follow_up_on)}</strong>
        </span>
        {acc.next_follow_up_on && acc.next_follow_up_on < today && (
          <Badge variant="destructive">متابعة متأخرة</Badge>
        )}
        {kind === "client" && (
          <span>
            المتبقي من العقود:{" "}
            <strong>
              {money(balances.reduce((sum, b) => sum + b.remaining, 0))}
            </strong>
          </span>
        )}
      </div>
      {acc.archived && (
        <Alert>
          <AlertDescription>
            هذا الملف مؤرشف. استعده للمتابعة أو إضافة سجلات جديدة.
          </AlertDescription>
        </Alert>
      )}
      {(error || state.error) && (
        <Alert variant="destructive">
          <AlertDescription>{error || state.error}</AlertDescription>
        </Alert>
      )}
      <div className="crm-toolbar">
        <p role="status" aria-live="polite">
          {notice}
        </p>
        <CrmStatus
          error=""
          loading={state.loading || busy}
          reload={() => void state.reload()}
        />
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <TabsList className="crm-profile-tabs" aria-label="أقسام ملف المؤسسة">
          {tabs.map((key) => (
            <TabsTrigger key={key} value={key}>
              {key === "overview" ? "الملف" : titleFor(key)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview">
          <div className="crm-overview-grid">
            <Card>
              <CardHeader>
                <CardTitle>المؤسسة والتواصل الرئيسي</CardTitle>
                <CardDescription>
                  بيانات العلاقة ومسؤول التواصل لدى العميل.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="crm-details">
                  {[
                    ["جهة الاتصال", acc.contact_name],
                    [
                      kind === "lead" ? "الخطة المرشحة" : "خطة الاشتراك",
                      data.plans.find((plan) => plan.id === acc.plan_id)
                        ?.name ?? "لم تُحدد بعد",
                    ],
                    ["الدور", acc.contact_role],
                    ["مصدر التعارف", sources[acc.source]],
                    ["الجوال", acc.phone],
                    ["البريد", acc.email],
                    ["الموقع", acc.website],
                    [
                      "ميزانية سنوية تقديرية",
                      acc.annual_budget_cents == null
                        ? "—"
                        : money(acc.annual_budget_cents),
                    ],
                    ["موعد التعاقد المتوقع", dateLabel(acc.expected_close_on)],
                    ["أُنشئ الملف", dateLabel(acc.created_at)],
                    ...(acc.converted_at
                      ? [["تاريخ التحويل", dateLabel(acc.converted_at)]]
                      : []),
                  ].map(([name, value]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
                <div className="crm-actions">
                  {acc.phone && (
                    <a
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                      href={`tel:${acc.phone}`}
                    >
                      <Phone data-icon="inline-start" />
                      اتصال
                    </a>
                  )}
                  {acc.email && (
                    <a
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                      href={`mailto:${acc.email}`}
                    >
                      <Mail data-icon="inline-start" />
                      بريد
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>احتياجات المؤسسة ونطاق المتابعة</CardTitle>
                <CardDescription>
                  مرجع الفريق عند تجهيز العرض والخدمة.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="crm-long-copy">
                  {acc.needs ||
                    "أضف احتياجات المؤسسة والخدمات والفروع والتخصيصات المطلوبة من تعديل الملف."}
                </p>
                {acc.stage === "lost" && (
                  <div className="crm-callout">
                    <strong>سبب عدم الاتفاق</strong>
                    <p>{acc.lost_reason}</p>
                  </div>
                )}
                {kind === "client" && (
                  <div className="crm-callout">
                    <strong>تجهيز العميل</strong>
                    <p>
                      {onboarding.length
                        ? `${done} من ${onboarding.length} مهام مكتملة`
                        : "أضف خطوات التجهيز من المتابعات."}
                    </p>
                    <Button variant="link" onClick={() => setTab("followups")}>
                      متابعة التجهيز
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="contacts">
          {sectionHeader("contacts")}
          {!data.contacts.length && (
            <NoRecords
              title="أضف أطراف التواصل"
              description="احتفظ ببيانات المالك ومدير التشغيل والمسؤول التقني والمالي كلٌّ بدوره."
            />
          )}
          <div className="crm-card-grid">
            {data.contacts.map((row) => (
              <Card key={row.id}>
                <CardHeader>
                  <CardTitle>{String(row.name)}</CardTitle>
                  <CardDescription>
                    {String(row.role || "دون مسمى")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p dir="ltr">{String(row.phone || "")}</p>
                  <p dir="ltr">{String(row.email || "")}</p>
                  <p className="crm-long-copy">{String(row.notes || "")}</p>
                </CardContent>
                <CardFooter>{actions("contacts", row)}</CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="activities">
          {sectionHeader("activities")}
          {!data.activities.length && (
            <NoRecords
              title="سجّل أول تواصل"
              description="ملخص المكالمة أو الاجتماع أو العرض، والأسئلة وما تم الاتفاق عليه."
            />
          )}
          <div className="crm-record-list">
            {data.activities.map((row) => (
              <Card key={row.id}>
                <CardHeader>
                  <CardTitle>{String(row.title)}</CardTitle>
                  <CardDescription>
                    {label(row.channel)} · {dateLabel(row.occurred_on)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="crm-long-copy">{String(row.body)}</p>
                </CardContent>
                <CardFooter>{actions("activities", row)}</CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="followups">
          {sectionHeader("followups")}
          {!!onboarding.length && (
            <div className="crm-onboarding-progress">
              <span>
                تجهيز العميل: {done} / {onboarding.length}
              </span>
              <progress
                value={done}
                max={onboarding.length}
                aria-label="نسبة اكتمال تجهيز العميل"
              />
            </div>
          )}
          {!data.followups.length && (
            <NoRecords
              title="ما المتابعة القادمة؟"
              description="أضف مهمة بتاريخ ومسؤول واضحين، وسجل اكتمالها عند الانتهاء."
            />
          )}
          <div className="crm-record-list">
            {data.followups
              .toSorted((a, b) =>
                String(a.due_on ?? "9999").localeCompare(
                  String(b.due_on ?? "9999"),
                ),
              )
              .map((row) => (
                <Card
                  key={row.id}
                  className="crm-followup"
                  data-done={row.status === "done"}
                >
                  <CardHeader>
                    <div className="crm-followup-title">
                      <Checkbox
                        aria-label={`إكمال ${row.title}`}
                        checked={row.status === "done"}
                        disabled={!editable}
                        onCheckedChange={async (checked) => {
                          try {
                            await mutate("entries/followups", "PATCH", {
                              id: row.id,
                              account_id: id,
                              revision: row.revision,
                              fields: {
                                ...row,
                                status: checked ? "done" : "open",
                              },
                            });
                          } catch (error) {
                            setError(
                              error instanceof Error
                                ? error.message
                                : "تعذر الحفظ.",
                            );
                          }
                        }}
                      />
                      <CardTitle>{String(row.title)}</CardTitle>
                      <Badge variant="outline">{label(row.category)}</Badge>
                    </div>
                    <CardDescription>
                      {dateLabel(row.due_on)} ·{" "}
                      {data.members.find((m) => m.id === row.owner_id)?.name ??
                        "غير معيّن"}
                      {row.status !== "done" &&
                      row.due_on &&
                      String(row.due_on) < today
                        ? " · متأخرة"
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  {Boolean(row.details) && (
                    <CardContent>
                      <p className="crm-long-copy">{String(row.details)}</p>
                    </CardContent>
                  )}
                  <CardFooter>{actions("followups", row)}</CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        {kind === "client" && (
          <TabsContent value="contracts">
            {sectionHeader("contracts")}
            {!data.contracts.length && (
              <NoRecords
                title="أضف الاتفاق الفعلي"
                description="سجّل مدة العقد وقيمة الاشتراك السنوية ورسوم التجهيز والنطاق. التجديد يُسجّل كعقد جديد للحفاظ على التاريخ."
              />
            )}
            <div className="crm-card-grid">
              {data.contracts.map((row) => {
                const balance = contractBalance(row, data.payments);
                return (
                  <Card key={row.id}>
                    <CardHeader>
                      <div className="crm-heading-badges">
                        <Badge variant="secondary">{label(row.status)}</Badge>
                        {row.status === "signed" &&
                          String(row.ends_on) < today && (
                            <Badge variant="destructive">انتهت المدة</Badge>
                          )}
                      </div>
                      <CardTitle>{String(row.title)}</CardTitle>
                      <CardDescription>
                        {dateLabel(row.starts_on)} — {dateLabel(row.ends_on)}
                        {row.reference ? ` · ${row.reference}` : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <dl className="crm-details">
                        <div>
                          <dt>الباقة وقت التعاقد</dt>
                          <dd>{String(row.plan_name || "اتفاق مخصص")}</dd>
                        </div>
                        <div>
                          <dt>الاشتراك السنوي</dt>
                          <dd>{money(row.annual_fee_cents)}</dd>
                        </div>
                        <div>
                          <dt>التجهيز والتطوير</dt>
                          <dd>{money(row.setup_fee_cents)}</dd>
                        </div>
                        <div>
                          <dt>المحصّل</dt>
                          <dd>{money(balance.paid)}</dd>
                        </div>
                        <div>
                          <dt>المتبقي</dt>
                          <dd>{money(balance.remaining)}</dd>
                        </div>
                      </dl>
                      <p className="crm-long-copy">{String(row.scope)}</p>
                      {Array.isArray(row.plan_features) &&
                        row.plan_features.length > 0 && (
                          <details className="crm-plan-snapshot">
                            <summary>مميزات الباقة وقت التعاقد</summary>
                            <ul>
                              {(row.plan_features as string[]).map(
                                (feature) => (
                                  <li key={feature}>{feature}</li>
                                ),
                              )}
                            </ul>
                          </details>
                        )}
                      {Boolean(row.document_url) && (
                        <a
                          className="crm-inline-link"
                          href={String(row.document_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          مستند العقد
                          <ExternalLink aria-hidden="true" />
                        </a>
                      )}
                    </CardContent>
                    <CardFooter className="crm-actions">
                      {actions("contracts", row)}
                      {editable && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditor({
                              resource: "contracts",
                              row: {
                                ...row,
                                ...renewalDate(String(row.ends_on)),
                                ...planContractDefaults(
                                  data.plans.find(
                                    (plan) =>
                                      plan.id === row.plan_id && plan.active,
                                  ),
                                ),
                                id: crypto.randomUUID(),
                                status: "draft",
                                setup_fee_cents: 0,
                                reference: "",
                                title: `تجديد ${row.title}`,
                                _new: true,
                              },
                            })
                          }
                        >
                          <RotateCcw data-icon="inline-start" />
                          تجهيز تجديد
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            {sectionHeader("payments", "سجل الدفعات")}
            {!data.payments.length && (
              <NoRecords
                title="لم تُسجّل دفعات بعد"
                description="تُسجّل الدفعة مقابل عقد موقّع، مع تاريخ التحصيل ومرجعه. تُحسب المتبقيات من الدفعات غير الملغاة."
              />
            )}
            <div className="crm-record-list">
              {data.payments.map((row) => (
                <Card key={row.id}>
                  <CardHeader>
                    <div className="crm-heading-badges">
                      <CardTitle>{money(row.amount_cents)}</CardTitle>
                      {row.voided ? (
                        <Badge variant="destructive">أُلغي التسجيل</Badge>
                      ) : (
                        <Badge variant="secondary">مسجّلة</Badge>
                      )}
                    </div>
                    <CardDescription>
                      {
                        data.contracts.find((c) => c.id === row.contract_id)
                          ?.title as string
                      }{" "}
                      · {dateLabel(row.paid_on)} · {label(row.method)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>المرجع: {String(row.reference || "—")}</p>
                    <p className="crm-long-copy">{String(row.notes || "")}</p>
                    {Boolean(row.voided) && (
                      <p>سبب الإلغاء: {String(row.void_reason)}</p>
                    )}
                  </CardContent>
                  {editable && !row.voided && (
                    <CardFooter>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setEditor({ resource: "void", row })}
                      >
                        إلغاء تسجيل الدفعة
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
        {kind === "client" && (
          <TabsContent value="workspaces">
            {sectionHeader("workspaces")}
            <p className="crm-help">
              سجّل مراجع التشغيل والإصدار والنسخ الاحتياطي. تحفظ مفاتيح الوصول
              وكلمات المرور في مدير الأسرار المعتمد لدى الفريق.
            </p>
            {!data.workspaces.length && (
              <NoRecords
                title="أضف بيئة العميل"
                description="تابع الإنتاج والاختبار وروابط التشغيل والإصدار وحالة النسخ الاحتياطي."
              />
            )}
            <div className="crm-card-grid">
              {data.workspaces.map((row) => (
                <Card key={row.id}>
                  <CardHeader>
                    <div className="crm-heading-badges">
                      <Badge variant="secondary">{label(row.status)}</Badge>
                      <Badge variant="outline">{label(row.environment)}</Badge>
                    </div>
                    <CardTitle>بيئة {label(row.environment)}</CardTitle>
                    <CardDescription>
                      {String(
                        row.hosting_provider || "لم يُسجل مزود الاستضافة",
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="crm-details">
                      <div>
                        <dt>قاعدة البيانات</dt>
                        <dd>{String(row.database_ref || "—")}</dd>
                      </div>
                      <div>
                        <dt>الإصدار / الفرع</dt>
                        <dd>{String(row.release_ref || "—")}</dd>
                      </div>
                      <div>
                        <dt>النسخ الاحتياطي</dt>
                        <dd>{label(row.backup_status)}</dd>
                      </div>
                      <div>
                        <dt>اختبار الاستعادة</dt>
                        <dd>{dateLabel(row.backup_checked_on)}</dd>
                      </div>
                    </dl>
                    <div className="crm-actions">
                      {Boolean(row.app_url) && (
                        <a
                          className="crm-inline-link"
                          href={String(row.app_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          نظام العميل
                          <ExternalLink aria-hidden="true" />
                        </a>
                      )}
                      {Boolean(row.repository_url) && (
                        <a
                          className="crm-inline-link"
                          href={String(row.repository_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          المستودع
                          <ExternalLink aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="crm-long-copy">{String(row.notes || "")}</p>
                  </CardContent>
                  <CardFooter>{actions("workspaces", row)}</CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
        {kind === "client" && (
          <TabsContent value="tickets">
            {sectionHeader("tickets")}
            {!data.tickets.length && (
              <NoRecords
                title="الدعم والتطوير في سجل واحد"
                description="سجّل الطلب ونوعه وأولويته والمسؤول وموعد المتابعة، ثم وثّق الحل عند الإغلاق."
              />
            )}
            <div className="crm-record-list">
              {data.tickets.map((row) => (
                <Card key={row.id}>
                  <CardHeader>
                    <div className="crm-heading-badges">
                      <Badge variant="secondary">{label(row.status)}</Badge>
                      <Badge variant="outline">
                        {label(row.category)} · {label(row.priority)}
                      </Badge>
                    </div>
                    <CardTitle>{String(row.title)}</CardTitle>
                    <CardDescription>
                      {data.members.find((m) => m.id === row.owner_id)?.name ??
                        "غير معيّن"}{" "}
                      · {dateLabel(row.due_on)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="crm-long-copy">{String(row.body)}</p>
                    {Boolean(row.resolution) && (
                      <div className="crm-callout">
                        <strong>الحل أو الإجراء</strong>
                        <p className="crm-long-copy">
                          {String(row.resolution)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>{actions("tickets", row)}</CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
        <TabsContent value="events">
          <div className="crm-section-heading">
            <h2>سجل النشاط</h2>
          </div>
          <p className="crm-help">
            تواريخ إنشاء السجلات وتعديلها وأرشفتها وتحويلها، مع العضو المنفّذ.
          </p>
          <ol className="crm-timeline">
            {data.events.map((row) => (
              <li key={row.id}>
                <span aria-hidden="true" />
                <div>
                  <strong>{String(row.title)}</strong>
                  <p>{String(row.details)}</p>
                  <small>
                    {dateLabel(row.created_at)} ·{" "}
                    {data.members.find((m) => m.id === row.actor_id)?.name ??
                      "عضو الإدارة"}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        </TabsContent>
      </Tabs>
      {editor && (
        <CrmEditor
          key={`${editor.resource}-${editor.row.id}`}
          title={
            editor.resource === "convert"
              ? "تأكيد التعاقد وتحويل الملف"
              : editor.resource === "account"
                ? "تعديل ملف المؤسسة"
                : editor.resource === "void"
                  ? "إلغاء تسجيل الدفعة"
                  : `${editor.row._new ? "إضافة" : "تعديل"} ${resourceNames[editor.resource]}`
          }
          description={
            editor.resource === "convert"
              ? "أكمل بيانات الاتفاق الفعلي. ينتقل الملف بتاريخه وجهات اتصاله ومتابعاته إلى العملاء، مع العقد وقائمة التجهيز."
              : undefined
          }
          fields={
            editor.resource === "account"
              ? accountForm(kind, data.members, data.plans, acc.plan_id)
              : editor.resource === "void"
                ? [
                    {
                      key: "reason",
                      label: "سبب إلغاء تسجيل الدفعة",
                      type: "textarea",
                      required: true,
                      wide: true,
                    },
                  ]
                : resourceForm(
                    editor.resource === "convert"
                      ? "contracts"
                      : editor.resource,
                    data.members,
                    data.contracts,
                    data.plans,
                    editor.row.plan_id,
                  ).filter(
                    (f) => editor.resource !== "convert" || f.key !== "status",
                  )
          }
          initial={editor.row}
          onFieldChange={
            editor.resource === "contracts" || editor.resource === "convert"
              ? (key, value) => contractPlanChange(data.plans, key, value)
              : undefined
          }
          onClose={() => setEditor(null)}
          onSave={save}
          submitLabel={
            editor.resource === "convert" ? "تأكيد التعاقد والتحويل" : "حفظ"
          }
        />
      )}
      {confirm && (
        <CrmConfirm
          title={confirm.title}
          description={confirm.description}
          onClose={() => setConfirm(null)}
          onConfirm={confirm.run}
        />
      )}
    </main>
  );
}
