// Original 96 BPM score and Foley, deterministically synthesized without samples.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const rate = 48000;
const duration = 45;
const beat = 60 / 96;
const tau = 2 * Math.PI;
const destination = new URL(
  "../public/gates/sound-design-v2/",
  import.meta.url,
);
const workspace = new URL("../out/gate-sound-design/", import.meta.url);
mkdirSync(destination, { recursive: true });
mkdirSync(workspace, { recursive: true });
let seed = 962026;
const noise = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
const hz = (note) => 440 * 2 ** ((note - 69) / 12);
const db = (value) => 10 ** (value / 20);
const smooth = (x) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};
const stereo = (seconds) => [
  new Float64Array(Math.ceil(seconds * rate)),
  new Float64Array(Math.ceil(seconds * rate)),
];
function add(bus, start, length, voice, pan = 0) {
  const offset = Math.round(start * rate);
  const leftGain = Math.sqrt((1 - pan) / 2);
  const rightGain = Math.sqrt((1 + pan) / 2);
  for (
    let i = 0;
    i < Math.round(length * rate) && i + offset < bus[0].length;
    i++
  ) {
    if (i + offset < 0) continue;
    const value = voice(i / rate);
    bus[0][i + offset] += value * leftGain;
    bus[1][i + offset] += value * rightGain;
  }
}
function space(bus, wet = 0.15) {
  // Read dry samples only: finite reflections with smooth, bounded tails.
  const dry = bus.map((channel) => channel.slice());
  for (const [delay, gain] of [
    [0.071, 0.48],
    [0.113, 0.37],
    [0.181, 0.29],
    [0.283, 0.21],
    [0.419, 0.14],
  ]) {
    const offset = Math.round(delay * rate);
    for (let i = offset; i < bus[0].length; i++) {
      bus[0][i] += dry[1][i - offset] * gain * wet;
      bus[1][i] += dry[0][i - offset] * gain * wet * 0.93;
    }
  }
}
function writeWave(url, bus, peakDb) {
  let peak = 0;
  for (let i = 0; i < bus[0].length; i++) {
    const fade = Math.min(
      1,
      i / (rate * 0.006),
      (bus[0].length - 1 - i) / (rate * 0.04),
    );
    bus[0][i] *= fade;
    bus[1][i] *= fade;
    peak = Math.max(peak, Math.abs(bus[0][i]), Math.abs(bus[1][i]));
  }
  const gain = db(peakDb) / Math.max(peak, 0.000001);
  const b = Buffer.alloc(44 + bus[0].length * 4);
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
  for (let i = 0; i < bus[0].length; i++) {
    b.writeInt16LE(Math.round(bus[0][i] * gain * 32767), 44 + i * 4);
    b.writeInt16LE(Math.round(bus[1][i] * gain * 32767), 46 + i * 4);
  }
  writeFileSync(url, b);
}
const pluck =
  (note, velocity = 1, decay = 3.2) =>
  (t) => {
    const f = hz(note);
    return (
      velocity *
      smooth(t / 0.008) *
      Math.exp(-decay * t) *
      (Math.sin(tau * f * t) +
        0.2 * Math.sin(tau * f * 2.002 * t) * Math.exp(-3 * t) +
        0.055 * Math.sin(tau * f * 3.996 * t) * Math.exp(-6 * t))
    );
  };
