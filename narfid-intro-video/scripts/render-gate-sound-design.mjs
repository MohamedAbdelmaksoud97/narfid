import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const nameArgument = process.argv.indexOf("--name");
const minimumLoudnessArgument = process.argv.indexOf("--min-lufs");
const minimumLoudness =
  minimumLoudnessArgument < 0
    ? -33
    : Number(process.argv[minimumLoudnessArgument + 1]);
if (!Number.isFinite(minimumLoudness) || minimumLoudness >= -14) {
  throw Error("--min-lufs must be a finite value below -14");
}
const renderName =
  nameArgument < 0
    ? "narfid-gate-integration-sound-design"
    : process.argv[nameArgument + 1];
if (!/^[a-z0-9-]+$/.test(renderName ?? ""))
  throw Error(
    "Output name must contain lowercase letters, numbers and hyphens",
  );
const out = resolve(root, "out", renderName);
mkdirSync(out, { recursive: true });
const executable = (name) =>
  resolve(
    root,
    "node_modules/@remotion/compositor-win32-x64-msvc",
    name + ".exe",
  );
const probe = (path) =>
  JSON.parse(
    execFileSync(
      executable("ffprobe"),
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", path],
      { encoding: "utf8" },
    ),
  );
const pictureArgument = process.argv.indexOf("--picture");
const picture =
  pictureArgument < 0
    ? null
    : resolve(process.cwd(), process.argv[pictureArgument + 1]);
const output = resolve(root, "out", renderName + ".mp4");
const mix = resolve(out, "gate-final-mix.wav");
const errors = [];
const serveUrl = await bundle({
  entryPoint: resolve(root, "src/index.ts"),
  rootDir: root,
  outDir: resolve(out, "bundle"),
  rspack: true,
  onProgress: () => {},
});
const composition = await selectComposition({
  serveUrl,
  id: "NarfidGateIntegration",
});
await renderMedia({
  serveUrl,
  composition,
  codec: "wav",
  audioCodec: "pcm-16",
  outputLocation: mix,
  overwrite: true,
  onBrowserLog: (log) => {
    if (log.type === "error") errors.push(log.text);
  },
});
if (errors.length)
  throw Error("Composition audio errors: " + errors.join("; "));
if (picture) {
  const video = probe(picture).streams.find(
    (stream) => stream.codec_type === "video",
  );
  if (
    video?.codec_name !== "h264" ||
    video.width !== 1920 ||
    video.height !== 1080 ||
    video.avg_frame_rate !== "30/1" ||
    Number(video.nb_frames) !== 1350
  )
    throw Error(
      "Picture source must be the verified 45-second 1080p gate film",
    );
  execFileSync(executable("ffmpeg"), [
    "-v",
    "error",
    "-i",
    picture,
    "-i",
    mix,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-b:a",
    "256k",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-t",
    "45",
    "-movflags",
    "+faststart",
    "-y",
    output,
  ]);
} else {
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    audioCodec: "aac",
    audioBitrate: "256k",
    pixelFormat: "yuv420p",
    crf: 18,
    concurrency: 2,
    outputLocation: output,
    overwrite: true,
    onBrowserLog: (log) => {
      if (log.type === "error") errors.push(log.text);
    },
  });
}
execFileSync(executable("ffmpeg"), [
  "-v",
  "error",
  "-i",
  mix,
  "-codec:a",
  "libmp3lame",
  "-b:a",
  "320k",
  "-y",
  resolve(root, "out", renderName + ".mp3"),
]);
const meter = spawnSync(
  executable("ffmpeg"),
  [
    "-hide_banner",
    "-i",
    output,
    "-vn",
    "-af",
    "loudnorm=I=-18:TP=-1:LRA=9:print_format=json",
    "-c:a",
    "pcm_s16le",
    "-f",
    "null",
    "NUL",
  ],
  { encoding: "utf8" },
);
if (meter.status !== 0) throw Error("Audio measurement failed");
const meterText = [...meter.stderr.matchAll(/\{[\s\S]*?\}/g)].at(-1)?.[0];
const levels = JSON.parse(meterText);
if (
  Number(levels.input_tp) > -1 ||
  !Number.isFinite(Number(levels.input_i)) ||
  Number(levels.input_i) < minimumLoudness ||
  Number(levels.input_i) > -14
)
  throw Error("Mix level requires review: " + meterText);
execFileSync(executable("ffmpeg"), [
  "-v",
  "error",
  "-i",
  output,
  "-c:v",
  "libx264",
  "-preset",
  "ultrafast",
  "-c:a",
  "pcm_s16le",
  "-f",
  "null",
  "NUL",
]);
const result = probe(output);
const v = result.streams.find((stream) => stream.codec_type === "video");
const a = result.streams.find((stream) => stream.codec_type === "audio");
if (
  Number(v.nb_frames) !== 1350 ||
  v.width !== 1920 ||
  v.height !== 1080 ||
  v.avg_frame_rate !== "30/1" ||
  a.codec_name !== "aac" ||
  a.channels !== 2 ||
  Math.abs(Number(result.format.duration) - 45) > 0.1
)
  throw Error("Unexpected delivery streams");
const qa = {
  output,
  seconds: Number(result.format.duration),
  width: v.width,
  height: v.height,
  fps: 30,
  frames: Number(v.nb_frames),
  audioChannels: a.channels,
  bytes: statSync(output).size,
  levels,
  fullDecodePassed: true,
  audioListened: false,
  pictureSource: picture,
  browserErrors: errors,
  sha256: createHash("sha256").update(readFileSync(output)).digest("hex"),
  verifiedAt: new Date().toISOString(),
};
writeFileSync(
  resolve(out, "final-qa.json"),
  JSON.stringify(qa, null, 2) + "\n",
);
writeFileSync(resolve(out, "audio-measurement.txt"), meter.stderr);
console.log(JSON.stringify(qa, null, 2));
