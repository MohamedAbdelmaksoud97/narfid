"use client";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { Button } from "@/components/ui/button";
const key = "nerved-analytics-consent";
const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  window.addEventListener("nerved-consent", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nerved-consent", callback);
  };
};
function choice() {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function choose(value: string | null) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {
    /* Consent remains ungranted if storage is unavailable. */
  }
  window.dispatchEvent(new Event("nerved-consent"));
}
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  nervedAnalyticsConfigured?: boolean;
  [key: `ga-disable-${string}`]: boolean | undefined;
};
function analyticsWindow() {
  return window as unknown as AnalyticsWindow;
}
function allowed(path: string) {
  return (
    path === "/" ||
    [
      "/articles",
      "/solutions/",
      "/pricing",
      "/about",
      "/contact",
      "/technology-partnership",
      "/authors/",
    ].some(
      (prefix) =>
        path === prefix ||
        path.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`),
    )
  );
}
export function PublicAnalytics({ measurementId }: { measurementId: string }) {
  const path = usePathname();
  const consent = useSyncExternalStore(subscribe, choice, () => null);
  const publicPage = allowed(path);
  const lastPage = useRef("");
  useEffect(() => {
    const analytics = analyticsWindow();
    analytics[`ga-disable-${measurementId}`] =
      consent !== "accepted" || !publicPage;
    if (consent !== "accepted" || !publicPage) {
      lastPage.current = "";
      return;
    }
    analytics.dataLayer ??= [];
    // Google's documented gtag queue uses IArguments rather than a normal array.
    analytics.gtag ??= function () {
      // eslint-disable-next-line prefer-rest-params
      analytics.dataLayer!.push(arguments);
    };
    if (!analytics.nervedAnalyticsConfigured) {
      analytics.gtag("js", new Date());
      analytics.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      analytics.nervedAnalyticsConfigured = true;
    }
    const location = window.location.origin + path;
    analytics.gtag("set", {
      page_location: location,
      page_referrer: "",
      page_title: "نرفد",
    });
    if (lastPage.current !== path) {
      analytics.gtag("event", "page_view", {
        page_location: location,
        page_title: document.title,
        page_referrer: "",
        send_to: measurementId,
      });
      lastPage.current = path;
    }
  }, [consent, path, publicPage, measurementId]);
  useEffect(() => {
    const guard = () => {
      if (!allowed(window.location.pathname))
        analyticsWindow()[`ga-disable-${measurementId}`] = true;
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest("a[href]");
      if (anchor) {
        const url = new URL(anchor.getAttribute("href")!, window.location.href);
        if (url.origin === window.location.origin && !allowed(url.pathname))
          analyticsWindow()[`ga-disable-${measurementId}`] = true;
      }
      if (!publicPage || consent !== "accepted") return;
      const name = target
        ?.closest("[data-analytics]")
        ?.getAttribute("data-analytics");
      if (name && ["demo_request_start", "whatsapp_click"].includes(name))
        analyticsWindow().gtag?.("event", name, {
          page_location: window.location.origin + path,
          send_to: measurementId,
        });
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", guard, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", guard, true);
    };
  }, [consent, path, publicPage, measurementId]);
  if (!publicPage) return null;
  return (
    <>
      {consent === "accepted" && (
        <Script
          id="nerved-ga4"
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
        />
      )}
      {consent === null ? (
        <aside
          className="analytics-consent"
          aria-label="إحصاءات الموقع الاختيارية"
        >
          <p>
            تسمح إحصاءات الاستخدام بفهم ما يفيد زوار الموقع.{" "}
            <Link href="/contact#measurement">كيف نستخدمها؟</Link>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => choose("accepted")}>
              السماح بالإحصاءات
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => choose("rejected")}
            >
              بدون إحصاءات
            </Button>
          </div>
        </aside>
      ) : (
        <div className="analytics-settings container">
          <Button variant="link" size="sm" onClick={() => choose(null)}>
            إعدادات إحصاءات الموقع
          </Button>
        </div>
      )}
    </>
  );
}
