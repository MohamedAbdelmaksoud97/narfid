"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  VideoLibraryState,
  VideoProduction,
  VideoPublication,
} from "@/lib/marketing/video-plan";

export function useVideos() {
  const [state, setState] = useState<VideoLibraryState | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState("");
  const [refreshing, setRefreshing] = useState(true);
  const generation = useRef(0),
    writing = useRef(false);
  const refresh = useCallback(() => {
    if (writing.current) return;
    const current = ++generation.current;
    return fetch("/api/board/marketing/videos", {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "تعذر تحميل سجل الفيديو.");
        return body;
      })
      .then((body) => {
        if (current === generation.current) {
          setState(body);
          setError("");
        }
      })
      .catch((error: unknown) => {
        if (current === generation.current)
          setError(
            error instanceof Error ? error.message : "تعذر تحميل السجل.",
          );
      })
      .finally(() => {
        if (current === generation.current) setRefreshing(false);
      });
  }, []);
  useEffect(() => {
    void refresh();
    const activeGeneration = generation;
    const update = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const interval = window.setInterval(update, 30000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      activeGeneration.current++;
      clearInterval(interval);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [refresh]);
  async function change(input: Record<string, unknown>) {
    if (writing.current || error || !state) return;
    writing.current = true;
    ++generation.current;
    setPending(String(input.video_id));
    setNotice("");
    setRefreshing(false);
    let failure = "";
    try {
      const response = await fetch("/api/board/marketing/videos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15000),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "تعذر حفظ الحالة.");
      setState((previous) => {
        if (!previous) return previous;
        if (body.kind === "production")
          return {
            ...previous,
            productions: previous.productions.map((row) =>
              row.video_id === body.row.video_id
                ? (body.row as VideoProduction)
                : row,
            ),
          };
        return {
          ...previous,
          publications: previous.publications.map((row) =>
            row.video_id === body.row.video_id &&
            row.platform === body.row.platform
              ? (body.row as VideoPublication)
              : row,
          ),
        };
      });
      setNotice("حُفظت حالة الفيديو.");
    } catch (error) {
      failure = error instanceof Error ? error.message : "تعذر حفظ الحالة.";
    } finally {
      writing.current = false;
      setPending("");
      if (failure) {
        await refresh();
        setNotice(failure);
      }
    }
  }
  const reload = useCallback(() => {
    setRefreshing(true);
    return refresh();
  }, [refresh]);
  return { state, error, notice, pending, refreshing, refresh: reload, change };
}
