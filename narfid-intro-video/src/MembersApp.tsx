import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile, useVideoConfig } from "remotion";
import { Closing } from "./members/Closing";
import { Freeze } from "./members/Freeze";
import { Opening } from "./members/Opening";
import { Payment } from "./members/Payment";
import { Renew } from "./members/Renew";
import { Subscribe } from "./members/Subscribe";

export function MembersApp() {
  const { fps } = useVideoConfig();
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
        name="Brain Dance · music edit"
        src={staticFile("members/sound/brain-dance-edit.mp3")}
        premountFor={fps}
      />
      <Audio
        name="Opening texture"
        src={staticFile("members/sound/opening-hit.wav")}
        from={Math.round((1 / 30) * fps)}
        premountFor={fps}
      />
      <Audio
        name="Package selection"
        src={staticFile("members/sound/selection-hit.wav")}
        from={Math.round((260 / 30) * fps)}
        premountFor={fps}
      />
      <Audio
        name="Payment reveal"
        src={staticFile("members/sound/payment-sweep.wav")}
        from={Math.round((409 / 30) * fps)}
        premountFor={fps}
      />
      <Audio
        name="Invoice confirmation"
        src={staticFile("members/sound/invoice-hit.wav")}
        from={Math.round((508 / 30) * fps)}
        premountFor={fps}
      />
      <Audio
        name="Renewal scene"
        src={staticFile("members/sound/renewal-sweep.wav")}
        from={Math.round((681 / 30) * fps)}
        premountFor={fps}
      />
      <Audio
        name="Freeze scene"
        src={staticFile("members/sound/freeze-sweep.wav")}
        from={Math.round((927 / 30) * fps)}
        premountFor={fps}
      />
      <Audio
        name="Closing card"
        src={staticFile("members/sound/closing-sweep.wav")}
        from={Math.round((1190 / 30) * fps)}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
}
