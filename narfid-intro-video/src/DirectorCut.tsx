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
import { Logo, Phone } from "./Composition";
import "./director.css";

const c = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const motion = { ...c, easing: ease };
const G = "#3ecf8e";

const Lift = ({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <div
      style={{
        ...style,
        opacity: interpolate(f, [delay * fps, (delay + 0.3) * fps], [0, 1], c),
        translate: interpolate(
          f,
          [delay * fps, (delay + 0.8) * fps],
          ["0px 65px", "0px 0px"],
          motion,
        ),
      }}
    >
      {children}
    </div>
  );
};
const Set = ({
  children,
  light = false,
  label,
}: {
  children: React.ReactNode;
  light?: boolean;
  label: string;
}) => (
  <AbsoluteFill className={`dc ${light ? "dc-light" : ""}`} dir="rtl" lang="ar">
    <div className="dc-atmosphere" />
    <header>
      <Logo />
      <span>{label}</span>
    </header>
    {children}
    <div className="dc-baseline">
      <span>السند التقني للمؤسسات الرياضية</span>
      <span dir="ltr">www.narfid.com</span>
    </div>
  </AbsoluteFill>
);
const Rings = () => {
  const f = useCurrentFrame();
  return (
    <div
      className="dc-rings"
      style={{ rotate: interpolate(f, [0, 270], ["-12deg", "12deg"], c) }}
    >
      <i />
      <i />
      <i />
      <b />
    </div>
  );
};
const Shot = ({
  file,
  style,
}: {
  file: string;
  style?: React.CSSProperties;
}) => (
  <div className="dc-shot" style={style}>
    <div className="dc-shot-top">
      <i />
      <i />
      <i />
      <span>نرفد / مساحة العمل</span>
    </div>
    <CanvasImage
      src={staticFile(`screens/${file}`)}
      style={{ width: "100%", display: "block" }}
    />
  </div>
);
const Intro = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="لكل يوم في ناديك">
      <Rings />
      <div className="dc-opening">
        <Lift>
          <p className="dc-kicker">أعضاء. مواعيد. فريق. قرارات.</p>
        </Lift>
        <Lift delay={0.3}>
          <Interactive.H1 name="افتتاحية ناديك لا يتوقف">
            ناديك
            <br />
            <span>لا يتوقف.</span>
          </Interactive.H1>
        </Lift>
        <Lift delay={1}>
          <p>وخلف كل حركة… تفاصيل.</p>
        </Lift>
      </div>
      <div
        className="dc-fragments"
        style={{
          opacity: interpolate(
            f,
            [0, 0.5 * fps, 4.5 * fps, 5.8 * fps],
            [0, 1, 1, 0],
            c,
          ),
        }}
      >
        {["اشتراك", "حجز", "فاتورة", "حضور", "وجبة", "فرع"].map((text, i) => (
          <div
            key={text}
            style={{
              left: [160, 510, 1360, 1490, 250, 1330][i],
              top: [245, 145, 235, 570, 725, 800][i],
              rotate: `${[-8, 5, -6, 7, 4, -4][i]}deg`,
              translate: interpolate(
                f,
                [0, 4.4 * fps, 5.8 * fps],
                [
                  `0px ${i % 2 ? 60 : -60}px`,
                  "0px 0px",
                  `${960 - [160, 510, 1360, 1490, 250, 1330][i]}px ${540 - [245, 145, 235, 570, 725, 800][i]}px`,
                ],
                motion,
              ),
              scale: interpolate(f, [4.4 * fps, 5.8 * fps], [1, 0], motion),
            }}
          >
            <span /> {text}
          </div>
        ))}
      </div>
    </Set>
  );
};
const Connect = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="هنا تبدأ المنظومة">
      <div
        className="dc-bloom"
        style={{ scale: interpolate(f, [0, 1.4 * fps], [0.03, 1], motion) }}
      />
      <div className="dc-connect">
        <Lift delay={0.2}>
          <p className="dc-kicker">مع نرفد</p>
        </Lift>
        <Lift delay={0.5}>
          <h1>
            خلّ التفاصيل
            <br />
            <span>تتصل.</span>
          </h1>
        </Lift>
        <Lift delay={1.4}>
          <div className="dc-connect-line">
            <span>فريقك</span>
            <b>←</b>
            <span>خدماتك</span>
            <b>←</b>
            <span>فروعك</span>
          </div>
        </Lift>
      </div>
    </Set>
  );
};
const Members = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="الأعضاء والاشتراكات">
      <div className="dc-member-copy">
        <Lift>
          <p className="dc-kicker">العلاقة تبدأ بعضوية</p>
          <h1>
            وتستمرّ
            <br />
            <span>بتجربة.</span>
          </h1>
        </Lift>
        <Lift delay={0.6}>
          <p>
            من التسجيل إلى التجديد،
            <br />
            كل تفاصيل العضو في ملف واحد.
          </p>
        </Lift>
      </div>
      <div
        className="dc-member-screen"
        style={{
          translate: interpolate(
            f,
            [0, 1.2 * fps],
            ["-180px 120px", "0px 0px"],
            motion,
          ),
          rotate: interpolate(f, [0, 1.3 * fps], ["-8deg", "-2deg"], motion),
          scale: interpolate(f, [0, 8 * fps], [0.93, 1.04], motion),
        }}
      >
        <Shot file="subscriptions.focus.png" />
      </div>
      <Lift delay={1.1} style={{ position: "absolute", left: 220, top: 770 }}>
        <div className="dc-floating-status">
          <span>✓</span>
          <div>
            <small>دورة العضوية</small>
            <b>
              {f < 4 * fps
                ? "تسجيل وتفعيل"
                : f < 6 * fps
                  ? "تجديد وتجميد"
                  : "حضور واستحقاق دخول"}
            </b>
          </div>
        </div>
      </Lift>
      <div className="dc-side-index">01</div>
    </Set>
  );
};
const Bookings = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set light label="الحجوزات والمرافق">
      <Lift style={{ position: "absolute", top: 185, right: 150 }}>
        <p className="dc-kicker">الموعد المناسب. السعة المتاحة.</p>
        <h1>
          لكل حجز
          <br />
          <span>مكانه.</span>
        </h1>
      </Lift>
      <div className="dc-schedule">
        <div className="dc-schedule-line" />
        {["ملعب بادل", "حصة جماعية", "تدريب شخصي"].map((s, i) => (
          <div
            key={s}
            style={{
              opacity: interpolate(
                f,
                [(i * 0.35 + 0.6) * fps, (i * 0.35 + 0.9) * fps],
                [0, 1],
                c,
              ),
              translate: interpolate(
                f,
                [(i * 0.35 + 0.6) * fps, (i * 0.35 + 1.3) * fps],
                ["120px 0px", "0px 0px"],
                motion,
              ),
            }}
          >
            <span>✓</span>
            <b>{s}</b>
            <small>حجز · سعة · متابعة</small>
          </div>
        ))}
      </div>
      <div
        className="dc-booking-screen"
        style={{
          rotate: interpolate(f, [0, 1.2 * fps], ["8deg", "3deg"], motion),
          translate: interpolate(
            f,
            [0, 1.2 * fps],
            ["-220px 0px", "0px 0px"],
            motion,
          ),
        }}
      >
        <Shot file="bookings.focus.png" />
      </div>
    </Set>
  );
};
const Finance = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="نقاط البيع والمالية">
      <Lift style={{ position: "absolute", right: 150, top: 205 }}>
        <p className="dc-kicker">من البيع إلى التحصيل</p>
        <h1>
          كل حركة،
          <br />
          <span>لها سياق.</span>
        </h1>
        <p>فواتير، مدفوعات، وورديات صندوق.</p>
      </Lift>
      <div
        className="dc-finance-screen"
        style={{
          scale: interpolate(
            f,
            [0, 1.5 * fps, 8 * fps],
            [0.88, 1, 1.04],
            motion,
          ),
          translate: interpolate(
            f,
            [0, 1.2 * fps],
            ["0px 120px", "0px 0px"],
            motion,
          ),
        }}
      >
        <Shot file="finance.focus.png" />
      </div>
      <div className="dc-flow">
        <div
          className="dc-flow-line"
          style={{
            scale: `${interpolate(f, [0.8 * fps, 3 * fps], [0, 1], motion)} 1`,
          }}
        />
        {["بيع", "فاتورة", "تحصيل"].map((s, i) => (
          <Lift key={s} delay={0.8 + i * 0.55}>
            <div className="dc-flow-node">
              <span>0{i + 1}</span>
              <b>{s}</b>
            </div>
          </Lift>
        ))}
      </div>
    </Set>
  );
};
const Operations = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="المطبخ والمخزون">
      <Lift
        style={{
          position: "absolute",
          top: 170,
          right: 150,
          left: 150,
          textAlign: "center",
        }}
      >
        <p className="dc-kicker">من الواجهة… إلى ما وراء الخدمة</p>
        <h1 className="dc-wide-title">
          تشغيل <span>يتكامل.</span>
        </h1>
      </Lift>
      <div className="dc-mosaic">
        <div
          style={{
            rotate: interpolate(f, [0, 1.5 * fps], ["-8deg", "-2deg"], motion),
            translate: interpolate(
              f,
              [0, 1.1 * fps],
              ["-200px 130px", "0px 0px"],
              motion,
            ),
          }}
        >
          <Shot file="inventory.focus.png" />
          <b>مخزون مرتبط بالمبيعات</b>
        </div>
        <div
          style={{
            rotate: interpolate(f, [0, 1.5 * fps], ["8deg", "2deg"], motion),
            translate: interpolate(
              f,
              [0.3 * fps, 1.5 * fps],
              ["200px 130px", "0px 0px"],
              motion,
            ),
          }}
        >
          <Shot file="kitchen.focus.png" />
          <b>طلب، تجهيز، تسليم</b>
        </div>
      </div>
      <div
        className="dc-link"
        style={{
          scale: interpolate(f, [1.3 * fps, 2.1 * fps], [0, 1], motion),
        }}
      >
        ↔
      </div>
    </Set>
  );
};
const Mobile = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="تطبيق الجوال">
      <Rings />
      <Lift style={{ position: "absolute", right: 145, top: 255, width: 550 }}>
        <p className="dc-kicker">للإدارة. للفريق. للعضو.</p>
        <h1>
          النادي
          <br />
          <span>معك.</span>
        </h1>
        <p>تجربة متصلة أينما كنت.</p>
      </Lift>
      <div
        className="dc-phone-stage"
        style={{
          scale: interpolate(
            f,
            [0, 1.4 * fps, 9 * fps],
            [0.8, 1, 1.025],
            motion,
          ),
        }}
      >
        <Phone />
      </div>
      <Lift delay={1} style={{ position: "absolute", left: 140, top: 265 }}>
        <div className="dc-satellite">
          <span>↗</span>
          <b>اشتراكاتك وحجوزاتك</b>
        </div>
      </Lift>
      <Lift delay={1.7} style={{ position: "absolute", left: 105, top: 460 }}>
        <div className="dc-satellite">
          <span>◎</span>
          <b>خطتك وقياساتك</b>
        </div>
      </Lift>
      <Lift delay={2.4} style={{ position: "absolute", left: 160, top: 655 }}>
        <div className="dc-satellite">
          <span>≡</span>
          <b>فواتيرك ورسائلك</b>
        </div>
      </Lift>
    </Set>
  );
};
const Whole = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="رؤية تجمع التفاصيل">
      <div
        className="dc-ecosystem"
        style={{
          scale: interpolate(f, [0, 4.5 * fps], [1.1, 0.83], motion),
          opacity: interpolate(
            f,
            [0, 2.5 * fps, 4 * fps],
            [0.65, 0.36, 0.12],
            c,
          ),
        }}
      >
        <Shot
          file="overview.png"
          style={{ position: "absolute", width: 1000, left: 250, top: 140 }}
        />
        <Shot
          file="bookings.focus.png"
          style={{
            position: "absolute",
            width: 650,
            left: -150,
            top: 360,
            rotate: "-10deg",
          }}
        />
        <Shot
          file="subscriptions.focus.png"
          style={{
            position: "absolute",
            width: 650,
            right: -150,
            top: 340,
            rotate: "10deg",
          }}
        />
      </div>
      <Lift
        delay={0.5}
        style={{
          position: "absolute",
          top: 370,
          right: 140,
          left: 140,
          textAlign: "center",
        }}
      >
        <p className="dc-kicker">الأعضاء · التشغيل · الفروع</p>
        <h1 className="dc-whole-title">
          منظومة <span>واحدة.</span>
        </h1>
      </Lift>
    </Set>
  );
};
const Close = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Set label="نرفد مؤسستك بالتقنية">
      <div className="dc-closing">
        <Lift>
          <Logo large />
        </Lift>
        <Lift delay={0.25}>
          <h1>
            تفرّغ لتطوير ناديك.
            <br />
            <span>نرفدك بالتقنية.</span>
          </h1>
        </Lift>
        <Lift delay={0.9}>
          <div className="dc-cta">
            احجز عرضًا توضيحيًا <b>←</b>
          </div>
        </Lift>
        <Lift delay={1.25}>
          <p dir="ltr">www.narfid.com</p>
        </Lift>
      </div>
      <div
        className="dc-closing-ring"
        style={{ scale: interpolate(f, [0, 5 * fps], [0.8, 1.2], motion) }}
      />
    </Set>
  );
};
const Wipe = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: "-20% -10%",
          background: G,
          rotate: "-9deg",
          translate: interpolate(
            f,
            [0, 0.3 * fps, 0.65 * fps],
            ["110% 0%", "0% 0%", "-110% 0%"],
            { ...c, easing: Easing.bezier(0.65, 0, 0.35, 1) },
          ),
        }}
      />
    </AbsoluteFill>
  );
};

