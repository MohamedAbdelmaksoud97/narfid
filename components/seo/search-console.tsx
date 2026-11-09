"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpLeft, Link2, RefreshCw, Search, Unplug } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  Inspection,
  SearchCountry,
  SearchDashboard,
  SearchMetrics,
  SearchReport,
  SearchRow,
} from "@/lib/search-console/types";

const api = "/api/board/seo/google";
const siteUrl = "https://www.narfid.com/";
const formatNumber = (value: number) =>
  new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 }).format(value);
const formatPercent = (value: number) =>
  new Intl.NumberFormat("ar-SA", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
const timestamp = (value: string | null) =>
  value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Cairo",
      }).format(new Date(value))
    : "غير متاح";
const callbackMessages: Record<string, string> = {
  connected: "تم ربط Search Console. تُعرض البيانات المتاحة من Google أدناه.",
  google_denied: "لم تكتمل الموافقة في Google. يمكنك بدء الربط مرة أخرى.",
  invalid_state: "انتهت محاولة الربط أو لم تطابق الجلسة. ابدأ الربط من جديد.",
  unauthorized: "سجّل الدخول بحساب مجلس الإدارة ثم أعد الربط.",
  google_forbidden:
    "تحقق من تفعيل API المطلوبة وصلاحية حساب Google للموقع وخاصية Analytics عند ربطها.",
  reconnect_required: "لم يكتمل تفويض القراءة. أعد ربط حساب Google.",
  not_configured: "إعداد اتصال Google على الخادم غير مكتمل.",
  connection_changed: "تغيّر الاتصال أثناء الربط. حدّث الصفحة وأعد المحاولة.",
  unavailable: "تعذر إكمال الربط الآن. حاول مرة أخرى.",
};

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.error === "string" ? data.error : "تعذر تنفيذ طلب Google.",
    );
  return data as T;
}

