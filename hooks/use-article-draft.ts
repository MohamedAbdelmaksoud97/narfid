"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { articleRequest, ArticleRequestError } from "@/lib/articles/browser";
import { useNavigationGuard } from "@/components/articles/navigation-guard-provider";
import {
  articleFields,
  type Article,
  type ArticleFields,
} from "@/lib/articles/types";

export function useArticleDraft(initial: Article) {
  const registerGuard = useNavigationGuard();
  const [fields, setFields] = useState(() => articleFields(initial));
  const [article, setArticle] = useState(initial);
  const [status, setStatus] = useState<"saved" | "dirty" | "saving" | "error">(
    "saved",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const latest = useRef(articleFields(initial));
  const saved = useRef(JSON.stringify(articleFields(initial)));
  const record = useRef(initial);
  const flight = useRef<Promise<Article> | null>(null);
  const blocked = useRef(false);
  const mounted = useRef(true);
  const historySnapshot = useRef<{ state: unknown; url: string } | null>(null);
  const change = useCallback((patch: Partial<ArticleFields>) => {
    // Capture after real editor interaction: PPR can mount before the URL commit.
    historySnapshot.current = {
      state: window.history.state,
      url: window.location.href,
    };
    latest.current = { ...latest.current, ...patch };
    setFields(latest.current);
    setStatus(
      JSON.stringify(latest.current) === saved.current ? "saved" : "dirty",
    );
  }, []);
  const save = useCallback(async (): Promise<Article> => {
    if (flight.current) return flight.current;
    blocked.current = false;
    const run = async () => {
      if (mounted.current) {
        setError("");
        setStatus("saving");
      }
      while (saved.current !== JSON.stringify(latest.current)) {
        const snapshot = structuredClone(latest.current);
        const serialized = JSON.stringify(snapshot);
        const result = await articleRequest<{ article: Article }>(
          `/api/board/articles/${initial.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              revision: record.current.revision,
              fields: snapshot,
            }),
          },
        );
        record.current = result.article;
        saved.current = serialized;
        if (mounted.current) setArticle(result.article);
      }
      if (mounted.current) setStatus("saved");
      return record.current;
    };
    const promise = run()
      .catch((error) => {
        // A conflict requires review; validation/network failures can recover on edit.
        blocked.current =
          error instanceof ArticleRequestError && error.status === 409;
        if (mounted.current) {
          setError(error instanceof Error ? error.message : "تعذر الحفظ.");
          setStatus("error");
        }
        throw error;
      })
      .finally(() => {
        flight.current = null;
      });
    flight.current = promise;
    return promise;
  }, [initial.id]);
  useEffect(() => {
    if (status !== "dirty" || blocked.current) return;
    const timer = setTimeout(() => {
      void save().catch(() => {});
    }, 1800);
    return () => clearTimeout(timer);
  }, [fields, status, save]);
  useEffect(() => {
    mounted.current = true;
    const editorUrl = new URL(
      `/board/articles/${initial.id}/edit`,
      window.location.origin,
    ).href;
    const editorHistoryState = window.history.state;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (saved.current !== JSON.stringify(latest.current) || flight.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const navigation = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (
        !link ||
        link.getAttribute("target") === "_blank" ||
        link.getAttribute("href")?.startsWith("#")
      )
        return;
      if (
        saved.current !== JSON.stringify(latest.current) &&
        !window.confirm("عندك تعديلات لم تُحفظ. هل تريد مغادرة المحرر؟")
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save().catch(() => {});
      }
    };
    const unregisterGuard = registerGuard({
      url: editorUrl,
      shouldBlock: () => saved.current !== JSON.stringify(latest.current),
      historyState: () => historySnapshot.current?.state ?? editorHistoryState,
    });
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", navigation, true);
    document.addEventListener("keydown", shortcut);
    return () => {
      unregisterGuard();
      mounted.current = false;
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", navigation, true);
      document.removeEventListener("keydown", shortcut);
    };
  }, [save, initial.id, registerGuard]);
  const publish = useCallback(
    async (action: "publish" | "unpublish") => {
      setBusy(true);
      setError("");
      try {
        const current = await save();
        const result = await articleRequest<{ article: Article }>(
          `/api/board/articles/${initial.id}/publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action, revision: current.revision }),
          },
        );
        record.current = result.article;
        setArticle(result.article);
      } catch (error) {
        setError(error instanceof Error ? error.message : "تعذر النشر.");
      } finally {
        setBusy(false);
      }
    },
    [initial.id, save],
  );
  return { fields, article, status, error, busy, change, save, publish };
}
