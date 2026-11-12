import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Header, Shot, Stage, Title, clamp } from "./Stage";
export const GateLog = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Title top={165} width={1600} size={82}>
        ولفريقك… <span style={{ color: "#3ecf8e" }}>سجل يوضح ما حدث.</span>
      </Title>
      <Shot
        file="control.png"
        x={666}
        y={1275}
        scale={1.3}
        width={1710}
        height={455}
        left={105}
        top={400}
      />
      <Interactive.Div
        name="تفاصيل السجل"
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 303,
          textAlign: "center",
          fontSize: 43,
          color: "#c5d8cb",
          opacity: interpolate(frame, [0.5 * fps, 1 * fps], [0, 1], clamp),
        }}
      >
        وقت المحاولة. العضو. وقرار البوابة.
      </Interactive.Div>
      <Interactive.Div
        name="توجيه فريق الاستقبال"
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 897,
          textAlign: "center",
          fontSize: 39,
          color: "#b9cebf",
          opacity: interpolate(frame, [3.6 * fps, 4.2 * fps], [0, 1], clamp),
        }}
      >
        ارجع إلى تفاصيل المحاولة لمراجعة الحالة مع العضو.
      </Interactive.Div>
    </Stage>
  );
};
