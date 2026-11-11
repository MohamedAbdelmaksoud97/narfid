import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Series,
  interpolate,
  staticFile,
  useVideoConfig,
} from "remotion";
import { Closing } from "./members/Closing";
import { Freeze } from "./members/Freeze";
import { Opening } from "./members/Opening";
import { Payment } from "./members/Payment";
import { Renew } from "./members/Renew";
import { Subscribe } from "./members/Subscribe";

export function MembersApp() {
  const { fps, durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence
          name="تطبيق الأعضاء"
          durationInFrames={6 * fps}
          premountFor={fps}
        >
          <Opening />
        </Series.Sequence>
        <Series.Sequence
          name="اختيار الباقة"
          durationInFrames={8 * fps}
          premountFor={fps}
        >
          <Subscribe />
        </Series.Sequence>
        <Series.Sequence
          name="طريقتا الدفع"
          durationInFrames={9 * fps}
          premountFor={fps}
        >
          <Payment />
        </Series.Sequence>
        <Series.Sequence
          name="تجديد الاشتراك"
          durationInFrames={8 * fps}
          premountFor={fps}
        >
          <Renew />
        </Series.Sequence>
        <Series.Sequence
          name="التجميد والاستئناف"
          durationInFrames={9 * fps}
          premountFor={fps}
        >
          <Freeze />
        </Series.Sequence>
        <Series.Sequence
          name="دعوة العرض"
          durationInFrames={6 * fps}
          premountFor={fps}
        >
          <Closing />
        </Series.Sequence>
      </Series>
      <Audio
        name="موسيقى نرفد"
        src={staticFile("director-score.mp3")}
        trimBefore={4 * fps}
        premountFor={fps}
        volume={(frame) => {
          const level = interpolate(
            frame,
            [
              0,
              fps,
              13.7 * fps,
              14.3 * fps,
              18.2 * fps,
              19 * fps,
              39.3 * fps,
              40.5 * fps,
              durationInFrames - 1,
            ],
            [0, 0.84, 0.84, 0.52, 0.52, 0.86, 0.86, 0.48, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          return level;
        }}
      />
      <Audio
        name="دخول شاشة العضوية"
        src={staticFile("members/sound/reveal.wav")}
        from={0}
        volume={0.54}
        premountFor={fps}
      />
      <Audio
        name="لمسة اختيار الباقة"
        src={staticFile("members/sound/tap.wav")}
        from={Math.round(8.75 * fps)}
        volume={0.74}
        premountFor={fps}
      />
      <Audio
        name="عرض خيارَي الدفع"
        src={staticFile("members/sound/payment.wav")}
        from={Math.round(14.35 * fps)}
        volume={0.66}
        premountFor={fps}
      />
      <Audio
        name="ظهور الفاتورة في النظام"
        src={staticFile("members/sound/invoice.wav")}
        from={Math.round(17.05 * fps)}
        volume={0.8}
        premountFor={fps}
      />
      <Audio
        name="لمسة طلب التجديد"
        src={staticFile("members/sound/tap.wav")}
        from={Math.round(25.8 * fps)}
        volume={0.7}
        premountFor={fps}
      />
      <Audio
        name="تحديد مدة التجميد"
        src={staticFile("members/sound/freeze.wav")}
        from={Math.round(33.65 * fps)}
        volume={0.69}
        premountFor={fps}
      />
      <Audio
        name="توقيع نرفد"
        src={staticFile("sfx/signature.wav")}
        from={Math.round(40.35 * fps)}
        volume={0.72}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
}