function MetricCards({ report }: { report: SearchReport }) {
  const fields: {
    key: keyof SearchMetrics;
    title: string;
    percent?: boolean;
  }[] = [
    { key: "clicks", title: "النقرات من البحث" },
    { key: "impressions", title: "مرات الظهور" },
    { key: "ctr", title: "نسبة النقر", percent: true },
    { key: "position", title: "متوسط موضع الظهور" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fields.map((field) => {
        const format = field.percent ? formatPercent : formatNumber;
        return (
          <Card key={field.key}>
            <CardHeader>
              <CardDescription>{field.title}</CardDescription>
              <CardTitle>
                {report.current ? format(report.current[field.key]) : "—"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                الفترة السابقة:{" "}
                {report.previous
                  ? format(report.previous[field.key])
                  : "لا تتوفر بيانات"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ReportTable({
  rows,
  kind,
}: {
  rows: SearchRow[];
  kind: "queries" | "pages" | "devices" | "trend";
}) {
  const title = {
    queries: "طلب البحث",
    pages: "الصفحة",
    devices: "الجهاز",
    trend: "التاريخ",
  }[kind];
  const deviceLabels: Record<string, string> = {
    MOBILE: "جوال",
    DESKTOP: "حاسوب",
    TABLET: "جهاز لوحي",
  };
  if (!rows.length)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>لا توجد نتائج متاحة</EmptyTitle>
          <EmptyDescription>
            لم يوفر Google صفوفًا لهذا التفصيل في الفترة المختارة.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{title}</TableHead>
          <TableHead>النقرات</TableHead>
          <TableHead>الظهور</TableHead>
          <TableHead>CTR</TableHead>
          <TableHead>الموضع</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const link = kind === "pages" && row.key.startsWith(siteUrl);
          return (
            <TableRow key={row.key}>
              <TableCell className="max-w-64 min-w-36 whitespace-normal break-words">
                {link ? (
                  <a
                    href={row.key}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all underline underline-offset-4"
                    dir="ltr"
                  >
                    {row.key.slice(siteUrl.length) || "/"}
                  </a>
                ) : kind === "devices" ? (
                  deviceLabels[row.key] || row.key
                ) : (
                  row.key
                )}
              </TableCell>
              <TableCell>{formatNumber(row.clicks)}</TableCell>
              <TableCell>{formatNumber(row.impressions)}</TableCell>
              <TableCell>{formatPercent(row.ctr)}</TableCell>
              <TableCell>{formatNumber(row.position)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function InspectionResult({ inspection }: { inspection: Inspection }) {
  const labels: Record<string, string> = {
    PASS: "موجود في فهرس Google",
    FAIL: "مشكلة في الفهرسة",
    NEUTRAL: "مستبعد من الفهرس",
    PARTIAL: "تحتاج الحالة إلى مراجعة",
  };
  const fields = [
    ["حالة التغطية", inspection.coverage],
    ["السماح بالفهرسة", inspection.indexingState],
    ["حالة robots", inspection.robotsState],
    ["آخر زحف", timestamp(inspection.lastCrawlTime)],
    ["الرابط الأساسي لدى Google", inspection.googleCanonical],
    ["الرابط الأساسي المعلن", inspection.userCanonical],
  ];
  return (
    <div className="flex min-w-0 flex-col gap-4" role="status">
      <Badge variant="secondary">
        {labels[inspection.verdict] || "الحالة غير محددة"}
      </Badge>
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd
              className="break-words text-sm"
              dir={value?.startsWith("http") ? "ltr" : undefined}
            >
              {value || "غير متاح"}
            </dd>
          </div>
        ))}
      </dl>
      {inspection.inspectionLink && (
        <a
          href={inspection.inspectionLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm underline"
        >
          فتح الفحص في Search Console{" "}
          <ArrowUpLeft aria-hidden="true" className="size-4" />
        </a>
      )}
    </div>
  );
}

export function SearchConsoleWorkspace() {
  const [country, setCountry] = useState<SearchCountry>("sau");
  const [dashboard, setDashboard] = useState<SearchDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [url, setUrl] = useState(siteUrl);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const params = useSearchParams();
  const callback = params.get("google");
  const message =
    notice ||
    (callback && Object.hasOwn(callbackMessages, callback)
      ? callbackMessages[callback]
      : null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${api}?country=${country}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => readResponse<SearchDashboard>(response))
      .then((data) => {
        if (!controller.signal.aborted) setDashboard(data);
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : "تعذر تحميل تقارير Google.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [country]);

  async function action(name: string, payload: Record<string, unknown> = {}) {
    return readResponse<Record<string, unknown>>(
      await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: name, ...payload }),
      }),
    );
  }

  async function connect() {
    setBusy("connect");
    setError(null);
    try {
      const data = await readResponse<{ url: string }>(
        await fetch(`${api}/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        }),
      );
      window.location.assign(data.url);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "تعذر بدء الربط.");
      setBusy(null);
    }
  }

  async function refresh() {
    setBusy("refresh");
    setError(null);
    try {
      setDashboard(
        (await action("refresh", { country })) as unknown as SearchDashboard,
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "تعذر التحديث.");
    } finally {
      setBusy(null);
    }
  }

  async function disconnect() {
    setBusy("disconnect");
    setError(null);
    try {
      const result = await action("disconnect");
      setDashboard(
        await readResponse<SearchDashboard>(
          await fetch(`${api}?country=${country}`, { cache: "no-store" }),
        ),
      );
      setInspection(null);
      setNotice(
        result.revoked
          ? "تم فصل اتصال Google وإلغاء التفويض."
          : "تم فصل الاتصال من نرفد. تعذر تأكيد إلغاء التفويض لدى Google؛ يمكنك إزالته من أذونات حساب Google.",
      );
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "تعذر فصل الاتصال.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function inspect(event: FormEvent) {
    event.preventDefault();
    setBusy("inspect");
    setError(null);
    setInspection(null);
    try {
      const result = await action("inspect", { url });
      setInspection(result.inspection as Inspection);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "تعذر فحص الرابط.");
    } finally {
      setBusy(null);
    }
  }

  const report = dashboard?.report;
  return (
    <section
      id="seo-google"
      aria-labelledby="seo-google-heading"
      className="my-10 flex min-w-0 flex-col gap-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="seo-google-heading" className="text-2xl font-bold">
            تقارير Google Search Console
          </h2>
          <p className="mt-2 break-all text-sm text-muted-foreground" dir="ltr">
            {siteUrl}
          </p>
        </div>
        <Badge variant="secondary">
          {loading
            ? "جارٍ التحقق"
            : dashboard?.connected
              ? "حساب مرتبط"
              : "غير مرتبط"}
        </Badge>
      </div>
      {message && (
        <Alert>
          <AlertTitle>اتصال Google</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {(error || dashboard?.error) && (
        <Alert variant="destructive">
          <AlertTitle>تعذر إكمال الطلب</AlertTitle>
          <AlertDescription>
            {error || dashboard?.error}
            {report && (
              <span> آخر تقرير محفوظ: {timestamp(report.fetchedAt)}.</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !dashboard?.connected ? (
        <Card>
          <CardHeader>
            <CardTitle>اربط حساب Google لعرض النتائج</CardTitle>
            <CardDescription>
              يعرض الربط بيانات الموقع لمجلس الإدارة بصلاحية قراءة فقط. ستوافق
              من حسابك الذي يملك الموقع في Search Console.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {dashboard && !dashboard.configured && (
              <p className="text-sm text-muted-foreground">
                لم يكتمل إعداد بيانات الاتصال على الخادم بعد.
              </p>
            )}
            <div>
              <Button
                onClick={connect}
                disabled={!dashboard?.configured || Boolean(busy)}
              >
                <Link2 data-icon="inline-start" />
                {busy === "connect"
                  ? "جارٍ فتح Google…"
                  : "ربط Google Search Console"}
              </Button>
            </div>
            {error && (
              <div>
                <Button
                  variant="outline"
                  onClick={refresh}
                  disabled={Boolean(busy)}
                >
                  إعادة المحاولة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ToggleGroup
              value={[country]}
              onValueChange={(values) => {
                const value = values[0];
                if ((value === "sau" || value === "all") && value !== country) {
                  setCountry(value);
                  setDashboard(null);
                  setLoading(true);
                  setError(null);
                }
              }}
              aria-label="بلد البحث"
              variant="outline"
              disabled={Boolean(busy)}
            >
              <ToggleGroupItem value="sau" aria-label="السعودية">
                السعودية
              </ToggleGroupItem>
              <ToggleGroupItem value="all" aria-label="كل البلدان">
                كل البلدان
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex flex-wrap items-center gap-2">
              {dashboard.reconnectRequired && (
                <Button onClick={connect} disabled={Boolean(busy)}>
                  <Link2 data-icon="inline-start" />
                  إعادة ربط Google
                </Button>
              )}
              <Button
                variant="outline"
                onClick={refresh}
                disabled={Boolean(busy)}
              >
                <RefreshCw data-icon="inline-start" />
                {busy === "refresh" ? "جارٍ التحديث…" : "تحديث التقرير"}
              </Button>
              <Button
                variant="ghost"
                onClick={disconnect}
                disabled={Boolean(busy)}
              >
                <Unplug data-icon="inline-start" />
                فصل الربط
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            فصل الربط يلغي تفويض Google المشترك لـSearch Console وAnalytics إذا
            كانا مرتبطين.
          </p>
          {report ? (
            <>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                <p>
                  فترة 28 يومًا، دون اليوم الحالي:{" "}
                  <bdi>
                    {report.currentPeriod.startDate} —{" "}
                    {report.currentPeriod.endDate}
                  </bdi>
                </p>
                <p>
                  المقارنة:{" "}
                  <bdi>
                    {report.previousPeriod.startDate} —{" "}
                    {report.previousPeriod.endDate}
                  </bdi>
                </p>
                <p>
                  آخر سحب من Google: {timestamp(report.fetchedAt)}
                  {report.lastDataDate && (
                    <>
                      {" "}
                      · آخر يوم متاح في التفصيل:{" "}
                      <bdi>{report.lastDataDate}</bdi>
                    </>
                  )}
                </p>
              </div>
              <MetricCards report={report} />
              {!report.current && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>ننتظر بيانات البحث من Google</EmptyTitle>
                    <EmptyDescription>
                      الاتصال يعمل، لكن لا تتوفر بيانات نهائية لهذه الفترة
                      والبلد حتى الآن. هذا لا يحدد حالة فهرسة الصفحات.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل الأداء</CardTitle>
                  <CardDescription>
                    المصدر: Search Console، بحث الويب والبيانات النهائية.
                    الجداول تعرض أعلى النتائج المتاحة حسب النقرات؛ وقد لا يعرض
                    Google جميع طلبات البحث. تواريخ الفترات بتوقيت تقارير Google
                    في المحيط الهادئ.
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-w-0">
                  <Tabs defaultValue="queries">
                    <TabsList className="flex h-auto flex-wrap">
                      <TabsTrigger value="queries">الكلمات</TabsTrigger>
                      <TabsTrigger value="pages">الصفحات</TabsTrigger>
                      <TabsTrigger value="devices">الأجهزة</TabsTrigger>
                      <TabsTrigger value="trend">اليومي</TabsTrigger>
                    </TabsList>
                    {(["queries", "pages", "devices", "trend"] as const).map(
                      (kind) => (
                        <TabsContent key={kind} value={kind}>
                          <ReportTable rows={report[kind]} kind={kind} />
                        </TabsContent>
                      ),
                    )}
                  </Tabs>
                </CardContent>
              </Card>
            </>
          ) : (
            !dashboard.error && (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>لا يوجد تقرير محفوظ بعد</EmptyTitle>
                  <EmptyDescription>
                    اضغط تحديث التقرير لقراءة البيانات المتاحة من Google.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )
          )}
          <p className="text-sm text-muted-foreground">
            تتجدد البيانات عند فتح الصفحة إذا مضت 6 ساعات على آخر سحب. متوسط
            الموضع مؤشر متغير، وليس ترتيبًا ثابتًا.
          </p>
          <Card>
            <CardHeader>
              <CardTitle>فحص حالة صفحة في Google</CardTitle>
              <CardDescription>
                يعرض الفحص حالة النسخة المحفوظة لدى Google. لا ينفذ اختبارًا
                مباشرًا أو طلب فهرسة للرابط.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-col gap-5">
              <form onSubmit={inspect}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="google-inspection-url">
                      رابط الصفحة العامة
                    </FieldLabel>
                    <Input
                      id="google-inspection-url"
                      type="url"
                      dir="ltr"
                      required
                      maxLength={2048}
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                    />
                  </Field>
                  <Field>
                    <div>
                      <Button type="submit" disabled={Boolean(busy)}>
                        <Search data-icon="inline-start" />
                        {busy === "inspect" ? "جارٍ الفحص…" : "فحص الرابط"}
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </form>
              {inspection && <InspectionResult inspection={inspection} />}
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