const music = stereo(duration);
const chords = {
  dm: [50, 57, 60, 64, 69],
  bb: [46, 53, 57, 60, 65],
  f: [53, 57, 60, 64, 67],
  c: [48, 55, 60, 62, 67],
};
const harmony = [
  [0, "dm", 5],
  [5, "dm", 2.5],
  [7.5, "bb", 3.5],
  [11, "f", 3.75],
  [14.75, "c", 3.25],
  [18, "f", 4],
  [22, "dm", 4],
  [26, "bb", 4],
  [30, "c", 4],
  [34, "dm", 2.5],
  [36.5, "bb", 3.5],
  [40, "f", 5],
];
for (const [start, chordName, length] of harmony) {
  const chord = chords[chordName];
  const level = start < 5 ? 0.027 : start >= 40 ? 0.019 : 0.036;
  chord.forEach((note, i) => {
    const f = hz(note);
    add(
      music,
      start,
      length + 1.7,
      (t) => {
        const envelope =
          smooth(t / 0.65) * (1 - smooth((t - length + 0.3) / 1.9));
        return (
          level *
          envelope *
          (Math.sin(tau * f * t + 0.04 * Math.sin(tau * 0.23 * t)) +
            0.28 * Math.sin(tau * f * 1.0017 * t) +
            0.12 * Math.sin(tau * f * 2 * t))
        );
      },
      (i - 2) * 0.32,
    );
  });
  if (start >= 5 && start < 40) {
    for (let n = 0; n * beat < length; n += 2) {
      const note = chord[[2, 4, 3, 1][(n / 2) % 4]] + 12;
      add(
        music,
        start + n * beat + 0.02,
        2.2,
        pluck(note, start >= 26 && start < 34 ? 0.036 : 0.052, 3.5),
        n % 4 ? 0.28 : -0.28,
      );
    }
  }
}
for (let i = 0; 5 + i * beat < 40; i++) {
  const time = 5 + i * beat;
  const chord = chords[harmony.filter(([start]) => start <= time).at(-1)[1]];
  const quieter =
    time >= 22 && time < 26 ? 0.42 : time >= 26 && time < 34 ? 0.6 : 1;
  if (i % 2 === 0)
    add(
      music,
      time,
      0.75,
      (t) =>
        0.13 *
        quieter *
        smooth(t / 0.018) *
        Math.exp(-5.6 * t) *
        (Math.sin(tau * hz(chord[0] - 12) * t) +
          0.09 * Math.sin(tau * hz(chord[0]) * t)),
    );
  if (time < 11 || (time >= 22 && time < 23.5)) continue;
  if (i % 2 === 0)
    add(
      music,
      time,
      0.36,
      (t) =>
        0.14 *
        quieter *
        smooth(t / 0.004) *
        Math.exp(-18 * t) *
        Math.sin(tau * (44 * t + 2.1 * (1 - Math.exp(-30 * t)))),
    );
  if (i % 4 === 1 || i % 4 === 3)
    add(
      music,
      time + 0.008,
      0.14,
      (t) =>
        quieter *
        smooth(t / 0.002) *
        Math.exp(-38 * t) *
        (noise() * 0.015 + Math.sin(tau * 780 * t) * 0.027),
    );
  for (const sub of [0, 0.5]) {
    let low = 0;
    add(
      music,
      time + sub * beat,
      0.11,
      (t) => {
        const n = noise();
        low += 0.17 * (n - low);
        return (
          (n - low) *
          Math.exp(-53 * t) *
          smooth(t / 0.004) *
          0.016 *
          quieter *
          (sub ? 0.55 : 1)
        );
      },
      sub ? 0.37 : -0.37,
    );
  }
}
// Purposeful lift on the assessment; cadence gives way to the independent logo cue.
add(music, 34.1, 2.5, pluck(77, 0.06, 2.8), -0.25);
add(music, 35.35, 2.5, pluck(76, 0.05, 2.8), 0.25);
add(music, 37.85, 2.2, pluck(72, 0.047, 2.5));
space(music, 0.23);
const keyCues = [5, 7.2, 13.3, 18.8, 22.6, 26, 30, 34.5, 35.7, 37, 40.4];
for (let i = 0; i < music[0].length; i++) {
  const t = i / rate;
  let duck = 1;
  for (const cue of keyCues) {
    const delta = t - cue;
    if (delta >= -0.1 && delta < 1.0) {
      const shape =
        delta < 0
          ? smooth((delta + 0.1) / 0.1)
          : delta < 0.35
            ? 1
            : 1 - smooth((delta - 0.35) / 0.65);
      duck = Math.min(duck, db(-4 * shape));
    }
  }
  const fade = smooth(t / 1.1) * (1 - smooth((t - 42.9) / 2.0));
  music[0][i] *= duck * fade;
  music[1][i] *= duck * fade;
}
writeWave(new URL("music-source.wav", workspace), music, -5.5);
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
  fileURLToPath(new URL("music-source.wav", workspace)),
  "-af",
  "loudnorm=I=-20.5:TP=-6:LRA=9",
  "-ar",
  "48000",
  "-b:a",
  "320k",
  "-y",
  fileURLToPath(new URL("music.mp3", destination)),
]);

