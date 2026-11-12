import {
  CanvasImage,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Header, Pointer, Stage, clamp, glide } from "./Stage";

export const ProductKitchen = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const preparing = interpolate(frame, [4.65 * fps, 4.95 * fps], [0, 1], clamp);
  const ready = interpolate(frame, [10.15 * fps, 10.45 * fps], [0, 1], clamp);
  const focusX = interpolate(
    frame,
    [0, 4.65 * fps, 5.55 * fps, 10.15 * fps, 11.05 * fps, 16 * fps],
    [1090, 1090, 664, 664, 238, 238],
    glide,
  );
  const zoom = interpolate(
    frame,
    [
      0,
      1.5 * fps,
      3.7 * fps,
      4.6 * fps,
      5.5 * fps,
      9.1 * fps,
      10.1 * fps,
      11 * fps,
    ],
    [1.65, 1.75, 1.75, 2.05, 1.75, 1.75, 2.05, 1.8],
    glide,
  );
  const focusY = interpolate(
    frame,
    [
      0,
      2.7 * fps,
      4.3 * fps,
      4.65 * fps,
      5.55 * fps,
      8.2 * fps,
      9.8 * fps,
      10.15 * fps,
      11.05 * fps,
      16 * fps,
    ],
    [820, 820, 1000, 1000, 820, 820, 1000, 1000, 820, 820],
    glide,
  );
  return (
    <Stage>
      <Header />
      <Interactive.Div
        name="عنوان حالة الطلب"
        style={{
          position: "absolute",
          top: 175,
          left: 100,
          right: 100,
          textAlign: "center",
          fontSize: 95,
          fontWeight: 800,
          lineHeight: 1.3,
        }}
      >
        <span style={{ opacity: 1 - preparing }}>طلب جديد. والخطوة واضحة.</span>
        <span
          style={{
            position: "absolute",
            inset: 0,
            opacity: preparing * (1 - ready),
          }}
        >
          الآن، قيد التحضير.
        </span>
        <span style={{ position: "absolute", inset: 0, opacity: ready }}>
          جاهز للاستلام.
        </span>
      </Interactive.Div>
      <div
        style={{
          position: "absolute",
          left: 150,
          top: 348,
          width: 1620,
          height: 610,
          borderRadius: 28,
          overflow: "hidden",
          background: "#0d0d0c",
          border: "1px solid #41625044",
          boxShadow: "0 38px 75px -35px #113a2466",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 810 - focusX * zoom,
            top: 305 - focusY * zoom,
            width: 1600,
            scale: zoom,
            transformOrigin: "0 0",
          }}
        >
          <CanvasImage
            src={staticFile("kitchen/01-new.jpg")}
            style={{ width: 1600, display: "block" }}
          />
          <CanvasImage
            src={staticFile("kitchen/02-preparing.jpg")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1600,
              opacity: preparing,
            }}
          />
          <CanvasImage
            src={staticFile("kitchen/03-ready.jpg")}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1600,
              opacity: ready,
            }}
          />
          <Pointer
            x={interpolate(
              frame,
              [2.7 * fps, 4.3 * fps, 5 * fps, 8.2 * fps, 9.8 * fps, 10.5 * fps],
              [1240, 1090, 1090, 810, 664, 664],
              glide,
            )}
            y={interpolate(
              frame,
              [2.7 * fps, 4.3 * fps, 5 * fps, 8.2 * fps, 9.8 * fps],
              [830, 1028, 1028, 840, 1028],
              glide,
            )}
            opacity={Math.max(
              interpolate(
                frame,
                [2.7 * fps, 3 * fps, 4.65 * fps, 4.95 * fps],
                [0, 1, 1, 0],
                clamp,
              ),
              interpolate(
                frame,
                [8.2 * fps, 8.5 * fps, 10.15 * fps, 10.45 * fps],
                [0, 1, 1, 0],
                clamp,
              ),
            )}
            click={Math.max(
              interpolate(
                frame,
                [4.4 * fps, 4.6 * fps, 4.95 * fps],
                [0, 1, 0],
                clamp,
              ),
              interpolate(
                frame,
                [9.9 * fps, 10.1 * fps, 10.45 * fps],
                [0, 1, 0],
                clamp,
              ),
            )}
          />
        </div>
      </div>
      <Interactive.Div
        name="تقدم الطلب"
        style={{
          position: "absolute",
          top: 996,
          left: 100,
          right: 100,
          display: "flex",
          justifyContent: "center",
          gap: 34,
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        <span style={{ color: preparing > 0.5 ? "#5f7a69" : "#11774c" }}>
          جديد
        </span>
        <span style={{ color: "#85b49a" }}>←</span>
        <span
          style={{
            color: preparing > 0.5 && ready < 0.5 ? "#11774c" : "#5f7a69",
          }}
        >
          قيد التحضير
        </span>
        <span style={{ color: "#85b49a" }}>←</span>
        <span style={{ color: ready > 0.5 ? "#11774c" : "#5f7a69" }}>
          جاهز للاستلام
        </span>
      </Interactive.Div>
    </Stage>
  );
};
