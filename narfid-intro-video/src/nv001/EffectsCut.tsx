import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "../Composition";
import { clamp, motion, Reveal } from "./Stage";
import "../fonts.css";
import "./effects-cut.css";

const descriptor = "نظام لإدارة الأندية والمنشآت الرياضية";

const Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const move = interpolate(
    frame,
    [0, 1.1 * fps, 5.5 * fps],
    [0.9, 1, 1.11],
    motion,
  );
  return (
    <AbsoluteFill>
      <header className="shift-effects-header">
        <div className="shift-effects-brand">نرفد — {descriptor}</div>
        <h1>
          قبل ما تسلّم
          <br />
          الوردية
        </h1>
      </header>
      <div className="shift-effects-screen" style={{ scale: move }}>
        <Img src={staticFile("screens/bookings.focus.png")} />
      </div>
      <div className="shift-effects-hook">
        <Reveal delay={2.4}>
          <span className="shift-effects-dot" />
          حجز ينتظر التأكيد
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Detail = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const press = interpolate(
    frame,
    [0, 0.48 * fps, durationInFrames],
    [0.92, 1, 1.02],
    motion,
  );
  return (
    <AbsoluteFill className="shift-effects-detail">
      <h2>{title}</h2>
      <div className="shift-effects-focus" style={{ scale: press }}>
        {value}
      </div>
      <Reveal delay={0.48}>
        <p>{description}</p>
      </Reveal>
    </AbsoluteFill>
  );
};

