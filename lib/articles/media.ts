// Same authenticated route for every variant; no public optimizer/cache for drafts.
export function imageVariant(src: string, width: number) {
  return src.endsWith(".gif") ? src : `${src}?w=${width}`;
}
export function imageSrcSet(src: string) {
  return src.endsWith(".gif")
    ? undefined
    : [320, 640, 960, 1440, 1920]
        .map((w) => `${imageVariant(src, w)} ${w}w`)
        .join(", ");
}
