"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Download, ExternalLink, Plus, Pencil } from "lucide-react";
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
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { accountPath, money, todaySaudi, dateLabel } from "@/lib/crm/types";
import { expenseCategories, paymentMethods } from "@/lib/finance";
import {
  identityBalance,
  identityStages,
  identityTypes,
  quoteStatuses,
  deliverableStatuses,
  type IdentityData,
  type IdentityProject,
} from "@/lib/identity-projects";
import { identityOffers } from "@/lib/identity-service";
import {
  CrmEditor,
  CrmConfirm,
  CrmStatus,
  NoRecords,
  useCrmData,
  crmRequest,
} from "./crm/crm-shared";
import type { FieldSpec } from "./crm/crm-fields";

type Edit = {
  mode: "project" | "quote" | "deliverable" | "income" | "expense" | "void";
  row: Record<string, unknown>;
};
const api = "/api/board/identity-projects";
const deliverableFields: FieldSpec[] = [
  { key: "title", label: "اسم التسليم", required: true },
  { key: "status", label: "حالة التسليم", options: deliverableStatuses },
  { key: "due_on", label: "موعد التسليم", type: "date" },
  {
    key: "revision_round",
    label: "جولة التعديل الحالية",
    type: "number",
    min: 0,
    hint: "٠ للمقترح الأول؛ لا تتجاوز العدد المتفق عليه في العرض.",
  },
  {
    key: "asset_url",
    label: "رابط ملفات التسليم",
    type: "url",
    wide: true,
    hint: "رابط HTTPS لمساحة ملفات بصلاحيات مناسبة للعميل.",
  },
  { key: "approved_on", label: "تاريخ اعتماد العميل", type: "date" },
  {
    key: "approval_note",
    label: "توثيق اعتماد العميل",
    type: "textarea",
    wide: true,
    hint: "من اعتمد؟ وبأي قناة أو مرجع؟ التسجيل هنا لا يرسل طلب اعتماد للعميل.",
  },
  {
    key: "notes",
    label: "ملاحظات وملاحظات المراجعة",
    type: "textarea",
    wide: true,
  },
];

