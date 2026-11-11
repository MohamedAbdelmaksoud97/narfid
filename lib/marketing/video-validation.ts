import { findVideo } from "./video-briefs";
import { videoPlatforms, type ProductionStatus } from "./video-plan";

export function validateVideoChange(input: Record<string, unknown>) {
  if (typeof input.video_id !== "string" || !findVideo(input.video_id))
    throw new Error("الفيديو غير موجود في الخطة.");
  if (!Number.isSafeInteger(input.revision) || (input.revision as number) < 0)
    throw new Error("نسخة السجل غير صالحة.");
  const identity = {
    video_id: input.video_id,
    revision: input.revision as number,
  };
  if (input.kind === "publication") {
    const platform = videoPlatforms.find((value) => value === input.platform);
    if (!platform || typeof input.published !== "boolean")
      throw new Error("بيانات النشر غير صالحة.");
    return {
      ...identity,
      kind: "publication" as const,
      platform,
      published: input.published,
    };
  }
  // Ready is set by the verified local production command, never this control.
  if (
    input.kind !== "production" ||
    !["planned", "producing", "needs_revision"].includes(String(input.status))
  )
    throw new Error(
      "حالة الإنتاج غير صالحة. يكتمل الإنتاج بعد التحقق من الملف ورفعه.",
    );
  return {
    ...identity,
    kind: "production" as const,
    status: input.status as Exclude<ProductionStatus, "ready">,
  };
}
