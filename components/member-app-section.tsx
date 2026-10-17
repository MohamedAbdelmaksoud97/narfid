"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  CreditCard,
  Home,
  Layers3,
  MessageSquareText,
  Pause,
  Play,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const appFeatures = [
  {
    id: "membership",
    title: "الاشتراكات والتجديد",
    icon: CreditCard,
    description:
      "حالة الاشتراك ومدته أمام العضو، مع رحلة تجديد مرتبطة بسياسات مؤسستك ووسائل الدفع المتفق على ربطها.",
  },
  {
    id: "bookings",
    title: "حجز الملاعب",
    icon: CalendarDays,
    description:
      "يستعرض العضو الملاعب والأوقات المتاحة، ويطلب حجزه من التطبيق؛ لتصل تفاصيله إلى فريقك في النظام.",
  },
  {
    id: "feedback",
    title: "الشكاوى والاقتراحات",
    icon: MessageSquareText,
    description:
      "قناة واضحة لصوت العضو: يرسل شكوى أو اقتراحًا، ويتابع حالة طلبه وردّ فريقك من مكان واحد.",
  },
  {
    id: "notifications",
    title: "تنبيهات الاشتراك",
    icon: Bell,
    description:
      "تنبيه قبل انتهاء الاشتراك يساعد العضو على تذكّر موعد التجديد، وفق توقيت الإشعارات الذي تحدده مؤسستك.",
  },
] as const;

function CourtIllustration() {
  return (
    <svg className="member-app-court" viewBox="0 0 280 145" aria-hidden="true">
      <defs>
        <linearGradient id="member-app-court-fill" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.24" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <ellipse
        cx="143"
        cy="125"
        rx="105"
        ry="12"
        fill="currentColor"
        opacity="0.07"
      />
      <path
        d="M30 35 211 15 257 107 75 129Z"
        fill="url(#member-app-court-fill)"
        stroke="currentColor"
        strokeOpacity="0.65"
      />
      <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7">
        <path d="M49 42 202 25 236 100 83 118Z" />
        <path d="m126 33 34 77M66 80l153-18M57 60l153-18M74 99l153-18" />
        <path d="M66 80V54l153-18v26M66 59l153-18M66 65l153-18M66 71l153-18" />
        <path
          d="m85 52 0 26m19-28 0 26m19-28 0 25m19-27 0 25m19-27 0 25m19-27 0 25m19-27 0 25"
          opacity="0.4"
        />
      </g>
      <circle cx="177" cy="89" r="4" fill="currentColor" />
      <path
        d="m182 87 13-5"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PreviewAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="member-app-preview-action">
      {children}
      <ArrowLeft aria-hidden="true" />
    </div>
  );
}

function PhonePanels() {
  return (
    <div className="member-app-phone-content">
      <TabsContent value="membership" className="member-app-panel">
        <p className="member-app-screen-eyebrow">كل تفاصيل عضويتك</p>
        <h3>خطوتك الجاية، أقرب.</h3>
        <div className="member-app-membership-card">
          <div className="member-app-card-top">
            <span>اشتراك اللياقة</span>
            <Badge variant="secondary">نشط</Badge>
          </div>
          <div className="member-app-days">
            <strong>٧</strong>
            <span>
              أيام متبقية
              <br />
              في اشتراكك
            </span>
          </div>
          <div className="member-app-progress" aria-hidden="true">
            <i />
          </div>
          <div className="member-app-card-bottom">
            <span>الباقة الشهرية</span>
            <ShieldCheck aria-hidden="true" />
          </div>
        </div>
        <PreviewAction>تجديد الاشتراك</PreviewAction>
        <div className="member-app-summary-row">
          <CalendarDays aria-hidden="true" />
          <span>
            تفاصيل الاشتراك<span>المدة والحالة في مكان واحد</span>
          </span>
          <ChevronLeft aria-hidden="true" />
        </div>
      </TabsContent>
      <TabsContent value="bookings" className="member-app-panel">
        <p className="member-app-screen-eyebrow">وقت الملعب صار أقرب</p>
        <h3>موعدك مع لعبتك.</h3>
        <div className="member-app-court-card">
          <CourtIllustration />
          <div>
            <strong>ملعب البادل</strong>
            <span>الفرع الرئيسي</span>
          </div>
        </div>
        <p className="member-app-mini-heading">أوقات توضيحية متاحة</p>
        <div className="member-app-time-slots" dir="ltr">
          <span>17:00</span>
          <span data-chosen>18:00</span>
          <span>19:00</span>
        </div>
        <PreviewAction>متابعة تفاصيل الحجز</PreviewAction>
      </TabsContent>
      <TabsContent value="feedback" className="member-app-panel">
        <p className="member-app-screen-eyebrow">نتحسن بصوتك</p>
        <h3>رأيك يوصل لفريقنا.</h3>
        <div className="member-app-feedback-options">
          <span>
            <MessageSquareText aria-hidden="true" />
            شكوى
          </span>
          <span>
            <Layers3 aria-hidden="true" />
            اقتراح
          </span>
        </div>
        <div className="member-app-request-card">
          <div>
            <span>اقتراحك</span>
            <Badge variant="outline">قيد المراجعة</Badge>
          </div>
          <strong>إضافة مواعيد مسائية</strong>
          <p>نقترح إتاحة مواعيد أكثر بعد وقت العمل.</p>
          <div className="member-app-request-update">
            <CheckCheck aria-hidden="true" />
            <span>وصل اقتراحك إلى الفريق</span>
          </div>
        </div>
        <PreviewAction>إرسال شكوى أو اقتراح</PreviewAction>
      </TabsContent>
      <TabsContent value="notifications" className="member-app-panel">
        <p className="member-app-screen-eyebrow">خلّك على اطلاع</p>
        <h3>موعد التجديد ما يفوتك.</h3>
        <div className="member-app-notification-hero">
          <div>
            <Bell aria-hidden="true" />
            <i />
          </div>
          <span>تنبيه الاشتراك</span>
          <strong>باقي ٧ أيام</strong>
          <p>
            اشتراكك يقترب من الانتهاء.
            <br />
            راجع التفاصيل وخطّط لتجديدك.
          </p>
        </div>
        <PreviewAction>عرض اشتراكي</PreviewAction>
        <p className="member-app-notification-note">
          <Check aria-hidden="true" />
          تذكير في الوقت المناسب
        </p>
      </TabsContent>
    </div>
  );
}

