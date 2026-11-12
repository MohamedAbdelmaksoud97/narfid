import {
  AbsoluteFill,
  CanvasImage,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Header, Stage, clamp, ease } from "./Stage";
export const GateOpening = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <CanvasImage
        src={staticFile("gates/entrance.png")}
        style={{
          width: 1920,
          height: 1080,
          objectFit: "cover",
          scale: interpolate(frame, [0, 5 * fps], [1.02, 1.09], ease),
          transformOrigin: "35% 60%",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg,transparent 32%,#09100b55 53%,#09100be8 100%)",
        }}
      />
      <Header />
      <Interactive.Div
        name="سؤال الاشتراك"
        style={{
          position: "absolute",
          right: 110,
          top: 320,
          width: 730,
          fontSize: 94,
          fontWeight: 800,
          lineHeight: 1.28,
          opacity: interpolate(frame, [0, 0.55 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0, 0.9 * fps],
            ["0px 34px", "0px 0px"],
            ease,
          ),
        }}
      >
        اشتراكه انتهى…
        <br />
        <span style={{ color: "#3ecf8e" }}>
          وش يصير
          <br />
          عند البوابة؟
        </span>
      </Interactive.Div>
      <Interactive.Div
        name="دخول إلى الرحلة"
        style={{
          position: "absolute",
          top: 780,
          right: 117,
          fontSize: 40,
          color: "#c5d7ca",
          opacity: interpolate(frame, [1.1 * fps, 1.65 * fps], [0, 1], clamp),
        }}
      >
        من حالة الاشتراك إلى قرار الدخول.
      </Interactive.Div>
    </Stage>
  );
};
