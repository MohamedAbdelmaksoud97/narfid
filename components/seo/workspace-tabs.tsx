"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchConsoleWorkspace } from "@/components/seo/search-console";

function subscribeToHash(change: () => void) {
  window.addEventListener("hashchange", change);
  window.addEventListener("popstate", change);
  return () => {
    window.removeEventListener("hashchange", change);
    window.removeEventListener("popstate", change);
  };
}

export function SeoWorkspaceTabs({ children }: { children: ReactNode }) {
  const params = useSearchParams();
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => "",
  );
  const selected = params.get("tab");
  const tab =
    selected === "google" ||
    (selected !== "guide" && (params.has("google") || hash === "#seo-google"))
      ? "google"
      : "guide";

  useEffect(() => {
    if (tab !== "google" || hash !== "#seo-google") return;
    const frame = window.requestAnimationFrame(() =>
      document.getElementById("seo-google")?.scrollIntoView({ block: "start" }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [tab, hash]);

  function changeTab(value: unknown) {
    if (value !== "guide" && value !== "google") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);
    url.searchParams.delete("google");
    // Native history integrates with useSearchParams and preserves Back/Forward.
    window.history.pushState(null, "", url.pathname + url.search);
  }

  return (
    <Tabs value={tab} onValueChange={changeTab} className="min-w-0 gap-6">
      <div className="container">
        <TabsList
          variant="line"
          aria-label="أقسام صفحة SEO"
          className="h-auto flex-wrap"
        >
          <TabsTrigger value="guide">الدليل والخطة</TabsTrigger>
          <TabsTrigger value="google">تقارير Google</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="guide" className="min-w-0">
        {children}
      </TabsContent>
      <TabsContent value="google" className="min-w-0">
        <div className="container">
          <SearchConsoleWorkspace />
        </div>
      </TabsContent>
    </Tabs>
  );
}
