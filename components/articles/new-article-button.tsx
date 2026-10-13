"use client";
import { useRef, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { articleRequest } from "@/lib/articles/browser";
import type { Article } from "@/lib/articles/types";
const subscribe = () => () => {};
export function NewArticleButton() {
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const router = useRouter();
  const id = useRef<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [navigating, startNavigation] = useTransition();
  async function create() {
    setPending(true);
    setError("");
    id.current ??= crypto.randomUUID();
    try {
      const { article } = await articleRequest<{ article: Article }>(
        "/api/board/articles",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id.current }),
        },
      );
      id.current = null;
      setPending(false);
      startNavigation(() => router.push(`/board/articles/${article.id}/edit`));
    } catch (error) {
      setError(error instanceof Error ? error.message : "تعذر إنشاء المقال.");
      setPending(false);
    }
  }
  return (
    <div className="new-article-action">
      <Button
        disabled={pending || navigating || !ready}
        onClick={() => void create()}
      >
        <Plus data-icon="inline-start" />
        {pending || navigating ? "جارٍ فتح المسودة…" : "مقال جديد"}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
