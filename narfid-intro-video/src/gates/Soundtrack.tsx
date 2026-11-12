import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

// Original 96 BPM score has a 4 dB envelope around the authored decision cues.
// Every sound remains a separate editable source node in the Studio timeline.
export const GateSoundtrack = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Audio
        name="موسيقى نرفد الأصلية — 96 BPM"
        src={staticFile("gates/sound-design-v2/music.mp3")}
        durationInFrames={45 * fps}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="أجواء استقبال النادي"
        src={staticFile("gates/sound-design-v2/ambience.wav")}
        from={Math.round(0.2 * fps)}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="الخطوة الأولى نحو البوابة"
        src={staticFile("gates/sound-design-v2/step.wav")}
        from={Math.round(0.8 * fps)}
        volume={0.85}
        premountFor={fps}
      />
      <Audio
        name="الخطوة الثانية نحو البوابة"
        src={staticFile("gates/sound-design-v2/step.wav")}
        from={Math.round(1.55 * fps)}
        volume={0.72}
        premountFor={fps}
      />
      <Audio
        name="حركة ظهور السؤال"
        src={staticFile("gates/sound-design-v2/move.wav")}
        from={Math.round(0.15 * fps)}
        volume={0.7}
        premountFor={fps}
      />
      <Audio
        name="تركيز حالة الاشتراك"
        src={staticFile("gates/sound-design-v2/focus.wav")}
        from={5 * fps}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="إبراز فترة الصلاحية"
        src={staticFile("gates/sound-design-v2/touch.wav")}
        from={Math.round(7.2 * fps)}
        volume={0.8}
        premountFor={fps}
      />
      <Audio
        name="حركة الانتقال إلى الربط"
        src={staticFile("gates/sound-design-v2/move.wav")}
        from={Math.round(10.8 * fps)}
        volume={0.8}
        premountFor={fps}
      />
      <Audio
        name="نبضات مزامنة الصلاحيات"
        src={staticFile("gates/sound-design-v2/sync.wav")}
        from={Math.round(13.3 * fps)}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="إشارة السماح الصاعدة"
        src={staticFile("gates/sound-design-v2/allow.wav")}
        from={Math.round(18.8 * fps)}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="فتح البوابة واستقرار القفل"
        src={staticFile("gates/sound-design-v2/motor.wav")}
        from={19 * fps}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="إغلاق البوابة بعد المرور"
        src={staticFile("gates/sound-design-v2/motor.wav")}
        from={22 * fps}
        volume={0.72}
        premountFor={fps}
      />
      <Audio
        name="رفض هادئ لصلاحية منتهية"
        src={staticFile("gates/sound-design-v2/deny.wav")}
        from={Math.round(22.6 * fps)}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="التركيز على سجل الأحداث"
        src={staticFile("gates/sound-design-v2/focus.wav")}
        from={26 * fps}
        volume={0.95}
        premountFor={fps}
      />
      <Audio
        name="مراجعة تفاصيل المحاولة"
        src={staticFile("gates/sound-design-v2/touch.wav")}
        from={30 * fps}
        volume={0.8}
        premountFor={fps}
      />
      <Audio
        name="التحقق من توافق الجهاز"
        src={staticFile("gates/sound-design-v2/check.wav")}
        from={Math.round(34.5 * fps)}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="تأكيد سياسة الدخول"
        src={staticFile("gates/sound-design-v2/check.wav")}
        from={Math.round(35.7 * fps)}
        volume={0.92}
        premountFor={fps}
      />
      <Audio
        name="اكتمال اختبار الربط"
        src={staticFile("gates/sound-design-v2/complete.wav")}
        from={37 * fps}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="قفلة نرفد الموسيقية الأصلية"
        src={staticFile("gates/sound-design-v2/signature.wav")}
        from={Math.round(40.4 * fps)}
        volume={1}
        premountFor={fps}
      />
    </>
  );
};
