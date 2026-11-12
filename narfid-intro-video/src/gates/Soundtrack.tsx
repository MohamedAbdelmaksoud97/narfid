import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";

const effects = [
  { name: "اكتمال المزامنة", file: "sync", seconds: 13.1, length: 0.58 },
  { name: "السماح بالدخول", file: "allow", seconds: 18.8, length: 0.42 },
  { name: "رفض الدخول", file: "deny", seconds: 22.13, length: 0.28 },
  { name: "ظهور تفاصيل السجل", file: "log", seconds: 26.53, length: 0.26 },
];

export const GateSoundtrack = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Audio
        name="موسيقى إيقاعية · 132 BPM"
        src={staticFile("gates/rhythm-v6/score.mp3")}
        durationInFrames={45 * fps}
        volume={(frame) => {
          const seconds = frame / fps;
          return Math.min(
            ...effects.map(({ seconds: start, length }) =>
              interpolate(
                seconds,
                [start - 0.15, start, start + length, start + length + 0.2],
                [1, 0.43, 0.43, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            ),
          );
        }}
        premountFor={fps}
      />
      {effects.map(({ name, file, seconds }) => (
        <Audio
          key={file}
          name={name}
          from={Math.round(seconds * fps)}
          src={staticFile(`gates/rhythm-v6/${file}.wav`)}
          premountFor={fps}
        />
      ))}
    </>
  );
};
