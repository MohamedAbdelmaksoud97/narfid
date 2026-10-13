"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="articles-public container">
      <h1>تعذر تحميل المقالات</h1>
      <p>حاول مرة أخرى بعد قليل.</p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </main>
  );
}
