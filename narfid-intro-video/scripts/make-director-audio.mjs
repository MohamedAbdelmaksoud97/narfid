// Deterministic original stereo score: staged arrangement, percussion,
// warm voicings, stereo delay and a resolving brand signature. No samples.
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const sr = 44100,
  seconds = 60,
  count = sr * seconds;
const left = new Float32Array(count),
  right = new Float32Array(count);
const tau = Math.PI * 2;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
let seed = 918273;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
const chords = [
  [50, 57, 60, 64],
  [46, 53, 57, 62],
  [53, 60, 64, 67],
  [48, 55, 62, 65],
];
const melody = [74, 69, 72, 76, 74, 69, 67, 72];
for (let i = 0; i < count; i++) {
  const t = i / sr;
  const b = t * 2,
    beat = b % 1;
  const chord = chords[Math.floor(t / 4) % 4];
  const stage =
    t < 6
      ? 0.2
      : t < 11
        ? 0.45
        : t < 19
          ? 0.7
          : t < 41
            ? 1
            : t < 50
              ? 0.4
              : t < 55
                ? 0.85
                : 0.35;
  const padFade = Math.min(1, (t % 4) / 0.65, (4 - (t % 4)) / 0.65);
  let l = 0,
    r = 0;
  for (let k = 0; k < 4; k++) {
    const hz = midi(chord[k]);
    const env = 0.008 * padFade * (0.75 + stage * 0.25);
    l +=
      (Math.sin(tau * hz * 0.9987 * t) + 0.3 * Math.sin(tau * hz * 2 * t)) *
      env;
    r +=
      (Math.sin(tau * hz * 1.0013 * t) + 0.3 * Math.sin(tau * hz * 2.003 * t)) *
      env;
  }
  if (t >= 6 && t < 57) {
    const nt = (t - 6) % 0.5,
      idx = Math.floor((t - 6) * 2);
    const hz = midi(melody[Math.floor(idx / 2) % melody.length]);
    const attack = Math.min(1, nt / 0.008),
      env = attack * Math.exp(-nt * 8) * 0.055 * (idx % 2 === 0 ? 1 : 0.22);
    const key =
      Math.sin(tau * hz * nt) +
      0.27 * Math.sin(tau * hz * 2.003 * nt) +
      0.07 * Math.sin(tau * hz * 3.997 * nt);
    l += key * env * (idx % 2 ? 0.6 : 1);
    r += key * env * (idx % 2 ? 1 : 0.6);
  }
  if (t >= 11 && t < 55) {
    const bt = (t - 11) % 0.5;
    const hz = midi(chord[0] - 12);
    const bass =
      Math.sin(tau * hz * bt) *
      Math.min(1, bt / 0.014) *
      Math.exp(-bt * 5) *
      0.09 *
      stage;
    l += bass;
    r += bass;
  }
  if (t >= 19 && t < 55) {
    const dt = (t - 19) % 0.5;
    const kick =
      Math.sin(tau * (44 * dt + 2.1 * (1 - Math.exp(-dt * 28)))) *
      Math.exp(-dt * 16) *
      0.13 *
      stage;
    const ht = (t - 19) % 0.25;
    const air = noise() * Math.exp(-ht * 95) * 0.022 * stage;
    const st = (t - 19) % 1;
    const clap =
      st > 0.5
        ? noise() *
          Math.exp(-(st - 0.5) * 35) *
          Math.min(1, (st - 0.5) * 1000) *
          0.035 *
          stage
        : 0;
    l += kick + air + clap;
    r += kick - air * 0.6 + clap;
  }
  const breath = Math.min(1, t / 2.2, (60 - t) / 3.2);
  // Deliberate space around scene reveals lets the synchronized SFX speak.
  const cuts = [6, 11, 19, 26, 34, 41, 50, 55];
  let duck = 1;
  for (const cut of cuts) {
    const distance = Math.abs(t - cut);
    if (distance < 0.3) duck = Math.min(duck, 0.65 + (distance / 0.3) * 0.35);
  }
  left[i] = l * breath * duck;
  right[i] = r * breath * duck;
}
// Cross-channel early reflections and a quiet longer tail.
for (let i = count - 1; i >= 0; i--) {
  if (i > sr * 0.187) {
    left[i] += right[i - Math.floor(sr * 0.187)] * 0.22;
    right[i] += left[i - Math.floor(sr * 0.243)] * 0.18 || 0;
  }
}
const writeWav = (file, l, r, peakLimit) => {
  let peak = 0,
    sum = 0;
  for (let i = 0; i < l.length; i++)
    peak = Math.max(peak, Math.abs(l[i]), Math.abs(r[i]));
  const gain = peakLimit / Math.max(peak, 0.001);
  const out = Buffer.alloc(44 + l.length * 4);
  out.write("RIFF");
  out.writeUInt32LE(out.length - 8, 4);
  out.write("WAVEfmt ", 8);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(2, 22);
  out.writeUInt32LE(sr, 24);
  out.writeUInt32LE(sr * 4, 28);
  out.writeUInt16LE(4, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36);
  out.writeUInt32LE(out.length - 44, 40);
  for (let i = 0; i < l.length; i++) {
    const a = l[i] * gain,
      b = r[i] * gain;
    sum += (a * a + b * b) / 2;
    out.writeInt16LE(Math.round(a * 32767), 44 + i * 4);
    out.writeInt16LE(Math.round(b * 32767), 46 + i * 4);
  }
  writeFileSync(new URL("../public/" + file, import.meta.url), out);
  console.log(
    `${file}: peak ${20 * Math.log10(peakLimit)} dBFS, RMS ${(20 * Math.log10(Math.sqrt(sum / l.length))).toFixed(1)} dBFS; stereo ${sr} Hz`,
  );
};
writeWav("director-score.wav", left, right, 0.35);
const ffmpeg =
  process.env.FFMPEG_PATH ||
  fileURLToPath(
    new URL(
      "../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe",
      import.meta.url,
    ),
  );
