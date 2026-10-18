"use client";

import Image from "next/image";
import Link from "next/link";
import { MemberAppSection } from "@/components/member-app-section";
import { IdentityServiceSection } from "@/components/identity-service-section";
import dashboardImage from "@/public/images/nerved-dashboard.png";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChefHat,
  ChevronLeft,
  Copy,
  Fingerprint,
  GitBranch,
  Layers3,
  Menu,
  MessageCircle,
  Package,
  Play,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  faqs,
  features,
  navigation,
  plans,
  salesPhone,
  whatsappUrl,
} from "@/lib/landing-content";

const money = new Intl.NumberFormat("en-US");

function Brand({ symbol = false }: { symbol?: boolean }) {
  return (
    <span className={cn("brand", symbol && "brand-symbol")}>
      <Image
        src={symbol ? "/logo%20symbol.png" : "/logo.png"}
        alt={symbol ? "" : "نرفد — السند التقني للمؤسسات الرياضية"}
        width={symbol ? 1254 : 1672}
        height={symbol ? 1254 : 941}
        priority={!symbol}
        sizes={symbol ? "80px" : "280px"}
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
          <Image
            src={dashboardImage}
            alt="لوحة التحكم الفعلية للنظام بهوية نرفد: الأعضاء والاشتراكات والحضور والإيرادات، بأرقام توضيحية"
            preload
            placeholder="blur"
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

type DemoDraft = { name: string; club: string; branches: string; plan: string };

function DemoDialog({
  open,
  onOpenChange,
  initialPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPlan: string;
}) {
  const [draft, setDraft] = useState<DemoDraft | null>(null);
  const [editingDraft, setEditingDraft] = useState<DemoDraft | null>(null);
  const [errors, setErrors] = useState<{ name?: string; club?: string }>({});
  const [copyStatus, setCopyStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function changeOpen(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setDraft(null);
      setEditingDraft(null);
      setErrors({});
      setCopyStatus("");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextDraft = {
      name: String(form.get("name") ?? "").trim(),
      club: String(form.get("club") ?? "").trim(),
      branches: String(form.get("branches") ?? "فرع واحد"),
      plan: String(form.get("plan") ?? "أحتاج مساعدة في الاختيار"),
    };
    const nextErrors = {
      ...(nextDraft.name.length < 2
        ? { name: "اكتب اسمك من حرفين على الأقل." }
        : {}),
      ...(nextDraft.club.length < 2
        ? { club: "اكتب اسم المؤسسة من حرفين على الأقل." }
        : {}),
    };
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current
        ?.querySelector<HTMLInputElement>(
          nextErrors.name ? "#demo-name" : "#demo-club",
        )
        ?.focus();
      return;
    }
    setDraft(nextDraft);
  }

  const message = draft
    ? [
        "مرحبًا نرفد، أرغب في حجز عرض توضيحي للمنصة.",
        "الاسم: " + draft.name,
        "المؤسسة: " + draft.club,
        "عدد الفروع: " + draft.branches,
        "الباقة محل الاهتمام: " + draft.plan,
        "أرجو التواصل لترتيب الموعد ومناقشة احتياجات المؤسسة.",
      ].join("\n")
    : "";

  async function copyRequest() {
    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus("تم نسخ تفاصيل الطلب.");
    } catch {
      setCopyStatus("تعذّر النسخ. يمكنك فتح الطلب مباشرةً في واتساب.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="demo-dialog" dir="rtl">
        <DialogHeader>
          <span className="dialog-eyebrow">
            <MessageCircle /> لنتعرّف على ناديك
          </span>
          <DialogTitle>
            {draft ? "طلبك جاهز. نكمل على واتساب؟" : "خطوتك الأولى مع نرفد"}
          </DialogTitle>
          <DialogDescription>
            {draft
              ? "راجع التفاصيل، ثم افتح واتساب لإرسال الطلب وترتيب العرض."
              : "أخبرنا قليلًا عن مؤسستك، لنرتّب عرضًا يناسب احتياجك."}
          </DialogDescription>
        </DialogHeader>
        {draft ? (
          <div className="request-review">
            <dl>
              <div>
                <dt>الاسم</dt>
                <dd>{draft.name}</dd>
              </div>
              <div>
                <dt>المؤسسة</dt>
                <dd>{draft.club}</dd>
              </div>
              <div>
                <dt>الفروع</dt>
                <dd>{draft.branches}</dd>
              </div>
              <div>
                <dt>الباقة</dt>
                <dd>{draft.plan}</dd>
              </div>
            </dl>
            <a
              href={
                "https://wa.me/" +
                salesPhone +
                "?text=" +
                encodeURIComponent(message)
              }
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "marketing" })}
            >
              <MessageCircle data-icon="inline-start" /> متابعة عبر واتساب{" "}
              <ArrowUpLeft data-icon="inline-end" />
            </a>
            <div className="review-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingDraft(draft);
                  setDraft(null);
                  setCopyStatus("");
                }}
              >
                تعديل التفاصيل
              </Button>
              <Button variant="outline" onClick={copyRequest}>
                <Copy data-icon="inline-start" />
                نسخ الطلب
              </Button>
            </div>
            {copyStatus && (
              <Alert>
                <AlertDescription>{copyStatus}</AlertDescription>
              </Alert>
            )}
            <p className="form-note">الطلب يُرسل عندما تضغط إرسال في واتساب.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate ref={formRef}>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="demo-name">اسمك</FieldLabel>
                <Input
                  id="demo-name"
                  name="name"
                  defaultValue={editingDraft?.name}
                  autoComplete="name"
                  placeholder="كيف نناديك؟"
                  required
                  maxLength={80}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <FieldError id="name-error">{errors.name}</FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(errors.club)}>
                <FieldLabel htmlFor="demo-club">
                  اسم المؤسسة الرياضية
                </FieldLabel>
                <Input
                  id="demo-club"
                  name="club"
                  defaultValue={editingDraft?.club}
                  autoComplete="organization"
                  placeholder="اسم النادي أو المركز"
                  required
                  maxLength={120}
                  aria-invalid={Boolean(errors.club)}
                  aria-describedby={errors.club ? "club-error" : undefined}
                />
                {errors.club && (
                  <FieldError id="club-error">{errors.club}</FieldError>
                )}
              </Field>
              <FieldGroup className="form-columns">
                <Field>
                  <FieldLabel htmlFor="demo-branches">عدد الفروع</FieldLabel>
                  <NativeSelect
                    id="demo-branches"
                    name="branches"
                    defaultValue={editingDraft?.branches}
                  >
                    <NativeSelectOption>فرع واحد</NativeSelectOption>
                    <NativeSelectOption>فرعان</NativeSelectOption>
                    <NativeSelectOption>٣ فروع</NativeSelectOption>
                    <NativeSelectOption>أكثر من ٣ فروع</NativeSelectOption>
                    <NativeSelectOption>أخطط لافتتاح مؤسسة</NativeSelectOption>
                  </NativeSelect>
                </Field>
                <Field>
                  <FieldLabel htmlFor="demo-plan">
                    الباقة محل الاهتمام
                  </FieldLabel>
                  <NativeSelect
                    id="demo-plan"
                    name="plan"
                    defaultValue={editingDraft?.plan ?? initialPlan}
                  >
                    <NativeSelectOption>
                      أحتاج مساعدة في الاختيار
                    </NativeSelectOption>
                    {plans.map((plan) => (
                      <NativeSelectOption key={plan.name}>
                        {plan.name}
                      </NativeSelectOption>
                    ))}
                    <NativeSelectOption>شراكة تقنية</NativeSelectOption>
                  </NativeSelect>
                </Field>
              </FieldGroup>
              <Field>
                <Button type="submit" size="marketing" className="w-full">
                  راجع طلب العرض <ArrowLeft data-icon="inline-end" />
                </Button>
                <FieldDescription>
                  التفاصيل التي تدخلها تُشارك معنا عبر واتساب عند إرسال الطلب.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function LandingPage({ articles }: { articles: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("أحتاج مساعدة في الاختيار");
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function openDemo(plan = "أحتاج مساعدة في الاختيار") {
    setSelectedPlan(plan);
    setDemoOpen(true);
    setMenuOpen(false);
  }

  return (
    <DirectionProvider direction="rtl">
      <div className="landing">
        <a className="skip-link" href="#main">
          انتقل إلى المحتوى
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <a href="#home" className="brand-link" aria-label="نرفد — الرئيسية">
              <Brand />
            </a>
            <nav className="desktop-nav" aria-label="القائمة الرئيسية">
              {navigation.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="header-actions">
              <Link href="/login" className="board-login-link">
                دخول الإدارة
              </Link>
              <Button size="navigation" data-analytics="demo_request_start" onClick={() => openDemo()}>
                احجز عرضًا توضيحيًا <ArrowUpLeft data-icon="inline-end" />
              </Button>
              <Button
                ref={menuToggleRef}
                variant="ghost"
                size="icon-lg"
                className="menu-toggle"
                aria-label={menuOpen ? "أغلق القائمة" : "افتح القائمة"}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
          {menuOpen && (
            <nav
              className="mobile-nav container"
              id="mobile-nav"
              aria-label="قائمة الجوال"
            >
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                  <ArrowUpLeft />
                </a>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                دخول الإدارة
                <ArrowUpLeft />
              </Link>
            </nav>
          )}
        </header>

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
                <Button size="marketing" data-analytics="demo_request_start" onClick={() => openDemo()}>
                  خلّنا نرفد ناديك <ArrowUpLeft data-icon="inline-end" />
                </Button>
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

          <MemberAppSection onRequest={() => openDemo("شراكة تقنية")} />
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
                      <Button
                        size="marketing"
                        variant={plan.recommended ? "default" : "outline"}
                        className="w-full"
                        onClick={() => openDemo(plan.name)}
                      >
                        {plan.cta}
                        <ArrowUpLeft data-icon="inline-end" />
                      </Button>
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
                <Button
                  variant="outline"
                  size="marketing"
                  onClick={() => openDemo("شراكة تقنية")}
                >
                  ناقش مشروعك معنا
                  <ArrowUpLeft data-icon="inline-end" />
                </Button>
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
            <Button size="marketing" data-analytics="demo_request_start" onClick={() => openDemo()}>
              احجز عرضًا توضيحيًا
              <ArrowUpLeft data-icon="inline-end" />
            </Button>
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
              <Button variant="link" onClick={() => openDemo()}>
                احجز عرضًا توضيحيًا
              </Button>
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
        <DemoDialog
          open={demoOpen}
          onOpenChange={setDemoOpen}
          initialPlan={selectedPlan}
        />
      </div>
    </DirectionProvider>
  );
}
