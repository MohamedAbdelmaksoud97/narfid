import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { requireBoardMember } from "@/lib/auth/session";
import { BoardShell } from "@/components/board/board-shell";

async function AuthenticatedWorkspace({ children }: { children: ReactNode }) {
  const member = await requireBoardMember();
  const preferences = await cookies();
  return (
    <BoardShell
      member={{ name: member.name, email: member.email }}
      defaultOpen={preferences.get("nerved_board_sidebar")?.value !== "false"}
    >
      {children}
    </BoardShell>
  );
}

export default function BoardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ فتح لوحة الإدارة…</p>
        </main>
      }
    >
      <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
    </Suspense>
  );
}
