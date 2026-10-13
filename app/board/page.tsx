import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpLeft, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";
import { requireBoardMember } from "@/lib/auth/session";
import { logoutAction } from "@/app/login/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "مجلس الإدارة | نرفد",
  robots: { index: false, follow: false },
};

async function BoardWorkspace() {
  const member = await requireBoardMember();
  return (
    <main className="board-workspace">
      <header className="board-workspace-header">
        <div className="container">
          <Link href="/" aria-label="نرفد — الرئيسية" className="brand">
            <Image
              src="/logo.png"
              alt="نرفد"
              width={1672}
              height={941}
              sizes="280px"
            />
          </Link>
          <div className="board-workspace-actions">
            <Badge variant="secondary">
              <ShieldCheck />
              مجلس الإدارة
            </Badge>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="navigation">
                تسجيل الخروج
                <LogOut data-icon="inline-end" />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <section className="board-workspace-content container">
        <span className="section-kicker">
          <span className="status-dot" />
          مساحة نرفد الداخلية
        </span>
        <h1>
          أهلًا،
          <br />
          <span>{member.name}.</span>
        </h1>
        <p>تم تسجيل دخولك بنجاح. مساحة مجلس الإدارة جاهزة للخطوات القادمة.</p>
        <div className="board-member-card">
          <span className="board-member-icon">
            <CheckCircle2 />
          </span>
          <div>
            <h2>حسابك متصل</h2>
            <p>أنت داخل مساحة مجلس الإدارة بحسابك المخصّص.</p>
          </div>
          <dl>
            <div>
              <dt>الحساب</dt>
              <dd dir="ltr">{member.email}</dd>
            </div>
            <div>
              <dt>نوع الوصول</dt>
              <dd>عضو مجلس الإدارة</dd>
            </div>
          </dl>
        </div>
        <div className="board-next-step">
          <ShieldCheck />
          <div>
            <h2>نبدأ من هنا</h2>
            <p>سنضيف أقسام الإدارة ومحتواها هنا في المراحل القادمة.</p>
          </div>
        </div>
        <Link href="/board/articles" className={buttonVariants({ size: "marketing" })}>
          إدارة المقالات
          <ArrowUpLeft data-icon="inline-end" />
        </Link>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline", size: "marketing" })}
        >
          زيارة موقع نرفد
          <ArrowUpLeft data-icon="inline-end" />
        </Link>
      </section>
    </main>
  );
}

export default function BoardPage() {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ التحقق من حسابك…</p>
        </main>
      }
    >
      <BoardWorkspace />
    </Suspense>
  );
}
