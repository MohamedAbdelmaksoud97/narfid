// Quiet revision: one monophonic musical voice, three isolated tactile cues.
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rate = 48000;
const duration = 45;
const directory = new URL("../public/gates/studio-v4/", import.meta.url);
const work = new URL("../out/gate-studio-v4/", import.meta.url);
mkdirSync(directory, { recursive: true });
mkdirSync(work, { recursive: true });
const tau = 2 * Math.PI;
let seed = 86243;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => {
  const t = clamp(x);
  return t * t * (3 - 2 * t);
};
const hz = (note) => 440 * 2 ** ((note - 69) / 12);
function wav(path, left, right, ceilingDb) {
  let peak = 0;
  for (let i = 0; i < left.length; i++)
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
  const gain = 10 ** (ceilingDb / 20) / Math.max(peak, 1e-10);
  const b = Buffer.alloc(44 + left.length * 4);
  b.write("RIFF");
  b.writeUInt32LE(b.length - 8, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 4, 28);
  b.writeUInt16LE(4, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(b.length - 44, 40);
  for (let i = 0; i < left.length; i++) {
    b.writeInt16LE(Math.round(left[i] * gain * 32767), 44 + i * 4);
    b.writeInt16LE(Math.round(right[i] * gain * 32767), 46 + i * 4);
  }
  writeFileSync(path, b);
}
const noteLength = 0.72;
const notes = [
  [0.8, 57],
  [2.4, 60],
  [4, 64],
  [5.8, 62],
  [7.4, 65],
  [9, 60],
  [10.6, 57],
  [12, 59],
  [14.3, 62],
  [15.9, 65],
  [17.5, 64],
  [19.8, 60],
  [21.4, 57],
  [23.7, 59],
  [25.3, 62],
  [26.9, 64],
  [28.5, 67],
  [30.1, 65],
  [31.7, 62],
  [33.3, 60],
  [34.9, 59],
  [36.5, 62],
  [38.1, 65],
  [40.2, 64],
  [41.8, 60],
  [43.4, 57],
];
const cues = [13.3, 18.8, 22.6];
for (let n = 0; n < notes.length; n++) {
  if (n && notes[n][0] < notes[n - 1][0] + noteLength)
    throw Error("Musical notes overlap");
  for (const cue of cues)
    if (notes[n][0] < cue + 0.4 && notes[n][0] + noteLength > cue - 0.3)
      throw Error("Music overlaps a tactile cue");
}
const left = new Float64Array(duration * rate);
const right = new Float64Array(left.length);
notes.forEach(([start, note], index) => {
  const frequency = hz(note);
  const strength = index % 3 === 2 ? 0.82 : 1;
  const offset = Math.round(start * rate);
  for (let i = 0; i < Math.round(noteLength * rate); i++) {
    const t = i / rate;
    const envelope =
      smooth(t / 0.025) * Math.exp(-4.4 * t) * (1 - smooth((t - 0.49) / 0.23));
    // Inharmonic, quickly damped partials provide a rounded felt-key attack.
    let sample = 0;
    for (const [partial, level, damping] of [
      [1, 1, 0],
      [2, 0.12, 7],
      [3, 0.03, 15],
      [4, 0.008, 21],
    ]) {
      const f =
        frequency * partial * Math.sqrt(1 + 0.00006 * partial * partial);
      sample += level * Math.exp(-damping * t) * Math.sin(tau * f * t);
    }
    sample *= envelope * strength;
    const pan = index % 2 ? 0.08 : -0.08;
    left[offset + i] += sample * Math.sqrt((1 - pan) / 2);
    right[offset + i] += sample * Math.sqrt((1 + pan) / 2);
  }
});
wav(new URL("music-source.wav", work), left, right, -16);
const ffmpeg = fileURLToPath(
  new URL(
    "../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe",
    import.meta.url,
  ),
);
execFileSync(ffmpeg, [
  "-v",
  "error",
  "-i",
  fileURLToPath(new URL("music-source.wav", work)),
  "-af",
  "loudnorm=I=-21:TP=-9:LRA=4,volume=-4dB",
  "-ar",
  "48000",
  "-b:a",
  "320k",
  "-y",
  fileURLToPath(new URL("music.mp3", directory)),
]);
for (const [name, frequency] of [
  ["sync", 190],
  ["allow", 230],
  ["deny", 150],
]) {
  const count = Math.round(0.12 * rate);
  const l = new Float64Array(count),
    r = new Float64Array(count);
  let filtered = 0;
  for (let i = 0; i < count; i++) {
    const t = i / rate;
    filtered += 0.06 * (noise() - filtered);
    const envelope =
      smooth(t / 0.003) * Math.exp(-75 * t) * (1 - smooth((t - 0.075) / 0.045));
    l[i] = (Math.sin(tau * frequency * t) * 0.4 + filtered * 0.35) * envelope;
    r[i] = l[i];
  }
  wav(new URL(name + ".wav", directory), l, r, -25);
}
writeFileSync(
  new URL("provenance.json", directory),
  JSON.stringify(
    {
      version: 4,
      generator: "scripts/make-gate-studio-audio.mjs",
      voice: "New original low-register felt-key composition and fresh tactile cues",
      durationSeconds: 45,
      musicNotes: notes,
      musicalVoiceMaximumConcurrency: 1,
      noteDurationSeconds: noteLength,
      effectsAtSeconds: cues,
      effectDurationSeconds: 0.12,
      musicAndEffectOverlap: false,
      effectsPeakDbfs: -25,
      musicMaster: "-25 LUFS target / -13 dBTP ceiling",
      percussion: false,
      pads: false,
      bassDrone: false,
      motor: false,
      footsteps: false,
      ambience: false,
      reverb: false,
      reference: "https://x.com/claudeai/status/2120206365759094857",
      referenceUsedAs:
        "User's requested minimal product-film direction; no reference samples or melody copied",
      referenceAccess:
        "Post and video controls inspected; audio obtained privately for numerical comparison only. Direct listening unavailable.",
      externalMusicGeneration:
        "Attempt not submitted: insufficient credits. No external generated music used.",
      externalSamples: false,
      rights: "Original project synthesis; no third-party media embedded",
      audioListened: false,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Quiet music: 26 isolated notes; three 120 ms tactile cues; no overlapping voices or cue tails.",
);
