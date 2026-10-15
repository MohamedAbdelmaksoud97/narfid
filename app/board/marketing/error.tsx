"use client";
import { Button } from "@/components/ui/button";
export default function MarketingError({ reset }: { reset: () => void }) {
  return (
    <main className="marketing-social container">
      <h1>تعذر فتح مساحة التسويق</h1>
      <p>تحقق من اتصالك وصلاحيات حسابك، ثم أعد المحاولة.</p>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </main>
  );
}
