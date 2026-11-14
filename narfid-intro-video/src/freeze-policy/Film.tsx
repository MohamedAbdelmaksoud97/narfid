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
      <Sequence name="طلب العضو" durationInFrames={4.5 * fps} premountFor={fps}>
        <FreezeRequest />
      </Sequence>
      <Sequence
        name="سياسة الباقة"
        from={4.5 * fps}
        durationInFrames={9.5 * fps}
        premountFor={fps}
      >
        <FreezePolicy />
      </Sequence>
      <Sequence
        name="حفظ الجدولة"
        from={14 * fps}
        durationInFrames={8 * fps}
        premountFor={fps}
      >
        <FreezeSchedule />
      </Sequence>
      <Sequence
        name="بداية التجميد"
        from={22 * fps}
        durationInFrames={7.5 * fps}
        premountFor={fps}
      >
        <FreezeTimeline />
      </Sequence>
      <Sequence
        name="الاستئناف المبكر"
        from={29.5 * fps}
        durationInFrames={13.5 * fps}
        premountFor={fps}
      >
        <FreezeResume />
      </Sequence>
      <Sequence
        name="بطاقة نرفد"
        from={43 * fps}
        durationInFrames={5 * fps}
        premountFor={fps}
      >
        <FreezeClosing />
      </Sequence>
    </AbsoluteFill>
  );
};