function cue(name, length, peakDb, create, reverb = 0) {
  const bus = stereo(length);
  create(bus);
  if (reverb) space(bus, reverb);
  writeWave(new URL(name + ".wav", destination), bus, peakDb);
}
cue("ambience", 4.8, -35, (bus) => {
  let a = 0,
    b = 0;
  for (let i = 0; i < bus[0].length; i++) {
    a += 0.003 * (noise() - a);
    b += 0.004 * (noise() - b);
    const t = i / rate,
      envelope = smooth(t / 0.8) * (1 - smooth((t - 3.5) / 1.2));
    bus[0][i] = a * envelope;
    bus[1][i] = b * envelope;
  }
});
cue("step", 0.48, -19, (bus) => {
  let smoothNoise = 0;
  add(
    bus,
    0,
    0.44,
    (t) => {
      smoothNoise += 0.1 * (noise() - smoothNoise);
      const heel =
        Math.sin(tau * (72 * t + 0.55 * (1 - Math.exp(-60 * t)))) *
        Math.exp(-28 * t);
      const sole = smoothNoise * Math.exp(-18 * t) * smooth(t / 0.008);
      return heel * 0.35 + sole * 0.9;
    },
    -0.25,
  );
});
cue("move", 0.75, -18, (bus) => {
  let low = 0,
    high = 0;
  for (let i = 0; i < bus[0].length; i++) {
    const t = i / rate,
      n = noise();
    low += 0.015 * (n - low);
    high += 0.08 * (n - high);
    const sample = (high - low) * Math.sin((Math.PI * t) / 0.75) ** 2;
    bus[0][i] = sample * (0.9 - t * 0.6);
    bus[1][i] = sample * (0.45 + t * 0.6);
  }
});
cue(
  "focus",
  0.6,
  -14,
  (bus) =>
    add(
      bus,
      0,
      0.52,
      (t) =>
        smooth(t / 0.004) *
        Math.exp(-21 * t) *
        (Math.sin(tau * 220 * t) + noise() * 0.09),
    ),
  0.07,
);
cue("touch", 0.25, -17, (bus) =>
  add(
    bus,
    0,
    0.23,
    (t) =>
      smooth(t / 0.002) *
      Math.exp(-65 * t) *
      (noise() * 0.18 + Math.sin(tau * 430 * t) * 0.5),
  ),
);
cue(
  "sync",
  1.5,
  -10,
  (bus) => {
    add(bus, 0, 1.2, pluck(62, 0.55, 6), -0.45);
    add(bus, 0.15, 1.15, pluck(69, 0.5, 6));
    add(bus, 0.3, 1.15, pluck(76, 0.45, 5), 0.45);
  },
  0.18,
);
cue(
  "allow",
  1.0,
  -9.5,
  (bus) => {
    add(bus, 0, 0.85, pluck(76, 0.5, 7), -0.15);
    add(bus, 0.13, 0.85, pluck(81, 0.5, 7), 0.15);
  },
  0.12,
);
cue(
  "deny",
  1.05,
  -12,
  (bus) => {
    add(bus, 0, 0.7, pluck(57, 0.5, 9), -0.1);
    add(bus, 0.2, 0.75, pluck(53, 0.5, 9), 0.1);
  },
  0.07,
);
cue(
  "motor",
  0.8,
  -17,
  (bus) => {
    let low = 0;
    add(
      bus,
      0,
      0.68,
      (t) => {
        low += 0.065 * (noise() - low);
        const envelope = smooth(t / 0.09) * (1 - smooth((t - 0.43) / 0.25));
        return (
          envelope * (0.12 * Math.sin(tau * (95 * t + 15 * t * t)) + low * 0.6)
        );
      },
      -0.2,
    );
    add(
      bus,
      0.62,
      0.13,
      (t) =>
        Math.exp(-60 * t) * (0.15 * noise() + Math.sin(tau * 320 * t) * 0.55),
      -0.2,
    );
  },
  0.05,
);
cue(
  "check",
  0.8,
  -13,
  (bus) => {
    add(
      bus,
      0,
      0.15,
      (t) =>
        Math.exp(-65 * t) * (Math.sin(tau * 360 * t) * 0.4 + noise() * 0.08),
    );
    add(bus, 0.035, 0.7, pluck(77, 0.17, 9), 0.1);
  },
  0.1,
);
cue(
  "complete",
  1.3,
  -11.5,
  (bus) => {
    add(bus, 0, 1.1, pluck(72, 0.5, 6), -0.2);
    add(bus, 0.13, 1.1, pluck(77, 0.48, 5), 0.2);
  },
  0.14,
);
cue(
  "signature",
  4.4,
  -10,
  (bus) => {
    add(bus, 0, 3.4, pluck(65, 0.6, 1.7), -0.2);
    add(bus, 0.19, 3.3, pluck(72, 0.5, 1.9), 0.2);
    add(bus, 0.4, 3.4, pluck(77, 0.48, 1.5));
    add(bus, 0.4, 3.5, pluck(53, 0.14, 1.5));
  },
  0.25,
);
writeFileSync(
  new URL("provenance.json", destination),
  JSON.stringify(
    {
      version: 2,
      generator: "scripts/make-gate-sound-design.mjs",
      composer: "Original composition and procedural sound design for Narfid",
      tempoBpm: 96,
      durationSeconds: 45,
      sampleRate: rate,
      channels: 2,
      harmony:
        "D minor/add9, Bb major9, F major9, C add9; closing cadence in F",
      instruments: [
        "warm stereo pad",
        "soft harmonic plucks",
        "mono sine bass",
        "restrained electronic kick",
        "dry rim",
        "filtered shaker",
      ],
      musicDuckDb: 4,
      duckEventsSeconds: keyCues,
      effects: [
        "ambience",
        "step",
        "move",
        "focus",
        "touch",
        "sync",
        "allow",
        "deny",
        "motor",
        "check",
        "complete",
        "signature",
      ],
      musicMaster: "-20.5 LUFS, true-peak ceiling -6 dBTP before final mix",
      externalSamples: false,
      externalServices: false,
      speech: false,
      rights:
        "Original project composition and synthesis; no third-party recordings or sampled music",
    audioListened: false,
    executionAfterDisclosure: "نفذ",
      listeningLimitation:
        "Direct listening unavailable; numerical and timing verification remain required",
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Composed 45-second 96 BPM score and twelve original stereo effects.",
);
