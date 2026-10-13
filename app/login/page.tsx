import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getBoardMember } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "دخول مجلس الإدارة | نرفد",
  robots: { index: false, follow: false },
};

async function LoginContent() {
  if (await getBoardMember()) redirect("/board");
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <main className="board-auth-page">
      <header className="board-auth-header container">
        <Link href="/" aria-label="نرفد — الرئيسية" className="brand">
          <Image
            src="/logo.png"
            alt="نرفد"
            width={1672}
            height={941}
            sizes="280px"
          />
        </Link>
        <Link href="/" className="board-home-link">
          <ArrowRight />
          العودة إلى الموقع
        </Link>
      </header>
      <div className="board-auth-layout container">
        <section className="board-auth-intro">
          <span className="section-kicker">
            <ShieldCheck />
            مساحة مجلس الإدارة
          </span>
          <h1>
            مساحة القرار.
            <br />
            <span>لمن يقود نرفد.</span>
          </h1>
          <p>
            أهلًا بك في مساحة مجلس الإدارة. سجّل دخولك للوصول إلى منصة نرفد
            الداخلية.
          </p>
          <div className="board-auth-mark" aria-hidden="true">
            <span className="brand brand-symbol">
              <Image
                src="/logo%20symbol.png"
                alt=""
                width={1254}
                height={1254}
                sizes="92px"
              />
            </span>
            <span>السند التقني للمؤسسات الرياضية</span>
          </div>
        </section>
        <section className="board-login-panel" aria-labelledby="login-heading">
          <div className="board-login-heading">
            <span className="board-lock">
              <ShieldCheck />
            </span>
            <h2 id="login-heading">مرحبًا بعودتك</h2>
            <p>أدخل بيانات حسابك للمتابعة.</p>
          </div>
          <Suspense
            fallback={
              <p className="board-loading" role="status">
                جارٍ التحقق من الجلسة…
              </p>
            }
          >
            <LoginContent />
          </Suspense>
        </section>
      </div>
      <footer className="board-auth-footer container">
        © ٢٠٢٦ نرفد. مساحة مخصّصة لمجلس الإدارة.
      </footer>
    </main>
  );
}
