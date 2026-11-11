import type { PlatformId } from "./social";

export const videoPillars = [
  { id: "operations", name: "مواقف ونصائح التشغيل", count: 20 },
  { id: "product", name: "دورات عمل المنصة", count: 15 },
  { id: "decisions", name: "قرارات تقنية واعتراضات", count: 10 },
  { id: "brand", name: "نرفد وخدماتها", count: 5 },
] as const;
export type VideoPillar = (typeof videoPillars)[number]["id"];
export const productionStatuses = {
  planned: "مخطط",
  producing: "قيد الإنتاج",
  needs_revision: "يحتاج تعديل",
  ready: "جاهز",
} as const;
export type ProductionStatus = keyof typeof productionStatuses;
export const videoPlatforms: PlatformId[] = [
  "instagram",
  "x",
  "linkedin",
  "facebook",
  "snapchat",
];
export const videoFormat = { width: 1080, height: 1920, fps: 30 } as const;
export const sonicSignature = {
  id: "narfid-sonic-v1",
  phrase: "نرفد… سندك التقني",
  durationSeconds: 3,
  direction:
    "نغمة موسيقية أصلية فقط، قصيرة تتصاعد ثم تستقر، دون تعليق صوتي في التوقيع. يُستخدم ملف الخاتمة نفسه في كل فيديو، وفق تعديل المالك في ١١ نوفمبر ٢٠٢٦.",
  soundSource:
    "موسيقى ومؤثرات أصلية فقط، دون تعليق صوتي في الفيديو كله. تنقل النصوص والحركة الرسالة.",
  assetStatus:
    "التوقيع الموسيقي narfid-sonic-v1 جاهز، ومصرّح باستخدامه وفق توجيه المالك بالإكمال والنشر. يُعاد استخدام الملف نفسه دون كلام أو تغيير السرعة.",
} as const;

export type VideoScene = {
  seconds: number;
  onScreen: string;
  message: string;
  visual: string;
  sound: string;
};
export type VideoBrief = {
  id: string;
  pillar: VideoPillar;
  topic: string;
  title: string;
  audience: string;
  goal: string;
  treatment: string;
  evidence: "operations" | "platform" | "custom" | "brand";
  scenes: VideoScene[];
  caption: string;
  cta: string;
  durationSeconds: number;
};
export function scene(
  seconds: number,
  onScreen: string,
  message: string,
  visual: string,
  sound = "موسيقى متدرجة وإشارة خفيفة مرتبطة بالحركة؛ دون تعليق صوتي.",
): VideoScene {
  return { seconds, onScreen, message, visual, sound };
}
export function brief(input: Omit<VideoBrief, "durationSeconds">): VideoBrief {
  const scenes = [
    ...input.scenes,
    scene(
      3,
      sonicSignature.phrase,
      "",
      "ظهور الشعار العربي الأصلي بهدوء، ثم استقرار على خلفية نرفد؛ مساحة آمنة حول الشعار.",
      "تشغيل ملف narfid-sonic-v1 الموسيقي المعتمد نفسه، دون تعليق صوتي؛ لا إعادة توليد للصوت أو تغيير لسرعته.",
    ),
  ];
  return {
    ...input,
    scenes,
    durationSeconds: scenes.reduce((total, item) => total + item.seconds, 0),
  };
}
export function videoScript(video: VideoBrief) {
  let at = 0;
  const scenes = video.scenes
    .map((item, index) => {
      const from = at;
      at += item.seconds;
      return `${index + 1}. ${from}–${at} ثانية\nالشاشة: ${item.onScreen}\nالمعنى المطلوب بصريًا: ${item.message}\nالصورة والحركة: ${item.visual}\nالصوت: ${item.sound}`;
    })
    .join("\n\n");
  return `${video.id} — ${video.title}\nالجمهور: ${video.audience}\nالهدف: ${video.goal}\nالمعالجة: ${video.treatment}\nالصوت: موسيقى ومؤثرات فقط؛ دون تعليق صوتي\n1080×1920 / 30fps / ${video.durationSeconds} ثانية\n\n${scenes}\n\nوصف المنشور:\n${video.caption}\n\nالدعوة: ${video.cta}`;
}

export type VideoProduction = {
  video_id: string;
  status: ProductionStatus;
  revision: number;
  attempt_id: string | null;
  output_path: string | null;
  output_metadata: VideoOutput | null;
  notes: string;
  updated_at: string;
};
export type VideoOutput = {
  width: number;
  height: number;
  fps: number;
  duration: number;
  bytes: number;
  sha256: string;
  audio: true;
  signature_id: string;
};
export type VideoPublication = {
  video_id: string;
  platform: PlatformId;
  published: boolean;
  published_at: string | null;
  revision: number;
};
export type VideoLibraryState = {
  productions: VideoProduction[];
  publications: VideoPublication[];
};
