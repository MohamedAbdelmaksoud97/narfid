import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Header, Shot, Stage, Title, clamp } from "./Stage";
export const GateMembership = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Title right={110} width={550} top={275} size={79}>
        قرار الدخول
        <br />
        يبدأ من
        <br />
        <span style={{ color: "#3ecf8e" }}>حالة الاشتراك.</span>
      </Title>
      <Shot
        file="membership.png"
        x={346}
        y={720}
        scale={1.7}
        width={1070}
        height={650}
        top={226}
      />
      <Interactive.Div
        name="بيانات العضوية"
        style={{
          position: "absolute",
          right: 110,
          top: 650,
          width: 540,
          fontSize: 41,
          lineHeight: 1.7,
          color: "#bbd0c2",
          opacity: interpolate(frame, [1.1 * fps, 1.6 * fps], [0, 1], clamp),
        }}
      >
        حالة العضوية.
        <br />
        فترة الصلاحية.
        <br />
        وشروط السماح بالدخول.
      </Interactive.Div>
    </Stage>
  );
};
