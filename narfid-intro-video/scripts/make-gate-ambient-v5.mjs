// Original synthesized ambient harmony for the gate film; no samples or speech.
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const rate = 48000, seconds = 45;
const folder = new URL("../public/gates/ambient-v5/", import.meta.url);
const work = new URL("../out/gate-ambient-v5/", import.meta.url);
mkdirSync(folder, { recursive: true }); mkdirSync(work, { recursive: true });
const count = rate * seconds, wave = Buffer.alloc(44 + count * 4);
wave.write("RIFF", 0); wave.writeUInt32LE(wave.length - 8, 4);
wave.write("WAVEfmt ", 8); wave.writeUInt32LE(16, 16);
wave.writeUInt16LE(1, 20); wave.writeUInt16LE(2, 22);
wave.writeUInt32LE(rate, 24); wave.writeUInt32LE(rate * 4, 28);
wave.writeUInt16LE(4, 32); wave.writeUInt16LE(16, 34);
wave.write("data", 36); wave.writeUInt32LE(count * 4, 40);
const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const hz = (n) => 440 * 2 ** ((n - 69) / 12);
// Slow harmonic changes leave room for the story; no percussion or separate cues.
const chords = [[0, 11.5, [50, 57, 64]], [10, 11.5, [46, 53, 60]], [20, 11.5, [48, 55, 64]], [30, 11.5, [45, 53, 60]], [40, 5, [50, 57, 62]]];
for (let i = 0; i < count; i++) {
  const t = i / rate;
  let l = 0, r = 0;
  for (const [start, length, notes] of chords) {
    const x = t - start;
    if (x < 0 || x >= length) continue;
    const env = smooth(x / 2.2) * smooth((length - x) / 2.2);
    notes.forEach((note, index) => {
      const f = hz(note);
      const tone = Math.sin(2 * Math.PI * f * t) + 0.12 * Math.sin(2 * Math.PI * 2 * f * t);
      const amount = env * tone * (index === 0 ? 0.048 : 0.035);
      l += amount * (index === 1 ? 0.75 : 1);
      r += amount * (index === 2 ? 0.75 : 1);
    });
  }
  const fade = smooth(t / 2) * smooth((seconds - t) / 2);
  wave.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l * fade)) * 32767), 44 + i * 4);
  wave.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r * fade)) * 32767), 46 + i * 4);
}
const wav = fileURLToPath(new URL("source.wav", work));
writeFileSync(wav, wave);
const ffmpeg = fileURLToPath(new URL("../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe", import.meta.url));
execFileSync(ffmpeg, ["-v", "error", "-i", wav, "-af", "loudnorm=I=-23:TP=-6:LRA=6", "-b:a", "320k", "-y", fileURLToPath(new URL("music.mp3", folder))]);
writeFileSync(new URL("provenance.json", folder), JSON.stringify({ generator: "scripts/make-gate-ambient-v5.mjs", description: "Original slowly changing synthesized ambient chords; no speech, percussion or external samples", durationSeconds: seconds, audioListened: false }, null, 2) + "\n");
