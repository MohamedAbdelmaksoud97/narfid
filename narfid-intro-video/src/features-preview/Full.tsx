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
  useVideoConfig,
} from "remotion";
import { ProductClosing } from "../product-launch/Closing";
import { Header, Lens, Stage, clamp, settle } from "../product-launch/Stage";
import { FeaturesPreview } from "./Film";
import { chapters, closingAt, type Chapter, type Shot } from "./chapters";

const restVoice = "features-preview/mansour-rest.mp3";

const FeatureShot = ({
  shot,
  wide,
  duration,
}: {
  shot: Shot;
  wide: boolean;
  duration: number;
}) => {
  const frame = useCurrentFrame();
  const [x, y, zoom] = shot.focus ?? [800, 455, 1.15];
  const width = wide ? 1728 : 1120;
  return (
    <>
      {shot.fit ? (
        <div className="features-full-fit">
          <CanvasImage
            src={staticFile(shot.file)}
            className="features-full-contain"
            style={{
              scale: interpolate(
                frame,
                [0, duration - 1],
                [0.985, 1.02],
                settle,
              ),
            }}
          />
        </div>
      ) : (
        <Lens
          file={shot.file}
          x={x}
          y={interpolate(frame, [0, duration - 1], [y - 12, y + 13], settle)}
          zoom={interpolate(
            frame,
            [0, duration - 1],
            [zoom, zoom + 0.055],
            settle,
          )}
          left={96}
          top={281}
          width={width}
          height={wide ? 645 : 678}
        />
      )}
      <Interactive.Div
        name={shot.label}
        className="features-full-cue"
        style={{
          opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          translate: interpolate(
            frame,
            [0, 15],
            ["0px 13px", "0px 0px"],
            settle,
          ),
        }}
      >
        <h3>{shot.label}</h3>
        {shot.note && <p>{shot.note}</p>}
      </Interactive.Div>
    </>
  );
};

const ChapterScene = ({ chapter, end }: { chapter: Chapter; end: number }) => {
  const { fps } = useVideoConfig();
  const chapterStart = Math.round(chapter.at * fps);
  return (
    <Stage dark={chapter.dark}>
      <Header dark={chapter.dark} />
      <div
        className={`features-full-chapter${chapter.wide ? " features-full-wide" : ""}${chapter.dark ? " features-full-dark" : ""}`}
      >
        <Interactive.Div
          name={chapter.title}
          className="features-member-heading"
        >
          <h2>{chapter.title}</h2>
        </Interactive.Div>
        {chapter.shots.map((shot, index) => {
          const start = Math.round(shot.at * fps);
          const stop = Math.round((chapter.shots[index + 1]?.at ?? end) * fps);
          const duration = stop - start;
          return (
            <Sequence
              key={shot.at}
              name={shot.label}
              from={start - chapterStart}
              durationInFrames={duration}
              premountFor={20}
            >
              <FeatureShot
                shot={shot}
                wide={Boolean(chapter.wide)}
                duration={duration}
              />
            </Sequence>
          );
        })}
      </div>
    </Stage>
  );
};

const scoreParts = [
  { from: 600, to: 1940 },
  { from: 1870, to: 3220 },
  { from: 3150, to: 4500 },
  { from: 4430, to: 5100 },
];

const recapScreens = [
  {
    file: "features-preview/screens/dashboard.jpg",
    label: "متابعة الفروع",
    x: 724,
    y: 375,
  },
  {
    file: "club-day/booking-confirmed.jpg",
    label: "حجوزات النادي",
    x: 825,
    y: 443,
  },
  { file: "gates/membership.png", label: "ملف العضو", x: 1030, y: 255 },
];

const FeaturesRecap = () => {
  const frame = useCurrentFrame();
  return (
    <Stage dark>
      <Header dark />
      <Interactive.Div
        name="تشغيل النادي في نظام واحد"
        className="features-recap-title"
      >
        <h2>تشغيل النادي في نظام واحد</h2>
      </Interactive.Div>
      {recapScreens.map((item, index) => (
        <div
          key={item.file}
          style={{
            position: "absolute",
            left: 100 + 590 * index,
            top: 375,
            width: 540,
            height: 482,
            opacity: interpolate(
              frame,
              [index * 7, index * 7 + 23],
              [0, 1],
              clamp,
            ),
            translate: interpolate(
              frame,
              [index * 7, index * 7 + 32],
              ["0px 32px", "0px 0px"],
              settle,
            ),
          }}
        >
          <Lens
            file={item.file}
            x={item.x}
            y={item.y}
            zoom={1.26}
            left={0}
            top={0}
            width={540}
            height={400}
          />
          <p className="features-recap-caption">{item.label}</p>
        </div>
      ))}
    </Stage>
  );
};

export const FeaturesFull = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const closingStart = Math.round(closingAt * fps);
  const endCardStart = Math.round(156.8 * fps);
  return (
    <AbsoluteFill style={{ background: "#101b16" }}>
      <Sequence name="الافتتاحية المعتمدة" durationInFrames={600}>
        <FeaturesPreview />
      </Sequence>
      {chapters.map((chapter, index) => {
        const end = chapters[index + 1]?.at ?? closingAt;
        const start = Math.round(chapter.at * fps);
        const duration = Math.round(end * fps) - start;
        return (
          <Sequence
            key={chapter.at}
            name={chapter.title}
            from={start}
            durationInFrames={duration}
            premountFor={30}
          >
            <ChapterScene chapter={chapter} end={end} />
          </Sequence>
        );
      })}
      <Sequence
        name="من العضو إلى الفروع"
        from={closingStart}
        durationInFrames={endCardStart - closingStart}
        premountFor={30}
      >
        <FeaturesRecap />
      </Sequence>
      <Sequence
        name="احجز عرضًا توضيحيًا"
        from={endCardStart}
        durationInFrames={durationInFrames - endCardStart}
        premountFor={30}
      >
        <ProductClosing />
      </Sequence>
      {scoreParts.map(({ from, to }) => {
        const duration = to - from;
        return (
          <Sequence
            key={from}
            name="الموسيقى تحت التعليق"
            from={from}
            durationInFrames={duration}
            premountFor={20}
          >
            <Audio
              src={staticFile("product-launch/score.wav")}
              trimBefore={60}
              volume={(frame) =>
                interpolate(
                  frame,
                  [0, 70, duration - 70, duration - 1],
                  [0, 0.48, 0.48, 0],
                  clamp,
                )
              }
            />
          </Sequence>
        );
      })}
      {getStaticFiles().some((file) => file.name === restVoice) && (
        <Audio
          name="منصور — بقية التعليق الصوتي"
          src={staticFile(restVoice)}
          from={606}
          premountFor={30}
        />
      )}
    </AbsoluteFill>
  );
};
