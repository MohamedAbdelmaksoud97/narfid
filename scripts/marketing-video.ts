// Normal board authentication; no production reference-system connection.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import { createClient } from "@supabase/supabase-js";
import { findVideo } from "../lib/marketing/video-briefs";
import {
  sonicSignature,
  videoScript,
  type VideoOutput,
  type VideoProduction,
} from "../lib/marketing/video-plan";

setDefaultAutoSelectFamilyAttemptTimeout(3000);
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
function audio(file: string, start?: number) {
  return execFileSync(
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
      "-f",
      "s16le",
      "pipe:1",
    ],
    { maxBuffer: 1024 * 1024 },
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
export async function verifyVideo(
  file: string,
  signatureManifest: string,
  qaFile: string,
  expectedSeconds: number,
): Promise<{ bytes: Buffer; metadata: VideoOutput }> {
  const bytes = await readFile(file);
  if (bytes.length > 50 * 1024 * 1024)
    throw new Error(
      "Video exceeds the private bucket limit of 50 MiB; compress the export first.",
    );
  const signature = JSON.parse(await readFile(signatureManifest, "utf8"));
  if (
    signature.id !== sonicSignature.id ||
    signature.approved !== true ||
    !signature.voiceId ||
    !signature.provider ||
    !signature.rights
  )
    throw new Error(
      "An approved signature manifest with voice provenance and usage rights is required.",
    );
  const signaturePath = resolve(
    dirname(signatureManifest),
    signature.audioFile,
  );
  const signatureBytes = await readFile(signaturePath);
  if (hash(signatureBytes) !== signature.sha256)
    throw new Error("Signature file changed after approval.");
  const signatureMeta = probe(signaturePath);
  if (Math.abs(Number(signatureMeta.format.duration) - 3) > 0.05)
    throw new Error("Signature master must be exactly three seconds.");
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
    signatureCorrelation(audio(file, duration - 3), audio(signaturePath)) < 0.97
  )
    throw new Error(
      "The final three seconds do not match the approved sonic signature. Use the master without speed changes or a music bed over it.",
    );
  const qa = JSON.parse(await readFile(qaFile, "utf8"));
  if (
    qa.videoSha256 !== hash(bytes) ||
    qa.signatureSha256 !== signature.sha256 ||
    qa.visualReviewed !== true ||
    qa.audioListened !== true
  )
    throw new Error(
      "A QA report for this exact export must confirm frame review and actual listening.",
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
      signature_id: sonicSignature.id,
    },
  };
}
async function main() {
  const command = process.argv[2],
    id = process.argv[3],
    video = findVideo(id);
  if (
    !video ||
    !["brief", "status", "start", "revise", "finish", "verify"].includes(
      command,
    )
  )
    throw new Error(
      "Usage: npm run marketing:video -- brief|status|start|revise|verify|finish NV-001 [--file path --signature manifest.json --qa report.json] [--note text]",
    );
  if (command === "brief") {
    console.log(videoScript(video));
    return;
  }
  let verified: Awaited<ReturnType<typeof verifyVideo>> | undefined;
  if (command === "finish" || command === "verify") {
    const file = arg("--file"),
      signature = arg("--signature"),
      qa = arg("--qa");
    if (!file || !signature || !qa)
      throw new Error("--file, --signature and --qa are required.");
    verified = await verifyVideo(
      resolve(file),
      resolve(signature),
      resolve(qa),
      video.durationSeconds,
    );
    if (command === "verify") {
      console.log(
        JSON.stringify({ verified: true, video_id: id, ...verified.metadata }),
      );
      return;
    }
  }
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: true },
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: init?.signal ?? AbortSignal.timeout(60000),
          }),
      },
    },
  );
  const credentials = JSON.parse(
    await readFile(".private/board-accounts.json", "utf8"),
  );
  const account = credentials.accounts.find(
    (entry: { email: string }) => entry.email === "chairman@nerfed.example",
  );
  if (!account)
    throw new Error("Authorized chairman credentials are missing locally.");
  const signed = await client.auth.signInWithPassword({
    email: account.email,
    password: account.password,
  });
  if (signed.error || !signed.data.user)
    throw new Error("Board sign-in failed.");
  try {
    const membership = await client
      .from("board_members")
      .select("active")
      .eq("user_id", signed.data.user.id)
      .single();
    if (membership.error || !membership.data.active)
      throw new Error("Active board membership required.");
    const get = async () => {
      const result = await client
        .from("marketing_video_productions")
        .select("*")
        .eq("video_id", id)
        .single();
      if (result.error)
        throw new Error(`Video lookup failed (${result.error.code}).`);
      return result.data as VideoProduction;
    };
    let current = await get();
    const runFile = resolve(`.private/video-runs/${id}.json`);
    if (command === "status") {
      const { video_id, status, revision, attempt_id, output_path } = current;
      console.log(
        JSON.stringify({ video_id, status, revision, attempt_id, output_path }),
      );
      return;
    }
    if (command === "finish" && verified) {
      if (
        current.status === "ready" &&
        current.output_metadata?.sha256 === verified.metadata.sha256
      ) {
        console.log(
          `${id}: verified output is already attached; no duplicate write.`,
        );
        return;
      }
      const run = JSON.parse(await readFile(runFile, "utf8"));
      if (
        current.status !== "producing" ||
        current.attempt_id !== run.attempt_id ||
        current.revision !== run.revision
      )
        throw new Error(
          "Production changed since start. Read the board before retrying; do not overwrite another attempt.",
        );
      const path = `${id}/${current.attempt_id}/${verified.metadata.sha256}.mp4`;
      const upload = await client.storage
        .from("marketing-videos")
        .upload(path, verified.bytes, {
          contentType: "video/mp4",
          upsert: false,
          cacheControl: "0",
        });
      // An uncertain upload may already exist: verify its bytes, never replace it.
      const remote = await client.storage
        .from("marketing-videos")
        .download(path);
      if (
        remote.error ||
        !remote.data ||
        hash(new Uint8Array(await remote.data.arrayBuffer())) !==
          verified.metadata.sha256
      )
        throw new Error(
          `Upload verification failed${upload.error ? ` (${upload.error.name})` : ""}; status remains producing.`,
        );
      const completed = await client.rpc("set_marketing_video_production", {
        p_video_id: id,
        p_status: "ready",
        p_revision: current.revision,
        p_attempt_id: current.attempt_id,
        p_output_path: path,
        p_output_metadata: verified.metadata,
        p_notes: arg("--note") ?? "",
      });
      if (completed.error) {
        current = await get();
        if (
          current.status !== "ready" ||
          current.output_metadata?.sha256 !== verified.metadata.sha256
        )
          throw new Error(
            `Completion not saved (${completed.error.code}); inspect status before retrying.`,
          );
      }
      current = await get();
      if (current.status !== "ready" || current.output_path !== path)
        throw new Error("Completion read-back failed.");
      console.log(
        `${id}: MP4 verified, privately uploaded and board status saved as ready. Publication states unchanged.`,
      );
      return;
    }
    if (command === "start" && current.status === "producing") {
      const run = JSON.parse(
        await readFile(runFile, "utf8").catch(() => "null"),
      );
      if (
        run?.attempt_id === current.attempt_id &&
        run.revision === current.revision
      ) {
        console.log(`${id}: resuming existing production attempt.`);
        return;
      }
      throw new Error(
        "Video is already producing in another attempt. Review board state before starting again.",
      );
    }
    const attempt = command === "start" ? randomUUID() : current.attempt_id;
    const result = await client.rpc("set_marketing_video_production", {
      p_video_id: id,
      p_status: command === "start" ? "producing" : "needs_revision",
      p_revision: current.revision,
      p_attempt_id: attempt,
      p_notes: arg("--note") ?? "",
    });
    if (result.error)
      throw new Error(
        `Status save failed (${result.error.code}); inspect status before retrying.`,
      );
    current = await get();
    await mkdir(dirname(runFile), { recursive: true });
    await writeFile(
      runFile,
      JSON.stringify(
        {
          video_id: id,
          attempt_id: current.attempt_id,
          revision: current.revision,
        },
        null,
        2,
      ),
    );
    console.log(`${id}: ${current.status}; saved and read back from board.`);
  } finally {
    await client.auth.signOut({ scope: "local" });
  }
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
