import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  getStaticFiles,
  staticFile,
  useVideoConfig,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { ClubDayOpening } from "./Opening";
import { ClubDayEnter } from "./Enter";
import { ClubDayMembership } from "./Membership";
import { ClubDayBooking } from "./Booking";
import { ClubDayCollection } from "./Collection";
import { ClubDayTogether } from "./Together";
import { ClubDayPromise } from "./Promise";
import { ClubDayClosing } from "./Closing";
import { clamp } from "./Stage";

const backgroundMusic = "club-day/audio/local-background.mp3";

export const ClubDayFilm = () => {
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#101b16" }}>
      <Sequence
        name="أسئلة يوم النادي"
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <ClubDayOpening />
      </Sequence>
      <Sequence
        name="ابدأ من مكان واحد"
        from={6 * fps}
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <ClubDayEnter />
      </Sequence>
      <Sequence
        name="تجديد الاشتراك"
        from={12 * fps}
        durationInFrames={9 * fps}
        premountFor={fps}
      >
        <ClubDayMembership />
      </Sequence>
      <Sequence
        name="تأكيد الحجز"
        from={21 * fps}
        durationInFrames={9 * fps}
        premountFor={fps}
      >
        <ClubDayBooking />
      </Sequence>
      <Sequence
        name="الفاتورة والتحصيل"
        from={30 * fps}
        durationInFrames={9 * fps}
        premountFor={fps}
      >
        <ClubDayCollection />
      </Sequence>
      <Sequence
        name="تفاصيل مترابطة"
        from={39 * fps}
        durationInFrames={8 * fps}
        premountFor={fps}
      >
        <ClubDayTogether />
      </Sequence>
      <Sequence
        name="وعد نرفد"
        from={47 * fps}
        durationInFrames={7 * fps}
        premountFor={fps}
      >
        <ClubDayPromise />
      </Sequence>
      <Sequence
        name="احجز عرضًا توضيحيًا"
        from={54 * fps}
        durationInFrames={6 * fps}
        premountFor={fps}
      >
        <ClubDayClosing />
      </Sequence>
      {getStaticFiles().some((file) => file.name === backgroundMusic) && (
        <Audio
          name="Baila Conmigo — موسيقى خلفية خافتة"
          src={staticFile(backgroundMusic)}
          premountFor={fps}
          volume={(frame) =>
            interpolate(
              frame,
              [0, 1.25 * fps, 57 * fps, 60 * fps],
              [0, 0.027, 0.027, 0],
              clamp,
            )
          }
        />
      )}
      <Audio
        name="أجواء البداية"
        src={staticFile("club-day/audio/room.wav")}
        premountFor={fps}
        volume={interpolate(
          f,
          [0, 0.5 * fps, 5 * fps, 7 * fps],
          [0, 0.5, 0.5, 0],
          clamp,
        )}
      />
      <Audio
        name="سؤال التجديد"
        src={staticFile("club-day/audio/question-1.wav")}
        from={0.5 * fps}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="سؤال الحجز"
        src={staticFile("club-day/audio/question-2.wav")}
        from={2 * fps}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="سؤال التحصيل"
        src={staticFile("club-day/audio/question-3.wav")}
        from={3.5 * fps}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="دخول النظام"
        src={staticFile("club-day/audio/sweep.wav")}
        from={6 * fps}
        premountFor={fps}
        volume={0.7}
      />
      <Audio
        name="استقرار الواجهة"
        src={staticFile("club-day/audio/settle.wav")}
        from={7.3 * fps}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="فتح ملف العضو"
        src={staticFile("club-day/audio/click.wav")}
        from={12.6 * fps}
        premountFor={fps}
        volume={0.7}
      />
      <Audio
        name="اختيار التجديد"
        src={staticFile("club-day/audio/click.wav")}
        from={15.2 * fps}
        premountFor={fps}
        volume={0.7}
      />
      <Audio
        name="نتيجة التجديد"
        src={staticFile("club-day/audio/success.wav")}
        from={18.4 * fps}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="تأكيد أمر التجديد"
        src={staticFile("club-day/audio/click.wav")}
        from={17.8 * fps}
        premountFor={fps}
        volume={0.7}
      />
      <Audio
        name="فتح الحجوزات"
        src={staticFile("club-day/audio/sweep.wav")}
        from={21 * fps}
        premountFor={fps}
        volume={0.35}
      />
      <Audio
        name="اختيار موعد"
        src={staticFile("club-day/audio/click.wav")}
        from={22.2 * fps}
        premountFor={fps}
        volume={0.7}
      />
      <Audio
        name="الحجز مؤكد"
        src={staticFile("club-day/audio/success.wav")}
        from={27.4 * fps}
        premountFor={fps}
        volume={0.65}
      />
      <Audio
        name="إبراز المحصل"
        src={staticFile("club-day/audio/focus.wav")}
        from={33 * fps}
        premountFor={fps}
        volume={0.6}
      />
      <Audio
        name="إبراز المتبقي"
        src={staticFile("club-day/audio/focus.wav")}
        from={35.5 * fps}
        premountFor={fps}
        volume={0.5}
      />
      <Audio
        name="اتصال التفاصيل"
        src={staticFile("club-day/audio/connect.wav")}
        from={39 * fps}
        premountFor={fps}
        volume={0.75}
      />
      <Audio
        name="ظهور الوعد"
        src={staticFile("club-day/audio/sweep.wav")}
        from={49.5 * fps}
        premountFor={fps}
        volume={0.3}
      />
      <Audio
        name="توقيع نرفد الصوتي"
        src={staticFile("club-day/audio/signature.wav")}
        from={54 * fps}
        premountFor={fps}
        volume={0.65}
      />
    </AbsoluteFill>
  );
};
