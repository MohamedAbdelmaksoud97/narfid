import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage, Reveal, Check, clamp } from "./Stage";

export const ShiftChallenge = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage light>
      <div className="nv-copy">
        <Reveal>
          <div className="nv-kicker">جرّبها في ورديتك القادمة</div>
          <h1>
            ابدأ بثلاث
            <br />
            <em>حالات فقط.</em>
          </h1>
        </Reveal>
      </div>
      <div className="nv-checklist">
        <Reveal delay={0.4}>
          <div>
            <Check
              progress={interpolate(
                frame,
                [1.3 * fps, 1.7 * fps],
                [0, 1],
                clamp,
              )}
            />
            <span>الحالة مفهومة</span>
          </div>
        </Reveal>
        <Reveal delay={1}>
          <div>
            <Check
              progress={interpolate(
                frame,
                [2.2 * fps, 2.6 * fps],
                [0, 1],
                clamp,
              )}
            />
            <span>المسؤول محدّد</span>
          </div>
        </Reveal>
        <Reveal delay={1.6}>
          <div>
            <Check
              progress={interpolate(
                frame,
                [3.1 * fps, 3.5 * fps],
                [0, 1],
                clamp,
              )}
            />
            <span>المتابعة بموعد</span>
          </div>
        </Reveal>
      </div>
      <Reveal
        delay={3.7}
        style={{ position: "absolute", top: 1330, right: 105, left: 105 }}
      >
        <p className="nv-note">
          هل يقدر زميلك
          <br />
          يكملها من الوصف؟
        </p>
      </Reveal>
    </Stage>
  );
};
