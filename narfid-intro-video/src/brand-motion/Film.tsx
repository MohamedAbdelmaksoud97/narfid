import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { BrandOpening } from "./Opening";
import { BrandDetails } from "./Details";
import { BrandTogether } from "./Together";
import { BrandPromise } from "./Promise";
import { BrandClosing } from "./Closing";

export const BrandMotionFilm = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence
        name="كل يوم في ناديك"
        durationInFrames={5 * fps}
        premountFor={fps}
      >
        <BrandOpening />
      </Sequence>
      <Sequence
        name="تفاصيل ناديك"
        from={5 * fps}
        durationInFrames={7.5 * fps}
        premountFor={fps}
      >
        <BrandDetails />
      </Sequence>
      <Sequence
        name="منظومة واحدة"
        from={12.5 * fps}
        durationInFrames={6.5 * fps}
        premountFor={fps}
      >
        <BrandTogether />
      </Sequence>
      <Sequence
        name="نرفدك بالتقنية"
        from={19 * fps}
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <BrandPromise />
      </Sequence>
      <Sequence
        name="نرفد"
        from={25 * fps}
        durationInFrames={5 * fps}
        premountFor={fps}
      >
        <BrandClosing />
      </Sequence>
      <Audio
        name="مؤثرات الهوية الأصلية"
        src={staticFile("brand-motion/effects.wav")}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
