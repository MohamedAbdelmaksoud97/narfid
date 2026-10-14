"use client";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function TasksError({ reset }: { reset: () => void }) {
  return (
    <main className="tasks-manager container">
      <Alert variant="destructive">
        <AlertTitle>تعذر فتح المهام</AlertTitle>
        <AlertDescription>
          تحقق من الاتصال وصلاحيات حسابك ثم أعد المحاولة.
        </AlertDescription>
      </Alert>
      <Button onClick={reset}>إعادة المحاولة</Button>
    </main>
  );
}
