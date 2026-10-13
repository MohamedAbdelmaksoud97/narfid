"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="articles-manager container">
      <h1>تعذر فتح مساحة المقالات</h1>
      <p>تحقق من اتصالك وصلاحية حسابك، ثم أعد المحاولة.</p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </main>
  );
}
