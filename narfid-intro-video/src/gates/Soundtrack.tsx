import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

export const GateSoundtrack = () => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name="موسيقى هادئة جديدة"
      src={staticFile("gates/ambient-v5/music.mp3")}
      durationInFrames={45 * fps}
      premountFor={fps}
    />
  );
};
