import {
  CanvasImage,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KitchenStage, clamp, ease, lens } from "./Stage";

// Real local UI captures. The lens and pointer are editorial motion, not a screencast.
// The UI removes completed orders from the active queue; no completion card is invented.
const Shot = ({ file, opacity }: { file: string; opacity: number }) => (
  <CanvasImage
    src={staticFile(`kitchen/${file}`)}
    style={{ position: "absolute", left: 0, top: 0, width: 1590, opacity }}
  />
);
export const KitchenProduct = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const times = [
    0, 3.5, 4.5, 7.2, 8.7, 9.7, 10.5, 12.7, 14.3, 15.2, 16.4, 17.3, 19.6, 21.4,
    22.6, 23.2, 24, 26,
  ].map((t) => t * fps);
  const scale = interpolate(
    frame,
    times,
    [
      1.23, 1.25, 2.15, 2.35, 2.5, 2.5, 1.9, 2.1, 2.15, 2.55, 2.55, 1.95, 2.1,
      2.5, 2.5, 1.25, 1.25, 1.25,
    ],
    lens,
  );
  const targetX = interpolate(
    frame,
    times,
    [
      660, 660, 1083, 1083, 1083, 1083, 660, 660, 660, 660, 660, 237, 237, 237,
      237, 660, 660, 660,
    ],
    lens,
  );
  const targetY = interpolate(
    frame,
    times,
    [
      855, 855, 861, 905, 1012, 1012, 795, 795, 795, 1000, 1000, 795, 795, 1000,
      1000, 710, 620, 620,
    ],
    lens,
  );
  const preparing = interpolate(frame, [9.82 * fps, 10.1 * fps], [0, 1], ease);
  const ready = interpolate(frame, [16.48 * fps, 16.76 * fps], [0, 1], ease);
  const completed = interpolate(
    frame,
    [22.72 * fps, 23.05 * fps],
    [0, 1],
    ease,
  );
  const sourceX = interpolate(
    frame,
    [0, 9.82 * fps, 10.1 * fps, 16.48 * fps, 16.76 * fps],
    [1083, 1083, 660, 660, 237],
    lens,
  );
  const sourceY = interpolate(
    frame,
    [0, 9.82 * fps, 10.1 * fps],
    [710, 710, 710],
    lens,
  );
  const pointerX = interpolate(
    frame,
    [
      8.3 * fps,
      9.5 * fps,
      10 * fps,
      14.4 * fps,
      16.15 * fps,
      16.8 * fps,
      20.8 * fps,
      22.4 * fps,
    ],
    [1220, 1083, 1083, 790, 660, 660, 370, 237],
    lens,
  );
  const pointerY = interpolate(
    frame,
    [8.3 * fps, 9.5 * fps, 14.4 * fps, 16.15 * fps, 20.8 * fps, 22.4 * fps],
    [880, 1023, 850, 1023, 850, 1023],
    lens,
  );
  const pointerOpacity = Math.max(
    interpolate(
      frame,
      [8.3 * fps, 8.7 * fps, 9.8 * fps, 10.1 * fps],
      [0, 1, 1, 0],
      clamp,
    ),
    interpolate(
      frame,
      [14.4 * fps, 14.8 * fps, 16.45 * fps, 16.75 * fps],
      [0, 1, 1, 0],
      clamp,
    ),
    interpolate(
      frame,
      [20.8 * fps, 21.2 * fps, 22.7 * fps, 23 * fps],
      [0, 1, 1, 0],
      clamp,
    ),
  );
  const click = Math.max(
    interpolate(frame, [9.6 * fps, 9.85 * fps, 10.15 * fps], [0, 1, 0], clamp),
    interpolate(frame, [16.25 * fps, 16.5 * fps, 16.8 * fps], [0, 1, 0], clamp),
    interpolate(
      frame,
      [22.48 * fps, 22.73 * fps, 23.03 * fps],
      [0, 1, 0],
      clamp,
    ),
  );
  return (
    <KitchenStage>
      <Interactive.Div
        name="تعريف نرفد"
        style={{
          position: "absolute",
          top: 94,
          left: 120,
          right: 120,
          textAlign: "center",
          fontSize: 40,
          fontWeight: 500,
          color: "#bad2c4",
        }}
      >
        نرفد — نظام لإدارة الأندية والمنشآت الرياضية
      </Interactive.Div>
      <Interactive.Div
        name="نافذة المطبخ والكاميرا"
        style={{
          position: "absolute",
          top: 365,
          left: 120,
          width: 1680,
          height: 570,
          overflow: "hidden",
          borderRadius: 22,
          border: "1px solid #496252",
          background: "#0d0d0c",
          boxShadow: "0 32px 90px #0009",
          opacity: interpolate(frame, [0, 0.5 * fps], [0.65, 1], clamp),
          translate: interpolate(
            frame,
            [0, 0.9 * fps],
            ["0px 30px", "0px 0px"],
            ease,
          ),
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1590,
            height: 1100,
            transformOrigin: "0 0",
            transform: `translate(${840 - targetX * scale}px, ${285 - targetY * scale}px) scale(${scale})`,
          }}
        >
          <Shot file="01-new.jpg" opacity={1} />
          <Shot file="02-preparing.jpg" opacity={preparing} />
          <Shot file="03-ready.jpg" opacity={ready} />
          <Shot file="04-completed.jpg" opacity={completed} />
          <div
            style={{
              position: "absolute",
              left: sourceX - 190,
              top: sourceY - 61,
              width: 380,
              height: 446,
              borderRadius: 24,
              border: "1px solid #75e6ac",
              opacity: 0.46 * (1 - completed),
              boxShadow: "0 0 25px #3ecf8e1a",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: pointerX - 11,
              top: pointerY - 11,
              width: 30,
              height: 30,
              border: "1px solid #c4ffe1",
              borderRadius: "50%",
              opacity: click,
              scale: 1 + click * 1.5,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: pointerX,
              top: pointerY,
              width: 15,
              height: 20,
              background: "#f0fff5",
              filter: "drop-shadow(0 2px 3px #0009)",
              clipPath:
                "polygon(0 0, 100% 58%, 62% 63%, 82% 92%, 64% 100%, 43% 72%, 22% 94%)",
              opacity: pointerOpacity,
            }}
          />
        </div>
      </Interactive.Div>
      <Interactive.Div
        name="مسار الطلب"
        style={{
          position: "absolute",
          top: 984,
          left: 120,
          right: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 44,
          fontSize: 30,
          color: "#a3b7ab",
          fontWeight: 500,
        }}
      >
        <span style={{ color: preparing < 0.5 ? "#7aefb5" : "#a3b7ab" }}>
          طلب جديد
        </span>
        <span style={{ color: "#496252" }}>←</span>
        <span
          style={{
            color: preparing > 0.5 && ready < 0.5 ? "#7aefb5" : "#a3b7ab",
          }}
        >
          قيد التحضير
        </span>
        <span style={{ color: "#496252" }}>←</span>
        <span
          style={{
            color: ready > 0.5 && completed < 0.5 ? "#7aefb5" : "#a3b7ab",
          }}
        >
          جاهز للاستلام
        </span>
        <span style={{ color: "#496252" }}>←</span>
        <span style={{ color: completed > 0.5 ? "#7aefb5" : "#a3b7ab" }}>
          مكتمل
        </span>
      </Interactive.Div>
    </KitchenStage>
  );
};
