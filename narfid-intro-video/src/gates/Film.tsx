import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { GateOpening } from "./Opening";
import { GateMembership } from "./Membership";
import { GateSync } from "./Sync";
import { GateDecisions } from "./Decisions";
import { GateLog } from "./Log";
import { GateAssessment } from "./Assessment";
import { GateClosing } from "./Closing";
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
      <Audio
        name="افتتاح المشهد"
        src={staticFile("kitchen/move.wav")}
        volume={0.42}
        premountFor={fps}
      />
      <Audio
        name="تركيز العضوية"
        src={staticFile("kitchen/focus.wav")}
        from={5 * fps}
        volume={0.59}
        premountFor={fps}
      />
      <Audio
        name="الانتقال إلى المزامنة"
        src={staticFile("kitchen/move.wav")}
        from={11 * fps}
        volume={0.37}
        premountFor={fps}
      />
      <Audio
        name="وصول خطة الصلاحيات"
        src={staticFile("gates/sync.wav")}
        from={13.3 * fps}
        volume={0.6}
        premountFor={fps}
      />
      <Audio
        name="إشارة السماح"
        src={staticFile("gates/allow.wav")}
        from={18.8 * fps}
        volume={0.62}
        premountFor={fps}
      />
      <Audio
        name="حركة البوابة"
        src={staticFile("gates/gate.wav")}
        from={19 * fps}
        volume={0.43}
        premountFor={fps}
      />
      <Audio
        name="إشارة عدم الصلاحية"
        src={staticFile("gates/deny.wav")}
        from={22.6 * fps}
        volume={0.56}
        premountFor={fps}
      />
      <Audio
        name="الدخول إلى السجل"
        src={staticFile("kitchen/focus.wav")}
        from={26 * fps}
        volume={0.63}
        premountFor={fps}
      />
      <Audio
        name="تفاصيل المحاولة"
        src={staticFile("kitchen/click.wav")}
        from={30 * fps}
        volume={0.46}
        premountFor={fps}
      />
      <Audio
        name="خطوة فحص الجهاز"
        src={staticFile("kitchen/click.wav")}
        from={34.5 * fps}
        volume={0.52}
        premountFor={fps}
      />
      <Audio
        name="خطوة السياسة"
        src={staticFile("kitchen/click.wav")}
        from={35.7 * fps}
        volume={0.52}
        premountFor={fps}
      />
      <Audio
        name="خطوة اختبار الربط"
        src={staticFile("kitchen/ready.wav")}
        from={37 * fps}
        volume={0.48}
        premountFor={fps}
      />
      <Audio
        name="قفلة نرفد"
        src={staticFile("kitchen/closing.wav")}
        from={40 * fps}
        volume={0.62}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
