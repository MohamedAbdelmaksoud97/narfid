import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { TasksManager } from "@/components/board/tasks-manager";
import { loadTasks, TaskError, taskSession } from "@/lib/tasks-server";
import type { Task } from "@/lib/tasks";

export const metadata: Metadata = {
  title: "المهام القادمة | مجلس إدارة نرفد",
  robots: { index: false, follow: false },
};

async function Workspace() {
  let tasks: Task[];
  try {
    tasks = await loadTasks(await taskSession());
  } catch (error) {
    if (error instanceof TaskError && error.status === 401) redirect("/login");
    throw error;
  }
  return <TasksManager initialTasks={tasks} />;
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ تحميل المهام…</p>
        </main>
      }
    >
      <Workspace />
    </Suspense>
  );
}