const Case = ({
  title,
  status,
  owner,
  action,
  time,
  renewal = false,
}: {
  title: string;
  status: string;
  owner: string;
  action: string;
  time: string;
  renewal?: boolean;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const focus = interpolate(frame, [3.5 * fps, 4.18 * fps], [0, 1], motion);
  return (
    <AbsoluteFill className="shift-effects-case">
      <div className="shift-effects-caption">من سجلّ تسليم الوردية</div>
      <h2>{title}</h2>
      <div className="shift-effects-card">
        <div
          className={
            renewal ? "shift-effects-badge renewal" : "shift-effects-badge"
          }
        >
          {status}
        </div>
        <Reveal delay={0.9}>
          <div className="shift-effects-field">
            <span>المسؤول</span>
            <strong>{owner}</strong>
          </div>
        </Reveal>
        <Reveal delay={2.2}>
          <div className="shift-effects-field">
            <span>الخطوة التالية</span>
            <strong>{action}</strong>
          </div>
        </Reveal>
        <Reveal delay={3.5}>
          <div
            className="shift-effects-time"
            style={{ scale: 0.97 + 0.03 * focus }}
          >
            <span>موعد المتابعة</span>
            <b dir="ltr">{time}</b>
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Recap = () => (
  <AbsoluteFill className="shift-effects-recap">
    <h2>ابدأ بثلاث حالات</h2>
    <ul>
      <li>
        <Reveal delay={0.45}>
          <span aria-hidden="true">✓</span> الحالة مفهومة
        </Reveal>
      </li>
      <li>
        <Reveal delay={1.15}>
          <span aria-hidden="true">✓</span> المسؤول محدّد
        </Reveal>
      </li>
      <li>
        <Reveal delay={1.85}>
          <span aria-hidden="true">✓</span> المتابعة بموعد
        </Reveal>
      </li>
    </ul>
    <Reveal delay={2.65}>
      <p>هل يقدر زميلك يكملها من الوصف؟</p>
    </Reveal>
  </AbsoluteFill>
);

const End = () => (
  <AbsoluteFill className="shift-effects-end">
    <Reveal>
      <Logo large />
    </Reveal>
    <p>{descriptor}</p>
  </AbsoluteFill>
);

const effect = {
  opening: { start: 0, length: 0.6 },
  cut: { start: 1.8, length: 0.46 },
  click: { start: 3.87, length: 0.2 },
  reveal: { start: 5.3, length: 1.02 },
};

const Cue = ({
  name,
  at,
  kind,
  volume,
}: {
  name: string;
  at: number;
  kind: keyof typeof effect;
  volume: number;
}) => {
  const { fps } = useVideoConfig();
  const { start, length } = effect[kind];
  return (
    <Audio
      name={name}
      src={staticFile("booking-study/effects.wav")}
      from={Math.round(at * fps)}
      trimBefore={Math.round(start * fps)}
      durationInFrames={Math.round(length * fps)}
      volume={volume}
      premountFor={fps}
    />
  );
};

export const ShiftEffectsCut = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wash = interpolate(frame, [0, 22 * fps, 34 * fps], [44, 58, 50], clamp);
  return (
    <AbsoluteFill
      className="shift-effects"
      lang="ar"
      dir="rtl"
      style={{ backgroundPosition: `${wash}% center` }}
    >
      <Sequence
        name="قبل تسليم الوردية"
        durationInFrames={5.5 * fps}
        premountFor={fps}
      >
        <Intro />
      </Sequence>
      <Sequence
        name="الحالة"
        from={5.5 * fps}
        durationInFrames={3.5 * fps}
        premountFor={fps}
      >
        <Detail
          title="الحالة"
          value="حجز ينتظر التأكيد"
          description="اكتب إيش باقي في الحجز."
        />
      </Sequence>
      <Sequence
        name="المسؤول"
        from={9 * fps}
        durationInFrames={3.5 * fps}
        premountFor={fps}
      >
        <Detail
          title="المسؤول"
          value="موظف الحجوزات"
          description="حدّد مين يتابعها بعد التسليم."
        />
      </Sequence>
      <Sequence
        name="الخطوة التالية"
        from={12.5 * fps}
        durationInFrames={3.5 * fps}
        premountFor={fps}
      >
        <Detail
          title="الخطوة التالية"
          value="راجع التأكيد ١٢:١٥"
          description="اربط الخطوة بموعد واضح."
        />
      </Sequence>
      <Sequence
        name="مثال الحجز"
        from={16 * fps}
        durationInFrames={6.5 * fps}
        premountFor={fps}
      >
        <Case
          title="حجز حصة"
          status="بانتظار التأكيد"
          owner="موظف الحجوزات"
          action="راجع تأكيد الحجز"
          time="١٢:١٥"
        />
      </Sequence>
      <Sequence
        name="مثال التجديد"
        from={22.5 * fps}
        durationInFrames={6.5 * fps}
        premountFor={fps}
      >
        <Case
          title="تجديد اشتراك"
          status="بانتظار مستند"
          owner="موظف التجديد"
          action="اطلب المستند الناقص"
          time="١٢:٣٠"
          renewal
        />
      </Sequence>
      <Sequence
        name="المراجعة قبل التسليم"
        from={29 * fps}
        durationInFrames={5 * fps}
        premountFor={fps}
      >
        <Recap />
      </Sequence>
      <Sequence
        name="توقيع نرفد"
        from={34 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      >
        <End />
      </Sequence>

      <Cue name="Opening impact" at={0} kind="opening" volume={0.88} />
      <Cue
        name="Pending reservation reveal"
        at={2.4}
        kind="click"
        volume={0.78}
      />
      <Cue name="Status close-up" at={5.5} kind="cut" volume={0.9} />
      <Cue name="Owner close-up" at={9} kind="click" volume={0.9} />
      <Cue name="Follow-up close-up" at={12.5} kind="reveal" volume={0.85} />
      <Cue name="Booking handoff card" at={16} kind="cut" volume={0.9} />
      <Cue name="Booking owner" at={16.9} kind="click" volume={0.61} />
      <Cue name="Booking follow-up" at={18.2} kind="click" volume={0.72} />
      <Cue name="Booking time" at={19.5} kind="reveal" volume={0.78} />
      <Cue name="Renewal handoff card" at={22.5} kind="opening" volume={0.84} />
      <Cue name="Renewal owner" at={23.4} kind="click" volume={0.61} />
      <Cue name="Renewal follow-up" at={24.7} kind="click" volume={0.72} />
      <Cue name="Renewal time" at={26} kind="reveal" volume={0.78} />
      <Cue name="Recap cut" at={29} kind="cut" volume={0.9} />
      <Cue name="Status check" at={29.45} kind="click" volume={0.6} />
      <Cue name="Owner check" at={30.15} kind="click" volume={0.72} />
      <Cue name="Follow-up check" at={30.85} kind="click" volume={0.84} />
      <Audio
        name="NARFID instrumental signature"
        src={staticFile("nv001/narfid-sonic-v1.wav")}
        from={34 * fps}
        durationInFrames={3 * fps}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
