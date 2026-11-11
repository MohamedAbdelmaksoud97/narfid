import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage, Reveal, color, motion, clamp } from "./Stage";

export const ShiftCases = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <div className="nv-copy">
        <Reveal>
          <div className="nv-kicker">كل حالة لها متابعة</div>
          <h1>
            سلّم
            <br />
            <em>حالة واضحة.</em>
          </h1>
        </Reveal>
      </div>
      <Reveal
        delay={0.6}
        style={{
          position: "absolute",
          top: 670,
          left: 105,
          right: 105,
          translate: interpolate(
            frame,
            [7 * fps, 9 * fps],
            ["0px 0px", "0px 80px"],
            motion,
          ),
        }}
      >
        <div className="nv-route" style={{ borderRightColor: color.amber }}>
          <div className="nv-route-top">
            <span style={{ color: color.amber }}>تجديد اشتراك</span>
            <span>بانتظار مستند</span>
          </div>
          <strong>طلب المستند الناقص</strong>
          <div className="nv-route-bottom">
            <span>المسؤول: موظف التجديد</span>
            <span>١٢:٣٠</span>
          </div>
        </div>
      </Reveal>
      <Reveal
        delay={2.8}
        style={{
          position: "absolute",
          top: 1010,
          left: 105,
          right: 105,
          translate: interpolate(
            frame,
            [7.5 * fps, 9.5 * fps],
            ["0px 0px", "0px 80px"],
            motion,
          ),
        }}
      >
        <div className="nv-route" style={{ borderRightColor: color.green }}>
          <div className="nv-route-top">
            <span style={{ color: color.green }}>حجز حصة</span>
            <span>بانتظار تأكيد</span>
          </div>
          <strong>مراجعة تأكيد الحجز</strong>
          <div className="nv-route-bottom">
            <span>المسؤول: موظف الحجوزات</span>
            <span>١٢:١٥</span>
          </div>
        </div>
      </Reveal>
      <div
        className="nv-shift-line"
        style={{
          top: 645,
          opacity: interpolate(frame, [6 * fps, 7 * fps], [0, 1], clamp),
        }}
      >
        <span>الوردية السابقة</span>
        <i />
        <span>الوردية التالية</span>
      </div>
      <Reveal
        delay={9.5}
        style={{ position: "absolute", top: 1470, left: 100, right: 100 }}
      >
        <p className="nv-note">
          موعد متابعة
          <br />
          <em>يفهمه الموظف التالي.</em>
        </p>
      </Reveal>
    </Stage>
  );
};
