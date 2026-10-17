"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlatformId } from "@/lib/marketing/social";
import type { Publication } from "@/lib/marketing/publications";

export function usePublications(platform: PlatformId) {
  const [rows, setRows] = useState<Publication[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState("");
  const [refreshing, setRefreshing] = useState(true);
  const generation = useRef(0);
  const writing = useRef(false);
  const load = useCallback(() => {
    if (writing.current) return;
    const current = ++generation.current;
    return fetch(`/api/board/marketing/publications?platform=${platform}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "تعذر تحميل سجل النشر.");
        return result;
      })
      .then((result) => {
        if (current === generation.current) {
          setRows(result.publications);
          setError("");
        }
      })
      .catch((error: unknown) => {
        if (current === generation.current)
          setError(
            error instanceof Error ? error.message : "تعذر تحميل سجل النشر.",
          );
      })
      .finally(() => {
        if (current === generation.current) setRefreshing(false);
      });
  }, [platform]);
  const refresh = useCallback(() => {
    setRefreshing(true);
    return load();
  }, [load]);

  useEffect(() => {
    void load();
    const activeGeneration = generation;
    const update = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(update, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      activeGeneration.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [load, refresh]);

  async function toggle(postId: string, published: boolean) {
    const row = rows?.find((row) => row.post_id === postId);
    if (!row || error || writing.current) return;
    writing.current = true;
    const current = ++generation.current;
    setPending(postId);
    setRefreshing(false);
    setNotice("");
    let failure = "";
    try {
      const response = await fetch("/api/board/marketing/publications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          post_id: postId,
          published,
          revision: row.revision,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "تعذر حفظ حالة النشر.");
      if (current === generation.current) {
        setRows(
          (rows) =>
            rows?.map((value) =>
              value.post_id === postId ? result.publication : value,
            ) ?? null,
        );
        setNotice(
          published
            ? `تم تسجيل نشر المنشور ${postId}.`
            : `أُلغي تسجيل نشر المنشور ${postId}.`,
        );
      }
    } catch (error) {
      failure = error instanceof Error ? error.message : "تعذر حفظ حالة النشر.";
    } finally {
      writing.current = false;
      // Next can preserve this library while hiding its page during navigation.
      // Always release the control, even if that lifecycle invalidated the read.
      setPending("");
      if (current === generation.current) {
        if (failure) {
          // A timed-out write may have reached the database: read before retrying.
          await refresh();
          setNotice(failure);
        }
      }
    }
  }
  return {
    rows,
    error,
    notice,
    pending,
    refreshing,
    refresh,
    toggle,
    clearNotice: () => setNotice(""),
  };
}
