import type { Metadata } from "next";
import { Suspense, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpLeft,
  Download,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { requireBoardMember } from "@/lib/auth/session";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  brand,
  brandSections,
  brandGoals,
  personas,
  brandValues,
  voiceRules,
  voiceExamples,
  brandColors,
  visualRules,
  customerJourney,
  contentPillars,
  channels,
  governance,
  marketSources,
} from "@/lib/brand";

export const metadata: Metadata = {
  title: "هوية نرفد | مجلس الإدارة",
  description:
    "مرجع فريق نرفد للرؤية والرسالة والتموضع والعملاء والصوت والهوية البصرية.",
  robots: { index: false, follow: false },
};

function BrandSection({
  id,
  title,
  english,
  description,
  children,
}: {
  id: string;
  title: string;
  english: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="brand-guide-section"
      aria-labelledby={`${id}-heading`}
    >
      <header className="brand-section-heading">
        <span className="section-kicker" lang="en" dir="ltr">
          {english}
        </span>
        <h2 id={`${id}-heading`}>{title}</h2>
        <p>{description}</p>
      </header>
      {children}
    </section>
  );
}

function TextCard({
  title,
  text,
  kicker,
  footer,
}: {
  title: string;
  text: string;
  kicker?: string;
  footer?: string;
}) {
  return (
    <Card>
      <CardHeader>
        {kicker && <CardDescription>{kicker}</CardDescription>}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{text}</p>
      </CardContent>
      {footer && (
        <CardFooter>
          <p>{footer}</p>
        </CardFooter>
      )}
    </Card>
  );
}

