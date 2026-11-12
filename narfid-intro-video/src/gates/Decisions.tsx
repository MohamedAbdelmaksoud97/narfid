import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Gate, Header, Stage, Title, clamp, ease } from "./Stage";
export const GateDecisions = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const second = frame >= 4 * fps;
  const local = second ? frame - 4 * fps : frame;
  return (
    <Stage>
      <Header label="قرار الدخول بعد مزامنة الصلاحيات" />
      <Title right={110} top={200} width={1500} size={77}>
        نفس البوابة.{" "}
        <span style={{ color: "#3ecf8e" }}>والقرار حسب الصلاحية.</span>
      </Title>
      <div style={{ position: "absolute", left: 80, top: 330 }}>
        <Gate
          open={
            second
              ? interpolate(local, [0, 0.65 * fps], [1, 0], ease)
              : interpolate(local, [0.8 * fps, 1.5 * fps], [0, 1], ease)
          }
          color={second ? "#f28679" : "#3ecf8e"}
        />
      </div>
      <Interactive.Div
        name="حالة العضو المستوفي للشروط"
        style={{
          position: "absolute",
          right: 150,
          top: 405,
          width: 800,
          opacity: interpolate(
            frame,
            [0, 0.4 * fps, 3.7 * fps, 4 * fps],
            [0, 1, 1, 0],
            clamp,
          ),
        }}
      >
        <div style={{ fontSize: 43, color: "#a4c2af" }}>سلمان الحربي</div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 15 }}>
          مستوفٍ للشروط
        </div>
        <div
          style={{
            fontSize: 66,
            color: "#3ecf8e",
            fontWeight: 700,
            marginTop: 25,
          }}
        >
          يُسمح بالدخول ✓
        </div>
        <div style={{ fontSize: 38, color: "#b9d2c3", marginTop: 27 }}>
          بعد مزامنة الصلاحية مع الجهاز
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="حالة العضو المنتهي اشتراكه"
        style={{
          position: "absolute",
          right: 150,
          top: 405,
          width: 800,
          opacity: interpolate(frame, [4 * fps, 4.45 * fps], [0, 1], clamp),
        }}
      >
        <div style={{ fontSize: 43, color: "#c8bdb3" }}>خالد القحطاني</div>
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 15 }}>
          اشتراك منتهٍ
        </div>
        <div
          style={{
            fontSize: 66,
            color: "#f28679",
            fontWeight: 700,
            marginTop: 25,
          }}
        >
          يُرفض وفق السياسة
        </div>
        <div style={{ fontSize: 38, color: "#c9c3b9", marginTop: 27 }}>
          صلاحية الدخول غير مفعّلة على الجهاز
        </div>
      </Interactive.Div>
    </Stage>
  );
};
