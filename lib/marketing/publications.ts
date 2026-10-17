import { findPlatform, postsFor, type PlatformId } from "./social";

export type Publication = {
  platform: PlatformId;
  post_id: string;
  published: boolean;
  deleted: boolean;
  published_at: string | null;
  revision: number;
  updated_at: string;
};

export function validatePublication(input: Record<string, unknown>) {
  const identity = validatePostChange(input);
  if (typeof input.published !== "boolean")
    throw new Error("بيانات حالة النشر غير صالحة.");
  return { ...identity, published: input.published };
}

export function validatePostChange(input: Record<string, unknown>) {
  const platform =
    typeof input.platform === "string"
      ? findPlatform(input.platform)
      : undefined;
  if (
    !platform ||
    typeof input.post_id !== "string" ||
    !postsFor(platform.id).some((post) => post.id === input.post_id)
  )
    throw new Error("المنشور غير موجود في المكتبة.");
  if (!Number.isSafeInteger(input.revision) || (input.revision as number) < 0)
    throw new Error("بيانات حالة النشر غير صالحة.");
  return {
    platform: platform.id,
    post_id: input.post_id,
    revision: input.revision as number,
  };
}
