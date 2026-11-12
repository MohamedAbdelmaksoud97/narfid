import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

export const GateSoundtrack = () => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name="إيقاع خلفية خافت · 132 BPM"
      src={staticFile("gates/rhythm-v6/score.mp3")}
      durationInFrames={45 * fps}
      volume={0.042}
      premountFor={fps}
    />
  );
};
