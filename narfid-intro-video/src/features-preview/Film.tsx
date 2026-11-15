import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  CanvasImage,
  Interactive,
  Sequence,
  getStaticFiles,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { ReactNode } from "react";
import { Logo } from "../Composition";
import { Header, Lens, Stage, clamp, settle } from "../product-launch/Stage";
import "./features-preview.css";

const voiceover = "features-preview/mansour.mp3";

const OpeningMoment = ({
  children,
  title,
  detail,
}: {
  children: ReactNode;
  title: string;
  detail: string;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className="features-moment">
      {children}
      <Interactive.Div
        name={title}
        className="features-moment-copy"
        style={{
          opacity: interpolate(frame, [1, 10], [0, 1], clamp),
          translate: interpolate(
            frame,
            [1, 20],
            ["0px 28px", "0px 0px"],
            settle,
          ),
        }}
      >
        <p>{detail}</p>
        <h1>{title}</h1>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

const Reception = () => {
  const frame = useCurrentFrame();
  return (
    <OpeningMoment title="عضو جديد" detail="الاستقبال">
      <div className="features-reception">
        <CanvasImage
          src={staticFile("club-reception-study.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 56%",
            scale: interpolate(frame, [0, 63], [1.015, 1.075], settle),
          }}
        />
      </div>
    </OpeningMoment>
  );
};

const ClubTitle = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className="features-title">
      <div className="features-orbit" />
      <Interactive.Div
        name="يوم عمل مع نرفد"
        className="features-title-copy"
        style={{
          opacity: interpolate(frame, [1, 16], [0, 1], clamp),
          translate: interpolate(
            frame,
            [1, 27],
            ["0px 28px", "0px 0px"],
            settle,
          ),
        }}
      >
        <Logo large />
        <h1>يوم عمل في النادي</h1>
        <p>نظام لإدارة الأندية والمنشآت الرياضية</p>
      </Interactive.Div>
    </AbsoluteFill>
  );
};

export const FeaturesOpening = () => (
  <Stage dark>
    <Sequence name="عضو عند الاستقبال" durationInFrames={64}>
      <Reception />
    </Sequence>
    <Sequence name="آخر مقعد" from={64} durationInFrames={71} premountFor={30}>
      <OpeningMoment title="باقي مقعد واحد" detail="حصة المساء">
        <Lens
          file="club-day/booking-form.jpg"
          x={790}
          y={329}
          zoom={1.57}
          left={96}
          top={294}
          width={958}
          height={479}
        />
      </OpeningMoment>
    </Sequence>
    <Sequence
      name="اقتراب إقفال الوردية"
      from={135}
      durationInFrames={67}
      premountFor={30}
    >
      <OpeningMoment title="الوردية قربت تنتهي" detail="الصندوق">
        <Lens
          file="club-day/invoice.jpg"
          x={671}
          y={434}
          zoom={1.54}
          left={96}
          top={264}
          width={952}
          height={539}
        />
      </OpeningMoment>
    </Sequence>
    <Sequence name="تعريف نرفد" from={202} durationInFrames={116}>
      <ClubTitle />
    </Sequence>
  </Stage>
);

export const FeaturesMembership = () => {
  const frame = useCurrentFrame();
  const isInvoice = frame >= 124 && frame < 196;
  const isActive = frame >= 196;
  return (
    <Stage>
      <Header />
      <Interactive.Div
        name="الأعضاء والاشتراكات"
        className="features-member-heading"
      >
        <h2>الأعضاء والاشتراكات</h2>
      </Interactive.Div>
      <Sequence name="ملف سلمان وباقة العضوية" durationInFrames={124}>
        <Lens
          file="gates/membership.png"
          x={interpolate(frame, [70, 118], [818, 456], settle)}
          y={interpolate(frame, [70, 118], [379, 676], settle)}
          zoom={interpolate(frame, [70, 118], [1.03, 1.62], settle)}
          left={96}
          top={276}
          width={1220}
          height={697}
        />
      </Sequence>
      <Sequence
        name="فاتورة الاشتراك"
        from={124}
        durationInFrames={72}
        premountFor={30}
      >
        <Lens
          file="club-day/invoice.jpg"
          x={826}
          y={283}
          zoom={1.18}
          left={96}
          top={276}
          width={1220}
          height={697}
        />
      </Sequence>
      <Sequence
        name="الاشتراك النشط"
        from={196}
        durationInFrames={86}
        premountFor={30}
      >
        <Lens
          file="gates/membership.png"
          x={interpolate(frame, [196, 240], [475, 417], settle)}
          y={interpolate(frame, [196, 240], [639, 669], settle)}
          zoom={interpolate(frame, [196, 240], [1.42, 1.66], settle)}
          left={96}
          top={276}
          width={1220}
          height={697}
        />
      </Sequence>
      <ol className="features-member-steps" aria-label="خطوات الاشتراك">
        <li className={!isInvoice && !isActive ? "is-current" : ""}>
          ملف العضو والباقة
        </li>
        <li className={isInvoice ? "is-current" : ""}>إصدار الفاتورة</li>
        <li className={isActive ? "is-current" : ""}>تفعيل الاشتراك</li>
      </ol>
    </Stage>
  );
};

export const FeaturesPreview = () => (
  <AbsoluteFill style={{ background: "#101b16" }}>
    <Sequence
      name="افتتاحية يوم النادي"
      durationInFrames={318}
      premountFor={30}
    >
      <FeaturesOpening />
    </Sequence>
    <Sequence
      name="ملف العضو والاشتراك"
      from={318}
      durationInFrames={282}
      premountFor={30}
    >
      <FeaturesMembership />
    </Sequence>
    <Audio
      name="الموسيقى"
      src={staticFile("product-launch/score.wav")}
      volume={(frame) =>
        interpolate(frame, [0, 12, 557, 599], [0, 0.48, 0.48, 0], clamp)
      }
    />
    {getStaticFiles().some((file) => file.name === voiceover) && (
      <Audio
        name="منصور — التعليق الصوتي"
        src={staticFile(voiceover)}
        from={8}
        premountFor={30}
      />
    )}
  </AbsoluteFill>
);
