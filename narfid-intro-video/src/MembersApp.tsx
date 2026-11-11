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
        name="Pianet and brushed percussion"
        src={staticFile("members/sound/pianet-score.mp3")}
        premountFor={fps}
      />
      <Audio
        name="Invoice confirmation"
        src={staticFile("members/sound/invoice-note.wav")}
        from={Math.round(17.03 * fps)}
        premountFor={fps}
      />
      <Audio
        name="NARFID logo"
        src={staticFile("members/sound/logo-resolve.wav")}
        from={Math.round(40.27 * fps)}
        premountFor={fps}
      />
    </AbsoluteFill>
  );
}
