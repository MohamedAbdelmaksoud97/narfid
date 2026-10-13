import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpLeft, CheckCircle2, FileText, Palette } from "lucide-react";
import { requireBoardMember } from "@/lib/auth/session";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "مجلس الإدارة | نرفد",
  robots: { index: false, follow: false },
};

async function BoardWorkspace() {
  const member = await requireBoardMember();
  return (
    <main className="board-workspace">
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
        <p>مساحة الفريق لإدارة محتوى نرفد، والرجوع إلى هويتها واتجاهها.</p>
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
        <div className="board-sections">
          <Card>
            <CardHeader>
              <Palette aria-hidden="true" />
              <CardTitle>هوية نرفد</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                الرؤية والرسالة، العملاء، صوت البراند وشخصيته، والمرجع البصري
                لفريقنا.
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href="/board/brand"
                className={buttonVariants({ size: "navigation" })}
              >
                استكشف هوية نرفد
                <ArrowUpLeft data-icon="inline-end" />
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <FileText aria-hidden="true" />
              <CardTitle>المقالات</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                اكتب محتوى نرفد، وراجع المسودات، وانشر ما يساعد المؤسسات
                الرياضية.
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href="/board/articles"
                className={buttonVariants({
                  variant: "outline",
                  size: "navigation",
                })}
              >
                إدارة المقالات
                <ArrowUpLeft data-icon="inline-end" />
              </Link>
            </CardFooter>
          </Card>
        </div>
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
