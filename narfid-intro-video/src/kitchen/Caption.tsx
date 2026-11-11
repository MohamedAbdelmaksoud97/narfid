import type { CSSProperties } from "react";
import {
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  type InteractivitySchema,
} from "remotion";
import { clamp, ease } from "./Stage";
import "../fonts.css";

type Props = { title: string; note: string; style?: CSSProperties };
const CaptionInner = ({ title, note, style }: Props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <Interactive.Div
      style={{
        position: "absolute",
        top: 176,
        left: 120,
        right: 120,
        color: "#edf7f0",
        fontFamily: "Tajawal, sans-serif",
        direction: "rtl",
        textAlign: "center",
        ...style,
      }}
    >
      <Interactive.Div
        name="عنوان المشهد"
        style={{
          fontSize: 90,
          fontWeight: 800,
          lineHeight: 1.25,
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0, 0.55 * fps],
            ["0px 20px", "0px 0px"],
            ease,
          ),
        }}
      >
        {title}
      </Interactive.Div>
      <Interactive.Div
        name="إيضاح المشهد"
        style={{
          marginTop: 10,
          fontSize: 38,
          fontWeight: 500,
          color: "#abc8b8",
          opacity: interpolate(
            frame,
            [
              0.1 * fps,
              0.5 * fps,
              Math.max(0.6 * fps, durationInFrames - 0.15 * fps),
              durationInFrames,
            ],
            [0, 1, 1, 0],
            clamp,
          ),
        }}
      >
        {note}
      </Interactive.Div>
    </Interactive.Div>
  );
};
const schema = {
  title: {
    type: "text-content",
    default: "طلب العضو… وصل لأي مرحلة؟",
    description: "العنوان",
  },
  note: { type: "text-content", default: "", description: "النص المساند" },
} as const satisfies InteractivitySchema;
export const KitchenCaption = Interactive.withSchema({
  Component: CaptionInner,
  componentName: "<KitchenCaption>",
  schema,
  wrapInSequence: true,
});
