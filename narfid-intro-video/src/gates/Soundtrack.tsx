import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

const effects = [
  { name: "لمسة ظهور العنوان", file: "title", seconds: 0.27 },
  { name: "ظهور بيانات العضوية", file: "membership", seconds: 6.2 },
  { name: "اكتمال المزامنة", file: "sync", seconds: 13 },
  { name: "السماح بالدخول", file: "allow", seconds: 18.8 },
  { name: "رفض الدخول", file: "deny", seconds: 22.13 },
  { name: "ظهور تفاصيل السجل", file: "log", seconds: 26.53 },
  { name: "فحص الجهاز", file: "device", seconds: 34.4 },
  { name: "تحديد سياسة الدخول", file: "policy", seconds: 35.6 },
  { name: "اختبار الربط", file: "test", seconds: 36.9 },
];

export const GateSoundtrack = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Audio
        name="إيقاع خلفية خافت · 132 BPM"
        src={staticFile("gates/rhythm-v6/score.mp3")}
        durationInFrames={45 * fps}
        volume={0.042}
        premountFor={fps}
      />
      {effects.map(({ name, file, seconds }) => (
        <Audio
          key={name}
          name={name}
          from={Math.round(seconds * fps)}
          src={staticFile(`gates/interface-effects/${file}.wav`)}
          premountFor={fps}
        />
      ))}
    </>
  );
};
