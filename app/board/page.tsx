import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowUpLeft,
  FileText,
  ListChecks,
  Megaphone,
  Palette,
  Search,
} from "lucide-react";
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
          أهلًا، <span>{member.name}.</span>
        </h1>
        <p>
          مساحة الفريق لمتابعة مهام نرفد، وإدارة محتواها، والرجوع إلى هويتها
          وخطة ظهورها في البحث.
        </p>
        <div className="board-sections">
          <Card>
            <CardHeader>
              <Megaphone aria-hidden="true" />
              <CardTitle>التسويق</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                خطة نرفد التسويقية، وأدلة المنصات الاجتماعية، و٤٠ منشورًا مصورًا
                جاهزًا للمراجعة والتحميل.
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href="/board/marketing"
                className={buttonVariants({
                  variant: "outline",
                  size: "navigation",
                })}
              >
                افتح مساحة التسويق <ArrowUpLeft data-icon="inline-end" />
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <ListChecks aria-hidden="true" />
              <CardTitle>المهام القادمة</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                خطة إطلاق نرفد وتطويرها، بمهام رئيسية وفرعية وتقدم محفوظ لكل
                خطوة.
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href="/board/tasks"
                className={buttonVariants({ size: "navigation" })}
              >
                تابع خطة التنفيذ <ArrowUpLeft data-icon="inline-end" />
              </Link>
            </CardFooter>
          </Card>
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
          <Card>
            <CardHeader>
              <Search aria-hidden="true" />
              <CardTitle>تحسين الظهور في البحث</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                خطة الإطلاق والمقالات، وفهم القياس، وخطوات أسبوعية وشهرية لتطوير
                ظهور نرفد.
              </p>
            </CardContent>
            <CardFooter>
              <Link
                href="/board/seo"
                className={buttonVariants({
                  variant: "outline",
                  size: "navigation",
                })}
              >
                افتح دليل تحسين البحث <ArrowUpLeft data-icon="inline-end" />
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
