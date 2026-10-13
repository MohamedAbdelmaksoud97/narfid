export { validateDocument } from "./validation";
import { youtubeId } from "./types";
export function youtubeSafeLink(src: unknown) {
  const id = youtubeId(src);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
}
