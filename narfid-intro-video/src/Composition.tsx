import React from "react";
import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Interactive,
  Sequence,
  Track,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import "./style.css";

const green = "#3ECF8E";
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Logo = ({ large = false }: { large?: boolean }) => (
  <div
    style={{
      position: "relative",
      width: large ? 620 : 270,
      height: large ? 194 : 85,
      overflow: "hidden",
    }}
  >
    <CanvasImage
      src={staticFile("logo.png")}
      style={{
        position: "absolute",
        width: large ? 1015 : 442,
        height: large ? 571 : 249,
        left: large ? -195 : -85,
        top: large ? -193 : -84,
      }}
    />
  </div>
);
const Backdrop = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#141a17", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(#3ecf8e09 1px, transparent 1px),linear-gradient(90deg,#3ecf8e09 1px,transparent 1px)",
          backgroundSize: "100px 100px",
          maskImage: "radial-gradient(ellipse at center,black,transparent 80%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1100,
          height: 1100,
          right: -450,
          top: -460,
          borderRadius: "50%",
          background: "radial-gradient(circle,#3ecf8e24,transparent 67%)",
          translate: interpolate(
            frame,
            [0, 1800],
            ["0px 0px", "-120px 180px"],
            clamp,
          ),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          left: -300,
          bottom: -500,
          border: "1px solid #3ecf8e26",
          borderRadius: "50%",
        }}
      />
    </AbsoluteFill>
  );
};
const Reveal = ({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        ...style,
        opacity: interpolate(f, [delay, delay + 0.7 * fps], [0, 1], clamp),
        translate: interpolate(
          f,
          [delay, delay + 1.1 * fps],
          ["0px 44px", "0px 0px"],
          { ...clamp, easing: ease },
        ),
      }}
    >
      {children}
    </div>
  );
};
const SceneFrame = ({
  children,
  number,
  label,
  duration,
}: {
  children: React.ReactNode;
  number: string;
  label: string;
  duration: number;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      dir="rtl"
      lang="ar"
      style={{
        opacity: interpolate(
          f,
          [0, 0.3 * fps, (duration - 0.35) * fps, duration * fps],
          [0, 1, 1, 0],
          clamp,
        ),
      }}
    >
      <div className="masthead">
        <Logo />
        <span>{label}</span>
      </div>
      {children}
      <div className="footer">
        <span>نرفد · السند التقني للمؤسسات الرياضية</span>
        <span className="chapter">
          {number}
          <span className="chapter-line" />
          08
        </span>
      </div>
    </AbsoluteFill>
  );
};
const ProductWindow = ({
  screen,
  width = 1090,
}: {
  screen: string;
  width?: number;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      className="product-window"
      style={{
        width,
        scale: interpolate(f, [0, 7 * fps], [0.96, 1.025], {
          ...clamp,
          easing: ease,
        }),
        translate: interpolate(f, [0, 1.2 * fps], ["0px 75px", "0px 0px"], {
          ...clamp,
          easing: ease,
        }),
      }}
    >
      <div className="window-bar">
        <div className="window-dots">
          <i />
          <i />
          <i />
        </div>
        <span>نرفد / مساحة العمل</span>
        <span style={{ color: green }}>●</span>
      </div>
      <CanvasImage
        src={staticFile(`screens/${screen}`)}
        style={{ width: "100%", display: "block" }}
      />
    </div>
  );
};
const Opening = () => {
  const { fps } = useVideoConfig();
  return (
    <SceneFrame number="01" label="منظومة إدارة الأندية" duration={7}>
      <div className="intro-copy">
        <Reveal>
          <div className="eyebrow">
            <span />
            تشغيل أوضح. تجربة أفضل.
          </div>
        </Reveal>
        <Reveal delay={0.35 * fps}>
          <Interactive.H1 name="Opening headline" className="hero-title">
            كل تفاصيل ناديك.
            <br />
            <span>في منظومة واحدة.</span>
          </Interactive.H1>
        </Reveal>
        <Reveal delay={1.1 * fps}>
          <p className="intro-sub">من أول اشتراك… إلى آخر إجراء في يومك.</p>
        </Reveal>
      </div>
      <Reveal
        delay={1.7 * fps}
        style={{ position: "absolute", left: 180, right: 180, bottom: 200 }}
      >
        <div className="orbit-labels">
          <span>الأعضاء</span>
          <b>←</b>
          <span>فريق العمل</span>
          <b>←</b>
          <span>الخدمات</span>
          <b>←</b>
          <span>الفروع</span>
        </div>
      </Reveal>
    </SceneFrame>
  );
};
type FeatureProps = {
  number: string;
  label: string;
  title: string;
  highlight: string;
  subtitle: string;
  screen: string;
  steps: string[];
  duration: number;
};
const Feature = ({
  number,
  label,
  title,
  highlight,
  subtitle,
  screen,
  steps,
  duration,
}: FeatureProps) => {
  const { fps } = useVideoConfig();
  return (
    <SceneFrame number={number} label={label} duration={duration}>
      <div className="feature-copy">
        <Reveal>
          <div className="eyebrow">
            <span />
            {label}
          </div>
        </Reveal>
        <Reveal delay={0.2 * fps}>
          <h1>
            {title}
            <br />
            <em>{highlight}</em>
          </h1>
        </Reveal>
        <Reveal delay={0.6 * fps}>
          <p>{subtitle}</p>
        </Reveal>
        <Reveal delay={1.2 * fps}>
          <div className="steps">
            {steps.map((s) => (
              <div key={s}>
                <span>✓</span>
                {s}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <div className="feature-product">
        <ProductWindow screen={screen} />
      </div>
    </SceneFrame>
  );
};
const EditableFeature = Interactive.create({
  Component: Feature,
  layout: "absolute-fill",
  schema: {
    title: { type: "string", default: "", description: "العنوان" },
    highlight: { type: "string", default: "", description: "السطر المميز" },
    subtitle: { type: "string", default: "", description: "الوصف" },
    screen: {
      type: "string",
      default: "overview.png",
      description: "لقطة النظام",
    },
  },
});
const Operations = () => {
  const { fps } = useVideoConfig();
  return (
    <SceneFrame number="06" label="المطبخ والمخزون" duration={7}>
      <Reveal
        style={{
          position: "absolute",
          top: 184,
          right: 150,
          left: 150,
          textAlign: "center",
        }}
      >
        <h1 className="section-title">
          وراء كل خدمة، <span>تشغيل مترابط.</span>
        </h1>
        <p className="section-sub">
          طلبات المطبخ، استحقاقات الوجبات، وحركة المنتجات.
        </p>
      </Reveal>
      <Reveal
        delay={0.5 * fps}
        style={{ position: "absolute", right: 150, top: 435, width: 780 }}
      >
        <div className="dual-label">
          <span className="status-dot" />
          من الطلب إلى التجهيز والتسليم
        </div>
        <div className="shot-crop">
          <ProductWindow screen="kitchen.focus.png" width={780} />
        </div>
      </Reveal>
      <Reveal
        delay={1 * fps}
        style={{ position: "absolute", left: 150, top: 435, width: 780 }}
      >
        <div className="dual-label">
          <span className="status-dot" />
          مبيعات مرتبطة بالمخزون
        </div>
        <div className="shot-crop">
          <ProductWindow screen="inventory.focus.png" width={780} />
        </div>
      </Reveal>
    </SceneFrame>
  );
};
const Phone = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      className="phone"
      style={{
        translate: interpolate(f, [0, 1.3 * fps], ["0px 100px", "0px 0px"], {
          ...clamp,
          easing: ease,
        }),
        rotate: interpolate(f, [0, 1.5 * fps], ["-8deg", "-3deg"], {
          ...clamp,
          easing: ease,
        }),
      }}
    >
      <div className="phone-island" />
      <div className="phone-status">
        <span>9:41</span>
        <span>● ▰</span>
      </div>
      <div className="phone-body">
        <Logo />
        <div className="phone-greeting">مرحبًا بك</div>
        <h2>ناديك أقرب إليك.</h2>
        <div className="member-pass">
          <span>اشتراك اللياقة</span>
          <b>عضويتك نشطة</b>
          <div className="pass-bottom">
            <span>تفاصيل الاشتراك</span>
            <span>←</span>
          </div>
        </div>
        <h3>خدماتك في متناولك</h3>
        <div className="phone-grid">
          <div>
            <span>▦</span>حجوزاتي
          </div>
          <div>
            <span>◷</span>الحضور
          </div>
          <div>
            <span>↗</span>خطتي التدريبية
          </div>
          <div>
            <span>≡</span>الفواتير
          </div>
        </div>
        <div className="next-session">
          <span className="status-dot" />
          حصة اللياقة الجماعية <span>←</span>
        </div>
      </div>
      <div className="phone-nav">
        <span style={{ color: green }}>الرئيسية</span>
        <span>خدماتي</span>
        <span>حسابي</span>
      </div>
      <div className="phone-home" />
    </div>
  );
};
const Mobile = () => {
  const { fps } = useVideoConfig();
  return (
    <SceneFrame number="07" label="تطبيق الجوال" duration={8}>
      <div className="mobile-copy">
        <Reveal>
          <div className="eyebrow">
            <span />
            تجربة متصلة على الجوال
          </div>
        </Reveal>
        <Reveal delay={0.25 * fps}>
          <h1>
            ناديك معك،
            <br />
            <em>أينما كنت.</em>
          </h1>
        </Reveal>
        <Reveal delay={0.7 * fps}>
          <p>للإدارة، لفريق العمل، وللعضو.</p>
        </Reveal>
        <Reveal delay={1.1 * fps}>
          <div className="steps">
            <div>
              <span>✓</span>متابعة الاشتراكات والحجوزات
            </div>
            <div>
              <span>✓</span>الخطط التدريبية والقياسات
            </div>
            <div>
              <span>✓</span>الطلبات والفواتير والتواصل
            </div>
          </div>
        </Reveal>
      </div>
      <div style={{ position: "absolute", left: 315, top: 165 }}>
        <Phone />
      </div>
    </SceneFrame>
  );
};
const Closing = () => {
  const { fps } = useVideoConfig();
  return (
    <SceneFrame number="08" label="شريكك التقني" duration={7}>
      <div className="closing">
        <Reveal>
          <Logo large />
        </Reveal>
        <Reveal delay={0.35 * fps}>
          <h1>
            تفرّغ لتطوير ناديك.
            <br />
            <span>نرفدك بالتقنية.</span>
          </h1>
        </Reveal>
        <Reveal delay={1 * fps}>
          <div className="closing-cta">
            احجز عرضًا توضيحيًا <span>←</span>
          </div>
        </Reveal>
        <Reveal delay={1.4 * fps}>
          <div className="domain" dir="ltr">
            www.narfid.com
          </div>
        </Reveal>
      </div>
    </SceneFrame>
  );
};
export const NarfidIntro = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{ fontFamily: "Tajawal, sans-serif", color: "#EDEDED" }}
    >
      <Backdrop />
      <Track name="قصة نرفد">
        <Sequence name="01 · كل تفاصيل ناديك" durationInFrames={7 * fps}>
          <Opening />
        </Sequence>
        <EditableFeature
          name="02 · لوحة المتابعة"
          from={7 * fps}
          durationInFrames={7 * fps}
          duration={7}
          number="02"
          label="لوحة المتابعة"
          title="رؤية أوضح"
          highlight="ليوم ناديك."
          subtitle="الأعضاء، الاشتراكات، الحضور والإيرادات… أمامك في مساحة عمل واحدة."
          screen="overview.png"
          steps={["مؤشرات التشغيل", "متابعة الفروع", "صلاحيات لفريق العمل"]}
        />
        <EditableFeature
          name="03 · الأعضاء والاشتراكات"
          from={14 * fps}
          durationInFrames={8 * fps}
          duration={8}
          number="03"
          label="الأعضاء والاشتراكات"
          title="من أول اشتراك"
          highlight="إلى كل تجديد."
          subtitle="ملف يجمع تفاصيل العضو ودورة اشتراكه."
          screen="subscriptions.focus.png"
          steps={["تسجيل وتجديد", "تجميد واستئناف", "حضور واستحقاق دخول"]}
        />
        <EditableFeature
          name="04 · الحجوزات"
          from={22 * fps}
          durationInFrames={8 * fps}
          duration={8}
          number="04"
          label="الملاعب والحصص والتدريب"
          title="حجوزات منظّمة."
          highlight="تجربة أسهل."
          subtitle="اربط المواعيد بالسعة المتاحة، وتابع كل حجز من الطلب إلى التنفيذ."
          screen="bookings.focus.png"
          steps={["ملاعب ومرافق", "حصص جماعية", "تدريب شخصي"]}
        />
        <EditableFeature
          name="05 · المالية"
          from={30 * fps}
          durationInFrames={8 * fps}
          duration={8}
          number="05"
          label="نقاط البيع والمالية"
          title="مبيعات وتحصيل."
          highlight="في سياق واحد."
          subtitle="تابع الفواتير والمدفوعات وورديات الصندوق ضمن دورة عمل مترابطة."
          screen="finance.focus.png"
          steps={["فواتير وسجلات تحصيل", "مدفوعات مجزّأة", "ورديات وتقارير"]}
        />
        <Sequence
          name="06 · المطبخ والمخزون"
          from={38 * fps}
          durationInFrames={7 * fps}
        >
          <Operations />
        </Sequence>
        <Sequence
          name="07 · تطبيق الجوال"
          from={45 * fps}
          durationInFrames={8 * fps}
        >
          <Mobile />
        </Sequence>
        <Sequence
          name="08 · احجز عرضًا توضيحيًا"
          from={53 * fps}
          durationInFrames={7 * fps}
        >
          <Closing />
        </Sequence>
      </Track>
      <Track name="الموسيقى الأصلية">
        <Audio
          name="Narfid instrumental"
          src={staticFile("narfid-theme.wav")}
          durationInFrames={60 * fps}
          volume={0.65}
        />
      </Track>
    </AbsoluteFill>
  );
};
