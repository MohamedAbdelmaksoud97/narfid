import { defineConfig, type UserConfig } from "vite";
import vinext from "vinext";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { buildMarketingPacks } from "./scripts/build-marketing-packs";
import type { PackedManifest } from "./lib/marketing/packed-archive";

let packs: PackedManifest = {};
let preparation: Promise<PackedManifest> | undefined;

export default defineConfig(({ command, isPreview }): UserConfig => {
  const workers = command === "build" || isPreview;
  return {
    resolve: {
      alias: workers
        ? {
            "@/lib/server-assets": resolve("lib/server-assets.cloudflare.ts"),
            "@/lib/articles/image-processing": resolve(
              "lib/articles/image-processing.wasm.ts",
            ),
            "@cf-wasm/photon": "@cf-wasm/photon/workerd",
            "@/lib/marketing/archive": resolve(
              "lib/marketing/archive.cloudflare.ts",
            ),
          }
        : {},
    },
    plugins: [
      tailwindcss(),
      vinext({
        prerender: true,
        cache: { cdn: staticAssetsAdapter() },
      }),
      ...(workers
        ? cloudflare({
            // Keep workerd's global DOM declarations out of the browser typecheck.
            types: { includeRuntime: false },
            viteEnvironment: {
              name: "rsc",
              childEnvironments: ["ssr"],
            },
          })
        : []),
      {
        name: "narfid-private-board-assets",
        apply: "build",
        async buildStart() {
          packs = await (preparation ??= buildMarketingPacks(
            ".cloudflare/marketing-packs",
          ));
        },
        resolveId(id) {
          if (id === "virtual:narfid-marketing-packs")
            return "\0narfid-marketing-packs";
        },
        load(id) {
          if (id === "\0narfid-marketing-packs")
            return `export default ${JSON.stringify(packs)}`;
        },
        async writeBundle() {
          if (this.environment.name !== "client") return;
          // These are deliberately absent from public/ and vinext's public-file
          // manifest. Every external request runs the authorized board API first.
          const directory = resolve(
            this.environment.config.build.outDir,
            "api/board/marketing/assets",
          );
          await mkdir(directory, { recursive: true });
          await cp("content/marketing/assets", directory, {
            recursive: true,
            filter: (source) => !source.endsWith(".zip"),
          });
          await cp(
            "BUSINESS_LOGIC.md",
            resolve(directory, "business-rules.md"),
          );
          await cp(
            ".cloudflare/marketing-packs",
            resolve(directory, ".packs"),
            { recursive: true },
          );
        },
      },
    ],
  };
});
