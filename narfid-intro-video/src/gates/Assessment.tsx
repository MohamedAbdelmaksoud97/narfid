import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Gate, Header, Stage, Title, clamp } from "./Stage";
export const GateAssessment = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Title top={185} width={1600} size={80}>
        تكامل بوابتك يبدأ{" "}
        <span style={{ color: "#3ecf8e" }}>بتقييم التوافق.</span>
      </Title>
      <div style={{ position: "absolute", left: 66, top: 340, opacity: 0.8 }}>
        <Gate />
      </div>
      <div style={{ position: "absolute", right: 170, top: 400, width: 880 }}>
        <Interactive.Div
          name="فحص الجهاز"
          style={{
            fontSize: 62,
            fontWeight: 700,
            borderBottom: "1px solid #375a44",
            paddingBottom: 30,
            opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], clamp),
          }}
        >
          <span style={{ color: "#3ecf8e", marginLeft: 30 }}>01</span>نفحص توافق
          جهازك.
        </Interactive.Div>
        <Interactive.Div
          name="سياسة الدخول"
          style={{
            fontSize: 62,
            fontWeight: 700,
            borderBottom: "1px solid #375a44",
            padding: "30px 0",
            opacity: interpolate(frame, [1.5 * fps, 2 * fps], [0, 1], clamp),
          }}
        >
          <span style={{ color: "#3ecf8e", marginLeft: 30 }}>02</span>نحدّد
          سياسة الدخول.
        </Interactive.Div>
        <Interactive.Div
          name="اختبار التكامل"
          style={{
            fontSize: 62,
            fontWeight: 700,
            paddingTop: 30,
            opacity: interpolate(frame, [2.8 * fps, 3.3 * fps], [0, 1], clamp),
          }}
        >
          <span style={{ color: "#3ecf8e", marginLeft: 30 }}>03</span>نختبر
          الربط.
        </Interactive.Div>
      </div>
    </Stage>
  );
};
