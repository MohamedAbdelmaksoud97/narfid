import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";

const effects = [
  {
    name: "ظهور عنوان الفيديو",
    file: "sound-design-v2/move",
    seconds: 0.1,
    gain: 0.9,
  },
  {
    name: "ظهور بيانات العضوية",
    file: "sound-design-v2/focus",
    seconds: 6.2,
    gain: 0.76,
  },
  { name: "اكتمال المزامنة", file: "rhythm-v6/sync", seconds: 13.1, gain: 0.8 },
  {
    name: "السماح بالدخول",
    file: "rhythm-v6/allow",
    seconds: 18.8,
    gain: 0.85,
  },
  { name: "رفض الدخول", file: "rhythm-v6/deny", seconds: 22.13, gain: 0.82 },
  {
    name: "ظهور تفاصيل السجل",
    file: "rhythm-v6/log",
    seconds: 26.53,
    gain: 0.85,
  },
  {
    name: "فحص الجهاز",
    file: "sound-design-v2/touch",
    seconds: 34.4,
    gain: 0.78,
  },
  {
    name: "تحديد سياسة الدخول",
    file: "sound-design-v2/touch",
    seconds: 35.6,
    gain: 0.78,
  },
  {
    name: "اختبار الربط",
    file: "sound-design-v2/touch",
    seconds: 36.9,
    gain: 0.88,
  },
];

export const GateSoundtrack = () => {
  const { fps } = useVideoConfig();
  return effects.map(({ name, file, seconds, gain }) => (
    <Audio
      key={name}
      name={name}
      from={Math.round(seconds * fps)}
      src={staticFile(`gates/${file}.wav`)}
      volume={gain}
      premountFor={fps}
    />
  ));
};
