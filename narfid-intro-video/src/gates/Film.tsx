import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { GateOpening } from "./Opening";
import { GateMembership } from "./Membership";
import { GateSync } from "./Sync";
import { GateDecisions } from "./Decisions";
import { GateLog } from "./Log";
import { GateAssessment } from "./Assessment";
import { GateClosing } from "./Closing";
import { GateSoundtrack } from "./Soundtrack";
export const GateFilm = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence
        name="السؤال عند بوابة النادي"
        durationInFrames={5 * fps}
        premountFor={fps}
      >
        <GateOpening />
      </Sequence>
      <Sequence
        name="من ملف العضو"
        from={5 * fps}
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <GateMembership />
      </Sequence>
      <Sequence
        name="مزامنة الصلاحيات"
        from={11 * fps}
        durationInFrames={7 * fps}
        premountFor={fps}
      >
        <GateSync />
      </Sequence>
      <Sequence
        name="السماح والرفض"
        from={18 * fps}
        durationInFrames={8 * fps}
        premountFor={fps}
      >
        <GateDecisions />
      </Sequence>
      <Sequence
        name="سجل محاولات الدخول"
        from={26 * fps}
        durationInFrames={8 * fps}
        premountFor={fps}
      >
        <GateLog />
      </Sequence>
      <Sequence
        name="خطوات تقييم التوافق"
        from={34 * fps}
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <GateAssessment />
      </Sequence>
      <Sequence
        name="خاتمة نرفد"
        from={40 * fps}
        durationInFrames={5 * fps}
        premountFor={fps}
      >
        <GateClosing />
      </Sequence>
      <GateSoundtrack />
    </AbsoluteFill>
  );
};
