import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage, Reveal, color, clamp } from "./Stage";

export const ShiftOpening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hand = interpolate(frame, [0, 2.4 * fps], [-32, 0], clamp);
  return (
    <Stage>
      <div className="nv-copy">
        <Reveal>
          <div className="nv-kicker">آخر خمس دقائق في الوردية</div>
        </Reveal>
        <Reveal delay={0.15}>
          <h1>
            انتهت ورديتك…
            <br />
            <em>وانتهت المعلومة؟</em>
          </h1>
        </Reveal>
      </div>
      <div className="nv-clock">
        <svg width="590" height="590" viewBox="0 0 590 590" fill="none">
          <circle
            cx="295"
            cy="295"
            r="260"
            stroke="#3ECF8E"
            strokeOpacity=".15"
            strokeWidth="2"
          />
          <circle
            cx="295"
            cy="295"
            r="238"
            stroke="#EDEDED"
            strokeOpacity=".17"
            strokeWidth="2"
          />
          {Array.from({ length: 60 }, (_, i) => (
            <line
              key={i}
              x1="295"
              y1="65"
              x2="295"
              y2={i % 5 === 0 ? 92 : 77}
              stroke={i % 5 === 0 ? color.white : "#637267"}
              strokeWidth={i % 5 === 0 ? 4 : 2}
              transform={`rotate(${i * 6} 295 295)`}
            />
          ))}
          <path
            d="M295 295L410 295"
            stroke={color.white}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M295 295L295 109"
            stroke={color.green}
            strokeWidth="8"
            strokeLinecap="round"
            transform={`rotate(${hand} 295 295)`}
          />
          <circle cx="295" cy="295" r="13" fill={color.green} />
        </svg>
        <div className="nv-clock-time">١١:٥٥</div>
      </div>
      <Reveal
        delay={0.7}
        style={{
          position: "absolute",
          top: 1225,
          left: 140,
          right: 140,
          rotate: "-3deg",
        }}
      >
        <div className="nv-case nv-open">
          <span className="nv-dot" />
          حجز ينتظر التأكيد<span className="nv-tag">معلّق</span>
        </div>
      </Reveal>
      <Reveal
        delay={1.4}
        style={{ position: "absolute", top: 1430, right: 105, left: 105 }}
      >
        <p className="nv-question">مين يتابعه؟</p>
      </Reveal>
    </Stage>
  );
};
