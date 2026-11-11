import {
  AbsoluteFill,
  Series,
  Track,
  useVideoConfig,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { ShiftOpening } from "./Opening";
import { ShiftHandoff } from "./Handoff";
import { ShiftCases } from "./Cases";
import { ShiftChallenge } from "./Challenge";
import { ShiftClosing } from "./Closing";

// Music and effects only. The owner explicitly rejected all narration.
export const ShiftFilm = ({
  signatureFile = "",
}: {
  signatureFile?: string;
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence
          name="الوردية تنتهي والحالة تبقى"
          durationInFrames={5.5 * fps}
          premountFor={fps}
        >
          <ShiftOpening />
        </Series.Sequence>
        <Series.Sequence
          name="الحالة والمسؤول والخطوة التالية"
          durationInFrames={10.5 * fps}
          premountFor={fps}
        >
          <ShiftHandoff />
        </Series.Sequence>
        <Series.Sequence
          name="تسليم حالتين بمواعيد واضحة"
          durationInFrames={13 * fps}
          premountFor={fps}
        >
          <ShiftCases />
        </Series.Sequence>
        <Series.Sequence
          name="تحدي ثلاث حالات"
          durationInFrames={5 * fps}
          premountFor={fps}
        >
          <ShiftChallenge />
        </Series.Sequence>
        <Series.Sequence
          name="التوقيع الثابت · ثلاث ثوان"
          durationInFrames={3 * fps}
          premountFor={fps}
        >
          <ShiftClosing />
        </Series.Sequence>
      </Series>
      <Track name="Original score and synchronized tactile sound design">
        <Audio
          src={staticFile("nv001/music-only.wav")}
          durationInFrames={34 * fps}
          premountFor={fps}
        />
      </Track>
      {signatureFile && (
        <Audio
          name="NARFID instrumental signature"
          src={staticFile(signatureFile)}
          from={34 * fps}
          durationInFrames={3 * fps}
          premountFor={fps}
        />
      )}
    </AbsoluteFill>
  );
};
