import Image from "next/image";
import Link from "next/link";
import { MemberAppSection } from "@/components/member-app-section";
import { IdentityServiceSection } from "@/components/identity-service-section";
import type { ReactNode } from "react";
import { DemoButton, LandingDemo } from "@/components/landing-demo";
import { LandingHeader } from "@/components/landing-header";
import {
  ArrowDownLeft,
  ArrowUpLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChefHat,
  ChevronLeft,
  Fingerprint,
  GitBranch,
  Layers3,
  MessageCircle,
  Package,
  Play,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  faqs,
  features,
  navigation,
  plans,
  whatsappUrl,
} from "@/lib/landing-content";

const money = new Intl.NumberFormat("en-US");

function Brand({ symbol = false }: { symbol?: boolean }) {
  return (
    <span className={cn("brand", symbol && "brand-symbol")}>
      <Image
        src={symbol ? "/images/narfid-symbol-192.webp" : "/images/narfid-logo-640.webp"}
        alt={symbol ? "" : "نرفد — السند التقني للمؤسسات الرياضية"}
        width={symbol ? 192 : 640}
        height={symbol ? 192 : 360}
        loading={symbol ? "lazy" : "eager"}
        unoptimized
      />
    </span>
  );
}

function SystemScreenshot() {
  return (
    <div className="preview-stage" id="preview">
      <div className="preview-glow" aria-hidden="true" />
      <figure className="system-shot-frame">
        <a
          href="/images/nerved-dashboard.png"
          target="_blank"
          rel="noopener noreferrer"
          className="system-shot-link"
          aria-label="عرض لقطة لوحة التحكم بالحجم الكامل"
        >
          {/* The source files are pre-sized so the browser can pick one directly. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/nerved-dashboard-768.webp"
            srcSet="/images/nerved-dashboard-480.webp 480w, /images/nerved-dashboard-768.webp 768w, /images/nerved-dashboard-1320.webp 1320w"
            alt="لوحة التحكم الفعلية للنظام بهوية نرفد: الأعضاء والاشتراكات والحضور والإيرادات، بأرقام توضيحية"
            width={1586}
            height={992}
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 719px) calc(100vw - 40px), (max-width: 959px) 630px, (max-width: 1199px) 48vw, 660px"
            className="system-shot-image"
          />
        </a>
        <figcaption className="system-shot-caption">
          <span>
            <i className="status-dot" /> لقطة من النظام بهوية نرفد · بيانات
            توضيحية
          </span>
          <a
            href="/images/nerved-dashboard.png"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="فتح صورة النظام بالحجم الكامل"
          >
            <ArrowUpRight aria-hidden="true" />
          </a>
        </figcaption>
      </figure>
    </div>
  );
}

function FeatureVisual({ kind }: { kind: (typeof features)[number]["kind"] }) {
  if (kind === "members")
    return (
      <div className="feature-visual member-visual">
        <div className="avatar-stack" aria-hidden="true">
          <span>أ</span>
          <span>م</span>
          <span>س</span>
          <span>ن</span>
        </div>
        <div>
          <span className="mini-label">رحلة العضو</span>
          <div className="mini-steps">
            <span>اشتراك</span>
            <ChevronLeft />
            <span>حضور</span>
            <ChevronLeft />
            <span>تجديد</span>
          </div>
        </div>
      </div>
    );
  if (kind === "finance")
    return (
      <div className="feature-visual finance-visual">
        <span className="mini-label">الاشتراكات + المبيعات</span>
        <div className="mini-bars" aria-hidden="true">
          {[35, 55, 42, 75, 60, 89, 74, 100, 86, 110].map((height, index) => (
            <i key={index} style={{ height: height / 2 }} />
          ))}
        </div>
      </div>
    );
  if (kind === "kitchen")
    return (
      <div className="feature-visual">
        <div className="meal-symbol">
          <ChefHat />
        </div>
        <div>
          <span className="mini-label">قائمة اليوم</span>
          <strong className="mini-value">تحضير ← صرف ← متابعة</strong>
        </div>
        <Badge variant="secondary">متصل</Badge>
      </div>
    );
  if (kind === "inventory")
    return (
      <div className="feature-visual inventory-visual">
        <div className="inventory-line">
          <Package />
          <span>مخزون المنتجات</span>
          <Badge variant="outline">حسب الفرع</Badge>
        </div>
        <div className="inventory-track" aria-hidden="true">
          <i />
        </div>
        <div className="inventory-labels">
          <span>المتاح</span>
          <span>المحجوز</span>
          <span>المباع</span>
        </div>
      </div>
    );
  if (kind === "bookings")
    return (
      <div className="feature-visual bookings-visual">
        {["16:00", "17:00", "18:00", "19:00"].map((time, i) => (
          <span
            key={time}
            className={cn("time-slot", i === 1 && "time-slot-active")}
          >
            <small dir="ltr">{time}</small>
            <i>{i === 1 ? "محجوز" : "متاح"}</i>
          </span>
        ))}
      </div>
    );
  return (
    <div className="feature-visual branches-visual">
      <span className="branch-node">
        <GitBranch />
        فرع ٠١
      </span>
      <i />
      <span className="branch-hub">
        <Layers3 />
      </span>
      <i />
      <span className="branch-node">
        <GitBranch />
        فرع ٠٢
      </span>
    </div>
  );
}

const featurePaths = { members: "memberships", finance: "point-of-sale", kitchen: "kitchen-inventory", inventory: "kitchen-inventory", bookings: "bookings", branches: "branches" };

export function LandingPage({ articles }: { articles: ReactNode }) {
  return (
    <LandingDemo>
      <div className="landing">
        <a className="skip-link" href="#main">
          انتقل إلى المحتوى
        </a>
        <LandingHeader brand={<Brand />} />

        <main id="main">
          <section className="hero container" id="home">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="status-dot" /> السند التقني للمؤسسات الرياضية
              </div>
              <h1>
                كل تفاصيل ناديك.
                <br />
                <span>في منظومة واحدة.</span>
              </h1>
              <p className="hero-description">
                من استقبال أول عضو إلى إدارة كل فرع، نرفد يجمع اشتراكاتك
                وحجوزاتك ومبيعاتك وتشغيلك اليومي. لتمنح ناديك وقتًا أكبر للنمو.
              </p>
              <div className="hero-actions">
                <DemoButton size="marketing" data-analytics="demo_request_start">
                  خلّنا نرفد ناديك <ArrowUpLeft data-icon="inline-end" />
                </DemoButton>
                <a
                  href="#platform"
                  className={buttonVariants({
                    variant: "outline",
                    size: "marketing",
                  })}
                >
                  <Play data-icon="inline-start" />
                  اكتشف المنظومة
                </a>
              </div>
              <div className="hero-benefits">
                <span>
                  <Check /> اشتراك سنوي واضح
                </span>
                <span>
                  <Check /> تجربة عربية
                </span>
                <span>
                  <Check /> تنمو مع فروعك
                </span>
              </div>
              <div className="hero-footnote">
                <span className="tiny-line" />
                <span dir="ltr">BUILT FOR SPORTS. DESIGNED FOR GROWTH.</span>
              </div>
            </div>
            <SystemScreenshot />
            <a href="#platform" className="explore-hint">
              اكتشف ما يمكن لنرفد أن يضيفه <ArrowDownLeft />
            </a>
          </section>

          <section className="audience-strip" aria-label="المؤسسات التي نخدمها">
            <div className="container audience-inner">
              <div className="client-origin">
                <span className="muted">انطلقت رحلتنا مع أول عميل</span>
                <strong dir="ltr">
                  GO<span>FITNESS</span>
                  <ArrowUpRight />
                </strong>
              </div>
              <Separator orientation="vertical" />
              <div className="audience-list">
                <span>للأندية الرياضية</span>
                <span>لمراكز اللياقة</span>
                <span>للملاعب والأكاديميات</span>
                <span>للمؤسسات متعددة الفروع</span>
              </div>
            </div>
          </section>

          <section
            className="platform-section container section-space"
            id="platform"
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  <span>01</span> منظومة متكاملة
                </span>
                <h2>
                  من أول اشتراك،
                  <br />
                  <span className="muted">إلى آخر تفصيلة.</span>
                </h2>
              </div>
              <p>
                كل جزء من ناديك متصل بالآخر.
                <br />
                ونرفد يجمع هذه التفاصيل في مكان واحد،
                <br />
                ليصبح التشغيل أسهل والقرار أوضح.
              </p>
            </div>
            <div className="features-grid">
              {features.map(
                ({ number, icon: Icon, title, description, kind, detail }) => (
                  <Card key={number} className="feature-card">
                    <CardHeader>
                      <div className="feature-card-top">
                        <span className="feature-icon">
                          <Icon />
                        </span>
                        <span className="feature-number" dir="ltr">
                          {number}
                        </span>
                      </div>
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FeatureVisual kind={kind} />
                    </CardContent>
                    <CardFooter>
                      <Link href={`/solutions/${featurePaths[kind]}`}>{detail}</Link>
                      <ArrowUpLeft aria-hidden="true" />
                    </CardFooter>
                  </Card>
                ),
              )}
            </div>
            <p className="feature-note">
              <Layers3 /> تتوفر الوحدات حسب الباقة المختارة. يمكنك البدء بما
              تحتاجه والتوسّع لاحقًا.
            </p>
          </section>

          <section className="connected-section" id="why-nerved">
            <div className="container connected-layout section-space">
              <div className="connected-copy">
                <span className="section-kicker">
                  <span>02</span> تشغيل مترابط
                </span>
                <h2>
                  فريقك يعمل معًا.
                  <br />
                  <span className="text-primary">وأنت ترى الصورة كاملة.</span>
                </h2>
                <p>
                  الاستقبال يعرف حالة العضو. نقطة البيع تسجّل الحركة. المطبخ
                  يتابع الوجبة. والإدارة تراجع كل ذلك من منظومة واحدة.
                </p>
                <div className="connected-points">
                  <div>
                    <ShieldCheck />
                    <div>
                      <h3>كل دور، بصلاحياته</h3>
                      <p>
                        من الموظف إلى مدير الفرع، وصول يناسب مسؤولية كل شخص.
                      </p>
                    </div>
                  </div>
                  <div>
                    <GitBranch />
                    <div>
                      <h3>كل فرع، ضمن رؤيتك</h3>
                      <p>
                        تشغيل حسب الفرع، وتقارير تجمع لك ما تحتاجه لاتخاذ
                        القرار.
                      </p>
                    </div>
                  </div>
                  <div>
                    <ReceiptText />
                    <div>
                      <h3>كل حركة، لها سجل</h3>
                      <p>
                        تابع السجلات التشغيلية والمالية ومَن نفّذ التغييرات.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="connection-map"
                aria-label="تربط نرفد الاستقبال والاشتراكات والمطبخ ونقاط البيع والحجوزات والإدارة"
              >
                <div className="map-ring map-ring-outer" />
                <div className="map-ring map-ring-inner" />
                <div className="map-axis map-axis-horizontal" />
                <div className="map-axis map-axis-vertical" />
                <div className="map-hub">
                  <Brand symbol />
                  <strong>نرفد</strong>
                  <span>منظومة واحدة</span>
                </div>
                {[
                  { label: "الاستقبال", icon: UsersRound, position: "top" },
                  {
                    label: "الاشتراكات",
                    icon: ReceiptText,
                    position: "right-top",
                  },
                  { label: "المطبخ", icon: ChefHat, position: "right-bottom" },
                  { label: "نقاط البيع", icon: Package, position: "bottom" },
                  {
                    label: "الحجوزات",
                    icon: CalendarDays,
                    position: "left-bottom",
                  },
                  {
                    label: "الإدارة والفروع",
                    icon: GitBranch,
                    position: "left-top",
                  },
                ].map(({ label, icon: Icon, position }) => (
                  <div
                    className={cn("map-node", "map-node-" + position)}
                    key={label}
                  >
                    <Icon />
                    <span>{label}</span>
                    <i />
                  </div>
                ))}
                <span className="map-caption" dir="ltr">
                  ONE CONNECTED WORKSPACE
                </span>
              </div>
            </div>
          </section>

          <MemberAppSection />
          <IdentityServiceSection />

          <section
            className="pricing-section container section-space"
            id="pricing"
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  <span>03</span> باقات تنمو معك
                </span>
                <h2>
                  ابدأ باحتياجك.
                  <br />
                  <span className="muted">وتوسّع بطموحك.</span>
                </h2>
              </div>
              <div className="pricing-intro">
                <p>
                  اشتراكات سنوية، بمميزات واضحة.
                  <br />
                  اختر ما يناسب تشغيلك اليوم، واترك مساحة للغد.
                </p>
                <Badge variant="outline">
                  <CalendarDays />
                  فوترة سنوية
                </Badge>
              </div>
            </div>
            <div className="pricing-grid">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "plan-wrapper",
                    plan.recommended && "plan-recommended",
                  )}
                >
                  {plan.recommended && (
                    <div className="recommended-label">
                      <Sparkles /> اختيارنا للنادي المتكامل
                    </div>
                  )}
                  <Card className="plan-card">
                    <CardHeader>
                      <div className="plan-top">
                        <CardTitle>{plan.name}</CardTitle>
                        <span dir="ltr">{plan.english}</span>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="plan-price">
                        <strong dir="ltr">{money.format(plan.annual)}</strong>
                        <span>
                          ر.س <small>/ سنويًا</small>
                        </span>
                      </div>
                      <p className="monthly-equivalent">
                        ما يعادل {money.format(plan.monthly)} ر.س شهريًا، بفوترة
                        سنوية
                      </p>
                      <span className="plan-branch">
                        <GitBranch />
                        {plan.branches}
                      </span>
                      <Separator />
                      <p className="plan-includes">{plan.intro}</p>
                      <ul>
                        {plan.features.map((feature) => (
                          <li key={feature}>
                            <Check />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <DemoButton
                        size="marketing"
                        variant={plan.recommended ? "default" : "outline"}
                        className="w-full"
                        plan={plan.name}
                      >
                        {plan.cta}
                        <ArrowUpLeft data-icon="inline-end" />
                      </DemoButton>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
            <p className="pricing-note">
              أسعار إطلاق مقترحة. الضرائب وتكاليف الأجهزة والتخصيص تُحدَّد في
              عرض السعر النهائي.
            </p>
            <div className="enterprise-card">
              <div className="enterprise-brand">
                <span className="enterprise-icon">
                  <Fingerprint />
                </span>
                <span dir="ltr">BEYOND SOFTWARE</span>
              </div>
              <div className="enterprise-copy">
                <Badge variant="secondary">شراكة تقنية</Badge>
                <h3>
                  احتياجك أبعد من باقة؟
                  <br />
                  نبنيه معك.
                </h3>
                <p>
                  تطبيق باسم ناديك، ربط بوابات الدخول، تكامل مع أنظمتك، أو تطوير
                  خاص. ندرس احتياجك ونصمّم نطاقًا يناسبه.
                </p>
                <div className="enterprise-options">
                  <span>
                    <Smartphone />
                    تطبيق مخصص
                  </span>
                  <span>
                    <Fingerprint />
                    بوابات دخول
                  </span>
                  <span>
                    <Layers3 />
                    تكاملات وتطوير
                  </span>
                </div>
              </div>
              <div className="enterprise-action">
                <strong>حسب نطاق المشروع</strong>
                <span>خدمات مخصصة تضاف إلى اشتراك المنصة</span>
                <DemoButton
                  variant="outline"
                  size="marketing"
                  plan="شراكة تقنية"
                >
                  ناقش مشروعك معنا
                  <ArrowUpLeft data-icon="inline-end" />
                </DemoButton>
              </div>
            </div>
          </section>

          <section className="onboarding-section container">
            <div className="onboarding-heading">
              <span className="section-kicker">
                <span>04</span> بداية واضحة
              </span>
              <h2>
                من التعارف،
                <br />
                إلى أول يوم تشغيل.
              </h2>
              <p>نبدأ بفهم مؤسستك، ونرتّب معك خطوات الانطلاق.</p>
            </div>
            <div className="onboarding-steps">
              {[
                {
                  number: "01",
                  title: "نفهم ناديك",
                  description: "عرض توضيحي ومناقشة نشاطك وفروعك وأولوياتك.",
                },
                {
                  number: "02",
                  title: "نجهّز منظومتك",
                  description: "نتفق على الباقة والإعداد ونطاق نقل البيانات.",
                },
                {
                  number: "03",
                  title: "ننطلق مع فريقك",
                  description: "تهيئة الأدوار وتعريف الفريق بسير العمل.",
                },
              ].map((step) => (
                <div className="onboarding-step" key={step.number}>
                  <span className="step-number" dir="ltr">
                    {step.number}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          {articles}

          <section className="faq-section container section-space" id="faq">
            <div className="faq-copy">
              <span className="section-kicker">
                <span>05</span> أسئلة تهمّك
              </span>
              <h2>
                الصورة أوضح،
                <br />
                <span className="muted">قبل أن تبدأ.</span>
              </h2>
              <p>
                لو عندك سؤال عن تشغيل مؤسستك،
                <br />
                يسعدنا نتكلم معك.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                تواصل مع فريق نرفد
                <MessageCircle />
              </a>
            </div>
            <Accordion defaultValue={["faq-0"]}>
              {faqs.map((faq, index) => (
                <AccordionItem value={"faq-" + index} key={faq.question}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>
                    <p>{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <section className="cta-section container" id="contact">
            <div className="cta-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="cta-copy">
              <span className="cta-kicker">أنت تبني ناديك. ونحن نرفدك.</span>
              <h2>
                الخطوة الجاية لناديك،
                <br />
                تبدأ من هنا.
              </h2>
              <p>خلّنا نريك كيف يمكن لنرفد أن يخدم مؤسستك.</p>
            </div>
            <DemoButton size="marketing" data-analytics="demo_request_start">
              احجز عرضًا توضيحيًا
              <ArrowUpLeft data-icon="inline-end" />
            </DemoButton>
          </section>
        </main>

        <footer className="site-footer container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#home" aria-label="نرفد — الرئيسية">
                <Brand />
              </a>
              <p>
                السند التقني للمؤسسات الرياضية.
                <br />
                نرفد تشغيلك، لتتفرّغ لنموّه.
              </p>
            </div>
            <div className="footer-links">
              <span>اكتشف نرفد</span>
              {navigation.slice(0, 4).map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
              <Link href="/pricing">تفاصيل الباقات السنوية</Link>
              <Link href="/technology-partnership">الشراكة التقنية</Link>
              <Link href="/visual-identity">الهوية البصرية لمؤسستك</Link>
              <Link href="/about">عن نرفد</Link>
              <Link href="/articles">مقالات نرفد</Link>
            </div>
            <div className="footer-links">
              <span>خلّنا نتواصل</span>
              <a href="#faq">الأسئلة الشائعة</a>
              <a href={whatsappUrl} data-analytics="whatsapp_click" target="_blank" rel="noopener noreferrer">
                واتساب
                <ArrowUpLeft />
              </a>
              <DemoButton variant="link">
                احجز عرضًا توضيحيًا
              </DemoButton>
            </div>
            <div className="footer-statement">
              <span dir="ltr">narfid</span>
              <p>
                تقنية تسند.
                <br />
                ومؤسسات تنمو.
              </p>
              <ArrowUpLeft aria-hidden="true" />
            </div>
          </div>
          <Separator />
          <div className="footer-bottom">
            <span>© ٢٠٢٦ نرفد. جميع الحقوق محفوظة.</span>
            <span dir="ltr">YOUR SPORTS TECH PARTNER.</span>
            <a href="#home">
              إلى الأعلى
              <ArrowUpLeft />
            </a>
          </div>
        </footer>
      </div>
    </LandingDemo>
  );
}
