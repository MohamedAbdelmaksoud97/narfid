import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Caption, Header, Lens, Pointer, Stage, clamp, glide } from "./Stage";

export const ProductMembership = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Header />
      <Caption sub="حالة العضوية، مدتها، واستخدامها.">
        ابدأ من ملف العضو.
      </Caption>
      <Lens
        file="gates/membership.png"
        x={interpolate(
          frame,
          [0, 2.5 * fps, 4.2 * fps, 8.8 * fps],
          [990, 990, 360, 360],
          glide,
        )}
        y={interpolate(
          frame,
          [0, 2.5 * fps, 4.2 * fps, 8.8 * fps],
          [250, 250, 690, 690],
          glide,
        )}
        zoom={interpolate(
          frame,
          [0, 2.5 * fps, 4.2 * fps, 8.8 * fps],
          [1.55, 1.6, 1.75, 1.82],
          glide,
        )}
        height={610}
      >
        <Pointer
          x={interpolate(
            frame,
            [1.1 * fps, 2.3 * fps, 4 * fps],
            [1250, 863, 558],
            glide,
          )}
          y={interpolate(
            frame,
            [1.1 * fps, 2.3 * fps, 4 * fps],
            [470, 485, 617],
            glide,
          )}
          opacity={interpolate(
            frame,
            [0.8 * fps, 1.2 * fps, 4 * fps, 4.4 * fps],
            [0, 1, 1, 0],
            clamp,
          )}
          click={interpolate(
            frame,
            [2.35 * fps, 2.5 * fps, 2.9 * fps],
            [0, 0.9, 0],
            clamp,
          )}
        />
      </Lens>
    </Stage>
  );
};
