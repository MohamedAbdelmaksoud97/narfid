"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpLeft,
  Download,
  Plus,
  Search,
  UsersRound,
  CircleAlert,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  accountPath,
  clientStages,
  contractBalance,
  dateLabel,
  leadStages,
  money,
  priorities,
  todaySaudi,
  type Account,
  type AccountKind,
  type CrmData,
} from "@/lib/crm/types";
import { accountForm, defaults } from "./crm-fields";
import {
  CrmEditor,
  CrmStatus,
  NoRecords,
  crmRequest,
  useCrmData,
} from "./crm-shared";

export function CrmList({ kind }: { kind: AccountKind }) {
  const router = useRouter(),
    state = useCrmData<CrmData>(`accounts?kind=${kind}`);
  const [search, setSearch] = useState(""),
    [stage, setStage] = useState(""),
    [owner, setOwner] = useState(""),
    [priority, setPriority] = useState(""),
    [archived, setArchived] = useState("active"),
    [attention, setAttention] = useState("");
  const [create, setCreate] = useState<Record<string, unknown> | null>(null);
  const stages = kind === "lead" ? leadStages : clientStages,
    today = todaySaudi();
  const soon = new Date(`${today}T12:00:00Z`);
  soon.setUTCDate(soon.getUTCDate() + 30);
  const cutoff = soon.toISOString().slice(0, 10);
  const active =
    state.data?.accounts.filter((account) => !account.archived) ?? [];
  const overdue = (account: Account) =>
    Boolean(account.next_follow_up_on && account.next_follow_up_on < today) ||
    Boolean(
      state.data?.followups.some(
        (row) =>
          row.account_id === account.id &&
          row.status === "open" &&
          row.due_on &&
          String(row.due_on) < today,
      ),
    );
  const latestContract = (account: Account) =>
    state.data?.contracts
      .filter((row) => row.account_id === account.id && row.status === "signed")
      .sort((a, b) => String(b.ends_on).localeCompare(String(a.ends_on)))[0];
  const needsRenewal = (account: Account) => {
    const contract = latestContract(account);
    return Boolean(
      contract &&
      account.stage !== "churned" &&
      String(contract.ends_on) <= cutoff,
    );
  };
  const visible = (state.data?.accounts ?? []).filter((account) => {
    const term = search.trim().toLocaleLowerCase("ar");
    return (
      (archived === "all" || account.archived === (archived === "archived")) &&
      (!stage || account.stage === stage) &&
      (!owner ||
        (owner === "unassigned"
          ? !account.owner_id
          : owner === account.owner_id)) &&
      (!priority || account.priority === priority) &&
      (!term ||
        [
          account.name,
          account.city,
          account.contact_name,
          account.phone,
          account.email,
        ].some((value) => value.toLocaleLowerCase("ar").includes(term))) &&
      (!attention ||
        (attention === "overdue" ? overdue(account) : needsRenewal(account)))
    );
  });
  const outstanding = (state.data?.contracts ?? [])
    .filter(
      (row) =>
        row.status === "signed" && active.some((a) => a.id === row.account_id),
    )
    .reduce(
      (sum, row) =>
        sum + contractBalance(row, state.data?.payments ?? []).remaining,
      0,
    );
  const stats =
    kind === "lead"
      ? [
          {
            title: "فرص قيد المتابعة",
            value: active
              .filter((a) => a.stage !== "lost")
              .length.toLocaleString("ar-SA"),
            icon: UsersRound,
          },
          {
            title: "عرض سعر أو تفاوض",
            value: active
              .filter((a) => ["proposal", "negotiation"].includes(a.stage))
              .length.toLocaleString("ar-SA"),
            icon: ArrowUpLeft,
          },
          {
            title: "متابعات متأخرة",
            value: active.filter(overdue).length.toLocaleString("ar-SA"),
            icon: CircleAlert,
          },
          {
            title: "ميزانيات فرص تقديرية",
            value: money(
              active
                .filter((a) => a.stage !== "lost")
                .reduce(
                  (sum, a) => sum + Number(a.annual_budget_cents ?? 0),
                  0,
                ),
            ),
            icon: Wallet,
          },
        ]
      : [
          {
            title: "عملاء نشطون",
            value: active
              .filter((a) => a.stage === "active")
              .length.toLocaleString("ar-SA"),
            icon: UsersRound,
          },
          {
            title: "قيد التجهيز",
            value: active
              .filter((a) => a.stage === "onboarding")
              .length.toLocaleString("ar-SA"),
            icon: CalendarClock,
          },
          {
            title: "تجديدات خلال ٣٠ يومًا أو منتهية",
            value: active.filter(needsRenewal).length.toLocaleString("ar-SA"),
            icon: CircleAlert,
          },
          {
            title: "متبقي من العقود الموقّعة",
            value: money(outstanding),
            icon: Wallet,
          },
        ];
  return (
    <main className="crm-page container">
      <header className="crm-page-heading">
        <div>
          <p className="section-kicker">علاقات العملاء · نرفد</p>
          <h1>{kind === "lead" ? "العملاء المحتملون" : "العملاء"}</h1>
          <p>
            {kind === "lead"
              ? "من أول تواصل إلى قرار التعاقد؛ ملف واحد يحفظ احتياج المؤسسة وتاريخ العلاقة."
              : "العقود والتجهيز والتشغيل والتجديد؛ متابعة مستمرة لكل مؤسسة وفريقها."}
          </p>
        </div>
        <div className="crm-actions">
          <Button
            onClick={() =>
              setCreate({
                ...defaults("account", kind),
                id: crypto.randomUUID(),
              })
            }
          >
            <Plus data-icon="inline-start" />
            {kind === "lead" ? "إضافة عميل محتمل" : "إضافة عميل"}
          </Button>
          <a
            className={buttonVariants({ variant: "outline" })}
            href={`/api/board/crm/accounts?kind=${kind}&format=csv`}
            download
          >
            <Download data-icon="inline-start" />
            تصدير CSV
          </a>
        </div>
      </header>
      <div className="crm-stats">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader>
              <CardDescription>
                <stat.icon aria-hidden="true" />
                {stat.title}
              </CardDescription>
              <CardTitle>
                {state.loading && !state.data ? "…" : stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      {kind === "lead" && (
        <ToggleGroup
          className="crm-pipeline"
          aria-label="مراحل العملاء المحتملين"
          variant="outline"
          value={stage ? [stage] : []}
          onValueChange={(values) => setStage(values[0] ?? "")}
        >
          {Object.entries(leadStages).map(([value, label]) => (
            <ToggleGroupItem key={value} value={value}>
              {label}
              <Badge variant="outline">
                {active.filter((a) => a.stage === value).length}
              </Badge>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      <div className="crm-toolbar">
        <div className="crm-search">
          <Search aria-hidden="true" />
          <Input
            aria-label="البحث عن مؤسسة أو جهة اتصال"
            placeholder="ابحث باسم المؤسسة أو المدينة أو جهة الاتصال…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <CrmStatus
          error={state.error}
          loading={state.loading}
          reload={() => void state.reload()}
        />
      </div>
      <div className="crm-filters">
        <Field>
          <FieldLabel htmlFor="crm-stage">
            {kind === "lead" ? "مرحلة البيع" : "حالة العميل"}
          </FieldLabel>
          <NativeSelect
            id="crm-stage"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          >
            <NativeSelectOption value="">كل المراحل</NativeSelectOption>
            {Object.entries(stages).map(([id, label]) => (
              <NativeSelectOption key={id} value={id}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="crm-owner">مسؤول نرفد</FieldLabel>
          <NativeSelect
            id="crm-owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <NativeSelectOption value="">كل المسؤولين</NativeSelectOption>
            <NativeSelectOption value="unassigned">
              غير معيّن
            </NativeSelectOption>
            {state.data?.members.map((m) => (
              <NativeSelectOption key={m.id} value={m.id}>
                {m.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="crm-priority">الأولوية</FieldLabel>
          <NativeSelect
            id="crm-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <NativeSelectOption value="">كل الأولويات</NativeSelectOption>
            {Object.entries(priorities).map(([id, label]) => (
              <NativeSelectOption key={id} value={id}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="crm-attention">يحتاج اهتمامًا</FieldLabel>
          <NativeSelect
            id="crm-attention"
            value={attention}
            onChange={(e) => setAttention(e.target.value)}
          >
            <NativeSelectOption value="">الكل</NativeSelectOption>
            <NativeSelectOption value="overdue">
              متابعة متأخرة
            </NativeSelectOption>
            {kind === "client" && (
              <NativeSelectOption value="renewal">
                تجديد قريب أو منتهٍ
              </NativeSelectOption>
            )}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="crm-archive">حالة الملف</FieldLabel>
          <NativeSelect
            id="crm-archive"
            value={archived}
            onChange={(e) => setArchived(e.target.value)}
          >
            <NativeSelectOption value="active">
              الملفات الحالية
            </NativeSelectOption>
            <NativeSelectOption value="archived">الأرشيف</NativeSelectOption>
            <NativeSelectOption value="all">الكل</NativeSelectOption>
          </NativeSelect>
        </Field>
      </div>
      <div className="crm-results" role="status">
        {state.loading
          ? "جارٍ تحميل البيانات…"
          : `${visible.length.toLocaleString("ar-SA")} ملف يطابق التصفية`}
      </div>
      {!!visible.length && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المؤسسة</TableHead>
              <TableHead>المرحلة</TableHead>
              <TableHead>الخطة</TableHead>
              <TableHead>التواصل</TableHead>
              <TableHead>المسؤول</TableHead>
              <TableHead>
                {kind === "lead" ? "المتابعة القادمة" : "نهاية آخر عقد"}
              </TableHead>
              <TableHead>الأولوية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((acc) => (
              <TableRow key={acc.id}>
                <TableCell>
                  <Link href={accountPath(acc)} className="crm-account-link">
                    {acc.name}
                    <ArrowUpLeft aria-hidden="true" />
                  </Link>
                  <small>
                    {[acc.city, acc.institution_type, `${acc.branches} فرع`]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {stages[acc.stage as keyof typeof stages] ?? acc.stage}
                  </Badge>
                  {acc.archived && <Badge variant="outline">مؤرشف</Badge>}
                </TableCell>
                <TableCell>
                  {state.data?.plans.find((plan) => plan.id === acc.plan_id)
                    ?.name ?? "لم تُحدد"}
                </TableCell>
                <TableCell>
                  {acc.contact_name || "—"}
                  <small dir="ltr">{acc.phone || acc.email || ""}</small>
                </TableCell>
                <TableCell>
                  {state.data?.members.find((m) => m.id === acc.owner_id)
                    ?.name ?? "غير معيّن"}
                </TableCell>
                <TableCell>
                  {dateLabel(
                    kind === "lead"
                      ? acc.next_follow_up_on
                      : latestContract(acc)?.ends_on,
                  )}
                  {overdue(acc) && (
                    <small className="crm-overdue">متابعة متأخرة</small>
                  )}
                  {kind === "client" && needsRenewal(acc) && (
                    <small className="crm-overdue">راجع التجديد</small>
                  )}
                </TableCell>
                <TableCell>{priorities[acc.priority]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {!state.loading && !visible.length && (
        <NoRecords
          title={
            active.length || archived !== "active"
              ? "لا توجد نتائج بهذه التصفية"
              : kind === "lead"
                ? "ابدأ بأول فرصة"
                : "ملفات العملاء في مكان واحد"
          }
          description={
            kind === "lead"
              ? "أضف المؤسسة وجهة الاتصال واحتياجها، ثم حدّد المرحلة ومسؤول المتابعة."
              : "أضف عميلًا متعاقدًا أو حوّل ملفًا من العملاء المحتملين للاحتفاظ بتاريخ العلاقة."
          }
        />
      )}
      {create && (
        <CrmEditor
          title={kind === "lead" ? "إضافة عميل محتمل" : "إضافة عميل"}
          fields={accountForm(
            kind,
            state.data?.members ?? [],
            state.data?.plans ?? [],
          )}
          initial={create}
          onClose={() => setCreate(null)}
          onSave={async (fields) => {
            const result = await crmRequest("accounts", "POST", {
              id: create.id,
              kind,
              fields,
            });
            router.push(accountPath(result.account));
          }}
        />
      )}
    </main>
  );
}
