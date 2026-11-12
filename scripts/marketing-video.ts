// Local campaign briefs and MP4 verification; no board or storage connection.
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { findVideo } from "../lib/marketing/video-briefs";
import {
  sonicSignature,
  videoScript,
  type VideoOutput,
} from "../lib/marketing/video-plan";

const hash = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
const arg = (key: string) => {
  const index = process.argv.indexOf(key);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const bin = resolve(
  "narfid-intro-video/node_modules/@remotion/compositor-win32-x64-msvc",
);
const probe = (file: string) =>
  JSON.parse(
    execFileSync(
      resolve(bin, "ffprobe.exe"),
      ["-v", "error", "-show_streams", "-show_format", "-of", "json", file],
      { encoding: "utf8", maxBuffer: 1024 * 1024 },
    ),
  );
export function pcmFromWav(bytes: Buffer) {
  if (
    bytes.toString("ascii", 0, 4) !== "RIFF" ||
    bytes.toString("ascii", 8, 12) !== "WAVE"
  )
    throw new Error("Expected decoded PCM WAV audio.");
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const length = bytes.readUInt32LE(offset + 4);
    if (bytes.toString("ascii", offset, offset + 4) === "data")
      return bytes.subarray(
        offset + 8,
        Math.min(bytes.length, offset + 8 + length),
      );
    offset += 8 + length + (length % 2);
  }
  throw new Error("Decoded WAV has no PCM data chunk.");
}
function audio(file: string, start?: number) {
  return pcmFromWav(
    execFileSync(
      resolve(bin, "ffmpeg.exe"),
      [
        "-v",
        "error",
        "-i",
        file,
        ...(start === undefined ? [] : ["-ss", String(start)]),
        "-t",
        "3",
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-c:a",
        "pcm_s16le",
        "-f",
        "wav",
        "pipe:1",
      ],
      { maxBuffer: 1024 * 1024 },
    ),
  );
}
export function signatureCorrelation(actual: Buffer, reference: Buffer) {
  let best = 0;
  const a = new Int16Array(
      actual.buffer,
      actual.byteOffset,
      actual.byteLength / 2,
    ),
    b = new Int16Array(
      reference.buffer,
      reference.byteOffset,
      reference.byteLength / 2,
    );
  for (let lag = -400; lag <= 400; lag += 8) {
    let ab = 0,
      aa = 0,
      bb = 0;
    for (let i = 400; i < Math.min(a.length, b.length) - 400; i++) {
      const x = a[i + lag],
        y = b[i];
      ab += x * y;
      aa += x * x;
      bb += y * y;
    }
    if (aa && bb) best = Math.max(best, ab / Math.sqrt(aa * bb));
  }
  return best;
}
export function validateSignatureManifest(signature: Record<string, unknown>) {
  const nonempty = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0;
  const provenance =
    signature.kind === "instrumental"
      ? nonempty(signature.generator)
      : (signature.kind === undefined || signature.kind === "voice") &&
        nonempty(signature.voiceId);
  if (
    signature.id !== sonicSignature.id ||
    signature.approved !== true ||
    !nonempty(signature.provider) ||
    !nonempty(signature.rights) ||
    !provenance
  )
    throw new Error(
      "An approved signature manifest with audio provenance and usage rights is required.",
    );
}
export function hasAuthorizedAudioReview(qa: Record<string, unknown>) {
  return (
    qa.audioListened === true ||
    (qa.audioReviewWaivedByOwner === true &&
      typeof qa.ownerAuthorization === "string" &&
      qa.ownerAuthorization.trim().length > 0)
  );
}
export async function verifyVideo(
  file: string,
  signatureManifest: string | undefined,
  qaFile: string,
  expectedSeconds: number,
): Promise<{ bytes: Buffer; metadata: VideoOutput }> {
  const bytes = await readFile(file);
  let signature: { audioFile: string; sha256: string; id: string } | undefined;
  let signaturePath: string | undefined;
  if (signatureManifest) {
    const manifest = JSON.parse(await readFile(signatureManifest, "utf8"));
    validateSignatureManifest(manifest);
    signature = manifest;
    signaturePath = resolve(dirname(signatureManifest), manifest.audioFile);
    const signatureBytes = await readFile(signaturePath);
    if (hash(signatureBytes) !== manifest.sha256)
      throw new Error("Signature file changed after approval.");
    const signatureMeta = probe(signaturePath);
    if (Math.abs(Number(signatureMeta.format.duration) - 3) > 0.05)
      throw new Error("Signature master must be exactly three seconds.");
  }
  const data = probe(file),
    video = data.streams.find(
      (stream: { codec_type: string }) => stream.codec_type === "video",
    ),
    sound = data.streams.find(
      (stream: { codec_type: string }) => stream.codec_type === "audio",
    );
  const [numerator, denominator] = String(video?.avg_frame_rate)
    .split("/")
    .map(Number);
  const duration = Number(data.format.duration),
    fps = numerator / denominator;
  if (
    video?.codec_name !== "h264" ||
    sound?.codec_name !== "aac" ||
    video.width !== 1080 ||
    video.height !== 1920 ||
    !Number.isFinite(fps) ||
    !Number.isFinite(duration) ||
    Math.abs(fps - 30) > 0.01 ||
    Math.abs(duration - expectedSeconds) > 0.2
  )
    throw new Error(
      "Export must match its brief: H.264/AAC, 1080×1920, 30 fps and intended duration.",
    );
  execFileSync(
    resolve(bin, "ffmpeg.exe"),
    [
      "-v",
      "error",
      "-xerror",
      "-i",
      file,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-c:a",
      "pcm_s16le",
      "-f",
      "null",
      "NUL",
    ],
    { stdio: "pipe", maxBuffer: 1024 * 1024 },
  );
  if (
    signaturePath &&
    signatureCorrelation(audio(file, duration - 3), audio(signaturePath)) < 0.97
  )
    throw new Error(
      "The final three seconds do not match the approved sonic signature. Use the master without speed changes or a music bed over it.",
    );
  const qa = JSON.parse(await readFile(qaFile, "utf8"));
  if (
    qa.videoSha256 !== hash(bytes) ||
    (signature && qa.signatureSha256 !== signature.sha256) ||
    qa.visualReviewed !== true ||
    !hasAuthorizedAudioReview(qa)
  )
    throw new Error(
      "Exact-export QA must confirm frame review and actual listening, or document the owner's explicit instruction to publish without an additional listening review.",
    );
  return {
    bytes,
    metadata: {
      width: video.width,
      height: video.height,
      fps,
      duration,
      bytes: bytes.length,
      sha256: hash(bytes),
      audio: true,
      ...(signature ? { signature_id: signature.id } : {}),
    },
  };
}
async function main() {
  const command = process.argv[2],
    id = process.argv[3],
    video = findVideo(id);
  if (!video || !["brief", "verify"].includes(command))
    throw new Error(
      "Usage: npm run marketing:video -- brief|verify NV-001 [--file path --signature manifest.json --qa report.json]. Video production stays local; board upload commands are no longer supported.",
    );
  if (command === "brief") {
    console.log(videoScript(video));
    return;
  }
  const file = arg("--file"),
    signature = arg("--signature"),
    qa = arg("--qa");
  if (!file || !qa)
    throw new Error("--file and --qa are required; --signature is optional.");
  const verified = await verifyVideo(
    resolve(file),
    signature ? resolve(signature) : undefined,
    resolve(qa),
    video.durationSeconds,
  );
  console.log(
    JSON.stringify({ verified: true, video_id: id, ...verified.metadata }),
  );
}

if (
  process.argv[1]?.replaceAll("\\", "/").endsWith("/scripts/marketing-video.ts")
)
  void main().catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Video command failed.",
    );
    process.exitCode = 1;
  });