export const DirectorCut = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Track name="الإخراج · من التفاصيل إلى المنظومة">
        <Sequence name="01 · النادي لا يتوقف" durationInFrames={6 * fps}>
          <Intro />
        </Sequence>
        <Sequence
          name="02 · التفاصيل تتصل"
          from={6 * fps}
          durationInFrames={5 * fps}
        >
          <Connect />
        </Sequence>
        <Sequence
          name="03 · تجربة العضوية"
          from={11 * fps}
          durationInFrames={8 * fps}
        >
          <Members />
        </Sequence>
        <Sequence
          name="04 · لكل حجز مكانه"
          from={19 * fps}
          durationInFrames={7 * fps}
        >
          <Bookings />
        </Sequence>
        <Sequence
          name="05 · سياق الحركة المالية"
          from={26 * fps}
          durationInFrames={8 * fps}
        >
          <Finance />
        </Sequence>
        <Sequence
          name="06 · تشغيل يتكامل"
          from={34 * fps}
          durationInFrames={7 * fps}
        >
          <Operations />
        </Sequence>
        <Sequence
          name="07 · النادي معك"
          from={41 * fps}
          durationInFrames={9 * fps}
        >
          <Mobile />
        </Sequence>
        <Sequence
          name="08 · منظومة واحدة"
          from={50 * fps}
          durationInFrames={5 * fps}
        >
          <Whole />
        </Sequence>
        <Sequence
          name="09 · نرفدك بالتقنية"
          from={55 * fps}
          durationInFrames={5 * fps}
        >
          <Close />
        </Sequence>
      </Track>
      <Track name="انتقالات الهوية">
        <Sequence
          name="الهوية"
          from={5.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
        <Sequence
          name="العضوية"
          from={10.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
        <Sequence
          name="الحجز"
          from={18.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
        <Sequence
          name="المالية"
          from={25.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
        <Sequence
          name="التشغيل"
          from={33.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
        <Sequence
          name="الجوال"
          from={40.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
        <Sequence
          name="المنظومة"
          from={49.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
        <Sequence
          name="الخاتمة"
          from={54.7 * fps}
          durationInFrames={Math.round(0.65 * fps)}
        >
          <Wipe />
        </Sequence>
      </Track>
      <Track name="موسيقى · إيقاع متدرّج">
        <Audio
          name="Original stereo score"
          src={staticFile("director-score.mp3")}
          durationInFrames={60 * fps}
          volume={1}
        />
      </Track>
      <Track name="اندفاعات الانتقال">
        <Audio
          name="جمع التفاصيل"
          from={4.5 * fps}
          durationInFrames={1.2 * fps}
          src={staticFile("sfx/riser.wav")}
          volume={0.23}
        />
        <Audio
          name="كشف المنظومة"
          from={5.7 * fps}
          src={staticFile("sfx/whoosh.wav")}
          durationInFrames={1.2 * fps}
          volume={0.22}
        />
        <Audio
          name="دخول العضوية"
          from={10.7 * fps}
          src={staticFile("sfx/whoosh.wav")}
          durationInFrames={1.2 * fps}
          volume={0.18}
        />
        <Audio
          name="دخول الحجز"
          from={18.7 * fps}
          src={staticFile("sfx/whoosh.wav")}
          durationInFrames={1.2 * fps}
          volume={0.2}
        />
        <Audio
          name="دخول المالية"
          from={25.7 * fps}
          src={staticFile("sfx/whoosh.wav")}
          durationInFrames={1.2 * fps}
          volume={0.18}
        />
        <Audio
          name="دخول التشغيل"
          from={33.7 * fps}
          src={staticFile("sfx/whoosh.wav")}
          durationInFrames={1.2 * fps}
          volume={0.2}
        />
        <Audio
          name="دخول الجوال"
          from={40.7 * fps}
          src={staticFile("sfx/whoosh.wav")}
          durationInFrames={1.2 * fps}
          volume={0.18}
        />
        <Audio
          name="سحب الكاميرا"
          from={49.7 * fps}
          src={staticFile("sfx/riser.wav")}
          volume={0.22}
        />
        <Audio
          name="الظهور الأخير"
          from={54.7 * fps}
          src={staticFile("sfx/whoosh.wav")}
          durationInFrames={1.2 * fps}
          volume={0.2}
        />
      </Track>
      <Track name="تفاصيل الإجراءات">
        <Audio
          name="نبضة الهوية"
          from={6 * fps}
          src={staticFile("sfx/impact.wav")}
          volume={0.5}
        />
        <Audio
          name="تفعيل العضوية"
          from={12.1 * fps}
          src={staticFile("sfx/switch.wav")}
          durationInFrames={0.5 * fps}
          volume={0.18}
        />
        <Audio
          name="تحديث العضوية"
          from={15 * fps}
          src={staticFile("sfx/click.wav")}
          durationInFrames={0.3 * fps}
          volume={0.13}
        />
        <Audio
          name="تأكيد الحجز"
          from={20.3 * fps}
          src={staticFile("sfx/ding.wav")}
          durationInFrames={1.2 * fps}
          volume={0.12}
        />
        <Audio
          name="البيع"
          from={26.8 * fps}
          src={staticFile("sfx/click.wav")}
          durationInFrames={0.3 * fps}
          volume={0.15}
        />
        <Audio
          name="الفاتورة"
          from={27.35 * fps}
          src={staticFile("sfx/click.wav")}
          durationInFrames={0.3 * fps}
          volume={0.15}
        />
        <Audio
          name="التحصيل"
          from={27.9 * fps}
          src={staticFile("sfx/switch.wav")}
          durationInFrames={0.5 * fps}
          volume={0.18}
        />
        <Audio
          name="ربط التشغيل"
          from={35.5 * fps}
          src={staticFile("sfx/impact.wav")}
          volume={0.28}
        />
        <Audio
          name="اشتراك على الجوال"
          from={42 * fps}
          src={staticFile("sfx/switch.wav")}
          durationInFrames={0.5 * fps}
          volume={0.14}
        />
        <Audio
          name="تدريب على الجوال"
          from={42.7 * fps}
          src={staticFile("sfx/click.wav")}
          durationInFrames={0.3 * fps}
          volume={0.13}
        />
        <Audio
          name="فواتير على الجوال"
          from={43.4 * fps}
          src={staticFile("sfx/click.wav")}
          durationInFrames={0.3 * fps}
          volume={0.13}
        />
        <Audio
          name="ختم المنظومة"
          from={50.5 * fps}
          src={staticFile("sfx/impact.wav")}
          volume={0.38}
        />
        <Audio
          name="توقيع نرفد الصوتي"
          from={55.3 * fps}
          src={staticFile("sfx/signature.wav")}
          volume={0.75}
        />
      </Track>
    </AbsoluteFill>
  );
};