export function IdentityProjects({
  id,
  initialAccountId = "",
}: {
  id?: string;
  initialAccountId?: string;
}) {
  const router = useRouter(),
    state = useCrmData<IdentityData>("", api),
    data = state.data;
  const [search, setSearch] = useState(""),
    [stage, setStage] = useState("all"),
    [archived, setArchived] = useState("active"),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("overview");
  const [accountFilter, setAccountFilter] = useState(initialAccountId);
  const [editor, setEditor] = useState<Edit | null>(null),
    [confirm, setConfirm] = useState<{
      title: string;
      description: string;
      run: () => Promise<void>;
    } | null>(null);
  const project = data?.projects.find((row) => row.id === id),
    account = data?.accounts.find((row) => row.id === project?.account_id);
  const locked = busy || state.loading || Boolean(state.error),
    editable = !locked && !project?.archived && !account?.archived;
  const projects = data?.projects ?? [],
    entries = data?.entries ?? [],
    deliveries =
      data?.deliverables.filter((row) => row.project_id === id) ?? [],
    balance = project ? identityBalance(project, entries) : null;
  const financials = entries.filter((row) => row.identity_project_id === id);
  const name = (accountId: string) =>
    data?.accounts.find((row) => row.id === accountId)?.name ?? "—";
  const visible = projects.filter(
    (row) =>
      (!accountFilter || row.account_id === accountFilter) &&
      (stage === "all" || row.status === stage) &&
      (archived === "all" || row.archived === (archived === "archived")) &&
      [row.title, name(row.account_id), row.designer]
        .join(" ")
        .includes(search.trim()),
  );
  async function change(body: object, method = "PATCH", root = api) {
    setBusy(true);
    try {
      const result = await crmRequest("", method, body, root);
      await state.reload();
      return result;
    } finally {
      setBusy(false);
    }
  }
  function create() {
    setEditor({
      mode: "project",
      row: {
        id: crypto.randomUUID(),
        _new: true,
        title: "",
        account_id: accountFilter,
        service_type: "refresh",
        status: "inquiry",
        revision_limit: 2,
        scope: identityOffers[0].deliverables.join("\n"),
      },
    });
  }
  function finance(kind: "income" | "expense") {
    setEditor({
      mode: kind,
      row: {
        id: crypto.randomUUID(),
        _new: true,
        kind,
        account_id: project!.account_id,
        identity_project_id: project!.id,
        title: `${kind === "income" ? "دفعة" : "تكلفة"} · ${project!.title}`,
        category: kind === "income" ? "visual_identity" : "people",
        due_on: todaySaudi(),
        paid_on: todaySaudi(),
        method: "bank",
        amount_cents: kind === "income" ? balance?.remaining : undefined,
      },
    });
  }
  let fields: FieldSpec[] = [],
    title = "";
  if (editor) {
    if (editor.mode === "project") {
      title = editor.row._new ? "إضافة مشروع هوية" : "تعديل مشروع الهوية";
      fields = [
        { key: "title", label: "اسم المشروع", required: true },
        {
          key: "account_id",
          label: "المؤسسة المرتبطة",
          required: true,
          options: Object.fromEntries(
            (data?.accounts ?? [])
              .filter((a) =>
                editor.row._new ? !a.archived : a.id === editor.row.account_id,
              )
              .map((a) => [
                a.id,
                `${a.name}${a.kind === "lead" ? " · عميل محتمل" : ""}`,
              ]),
          ),
          hint: "يمكن ربط الخدمة بعميل محتمل دون اشتراط اشتراك المنصة.",
        },
        ...(editor.row.quote_status === "accepted"
          ? []
          : [
              {
                key: "service_type",
                label: "نوع الخدمة",
                options: identityTypes,
              } as FieldSpec,
            ]),
        { key: "status", label: "مرحلة المشروع", options: identityStages },
        {
          key: "owner_id",
          label: "مسؤول المشروع في نرفد",
          options: {
            "": "غير معيّن",
            ...Object.fromEntries(
              (data?.members ?? []).map((m) => [m.id, m.name]),
            ),
          },
        },
        { key: "designer", label: "المصمم أو شريك التنفيذ" },
        { key: "due_on", label: "موعد التسليم المستهدف", type: "date" },
        {
          key: "payment_due_on",
          label: "موعد سداد قيمة المشروع",
          type: "date",
          hint: "موعد السداد المتفق عليه؛ يختلف عن موعد تسليم التصميم ويظهر في المالية.",
        },
        {
          key: "brief",
          label: "موجز الاحتياج والأهداف",
          type: "textarea",
          wide: true,
        },
        {
          key: "audience",
          label: "الجمهور والشخصية والمرجعيات",
          type: "textarea",
          wide: true,
        },
        {
          key: "handover_url",
          label: "رابط حزمة التسليم النهائي",
          type: "url",
          wide: true,
        },
        { key: "notes", label: "ملاحظات داخلية", type: "textarea", wide: true },
      ];
    } else if (editor.mode === "quote") {
      title = "عرض سعر الهوية واعتماده";
      fields = [
        {
          key: "quote_fee_cents",
          label: "قيمة المشروع (ر.س)",
          type: "money",
          nullable: true,
        },
        {
          key: "quote_status",
          label: "حالة عرض السعر",
          options: quoteStatuses,
        },
        {
          key: "revision_limit",
          label: "جولات التعديل المتفق عليها",
          type: "number",
          min: 0,
          required: true,
        },
        { key: "quote_reference", label: "مرجع عرض السعر أو رابطه" },
        {
          key: "scope",
          label: "النطاق والتسليمات وشروط الدفع",
          type: "textarea",
          wide: true,
          hint: "حدّد عدد الاتجاهات والتطبيقات والصيغ وحقوق الاستخدام وشروط الدفع ضمن العرض.",
        },
        {
          key: "exclusions",
          label: "ما لا يشمله العرض",
          type: "textarea",
          wide: true,
        },
        { key: "accepted_on", label: "تاريخ اعتماد العرض", type: "date" },
        {
          key: "acceptance_note",
          label: "توثيق موافقة العميل",
          type: "textarea",
          wide: true,
          hint: "مطلوب عند الاعتماد: اسم المعتمد وقناة أو مرجع موافقته. الاعتماد توثيق داخلي لاتفاق فعلي.",
        },
      ];
    } else if (editor.mode === "deliverable") {
      title = editor.row._new ? "إضافة تسليم" : "تعديل التسليم واعتماده";
      fields = deliverableFields;
    } else if (editor.mode === "void") {
      title = "إلغاء تسجيل الحركة المالية";
      fields = [
        {
          key: "reason",
          label: "سبب إلغاء التسجيل",
          type: "textarea",
          required: true,
          wide: true,
        },
      ];
    } else {
      const income = editor.mode === "income";
      title = income ? "تسجيل دفعة مشروع الهوية" : "تسجيل تكلفة للمشروع";
      fields = [
        { key: "title", label: "وصف الحركة", required: true },
        ...(!income
          ? [
              {
                key: "category",
                label: "تصنيف المصروف",
                options: expenseCategories,
              } as FieldSpec,
            ]
          : []),
        {
          key: "amount_cents",
          label: "المبلغ (ر.س)",
          type: "money",
          required: true,
        },
        {
          key: "counterparty",
          label: income ? "الجهة الدافعة" : "المورد أو المصمم",
        },
        {
          key: "due_on",
          label: "موعد الاستحقاق",
          type: "date",
          required: true,
        },
        {
          key: "paid_on",
          label: income ? "تاريخ القبض" : "تاريخ الدفع",
          type: "date",
          required: income,
          hint: income
            ? undefined
            : "اتركه فارغًا للتكلفة المنتظرة؛ تسددها لاحقًا من المالية.",
        },
        { key: "method", label: "طريقة الدفع", options: paymentMethods },
        { key: "reference", label: "مرجع التحويل أو الإيصال" },
        { key: "notes", label: "ملاحظات الحركة", type: "textarea", wide: true },
      ];
    }
  }
  const statusBadge = (row: IdentityProject) => (
    <Badge variant={row.status === "cancelled" ? "secondary" : "outline"}>
      {identityStages[row.status]}
    </Badge>
  );
  return (
    <main className="crm-page container identity-admin">
      {id && (
        <Link href="/board/identity-projects" className="crm-back">
          <ArrowRight aria-hidden="true" />
          كل مشروعات الهوية
        </Link>
      )}
      <header className="crm-page-heading">
        <div>
          <p className="section-kicker">خدمات نرفد · الهوية البصرية</p>
          <h1>{id ? (project?.title ?? "مشروع الهوية") : "مشروعات الهوية"}</h1>
          <p>
            {id
              ? "من فهم الاحتياج إلى الاعتماد والتسليم والتحصيل."
              : "إدارة طلبات تأسيس وتطوير هويات المؤسسات، بعروض مستقلة عن اشتراكات المنصة."}
          </p>
        </div>
        <div className="crm-actions">
          {!id && (
            <Button
              disabled={locked || !data?.accounts.some((a) => !a.archived)}
              onClick={create}
            >
              <Plus data-icon="inline-start" />
              إضافة مشروع هوية
            </Button>
          )}
          {project && (
            <>
              <Button
                variant="outline"
                disabled={!editable}
                onClick={() => setEditor({ mode: "project", row: project })}
              >
                <Pencil data-icon="inline-start" />
                تعديل المشروع
              </Button>
              <Button
                variant="ghost"
                disabled={locked || account?.archived}
                onClick={() =>
                  setConfirm({
                    title: project.archived
                      ? "استعادة المشروع؟"
                      : "أرشفة المشروع؟",
                    description:
                      "يحتفظ المشروع بعرضه وتسليماته وحركاته المالية في الأرشيف.",
                    run: async () => {
                      await change({
                        id,
                        revision: project.revision,
                        fields: { archived: !project.archived },
                      });
                    },
                  })
                }
              >
                {project.archived ? "استعادة المشروع" : "أرشفة المشروع"}
              </Button>
            </>
          )}
        </div>
      </header>
      <div className="crm-toolbar">
        <CrmStatus
          error={state.error}
          loading={state.loading}
          reload={() => void state.reload()}
        />
        <Link href="/visual-identity" className="crm-inline-link">
          صفحة الخدمة على الموقع
          <ExternalLink aria-hidden="true" />
        </Link>
      </div>
      {state.loading && !data && <p role="status">جارٍ تحميل المشروعات…</p>}
      {data && !id && (
        <>
          {!data.accounts.some((a) => !a.archived) && (
            <Alert>
              <AlertDescription>
                أضف المؤسسة أولًا في{" "}
                <Link href="/board/leads">العملاء المحتملين</Link> أو{" "}
                <Link href="/board/clients">العملاء</Link>، ثم أنشئ مشروعها هنا.
              </AlertDescription>
            </Alert>
          )}
          <div className="crm-stats">
            {[
              [
                "مشروعات جارية",
                projects.filter(
                  (p) =>
                    !p.archived &&
                    !["completed", "cancelled"].includes(p.status),
                ).length,
              ],
              [
                "عروض بانتظار الرد",
                projects.filter((p) => !p.archived && p.quote_status === "sent")
                  .length,
              ],
              [
                "تسليمات متأخرة",
                projects.filter(
                  (p) =>
                    !p.archived &&
                    !["completed", "cancelled"].includes(p.status) &&
                    p.due_on &&
                    p.due_on < todaySaudi(),
                ).length,
              ],
              [
                "مشروعات مكتملة",
                projects.filter((p) => !p.archived && p.status === "completed")
                  .length,
              ],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardHeader>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle>{value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="crm-toolbar">
            <Input
              className="crm-plan-search"
              aria-label="البحث في مشروعات الهوية"
              placeholder="ابحث بالمشروع أو المؤسسة أو المصمم…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <NativeSelect
              aria-label="تصفية المؤسسة"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
            >
              <NativeSelectOption value="">كل المؤسسات</NativeSelectOption>
              {data.accounts.map((a) => (
                <NativeSelectOption key={a.id} value={a.id}>
                  {a.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="مرحلة المشروع"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <NativeSelectOption value="all">كل المراحل</NativeSelectOption>
              {Object.entries(identityStages).map(([value, label]) => (
                <NativeSelectOption key={value} value={value}>
                  {label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="أرشيف المشروعات"
              value={archived}
              onChange={(e) => setArchived(e.target.value)}
            >
              <NativeSelectOption value="active">
                غير المؤرشفة
              </NativeSelectOption>
              <NativeSelectOption value="archived">المؤرشفة</NativeSelectOption>
              <NativeSelectOption value="all">الكل</NativeSelectOption>
            </NativeSelect>
            <a
              href={`${api}?format=csv`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Download data-icon="inline-start" />
              تصدير كل المشروعات
            </a>
          </div>
          {visible.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المشروع والمؤسسة</TableHead>
                  <TableHead>الخدمة والمرحلة</TableHead>
                  <TableHead>المسؤول والتسليم</TableHead>
                  <TableHead>عرض السعر</TableHead>
                  <TableHead>المحصّل والمتبقي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((p) => {
                  const amount = identityBalance(p, entries);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link
                          className="crm-account-link"
                          href={`/board/identity-projects/${p.id}`}
                        >
                          {p.title}
                        </Link>
                        <small>
                          {name(p.account_id)}
                          {p.archived ? " · مؤرشف" : ""}
                        </small>
                      </TableCell>
                      <TableCell>
                        {identityTypes[p.service_type]}
                        <small>{statusBadge(p)}</small>
                      </TableCell>
                      <TableCell>
                        {data.members.find((m) => m.id === p.owner_id)?.name ??
                          "غير معيّن"}
                        <small
                          className={
                            p.due_on &&
                            p.due_on < todaySaudi() &&
                            !["completed", "cancelled"].includes(p.status)
                              ? "crm-overdue"
                              : undefined
                          }
                        >
                          {dateLabel(p.due_on)}
                        </small>
                      </TableCell>
                      <TableCell>
                        {p.quote_fee_cents == null
                          ? "لم يُسعّر"
                          : money(p.quote_fee_cents)}
                        <small>{quoteStatuses[p.quote_status]}</small>
                      </TableCell>
                      <TableCell>
                        {money(amount.received)}
                        <small>
                          المتبقي:{" "}
                          {amount.remaining == null
                            ? "بعد اعتماد العرض"
                            : money(amount.remaining)}
                        </small>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <NoRecords
              title="لا توجد مشروعات بهذه الاختيارات"
              description="أضف مشروعًا لمؤسسة مسجلة أو غيّر الفلاتر."
            />
          )}
        </>
      )}
      {data && id && !project && (
        <NoRecords
          title="المشروع غير موجود"
          description="ارجع لقائمة المشروعات أو حدّث البيانات."
        />
      )}
      {project && data && balance && (
        <>
          {(project.archived || account?.archived) && (
            <Alert>
              <AlertDescription>
                المشروع أو ملف المؤسسة مؤرشف. استعده قبل متابعة التعديلات.
              </AlertDescription>
            </Alert>
          )}
          <div className="crm-profile-summary">
            {statusBadge(project)}
            <span>{identityTypes[project.service_type]}</span>
            {account && (
              <Link href={accountPath(account)} className="crm-inline-link">
                {account.name}
              </Link>
            )}
            <span>
              المسؤول:{" "}
              <strong>
                {data.members.find((m) => m.id === project.owner_id)?.name ??
                  "غير معيّن"}
              </strong>
            </span>
            <span>
              التسليم: <strong>{dateLabel(project.due_on)}</strong>
            </span>
          </div>
          <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
            <TabsList
              className="crm-profile-tabs"
              aria-label="أقسام مشروع الهوية"
            >
              <TabsTrigger value="overview">الموجز والمتابعة</TabsTrigger>
              <TabsTrigger value="quote">عرض السعر</TabsTrigger>
              <TabsTrigger value="deliverables">
                التسليمات والاعتمادات
              </TabsTrigger>
              <TabsTrigger value="finance">مالية المشروع</TabsTrigger>
              <TabsTrigger value="history">سجل النشاط</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="crm-overview-grid">
                <Card>
                  <CardHeader>
                    <CardTitle>موجز المؤسسة</CardTitle>
                    <CardDescription>
                      ماذا نريد أن تحقق الهوية، ولمن نتحدث؟
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="crm-long-copy">
                      {project.brief ||
                        "سجّل الأهداف واحتياج المؤسسة من تعديل المشروع."}
                    </p>
                    <h3 className="identity-admin-subtitle">
                      الجمهور والشخصية
                    </h3>
                    <p className="crm-long-copy">
                      {project.audience || "لم يُسجّل بعد."}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>متابعة التنفيذ</CardTitle>
                    <CardDescription>
                      {deliveries.filter((d) => d.status === "approved").length}{" "}
                      من {deliveries.length} تسليمات معتمدة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="crm-details">
                      <div>
                        <dt>المصمم أو الشريك</dt>
                        <dd>{project.designer || "غير محدد"}</dd>
                      </div>
                      <div>
                        <dt>جولات التعديل المتفق عليها</dt>
                        <dd>{project.revision_limit}</dd>
                      </div>
                      <div>
                        <dt>حالة العرض</dt>
                        <dd>{quoteStatuses[project.quote_status]}</dd>
                      </div>
                    </dl>
                    <p className="crm-long-copy">
                      {project.notes || "لا توجد ملاحظات داخلية."}
                    </p>
                    {project.handover_url && (
                      <a
                        className="crm-inline-link"
                        href={project.handover_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        حزمة التسليم النهائي
                        <ExternalLink aria-hidden="true" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="quote">
              <div className="crm-section-heading">
                <h2>عرض السعر المستقل</h2>
                <Button
                  variant="outline"
                  disabled={!editable || project.quote_status === "accepted"}
                  onClick={() => setEditor({ mode: "quote", row: project })}
                >
                  إعداد العرض وتوثيق اعتماده
                </Button>
              </div>
              <p className="crm-help">
                هذه تكلفة مشروع الهوية منفصلة عن اشتراك المنصة. الاعتماد هنا
                تسجيل لاتفاق العميل خارج النظام؛ لا يُرسل العرض تلقائيًا.
              </p>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {project.quote_fee_cents == null
                      ? "لم تُحدّد قيمة العرض"
                      : money(project.quote_fee_cents)}
                  </CardTitle>
                  <CardDescription>
                    {quoteStatuses[project.quote_status]}
                    {project.quote_reference
                      ? ` · ${project.quote_reference}`
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3>النطاق والتسليمات وشروط الدفع</h3>
                  <p className="crm-long-copy">
                    {project.scope || "لم يُحدّد النطاق بعد."}
                  </p>
                  <h3 className="identity-admin-subtitle">ما لا يشمله العرض</h3>
                  <p className="crm-long-copy">
                    {project.exclusions || "لم يُسجّل."}
                  </p>
                  <p className="crm-callout">
                    جولات التعديل: {project.revision_limit}
                    {project.accepted_on
                      ? ` · الاعتماد: ${dateLabel(project.accepted_on)}`
                      : ""}
                  </p>
                  {project.acceptance_note && (
                    <p className="crm-long-copy">{project.acceptance_note}</p>
                  )}
                  {project.quote_status === "accepted" && (
                    <p className="crm-help">
                      قيمة العرض ونطاقه محفوظان بعد الاعتماد. أي توسعة تُسجّل في
                      مشروع أو اتفاق جديد.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="deliverables">
              <div className="crm-section-heading">
                <h2>التسليمات والاعتمادات</h2>
                <Button
                  disabled={
                    !editable ||
                    ["completed", "cancelled"].includes(project.status)
                  }
                  onClick={() =>
                    setEditor({
                      mode: "deliverable",
                      row: {
                        id: crypto.randomUUID(),
                        _new: true,
                        status: "planned",
                        revision_round: 0,
                      },
                    })
                  }
                >
                  <Plus data-icon="inline-start" />
                  إضافة تسليم
                </Button>
              </div>
              <p className="crm-help">
                القائمة الأولية مقترحة حسب الخدمة؛ راجعها ضمن النطاق. لتوثيق
                اعتماد تسليم أضف رابط ملفاته وتاريخ ومرجع موافقة العميل. التسليم
                المعتمد يبقى محفوظًا.
              </p>
              <div className="crm-card-grid">
                {deliveries.map((row) => (
                  <Card key={row.id}>
                    <CardHeader>
                      <CardTitle>{row.title}</CardTitle>
                      <CardDescription>
                        {deliverableStatuses[row.status]} ·{" "}
                        {dateLabel(row.due_on)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="crm-help">
                        جولة التعديل: {row.revision_round} /{" "}
                        {project.revision_limit}
                      </p>
                      {row.notes && (
                        <p className="crm-long-copy">{row.notes}</p>
                      )}
                      {row.asset_url && (
                        <a
                          className="crm-inline-link"
                          href={row.asset_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          عرض الملفات
                          <ExternalLink aria-hidden="true" />
                        </a>
                      )}
                      {row.approval_note && (
                        <p className="crm-callout">
                          اعتماد {dateLabel(row.approved_on)}:{" "}
                          {row.approval_note}
                        </p>
                      )}
                      {row.status !== "approved" && (
                        <div className="crm-row-actions">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              !editable ||
                              ["completed", "cancelled"].includes(
                                project.status,
                              )
                            }
                            onClick={() =>
                              setEditor({ mode: "deliverable", row })
                            }
                          >
                            تعديل واعتماد
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={
                              !editable ||
                              ["completed", "cancelled"].includes(
                                project.status,
                              )
                            }
                            onClick={() =>
                              setConfirm({
                                title: "حذف هذا التسليم؟",
                                description:
                                  "يُحذف التسليم غير المعتمد ويظل الإجراء في سجل النشاط.",
                                run: async () => {
                                  await change(
                                    {
                                      resource: "deliverables",
                                      id: row.id,
                                      revision: row.revision,
                                    },
                                    "DELETE",
                                  );
                                },
                              })
                            }
                          >
                            حذف التسليم
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              {!deliveries.length && (
                <NoRecords
                  title="لا توجد تسليمات"
                  description="أضف التسليمات المتفق عليها في العرض."
                />
              )}
            </TabsContent>
            <TabsContent value="finance">
              <div className="crm-stats">
                {[
                  [
                    "قيمة العرض",
                    project.quote_fee_cents == null
                      ? "لم يُسعّر"
                      : money(project.quote_fee_cents),
                  ],
                  ["المحصّل", money(balance.received)],
                  [
                    "المتبقي",
                    balance.remaining == null
                      ? "بانتظار الاعتماد"
                      : money(balance.remaining),
                  ],
                  ["التكلفة المدفوعة", money(balance.costs)],
                ].map(([label, value]) => (
                  <Card key={label}>
                    <CardHeader>
                      <CardDescription>{label}</CardDescription>
                      <CardTitle>{value}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="crm-section-heading">
                <h2>حركات المشروع</h2>
                <div className="crm-actions">
                  <Button
                    disabled={
                      !editable ||
                      project.status === "cancelled" ||
                      !balance.remaining
                    }
                    onClick={() => finance("income")}
                  >
                    تسجيل دفعة للمشروع
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!editable}
                    onClick={() => finance("expense")}
                  >
                    تسجيل تكلفة
                  </Button>
                  <Link
                    href={`/board/finance?account_id=${project.account_id}`}
                    className="crm-inline-link"
                  >
                    فتح المالية
                  </Link>
                </div>
              </div>
              <p className="crm-help">
                هذه السجلات نفسها تظهر في المالية العامة. إلغاء التسجيل تصحيح
                للسجل ولا يجري استردادًا بنكيًا. المصروف المنتظر يُسدد من
                المالية.
              </p>
              {financials.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الحركة</TableHead>
                      <TableHead>المبلغ</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financials.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          {row.title}
                          <small>
                            {row.kind === "income" ? "قبض" : "مصروف"} ·{" "}
                            {row.reference || "دون مرجع"}
                          </small>
                        </TableCell>
                        <TableCell>{money(row.amount_cents)}</TableCell>
                        <TableCell>
                          {dateLabel(row.paid_on || row.due_on)}
                        </TableCell>
                        <TableCell>
                          {row.voided
                            ? "ملغي"
                            : row.paid_on
                              ? "مسجل"
                              : "بانتظار الدفع"}
                          {row.voided && <small>{row.void_reason}</small>}
                        </TableCell>
                        <TableCell>
                          {!row.voided && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!editable}
                              onClick={() => setEditor({ mode: "void", row })}
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
                <NoRecords
                  title="لا توجد حركات مالية للمشروع"
                  description="تُسجّل دفعات المشروع بعد اعتماد العرض، والتكاليف عند تحديدها."
                />
              )}
            </TabsContent>
            <TabsContent value="history">
              <h2 className="identity-admin-subtitle">سجل نشاط المشروع</h2>
              <ol className="crm-timeline">
                {data.events
                  .filter((row) => row.project_id === id)
                  .map((row) => (
                    <li key={row.id}>
                      <span />
                      <div>
                        <strong>{String(row.title)}</strong>
                        <p>{String(row.details)}</p>
                        <small>{dateLabel(row.created_at)}</small>
                      </div>
                    </li>
                  ))}
              </ol>
            </TabsContent>
          </Tabs>
        </>
      )}
      {editor && (
        <CrmEditor
          key={`${editor.mode}-${editor.row.id}`}
          title={title}
          fields={fields}
          initial={editor.row}
          description={
            editor.mode === "project" && editor.row._new
              ? "اربط المشروع بمؤسسة مسجلة. تُضاف قائمة تسليمات أولية قابلة للتعديل؛ السعر والنطاق يعتمدان بشكل مستقل عن اشتراك المنصة."
              : editor.mode === "void"
                ? "يظل أصل الحركة محفوظًا مع سبب الإلغاء ويُستبعد من الحسابات."
                : "وثّق الاتفاقات والموافقات الفعلية. لا تُرسل إشعارات أو ملفات للعميل من هذه الشاشة."
          }
          onClose={() => setEditor(null)}
          onFieldChange={
            editor.mode === "project"
              ? (key, value): Record<string, string> =>
                  key === "service_type"
                    ? {
                        scope:
                          identityOffers
                            .find((offer) => offer.key === value)
                            ?.deliverables.join("\n") ?? "",
                      }
                    : {}
              : undefined
          }
          onSave={async (fields) => {
            if (["income", "expense", "void"].includes(editor.mode)) {
              await change(
                {
                  id: editor.row.id,
                  revision: editor.row.revision,
                  action: editor.mode === "void" ? "void" : "save",
                  reason: fields.reason,
                  fields,
                },
                editor.mode === "void" ? "PATCH" : "POST",
                "/api/board/finance",
              );
            } else {
              const result = await change(
                {
                  resource:
                    editor.mode === "deliverable" ? "deliverables" : "projects",
                  id: editor.row.id,
                  project_id: id,
                  revision: editor.row.revision,
                  fields,
                },
                editor.row._new ? "POST" : "PATCH",
              );
              if (editor.mode === "project" && editor.row._new)
                router.push(`/board/identity-projects/${result.row.id}`);
            }
          }}
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
