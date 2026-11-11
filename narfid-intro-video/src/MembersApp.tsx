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
              16.5 * fps,
              16.9 * fps,
              17.25 * fps,
              17.7 * fps,
              42.1 * fps,
              durationInFrames - 1,
            ],
            [0, 0.82, 0.82, 0.72, 0.72, 0.82, 0.82, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );
          return level;
        }}
      />
      <Audio
        name="لمسة اختيار الباقة"
        src={staticFile("members/sound/package-touch.wav")}
        from={Math.round(8.73 * fps)}
        premountFor={fps}
      />
      <Audio
        name="ظهور الفاتورة في النظام"
        src={staticFile("members/sound/invoice-paper.wav")}
        from={Math.round(16.86 * fps)}
        premountFor={fps}
      />
      <Audio
        name="لمسة طلب التجديد"
        src={staticFile("members/sound/renewal-touch.wav")}
        from={Math.round(25.78 * fps)}
        premountFor={fps}
      />
      <Audio
        name="تحديد مدة التجميد"
        src={staticFile("members/sound/freeze-touch.wav")}
        from={Math.round(33.63 * fps)}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
}
