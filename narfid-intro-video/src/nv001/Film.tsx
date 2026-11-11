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

// Preview is deliberately incomplete until the voice and first sonic master are approved.
export const ShiftFilm = ({
  narration = false,
  signatureFile = "",
}: {
  narration?: boolean;
  signatureFile?: string;
}) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence
          name="الوردية تنتهي والحالة تبقى"
          durationInFrames={4 * fps}
          premountFor={fps}
        >
          <ShiftOpening />
        </Series.Sequence>
        <Series.Sequence
          name="الحالة والمسؤول والخطوة التالية"
          durationInFrames={10 * fps}
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
          durationInFrames={7 * fps}
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
          src={staticFile("nv001/score.wav")}
          durationInFrames={34 * fps}
          premountFor={fps}
        />
      </Track>
      {narration && (
        <Track name="Arabic narration · individually editable scenes">
          <Audio
            src={staticFile("nv001/voice-01.wav")}
            from={0}
            durationInFrames={4 * fps}
            premountFor={fps}
          />
          <Audio
            src={staticFile("nv001/voice-02.wav")}
            from={4 * fps}
            durationInFrames={10 * fps}
            premountFor={fps}
          />
          <Audio
            src={staticFile("nv001/voice-03.wav")}
            from={14 * fps}
            durationInFrames={13 * fps}
            premountFor={fps}
          />
          <Audio
            src={staticFile("nv001/voice-04.wav")}
            from={27 * fps}
            durationInFrames={7 * fps}
            premountFor={fps}
          />
        </Track>
      )}
      {signatureFile && (
        <Audio
          name="Approved unchanged NARFID sonic master"
          src={staticFile(signatureFile)}
          from={34 * fps}
          durationInFrames={3 * fps}
          premountFor={fps}
        />
      )}
    </AbsoluteFill>
  );
};
