import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage, Reveal, Check, clamp, motion } from "./Stage";

export const ShiftHandoff = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage light>
      <div className="nv-copy">
        <Reveal>
          <div className="nv-kicker">قبل ما تسلّم</div>
          <h1>
            ثلاثة تفاصيل.
            <br />
            <em>تكمل المعلومة.</em>
          </h1>
        </Reveal>
      </div>
      <div
        className="nv-paper"
        style={{
          rotate: interpolate(frame, [0, fps], ["-3deg", "0deg"], motion),
        }}
      >
        <div className="nv-paper-top">
          <span>تسليم الحالة</span>
          <span>١١:٥٥</span>
        </div>
        <Reveal delay={0.5}>
          <div className="nv-field">
            <span>الحالة</span>
            <strong>حجز ينتظر التأكيد</strong>
            <div
              className="nv-underline"
              style={{
                scale: `${interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], clamp)} 1`,
              }}
            />
          </div>
        </Reveal>
        <Reveal delay={2.5}>
          <div className="nv-field">
            <span>المسؤول</span>
            <strong>موظف الوردية التالية</strong>
            <div
              className="nv-underline"
              style={{
                scale: `${interpolate(frame, [2.5 * fps, 3.2 * fps], [0, 1], clamp)} 1`,
              }}
            />
          </div>
        </Reveal>
        <Reveal delay={4.6}>
          <div className="nv-field">
            <span>الخطوة التالية</span>
            <strong>راجع التأكيد الساعة ١٢:١٥</strong>
            <div
              className="nv-underline"
              style={{
                scale: `${interpolate(frame, [4.6 * fps, 5.3 * fps], [0, 1], clamp)} 1`,
              }}
            />
          </div>
        </Reveal>
        <Reveal delay={6.8}>
          <div className="nv-paper-end">
            <Check />
            <span>صار واضحًا وش باقي</span>
          </div>
        </Reveal>
      </div>
      <Reveal
        delay={7.5}
        style={{ position: "absolute", top: 1490, left: 100, right: 100 }}
      >
        <p className="nv-note">
          كلمة «تم» وحدها
          <br />
          ما تشرح اللي باقي.
        </p>
      </Reveal>
    </Stage>
  );
};
