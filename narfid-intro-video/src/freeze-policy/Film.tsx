import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { FreezeRequest } from "./Request";
import { FreezePolicy } from "./Policy";
import { FreezeSchedule } from "./Schedule";
import { FreezeTimeline } from "./Timeline";
import { FreezeResume } from "./Resume";
import { FreezeClosing } from "./Closing";

export const FreezePolicyFilm = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence name="طلب العضو" durationInFrames={3.5 * fps} premountFor={fps}>
        <FreezeRequest />
      </Sequence>
      <Sequence
        name="سياسة الباقة"
        from={3.5 * fps}
        durationInFrames={7 * fps}
        premountFor={fps}
      >
        <FreezePolicy />
      </Sequence>
      <Sequence
        name="حفظ الجدولة"
        from={10.5 * fps}
        durationInFrames={6.5 * fps}
        premountFor={fps}
      >
        <FreezeSchedule />
      </Sequence>
      <Sequence
        name="بداية التجميد"
        from={17 * fps}
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <FreezeTimeline />
      </Sequence>
      <Sequence
        name="الاستئناف المبكر"
        from={23 * fps}
        durationInFrames={11 * fps}
        premountFor={fps}
      >
        <FreezeResume />
      </Sequence>
      <Sequence
        name="بطاقة نرفد"
        from={34 * fps}
        durationInFrames={4 * fps}
        premountFor={fps}
      >
        <FreezeClosing />
      </Sequence>
    </AbsoluteFill>
  );
};
