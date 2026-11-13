import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig(({ isPreview, mode }) => ({
  accountId: "0109345bb46662a41365f2ffdbf57335",
  worker: defineWorker({
    name: "narfid",
    workersDev: mode === "migration",
    previewUrls: false,
    domains: ["narfid.com", "www.narfid.com"],
    entrypoint: "./worker.ts",
    compatibilityDate: "2026-11-13",
    compatibilityFlags: ["nodejs_compat"],
    placement: { region: "aws:eu-west-1" },
    observability: {
      enabled: true,
      traces: { enabled: true, headSamplingRate: 0.01 },
    },
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      NEXT_PUBLIC_SUPABASE_URL: bindings.secret(),
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: bindings.secret(),
      SUPABASE_SECRET_KEY: bindings.secret(),
      NARFID_PUBLIC_REBUILD_HOOK: bindings.secret(),
      NEXT_PUBLIC_SITE_URL: bindings.text("https://www.narfid.com"),
      NEXT_PUBLIC_GA_MEASUREMENT_ID: bindings.text("G-YRR3C0L5X9"),
      SITE_INDEXING_ENABLED: bindings.text(
        isPreview || mode === "migration" ? "false" : "true",
      ),
    },
  }),
}));
