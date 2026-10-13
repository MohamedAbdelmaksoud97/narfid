import Image from "next/image";
import Link from "next/link";
export function PublicArticleHeader() {
  return (
    <header className="article-site-header container">
      <Link href="/" className="brand" aria-label="نرفد — الرئيسية">
        <Image
          src="/logo.png"
          alt="نرفد"
          width={1672}
          height={941}
          sizes="220px"
        />
      </Link>
      <nav aria-label="تصفح الموقع">
        <Link href="/articles">المقالات</Link>
        <Link href="/#contact">تواصل معنا</Link>
      </nav>
    </header>
  );
}
