import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

// One musical voice and three dry taps. The score leaves silent windows for each tap.
export const GateSoundtrack = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Audio
        name="نغمات هادئة متباعدة"
        src={staticFile("gates/quiet-v3/music.mp3")}
        durationInFrames={45 * fps}
        volume={0.63}
        premountFor={fps}
      />
      <Audio
        name="لمسة المزامنة"
        src={staticFile("gates/quiet-v3/sync.wav")}
        from={Math.round(13.3 * fps)}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="لمسة السماح"
        src={staticFile("gates/quiet-v3/allow.wav")}
        from={Math.round(18.8 * fps)}
        volume={1}
        premountFor={fps}
      />
      <Audio
        name="لمسة الرفض"
        src={staticFile("gates/quiet-v3/deny.wav")}
        from={Math.round(22.6 * fps)}
        volume={1}
        premountFor={fps}
      />
    </>
  );
};
