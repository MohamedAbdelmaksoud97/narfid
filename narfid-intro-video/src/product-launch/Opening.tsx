import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Header, Lens, Stage, clamp, settle } from "./Stage";

export const ProductOpening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Interactive.Div
        name="وعد الفيلم"
        style={{
          position: "absolute",
          top: 201,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 120,
          fontWeight: 800,
          lineHeight: 1.2,
          opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0, 1.2 * fps],
            ["0px 45px", "0px 0px"],
            settle,
          ),
        }}
      >
        كل تفاصيل ناديك.
        <br />
        <span style={{ color: "#168052" }}>في منظومة واحدة.</span>
      </Interactive.Div>
      <Interactive.Div
        name="دخول النظام إلى الصورة"
        style={{
          position: "absolute",
          inset: 0,
          translate: interpolate(
            frame,
            [0.7 * fps, 2.3 * fps],
            ["0px 420px", "0px 0px"],
            settle,
          ),
          scale: interpolate(frame, [0.7 * fps, 5.8 * fps], [0.85, 1], settle),
          transformOrigin: "50% 100%",
        }}
      >
        <Lens
          file="gates/membership.png"
          x={680}
          y={600}
          zoom={1.05}
          left={290}
          top={580}
          width={1340}
          height={720}
        />
      </Interactive.Div>
    </Stage>
  );
};
