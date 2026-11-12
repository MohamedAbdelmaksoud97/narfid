import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Gate, Header, Shot, Stage, Title, clamp, ease } from "./Stage";
export const GateSync = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Title top={175} width={1600} size={79}>
        اربط صلاحية الدخول{" "}
        <span style={{ color: "#3ecf8e" }}>بسياسة ناديك.</span>
      </Title>
      <Shot
        file="control.png"
        x={974}
        y={934}
        scale={1.4}
        width={870}
        height={480}
        top={395}
        left={935}
      />
      <Interactive.Div
        name="بوابة متوافقة"
        style={{
          position: "absolute",
          left: 80,
          top: 320,
          scale: 0.95,
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], clamp),
        }}
      >
        <Gate />
      </Interactive.Div>
      <Interactive.Div
        name="مسار المزامنة"
        style={{
          position: "absolute",
          left: 740,
          top: 616,
          height: 3,
          width: interpolate(frame, [1 * fps, 2.4 * fps], [0, 200], ease),
          background: "#3ecf8e",
          boxShadow: "0 0 18px #3ecf8e",
        }}
      />
      <Interactive.Div
        name="معنى الربط"
        style={{
          position: "absolute",
          left: 450,
          top: 911,
          width: 1050,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 700,
          color: "#c3ebd4",
          opacity: interpolate(frame, [2.1 * fps, 2.7 * fps], [0, 1], clamp),
        }}
      >
        مزامنة الصلاحية مع الجهاز المتوافق
      </Interactive.Div>
      <Interactive.Div
        name="نطاق التنفيذ"
        style={{
          position: "absolute",
          right: 119,
          top: 310,
          fontSize: 36,
          color: "#abc4b4",
          opacity: interpolate(frame, [0.5 * fps, 1 * fps], [0, 1], clamp),
        }}
      >
        بعد ضبط السياسة واختبار التكامل
      </Interactive.Div>
    </Stage>
  );
};
