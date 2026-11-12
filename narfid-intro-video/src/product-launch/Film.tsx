import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ProductOpening } from "./Opening";
import { ProductMembership } from "./Membership";
import { ProductHandoff } from "./Handoff";
import { ProductKitchen } from "./Kitchen";
import { ProductTogether } from "./Together";
import { ProductClosing } from "./Closing";
import { clamp } from "./Stage";

export const ProductLaunchFilm = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#eaf5ef" }}>
      <Sequence
        name="نرفد — تفاصيل ناديك"
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <ProductOpening />
      </Sequence>
      <Sequence
        name="ملف العضو والاشتراك"
        from={5.6 * fps}
        durationInFrames={9.4 * fps}
        premountFor={fps}
      >
        <ProductMembership />
      </Sequence>
      <Sequence
        name="من الاشتراك إلى الخدمة"
        from={14.6 * fps}
        durationInFrames={6.4 * fps}
        premountFor={fps}
      >
        <ProductHandoff />
      </Sequence>
      <Sequence
        name="متابعة طلب المطبخ"
        from={20.6 * fps}
        durationInFrames={16.4 * fps}
        premountFor={fps}
      >
        <ProductKitchen />
      </Sequence>
      <Sequence
        name="تشغيل مترابط"
        from={36.6 * fps}
        durationInFrames={6.4 * fps}
        premountFor={fps}
      >
        <ProductTogether />
      </Sequence>
      <Sequence
        name="احجز عرضًا توضيحيًا"
        from={42.6 * fps}
        durationInFrames={5.4 * fps}
        premountFor={fps}
      >
        <ProductClosing />
      </Sequence>
      <Audio
        name="موسيقى نرفد الأصلية"
        src={staticFile("product-launch/score.wav")}
        premountFor={fps}
        volume={interpolate(
          frame,
          [0, fps, 46 * fps, 48 * fps],
          [0, 0.8, 0.8, 0],
          clamp,
        )}
      />
      <Audio
        name="اختيار الاشتراكات"
        src={staticFile("kitchen/click.wav")}
        from={8.05 * fps}
        premountFor={fps}
        volume={0.6}
      />
      <Audio
        name="بدء التحضير"
        src={staticFile("kitchen/click.wav")}
        from={25.2 * fps}
        premountFor={fps}
        volume={0.7}
      />
      <Audio
        name="تحديث التحضير"
        src={staticFile("kitchen/move.wav")}
        from={25.5 * fps}
        premountFor={fps}
        volume={0.3}
      />
      <Audio
        name="الطلب جاهز"
        src={staticFile("kitchen/ready.wav")}
        from={30.9 * fps}
        premountFor={fps}
        volume={0.6}
      />
    </AbsoluteFill>
  );
};
