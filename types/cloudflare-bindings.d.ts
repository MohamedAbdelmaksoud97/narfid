declare module "cloudflare:workers" {
  // The binding shape itself is generated from cloudflare.config.ts.
  export const env: Cloudflare.Env;
}
declare module "virtual:narfid-marketing-packs" {
  const manifest: import("../lib/marketing/packed-archive").PackedManifest;
  export default manifest;
}