export function MemberAppSection({ onRequest }: { onRequest: () => void }) {
  const [activeFeature, setActiveFeature] = useState("membership");
  const [motionPaused, setMotionPaused] = useState(false);
  const motionPausedRef = useRef(false);
  const syncMotionRef = useRef<(() => void) | null>(null);
  const entranceControlRef = useRef<((paused: boolean) => void) | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const active =
    appFeatures.find((feature) => feature.id === activeFeature) ??
    appFeatures[0];

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const device = deviceRef.current;
    if (!section || !stage || !device) return;

    let disposed = false;
    let started = false;
    let inView = false;
    let entranceFinished = false;
    let cleanupMotion: (() => void) | undefined;
    const syncMotion = () => {
      const visible = inView && !document.hidden;
      section.dataset.motionVisible = String(visible);
      entranceControlRef.current?.(!visible || motionPausedRef.current);
    };
    syncMotionRef.current = syncMotion;
    document.addEventListener("visibilitychange", syncMotion);
    const observer = new IntersectionObserver(
      async ([entry]) => {
        inView = entry.isIntersecting;
        syncMotion();
        if (!inView || started) return;
        started = true;
        try {
          const { gsap } = await import("gsap");
          if (disposed) return;
          const media = gsap.matchMedia();
          media.add("(prefers-reduced-motion: no-preference)", () => {
            const context = gsap.context(() => {
              entranceFinished = false;
              const entrance = gsap.timeline({
                defaults: { ease: "power2.out" },
                onComplete: () => {
                  entranceFinished = true;
                },
              });
              entrance
                .from(
                  ".member-app-copy > *",
                  {
                    y: 22,
                    opacity: 0.6,
                    duration: 1.4,
                    stagger: 0.12,
                    clearProps: "transform,opacity",
                  },
                  0,
                )
                .from(
                  device,
                  {
                    y: 72,
                    rotateY: -30,
                    rotateX: 13,
                    scale: 0.94,
                    duration: 3.2,
                    clearProps: "transform",
                  },
                  0,
                )
                .from(
                  ".member-app-float",
                  {
                    y: 38,
                    opacity: 0.2,
                    duration: 2,
                    stagger: 0.35,
                    clearProps: "transform,opacity",
                  },
                  0.6,
                );
              entranceControlRef.current = (paused) => {
                entrance.paused(paused);
              };
              syncMotion();
            }, section);
            return () => {
              entranceControlRef.current = null;
              context.revert();
            };
          });
          media.add(
            "(hover: hover) and (pointer: fine) and (min-width: 960px) and (prefers-reduced-motion: no-preference)",
            () => {
              const move = (event: PointerEvent) => {
                if (
                  !entranceFinished ||
                  motionPausedRef.current ||
                  !inView ||
                  document.hidden
                )
                  return;
                const bounds = stage.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                gsap.to(device, {
                  rotateY: -10 + x * 9,
                  rotateX: 5 - y * 7,
                  duration: 1.1,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              };
              const reset = () => {
                if (!entranceFinished || motionPausedRef.current) return;
                gsap.to(device, {
                  rotateY: -10,
                  rotateX: 5,
                  duration: 1.4,
                  overwrite: "auto",
                  clearProps: "transform",
                });
              };
              stage.addEventListener("pointermove", move);
              stage.addEventListener("pointerleave", reset);
              return () => {
                stage.removeEventListener("pointermove", move);
                stage.removeEventListener("pointerleave", reset);
                gsap.killTweensOf(device);
                device.style.removeProperty("transform");
              };
            },
          );
          cleanupMotion = () => media.revert();
        } catch {
          // The section remains usable if the optional animation chunk cannot load.
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(stage);
    return () => {
      disposed = true;
      observer.disconnect();
      cleanupMotion?.();
      syncMotionRef.current = null;
      document.removeEventListener("visibilitychange", syncMotion);
    };
  }, []);

  return (
    <section
      id="member-app"
      ref={sectionRef}
      className="member-app-section"
      data-motion-paused={motionPaused}
      aria-labelledby="member-app-heading"
    >
      <div className="container section-space">
        <Tabs
          value={activeFeature}
          onValueChange={(value) => setActiveFeature(String(value))}
          className="member-app-layout"
        >
          <div className="member-app-copy">
            <p className="section-kicker">
              <span />
              تطبيق الأعضاء · تطوير مخصص
            </p>
            <h2 id="member-app-heading">
              نظامك يدير المؤسسة.
              <br />
              <span>وتطبيقك يرافق العضو.</span>
            </h2>
            <p className="member-app-intro">
              نطوّر لمؤسستك تطبيقًا بهويتها، مرتبطًا بمنظومة نرفد. من متابعة
              الاشتراك إلى حجز الملعب، تبدأ تجربة العضو من جواله وتصل إلى فريقك.
            </p>
            <div className="member-app-explore">
              <p>اكتشف تجربة العضو</p>
              <TabsList
                aria-label="استعراض مزايا تطبيق الأعضاء"
                className="member-app-feature-tabs"
              >
                {appFeatures.map((feature) => (
                  <TabsTrigger key={feature.id} value={feature.id}>
                    <feature.icon aria-hidden="true" />
                    {feature.title}
                  </TabsTrigger>
                ))}
              </TabsList>
              <p className="member-app-feature-description" aria-live="polite">
                {active.description}
              </p>
            </div>
            <div className="member-app-conversation">
              <Button size="marketing" onClick={onRequest}>
                ناقش تطبيق مؤسستك
                <ArrowLeft data-icon="inline-end" />
              </Button>
              <span>
                <Smartphone aria-hidden="true" />
                بهوية مؤسستك، لأعضائك
              </span>
            </div>
            <p className="member-app-scope">
              خدمة تطوير مخصصة؛ نتفق على الوظائف والتكاملات والمدة والتكلفة بشكل
              منفصل عن اشتراك المنصة.
            </p>
          </div>
          <div className="member-app-visual">
            <div ref={stageRef} className="member-app-stage">
              <div
                className="member-app-orbit member-app-orbit-one"
                aria-hidden="true"
              />
              <div
                className="member-app-orbit member-app-orbit-two"
                aria-hidden="true"
              />
              <div className="member-app-platform" aria-hidden="true" />
              <div className="member-app-float member-app-system-cue">
                <Layers3 aria-hidden="true" />
                <span>
                  منظومة واحدة<strong>الإدارة ↔ تطبيق العضو</strong>
                </span>
                <i aria-hidden="true" />
              </div>
              <div ref={deviceRef} className="member-app-device">
                <div className="member-app-device-side" aria-hidden="true" />
                <div className="member-app-screen">
                  <div className="member-app-status-bar" aria-hidden="true">
                    <span>9:41</span>
                    <i />
                    <span>
                      <Wifi />
                      <span className="member-app-battery" />
                    </span>
                  </div>
                  <div className="member-app-phone-header">
                    <div>
                      <span>أهلًا بك في</span>
                      <strong>مؤسستك الرياضية</strong>
                    </div>
                    <span className="member-app-logo">
                      <Image
                        src="/logo.png"
                        alt="نرفد"
                        width={1672}
                        height={941}
                        sizes="80px"
                      />
                    </span>
                  </div>
                  <PhonePanels />
                  <div className="member-app-phone-nav" aria-hidden="true">
                    <span data-selected>
                      <Home />
                      الرئيسية
                    </span>
                    <span>
                      <CalendarDays />
                      حجوزاتي
                    </span>
                    <span>
                      <UserRound />
                      حسابي
                    </span>
                  </div>
                  <div
                    className="member-app-home-indicator"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="member-app-float member-app-reminder">
                <span className="member-app-reminder-icon">
                  <Bell aria-hidden="true" />
                </span>
                <div>
                  <span>تذكير من مؤسستك</span>
                  <strong>تجديدك القادم، في بالك.</strong>
                  <p>اقترب موعد انتهاء اشتراكك</p>
                </div>
              </div>
            </div>
            <p className="member-app-preview-caption">
              تصور لتطبيق مؤسستك · بيانات توضيحية
            </p>
            <div className="member-app-motion-control">
              <Button
                variant="ghost"
                size="sm"
                aria-pressed={motionPaused}
                onClick={() => {
                  const paused = !motionPaused;
                  motionPausedRef.current = paused;
                  setMotionPaused(paused);
                  syncMotionRef.current?.();
                }}
              >
                {motionPaused ? (
                  <Play data-icon="inline-start" />
                ) : (
                  <Pause data-icon="inline-start" />
                )}
                {motionPaused ? "تشغيل الحركة" : "إيقاف الحركة"}
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  );
}
