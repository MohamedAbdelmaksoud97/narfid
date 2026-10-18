import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { requireBoardMember } from "@/lib/auth/session";
import { boardSections } from "@/lib/board-sections";
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
          أهلًا، <span>{member.name}.</span>
        </h1>
        <p>
          مساحة الفريق لمتابعة مهام نرفد وعلاقات العملاء والباقات والعقود
          والمالية، وإدارة المحتوى والتسويق والرجوع إلى الهوية وخطة الظهور في
          البحث.
        </p>
        <div className="board-sections">
          {boardSections
            .filter((section) => section.href !== "/board")
            .map((section) => (
              <Card key={section.href}>
                <CardHeader>
                  <section.icon aria-hidden="true" />
                  <CardTitle>{section.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{section.description}</p>
                </CardContent>
                <CardFooter>
                  <Link
                    href={section.href}
                    className={buttonVariants({
                      variant: "outline",
                      size: "navigation",
                    })}
                  >
                    {section.action}
                    <ArrowUpLeft data-icon="inline-end" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
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
        <p className="board-loading" role="status">
          جارٍ فتح مساحة الإدارة…
        </p>
      }
    >
      <BoardWorkspace />
    </Suspense>
  );
}
