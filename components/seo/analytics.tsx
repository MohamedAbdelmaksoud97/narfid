"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link2, RefreshCw } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  AnalyticsDashboard,
  AnalyticsRealtime,
  AnalyticsRow,
} from "@/lib/analytics/types";
import type { SearchCountry } from "@/lib/search-console/types";

const api = "/api/board/seo/analytics";
const format = (n: number) => new Intl.NumberFormat("ar-SA").format(n);
const timestamp = (s: string) =>
  new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  }).format(new Date(s));
const labels: Record<string, string> = {
  page_view: "مشاهدات الصفحات",
  whatsapp_click: "الضغط على واتساب",
  demo_request_start: "بدء طلب العرض",
};
async function read<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "تعذر قراءة تقارير Analytics.",
    );
  return data;
}
function DataTable({
  rows,
  title,
  metric,
}: {
  rows: AnalyticsRow[];
  title: string;
  metric: string;
}) {
  if (!rows.length)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>لا توجد صفوف متاحة</EmptyTitle>
          <EmptyDescription>
            لم يُعد Google بيانات لهذا التفصيل في الفترة المحددة.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{title}</TableHead>
          <TableHead>{metric}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className="max-w-64 whitespace-normal break-all">
              {row.key}
            </TableCell>
            <TableCell>{format(row.value)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
function ContactEvents({ rows }: { rows: AnalyticsRow[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {["whatsapp_click", "demo_request_start"].map((name) => {
        const event = rows.find((row) => row.key === name);
        return (
          <Card key={name}>
            <CardHeader>
              <CardDescription>{labels[name]}</CardDescription>
              <CardTitle>
                {event ? format(event.value) : "غير مرصود في الاستجابة"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="break-all text-sm" dir="ltr">
                {name}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {event
                  ? "حدث وصل إلى Google في هذه الفترة؛ لا يثبت إرسال رسالة أو اكتمال طلب."
                  : "غياب الصف لا يثبت تعطل الحدث؛ راجع الفترة والبلد والموافقة وتأخر المعالجة."}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function AnalyticsWorkspace() {
  const params = useSearchParams();
  const [country, setCountry] = useState<SearchCountry>("all");
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [realtime, setRealtime] = useState<AnalyticsRealtime | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const result = params.get("google");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${api}?country=${country}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(read<AnalyticsDashboard>)
      .then((data) => {
        if (!controller.signal.aborted) setDashboard(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "تعذر تحميل التقرير.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [country]);

  async function connect() {
    setBusy("connect");
    setError(null);
    try {
      const data = await read<{ url: string }>(
        await fetch("/api/board/seo/google/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ analytics: true }),
        }),
      );
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر بدء الربط.");
      setBusy(null);
    }
  }
  async function refresh() {
    setBusy("refresh");
    setError(null);
    try {
      setDashboard(
        await read<AnalyticsDashboard>(
          await fetch(api, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "refresh", country }),
          }),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر التحديث.");
    } finally {
      setBusy(null);
    }
  }
  async function inspectRealtime() {
    setBusy("realtime");
    setRealtimeError(null);
    try {
      setRealtime(
        await read<AnalyticsRealtime>(
          await fetch(`${api}?view=realtime&country=${country}`, {
            cache: "no-store",
          }),
        ),
      );
    } catch (e) {
      setRealtimeError(e instanceof Error ? e.message : "تعذر الفحص اللحظي.");
    } finally {
      setBusy(null);
    }
  }
  const report = dashboard?.report;
  return (
    <section
      id="seo-analytics"
      aria-labelledby="seo-analytics-heading"
      className="my-10 flex min-w-0 flex-col gap-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="seo-analytics-heading" className="text-2xl font-bold">
            تقارير Google Analytics 4
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            خاصية نرفد: 563435056 · قراءة فقط
          </p>
        </div>
        <Badge variant="secondary">
          {loading
            ? "جارٍ التحقق"
            : dashboard?.connected
              ? "Analytics مرتبط"
              : "موافقة Analytics مطلوبة"}
        </Badge>
      </div>
      {result && (
        <Alert>
          <AlertTitle>تفويض Google</AlertTitle>
          <AlertDescription>
            {result === "connected"
              ? "اكتملت الموافقة وتم التحقق من الوصول إلى خاصية Analytics وSearch Console."
              : "لم تكتمل محاولة الربط. تحقق من تفعيل Google Analytics Data API وصلاحية الحساب، ووافق على صلاحيتي القراءة. الاتصال السابق لا يُستبدل عند فشل المحاولة."}
          </AlertDescription>
        </Alert>
      )}
      {(error || dashboard?.error) && (
        <Alert variant="destructive">
          <AlertTitle>تعذر تحديث Analytics</AlertTitle>
          <AlertDescription>
            {error || dashboard?.error}
            {report && ` آخر سحب ظاهر: ${timestamp(report.fetchedAt)}.`}
            <Button
              variant="outline"
              onClick={refresh}
              disabled={Boolean(busy)}
            >
              إعادة المحاولة
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {loading ? (
        <Skeleton className="h-32" />
      ) : !dashboard?.connected ? (
        <Card>
          <CardHeader>
            <CardTitle>أضف موافقة قراءة Analytics</CardTitle>
            <CardDescription>
              نستخدم حساب Google نفسه مع الاحتفاظ بقراءة Search Console. لا
              يغيّر الربط إعدادات القياس أو Enhanced measurement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={connect}
              disabled={!dashboard?.configured || Boolean(busy)}
            >
              <Link2 data-icon="inline-start" />
              {busy === "connect" ? "جارٍ فتح Google…" : "ربط GA4"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup
              value={[country]}
              onValueChange={(values) => {
                const value = values[0];
                if ((value === "all" || value === "sau") && value !== country) {
                  setLoading(true);
                  setDashboard(null);
                  setRealtime(null);
                  setError(null);
                  setRealtimeError(null);
                  setCountry(value);
                }
              }}
              disabled={Boolean(busy)}
              aria-label="بلد زوار Analytics"
            >
              <ToggleGroupItem value="all">كل البلدان</ToggleGroupItem>
              <ToggleGroupItem value="sau">السعودية</ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="outline"
              onClick={refresh}
              disabled={Boolean(busy)}
            >
              <RefreshCw data-icon="inline-start" />
              تحديث Analytics
            </Button>
            <Button
              variant="outline"
              onClick={connect}
              disabled={Boolean(busy)}
            >
              إعادة تفويض Analytics
            </Button>
          </div>
          {report ? (
            <>
              <p className="text-sm text-muted-foreground">
                آخر 28 يومًا دون اليوم الحالي:{" "}
                <bdi>
                  {report.currentPeriod.startDate} —{" "}
                  {report.currentPeriod.endDate}
                </bdi>
                . الفترة السابقة:{" "}
                <bdi>
                  {report.previousPeriod.startDate} —{" "}
                  {report.previousPeriod.endDate}
                </bdi>
                . منطقة الخاصية: <bdi>{report.timeZone}</bdi>. آخر سحب بتوقيت
                القاهرة: {timestamp(report.fetchedAt)}.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["users", "المستخدمون النشطون"],
                    ["sessions", "الجلسات"],
                    ["views", "مشاهدات الصفحات"],
                  ] as const
                ).map(([key, title]) => (
                  <Card key={key}>
                    <CardHeader>
                      <CardDescription>{title}</CardDescription>
                      <CardTitle>
                        {report.current ? format(report.current[key]) : "—"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        الفترة السابقة:{" "}
                        {report.previous
                          ? format(report.previous[key])
                          : "غير متاح"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {!report.current && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>
                      ننتظر بيانات Analytics للفترة المحددة
                    </EmptyTitle>
                    <EmptyDescription>
                      قد لا تشمل التقارير التاريخية أحداث اليوم؛ استخدم فحص آخر
                      30 دقيقة للتحقق الأولي.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <h3 className="text-lg font-bold">أحداث التواصل خلال الفترة</h3>
              <ContactEvents rows={report.events} />
              {report.warnings.map((w) => (
                <Alert key={w}>
                  <AlertTitle>حدود بيانات Google</AlertTitle>
                  <AlertDescription>{w}</AlertDescription>
                </Alert>
              ))}
              <div className="grid min-w-0 gap-4 lg:grid-cols-2">
                <Card className="min-w-0">
                  <CardHeader>
                    <CardTitle>أعلى 20 صفحة عامة</CardTitle>
                    <CardDescription>حسب مشاهدات الصفحات</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      rows={report.pages}
                      title="المسار"
                      metric="المشاهدات"
                    />
                  </CardContent>
                </Card>
                <Card className="min-w-0">
                  <CardHeader>
                    <CardTitle>قنوات الزيارات</CardTitle>
                    <CardDescription>حسب الجلسات</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      rows={report.channels}
                      title="القناة"
                      metric="الجلسات"
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={refresh}
              disabled={Boolean(busy)}
            >
              إعادة محاولة تحميل Analytics
            </Button>
          )}
          <Card>
            <CardHeader>
              <CardTitle>فحص آخر 30 دقيقة</CardTitle>
              <CardDescription>
                وافق على إحصاءات الموقع، واضغط واتساب أو طلب العرض مرة، ثم افحص
                وصول الحدث. التقرير مجمّع ويشمل أجهزة أخرى؛ لا يثبت عدم التكرار
                أو إعداد Enhanced measurement.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <Button onClick={inspectRealtime} disabled={Boolean(busy)}>
                  {busy === "realtime"
                    ? "جارٍ الفحص…"
                    : "فحص أحداث آخر 30 دقيقة"}
                </Button>
              </div>
              {realtimeError && (
                <Alert variant="destructive">
                  <AlertTitle>تعذر الفحص اللحظي</AlertTitle>
                  <AlertDescription>
                    {realtimeError}
                    {realtime &&
                      ` البيانات الظاهرة أقدم: ${timestamp(realtime.fetchedAt)}.`}
                  </AlertDescription>
                </Alert>
              )}
              {realtime && (
                <>
                  <p>
                    المستخدمون النشطون:{" "}
                    {realtime.activeUsers === null
                      ? "غير متاح"
                      : format(realtime.activeUsers)}{" "}
                    · سُحب بتوقيت القاهرة: {timestamp(realtime.fetchedAt)}
                  </p>
                  <ContactEvents rows={realtime.events} />
                  {realtime.warnings.map((w) => (
                    <p key={w}>{w}</p>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground">
            المصدر: Google Analytics Data API. تقارير الفترة ترشّح الدومين
            والصفحات العامة؛ التقرير اللحظي يخص الخاصية كلها مع فلتر البلد. قد
            تتأخر معالجة البيانات. الجداول لا تمثل مجموعًا بديلًا للإجماليات.
            فحص التكرار والموافقة وإعداد القياس المحسّن يحتاج Tag Assistant أو
            DebugView وإعدادات Google. فصل Google من تبويب Search Console يفصل
            التفويض المشترك للخدمتين.
          </p>
        </>
      )}
      <a
        href="https://analytics.google.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline"
      >
        فتح Google Analytics
      </a>
    </section>
  );
}
