import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { KitchenCaption } from "./Caption";
import { KitchenClosing } from "./Closing";
import { KitchenProduct } from "./Product";

export const KitchenFilm = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence
        name="رحلة طلب واحد داخل المطبخ"
        durationInFrames={26 * fps}
        premountFor={fps}
      >
        <KitchenProduct />
      </Sequence>
      <KitchenCaption
        name="السؤال"
        durationInFrames={4 * fps}
        premountFor={fps}
        title="طلب العضو… وصل لأي مرحلة؟"
        note="رحلة داخل المطبخ"
      />
      <KitchenCaption
        name="مراجعة الوجبة والكمية"
        from={4 * fps}
        durationInFrames={5 * fps}
        premountFor={fps}
        title="الوجبة واضحة. والكمية محدّدة."
        note="نراجع الطلب نفسه قبل بدء التحضير"
      />
      <KitchenCaption
        name="بدء التحضير"
        from={9 * fps}
        durationInFrames={6 * fps}
        premountFor={fps}
        title="ابدأ التحضير."
        note="وتابع انتقال الطلب إلى «قيد التحضير»"
      />
      <KitchenCaption
        name="مرور وقت التحضير"
        from={15 * fps}
        durationInFrames={2 * fps}
        premountFor={fps}
        title="بعد انتهاء التحضير…"
        note="يحدّث موظف المطبخ حالة الطلب"
      />
      <KitchenCaption
        name="الطلب جاهز"
        from={17 * fps}
        durationInFrames={4 * fps}
        premountFor={fps}
        title="الطلب جاهز للتسليم."
        note="نفس الطلب. والخطوة التالية واضحة."
      />
      <KitchenCaption
        name="تسجيل التسليم"
        from={21 * fps}
        durationInFrames={2.3 * fps}
        premountFor={fps}
        title="بعد تسليم الوجبة…"
        note="نضغط «تسليم وإكمال»"
      />
      <KitchenCaption
        name="نتيجة التسليم"
        from={Math.round(23.3 * fps)}
        durationInFrames={2.7 * fps}
        premountFor={fps}
        title="تم التسليم. واكتمل الطلب."
        note="يخرج الطلب من قائمة الطلبات النشطة"
      />
      <Sequence
        name="خاتمة نرفد"
        from={26 * fps}
        durationInFrames={4 * fps}
        premountFor={fps}
      >
        <KitchenClosing />
      </Sequence>
      <Audio
        name="دخول نافذة المطبخ"
        src={staticFile("kitchen/move.wav")}
        volume={0.44}
        premountFor={fps}
      />
      <Audio
        name="تركيز على الطلب"
        src={staticFile("kitchen/focus.wav")}
        from={Math.round(4.3 * fps)}
        volume={0.62}
        premountFor={fps}
      />
      <Audio
        name="إبراز الكمية"
        src={staticFile("kitchen/click.wav")}
        from={Math.round(7.2 * fps)}
        volume={0.42}
        premountFor={fps}
      />
      <Audio
        name="نقرة بدء التحضير"
        src={staticFile("kitchen/click.wav")}
        from={Math.round(9.82 * fps)}
        volume={0.78}
        premountFor={fps}
      />
      <Audio
        name="انتقال إلى التحضير"
        src={staticFile("kitchen/move.wav")}
        from={10 * fps}
        volume={0.38}
        premountFor={fps}
      />
      <Audio
        name="مرور وقت التحضير"
        src={staticFile("kitchen/move.wav")}
        from={15 * fps}
        volume={0.32}
        premountFor={fps}
      />
      <Audio
        name="نقرة الجاهزية"
        src={staticFile("kitchen/click.wav")}
        from={Math.round(16.48 * fps)}
        volume={0.7}
        premountFor={fps}
      />
      <Audio
        name="ظهور الطلب الجاهز"
        src={staticFile("kitchen/ready.wav")}
        from={Math.round(17.1 * fps)}
        volume={0.57}
        premountFor={fps}
      />
      <Audio
        name="نقرة تسليم وإكمال"
        src={staticFile("kitchen/click.wav")}
        from={Math.round(22.72 * fps)}
        volume={0.7}
        premountFor={fps}
      />
      <Audio
        name="تأكيد اكتمال الطلب"
        src={staticFile("kitchen/complete.wav")}
        from={Math.round(23.3 * fps)}
        volume={0.6}
        premountFor={fps}
      />
      <Audio
        name="قفلة المطبخ الأصلية"
        src={staticFile("kitchen/closing.wav")}
        from={26 * fps}
        volume={0.62}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
};