async function BrandWorkspace() {
  await requireBoardMember();
  return (
    <main className="board-workspace brand-guide">
      <header className="board-workspace-header">
        <div className="container">
          <Link
            href="/board"
            aria-label="نرفد — مجلس الإدارة"
            className="brand"
          >
            <Image
              src="/logo.png"
              alt="نرفد"
              width={1672}
              height={941}
              sizes="280px"
            />
          </Link>
          <Link
            href="/board"
            className={buttonVariants({
              variant: "outline",
              size: "navigation",
            })}
          >
            <ArrowRight data-icon="inline-start" /> مجلس الإدارة
          </Link>
        </div>
      </header>

      <div className="container">
        <header className="brand-guide-hero">
          <div className="brand-guide-meta">
            <Badge variant="secondary">
              <ShieldCheck /> مرجع الفريق
            </Badge>
            <span>
              إصدار {brand.version} · {brand.reviewedAt}
            </span>
          </div>
          <span className="section-kicker" lang="en" dir="ltr">
            THE NERVED BRAND
          </span>
          <h1>
            نرفد.
            <br />
            <span>تقنية تسند الطموح.</span>
          </h1>
          <p>
            مرجعنا المشترك لما نبنيه، ولمن نبنيه، وكيف نعبّر عنه. من منصة إدارة
            المؤسسات الرياضية إلى شراكة تقنية تنمو مع العميل.
          </p>
          <div className="brand-guide-hero-bottom">
            <p>{brand.descriptor}</p>
            <Link
              href="/board/articles"
              className={buttonVariants({
                variant: "outline",
                size: "navigation",
              })}
            >
              إلى مساحة المقالات <ArrowUpLeft data-icon="inline-end" />
            </Link>
          </div>
        </header>
        <Separator />

        <div className="brand-guide-layout">
          <aside className="brand-guide-index">
            <p>في هذا المرجع</p>
            <nav aria-label="أقسام هوية نرفد">
              {brandSections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span dir="ltr">{String(index + 1).padStart(2, "0")}</span>
                  {section.label}
                </a>
              ))}
            </nav>
            <span>
              الهوية البصرية الحالية، ومقترح استراتيجي يتطور مع تجربة العملاء.
            </span>
          </aside>

          <div className="brand-guide-content">
            <BrandSection
              id="foundation"
              title="السند يبدأ من فهم العمل."
              english="01 / Brand foundation"
              description="هويتنا التجارية، ومكاننا في السوق، والقيمة التي نعد بتقديمها."
            >
              <blockquote className="brand-statement">{brand.idea}</blockquote>
              <div className="brand-grid brand-grid-two">
                <TextCard
                  title="القصة والمعنى"
                  text={brand.story}
                  kicker="نرفد / Nerved"
                />
                <TextCard
                  title="تموضعنا"
                  text={brand.positioning}
                  kicker="مزوّد تقني للمؤسسات الرياضية"
                />
              </div>
              <div className="brand-promise">
                <span>وعد البراند</span>
                <h3>{brand.promise}</h3>
                <p>
                  نقيسه بوضوح رحلة العمل، وتبنّي الفريق، واستمرار قيمة المنصة
                  للمؤسسة.
                </p>
              </div>
              <TextCard
                title="تعريف نرفد في 30 ثانية"
                text={brand.pitch}
                footer={brand.proof}
              />
            </BrandSection>

            <BrandSection
              id="direction"
              title="وجهة واضحة. وخطوات قابلة للقياس."
              english="02 / Vision, mission & goals"
              description="صياغة مقترحة للرؤية والرسالة. الأهداف التالية خطة عمل، وتُراجع بالأرقام الفعلية عند بدء التنفيذ."
            >
              <div className="brand-grid brand-grid-two">
                <TextCard
                  title="الرؤية"
                  text={brand.vision}
                  kicker="Vision / إلى أين نتجه"
                />
                <TextCard
                  title="الرسالة"
                  text={brand.mission}
                  kicker="Mission / ماذا نفعل كل يوم"
                />
              </div>
              <div className="brand-north-star">
                <span>مقياسنا الأهم</span>
                <p>{brand.northStar}</p>
              </div>
              <div className="brand-grid">
                {brandGoals.map((goal) => (
                  <TextCard
                    key={goal.title}
                    title={goal.title}
                    text={goal.description}
                    kicker={goal.horizon}
                    footer={`نتابع: ${goal.measure}`}
                  />
                ))}
              </div>
            </BrandSection>

            <BrandSection
              id="market"
              title="السعودية هي نقطة البداية."
              english="03 / Market context"
              description="السياق العام يدعم اختيار القطاع، بينما المقابلات والاستخدام الفعلي يحددان الطلب على نرفد."
            >
              <TextCard
                title="من نخدم أولًا؟"
                text={brand.target}
                footer="نعطي الأولوية لمؤسسة لديها عمليات متكررة، وصاحب قرار متاح، وفريق مستعد لتبنّي المنصة. الأكاديميات تُقيّم بحسب نطاق العضويات والحجوزات الذي تحتاجه."
              />
              <div className="brand-grid">
                {marketSources.map((source) => (
                  <Card key={source.title}>
                    <CardHeader>
                      <CardTitle>{source.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{source.fact}</p>
                      <p className="brand-source-reading">
                        {source.implication}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <a
                        className="brand-source-link"
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        المصدر الرسمي <ExternalLink aria-hidden="true" />
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </BrandSection>

            <BrandSection
              id="personas"
              title="نخاطب القرار. ونفهم المستخدم."
              english="04 / Client personas"
              description="شخصيات مبنية على أدوار التشغيل في المنصة؛ فرضيات للمقابلات وليست نتائج بحث ميداني مكتمل. الشخص الواحد قد يجمع أكثر من دور."
            >
              <div className="brand-grid brand-grid-two">
                {personas.map((persona) => (
                  <Card key={persona.title}>
                    <CardHeader>
                      <CardDescription>{persona.role}</CardDescription>
                      <CardTitle>{persona.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{persona.context}</p>
                      <dl className="brand-details">
                        <div>
                          <dt>ما يحتاجه</dt>
                          <dd>{persona.needs}</dd>
                        </div>
                        <div>
                          <dt>ما يعطّل عمله</dt>
                          <dd>{persona.pain}</dd>
                        </div>
                        <div>
                          <dt>السؤال قبل الشراء</dt>
                          <dd>{persona.objection}</dd>
                        </div>
                        <div>
                          <dt>كيف نثبت القيمة</dt>
                          <dd>{persona.proof}</dd>
                        </div>
                      </dl>
                    </CardContent>
                    <CardFooter>
                      <p>رسالتنا له: {persona.message}</p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </BrandSection>

            <BrandSection
              id="character"
              title="مساند. عملي. واضح. وطموح."
              english="05 / Values & personality"
              description="شخصية نرفد تظهر في السلوك بقدر ما تظهر في الكلمات. نموذجنا: شريك يفهم التفاصيل ويقترح خطوة مفيدة."
            >
              <div className="brand-grid brand-grid-two">
                {brandValues.map((value) => (
                  <TextCard
                    key={value.title}
                    title={value.title}
                    text={value.text}
                    kicker={`شخصيتنا: ${value.trait}`}
                    footer={value.behavior}
                  />
                ))}
              </div>
            </BrandSection>

            <BrandSection
              id="voice"
              title="نتحدث بوضوح، ونترك الدليل يتكلم."
              english="06 / Voice & messaging"
              description="صوت واحد في الموقع والعروض والمقالات والدعم. العربية المهنية البسيطة هي الأساس؛ المصطلحات الإنجليزية حين تضيف معنى."
            >
              <div className="brand-grid brand-grid-two">
                {voiceRules.map((rule) => (
                  <TextCard
                    key={rule.title}
                    title={rule.title}
                    text={rule.text}
                  />
                ))}
              </div>
              <div className="brand-voice-examples">
                {voiceExamples.map((example) => (
                  <Card key={example.context}>
                    <CardHeader>
                      <CardTitle>{example.context}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="brand-details">
                        <div>
                          <dt>نكتب</dt>
                          <dd>{example.use}</dd>
                        </div>
                        <div>
                          <dt>نتجنّب</dt>
                          <dd>{example.avoid}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <TextCard
                title="قاموسنا"
                text="نرفد، المؤسسة الرياضية، الأعضاء، الاشتراكات، الحجوزات، فريق العمل، الفروع، المنظومة، الشراكة التقنية. نعطي كل ميزة اسمًا ثابتًا في الشرح والواجهة والعروض."
                footer="الدعوة الأساسية: «احجز عرضًا توضيحيًا». للشراكة التقنية: «ناقش احتياج مؤسستك». نربط النتيجة بالميزة التي تحققها."
              />
            </BrandSection>

            <BrandSection
              id="visuals"
              title="هوية هادئة. وإشارة خضراء واضحة."
              english="07 / Visual identity"
              description="ألوان المشروع الحالية مع Tajawal والشعارين الموجودين. نستخدم الهوية نفسها في المنتج والموقع والمحتوى."
            >
              <div className="brand-grid brand-grid-two">
                <Card>
                  <CardHeader>
                    <CardTitle>الشعار الكامل</CardTitle>
                    <CardDescription>
                      للتعريف بنرفد في المساحات الرئيسية.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="brand-logo-preview">
                      <Image
                        src="/logo.png"
                        alt="شعار نرفد الكامل"
                        width={1672}
                        height={941}
                        sizes="(max-width: 719px) 300px, 350px"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a
                      href="/logo.png"
                      download="nerved-logo.png"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      <Download data-icon="inline-start" /> تنزيل الشعار
                    </a>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>رمز نرفد</CardTitle>
                    <CardDescription>
                      لأيقونة التطبيق والصورة الرمزية والمساحات الصغيرة.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="brand-logo-preview brand-symbol-preview">
                      <Image
                        src="/logo%20symbol.png"
                        alt="رمز نرفد"
                      width={1254}
                      height={1254}
                        sizes="160px"
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <a
                      href="/logo%20symbol.png"
                      download="nerved-symbol.png"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      <Download data-icon="inline-start" /> تنزيل الرمز
                    </a>
                  </CardFooter>
                </Card>
              </div>
              <div className="brand-grid brand-colors">
                {brandColors.map((color) => (
                  <Card key={color.token} size="sm">
                    <CardHeader>
                      <CardTitle>{color.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="brand-color-swatch"
                        aria-hidden="true"
                        style={{ "--swatch-color": color.hex } as CSSProperties}
                      />
                      <p className="brand-color-value" dir="ltr">
                        {color.hex}
                      </p>
                      <p>{color.role}</p>
                    </CardContent>
                    <CardFooter>
                      <code dir="ltr">{color.token}</code>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Tajawal / تجوال</CardTitle>
                  <CardDescription>
                    الخط الموحد للهوية. الأوزان المستخدمة في المشروع: 400، 500،
                    700، 800.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="brand-type-specimen">
                    <span>عنوان رئيسي · 800</span>
                    <p>تقنية تسند الطموح.</p>
                  </div>
                  <div className="brand-type-specimen">
                    <span>عنوان قسم · 700</span>
                    <p>كل تفاصيل مؤسستك، في منظومة واحدة.</p>
                  </div>
                  <div className="brand-type-specimen">
                    <span>نص قراءة · 400</span>
                    <p>
                      نربط الأعضاء والاشتراكات والحجوزات والمبيعات والفروع،
                      لنمنح فريقك طريقة أوضح للعمل.
                    </p>
                  </div>
                  <p lang="en" dir="ltr" className="brand-latin-specimen">
                    Nerved. Technology that supports your ambition.
                  </p>
                </CardContent>
              </Card>
              <div className="brand-grid brand-grid-two">
                {visualRules.map((rule) => (
                  <TextCard
                    key={rule.title}
                    title={rule.title}
                    text={rule.text}
                  />
                ))}
              </div>
            </BrandSection>

            <BrandSection
              id="experience"
              title="وعدنا يظهر في كل خطوة."
              english="08 / Customer experience"
              description="معيار تجربة نبنيه مع الفريق. تفاصيل المدد والدعم والتسليم تُحدد في نطاق التعاقد."
            >
              <ol className="brand-journey">
                {customerJourney.map((step, index) => (
                  <li key={step.title}>
                    <span dir="ltr">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </BrandSection>

            <BrandSection
              id="growth"
              title="نُظهر القيمة قبل طلب الشراء."
              english="09 / Content & growth"
              description="محتوى من داخل العمل الرياضي، وعروض تشرح الاستخدام، وقياس يربط النشاط بطلبات مؤهلة وتجديدات."
            >
              <div className="brand-grid brand-grid-two">
                {contentPillars.map((pillar) => (
                  <TextCard
                    key={pillar.title}
                    title={pillar.title}
                    text={pillar.example}
                    footer={`لمن نكتب: ${pillar.audience}`}
                  />
                ))}
              </div>
              <div className="brand-grid">
                {channels.map((channel) => (
                  <TextCard
                    key={channel.title}
                    title={channel.title}
                    text={channel.text}
                  />
                ))}
              </div>
              <TextCard
                title="كيف نعرف أن الرسالة تعمل؟"
                text="نتابع الطلبات المؤهلة، ونسبة انتقال العرض إلى اتفاق، وتبنّي الفريق، وأسباب عدم الاستمرار. الإيراد المتكرر يخص اشتراك المنصة، وتُتابع إيرادات التطوير المخصص بشكل مستقل لفهم تكلفة كل نشاط."
                footer="نختبر الرسائل مع العملاء، ونسجّل ما يتكرر في أسئلتهم بدل افتراض ملاءمة كل قناة أو شريحة."
              />
            </BrandSection>

            <BrandSection
              id="governance"
              title="مرجع واحد لفريق يتكلم بصوت واحد."
              english="10 / Governance"
              description="قواعد عملية للمبيعات والتسويق والمنتج والدعم. الموجّهات الاستراتيجية هنا مقترحة؛ الهوية البصرية تعكس المشروع الحالي."
            >
              <div className="brand-grid brand-grid-two">
                {governance.map((rule) => (
                  <TextCard
                    key={rule.title}
                    title={rule.title}
                    text={rule.text}
                  />
                ))}
              </div>
              <p className="brand-guide-closing">
                قبل أي رسالة: لمن نكتب؟ ما احتياجه؟ ما الدليل؟ وما الخطوة
                التالية؟
              </p>
            </BrandSection>
          </div>
        </div>
        <footer className="brand-guide-footer">
          <span>نرفد / Nerved · {brand.descriptor}</span>
          <a href="#" className="brand-source-link">
            العودة إلى بداية المرجع ↑
          </a>
        </footer>
      </div>
    </main>
  );
}

export default function BrandPage() {
  return (
    <Suspense
      fallback={
        <main className="board-loading-page">
          <p role="status">جارٍ تحميل هوية نرفد…</p>
        </main>
      }
    >
      <BrandWorkspace />
    </Suspense>
  );
}