execFileSync(ffmpeg, [
  "-hide_banner",
  "-loglevel",
  "error",
  "-i",
  fileURLToPath(new URL("../public/director-score.wav", import.meta.url)),
  "-af",
  "loudnorm=I=-22:TP=-6:LRA=8",
  "-ar",
  "44100",
  "-b:a",
  "256k",
  "-y",
  fileURLToPath(new URL("../public/director-score.mp3", import.meta.url)),
]);
mkdirSync(new URL("../public/sfx", import.meta.url), { recursive: true });
for (const kind of ["impact", "riser", "signature"]) {
  const duration = kind === "signature" ? 2.8 : kind === "riser" ? 1.2 : 1.5;
  const l = new Float32Array(Math.floor(duration * sr)),
    r = new Float32Array(l.length);
  for (let i = 0; i < l.length; i++) {
    const t = i / sr;
    if (kind === "impact")
      l[i] = r[i] =
        Math.sin(tau * (42 * t + 1.7 * (1 - Math.exp(-25 * t)))) *
          Math.exp(-5 * t) *
          Math.min(1, t / 0.004) +
        noise() * Math.exp(-t * 25) * 0.08;
    if (kind === "riser") {
      const v =
        noise() * (t / duration) ** 2 * Math.sin((Math.PI * t) / duration);
      l[i] = v * (0.5 + t / duration / 2);
      r[i] = v * (1 - t / duration / 2);
    }
    if (kind === "signature") {
      for (const [j, n] of [62, 69, 76].entries()) {
        const nt = t - j * 0.16;
        if (nt > 0) {
          const s =
            (Math.sin(tau * midi(n) * nt) +
              0.25 * Math.sin(tau * midi(n) * 2.002 * nt)) *
            Math.exp(-nt * 2.8) *
            Math.min(1, nt / 0.008);
          l[i] += s * (0.28 + j * 0.06);
          r[i] += s * (0.4 - j * 0.06);
        }
      }
    }
  }
  writeWav("sfx/" + kind + ".wav", l, r, kind === "impact" ? 0.5 : 0.3);
}
