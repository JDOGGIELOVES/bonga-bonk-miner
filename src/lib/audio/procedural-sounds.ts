/** Procedural cartoon sounds via Web Audio API — no files required. */

function noiseBuffer(ctx: AudioContext, duration = 0.05): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  return buffer;
}

function connect(
  ctx: AudioContext,
  output: AudioNode,
  start: number,
  duration: number,
  peakGain: number
) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.linearRampToValueAtTime(peakGain, start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  output.connect(gain);
  return gain;
}

export type BonkVariant = 0 | 1 | 2 | 3 | 4;

export function playProceduralBonk(
  ctx: AudioContext,
  dest: AudioNode,
  variant: BonkVariant,
  volume: number,
  pitchShift = 1
) {
  const now = ctx.currentTime;
  const v = volume * 0.35;

  switch (variant) {
    case 0: {
      // Classic "BONK!" — punchy drop + noise crack
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(280 * pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);
      connect(ctx, osc, now, 0.11, v).connect(dest);
      osc.start(now);
      osc.stop(now + 0.11);

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer(ctx, 0.04);
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200;
      bp.Q.value = 0.8;
      noise.connect(bp);
      connect(ctx, bp, now, 0.05, v * 0.6).connect(dest);
      noise.start(now);
      noise.stop(now + 0.05);
      break;
    }
    case 1: {
      // Boing bonk — springy cartoon
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120 * pitchShift, now);
      osc.frequency.linearRampToValueAtTime(520 * pitchShift, now + 0.04);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.14);
      connect(ctx, osc, now, 0.16, v * 0.9).connect(dest);
      osc.start(now);
      osc.stop(now + 0.16);
      break;
    }
    case 2: {
      // Double-tap cartoon whack
      [0, 0.045].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime((i === 0 ? 220 : 180) * pitchShift, now + offset);
        osc.frequency.exponentialRampToValueAtTime(60, now + offset + 0.07);
        connect(ctx, osc, now + offset, 0.08, v * 0.7).connect(dest);
        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
      break;
    }
    case 3: {
      // Soft thuddy bonk
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(100 * pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
      connect(ctx, osc, now, 0.14, v * 1.1).connect(dest);
      osc.start(now);
      osc.stop(now + 0.14);

      const click = ctx.createOscillator();
      click.type = "square";
      click.frequency.value = 800 * pitchShift;
      connect(ctx, click, now, 0.02, v * 0.25).connect(dest);
      click.start(now);
      click.stop(now + 0.02);
      break;
    }
    case 4: {
      // Punchy saw bonk
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(350 * pitchShift, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.1);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2000;
      osc.connect(filter);
      connect(ctx, filter, now, 0.12, v * 0.55).connect(dest);
      osc.start(now);
      osc.stop(now + 0.12);
      break;
    }
  }
}

export function playProceduralCoinCollect(
  ctx: AudioContext,
  dest: AudioNode,
  volume: number
) {
  const now = ctx.currentTime;
  const v = volume * 0.3;
  const notes = [1046.5, 1318.5, 1568, 2093]; // C6 E6 G6 C7 sparkle arpeggio

  notes.forEach((freq, i) => {
    const start = now + i * 0.07;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    connect(ctx, osc, start, 0.35, v).connect(dest);
    osc.start(start);
    osc.stop(start + 0.35);
  });

  // Shimmer layer
  const shimmer = ctx.createOscillator();
  shimmer.type = "triangle";
  shimmer.frequency.setValueAtTime(2400, now + 0.15);
  shimmer.frequency.linearRampToValueAtTime(3200, now + 0.5);
  connect(ctx, shimmer, now + 0.15, 0.4, v * 0.35).connect(dest);
  shimmer.start(now + 0.15);
  shimmer.stop(now + 0.55);

  // Coin "ding"
  const ding = ctx.createOscillator();
  ding.type = "sine";
  ding.frequency.value = 1760;
  connect(ctx, ding, now + 0.28, 0.25, v * 0.5).connect(dest);
  ding.start(now + 0.28);
  ding.stop(now + 0.53);
}

export type BgmHandle = {
  stop: () => void;
  fade?: (to: number, sec?: number) => void;
};

/** Chill lo-fi hippie loop — soft pads + gentle beat */
export function startProceduralBgm(
  ctx: AudioContext,
  dest: AudioNode,
  volume: number
): BgmHandle {
  const bpm = 72;
  const beatSec = 60 / bpm;
  const barSec = beatSec * 4;
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  // Chord roots (Hz) — peaceful Am / F / C / G feel
  const chords = [
    [220, 261.63, 329.63], // Am
    [174.61, 220, 261.63], // F
    [261.63, 329.63, 392], // C
    [196, 246.94, 293.66], // G
  ];

  const masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = 1400;
  masterFilter.connect(dest);

  const padGain = ctx.createGain();
  padGain.gain.value = volume * 0.12;
  padGain.connect(masterFilter);

  const beatGain = ctx.createGain();
  beatGain.gain.value = volume * 0.18;
  beatGain.connect(masterFilter);

  const activeOscs: OscillatorNode[] = [];

  function scheduleBar(barIndex: number) {
    if (stopped) return;
    const start = ctx.currentTime + 0.05;
    const chord = chords[barIndex % chords.length];

    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(1, start + 0.3);
      g.gain.setValueAtTime(1, start + barSec - 0.3);
      g.gain.linearRampToValueAtTime(0, start + barSec);
      osc.connect(g);
      g.connect(padGain);
      osc.start(start);
      osc.stop(start + barSec);
      activeOscs.push(osc);
    });

    // Soft kick on beats 1 & 3
    [0, beatSec * 2].forEach((offset) => {
      const t = start + offset;
      const kick = ctx.createOscillator();
      kick.type = "sine";
      kick.frequency.setValueAtTime(90, t);
      kick.frequency.exponentialRampToValueAtTime(40, t + 0.08);
      const kg = ctx.createGain();
      kg.gain.setValueAtTime(0.5, t);
      kg.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      kick.connect(kg);
      kg.connect(beatGain);
      kick.start(t);
      kick.stop(t + 0.1);
    });

    // Gentle hi-hat shimmer on offbeats
    [beatSec, beatSec * 3].forEach((offset) => {
      const t = start + offset;
      const hat = ctx.createBufferSource();
      hat.buffer = noiseBuffer(ctx, 0.03);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 6000;
      hat.connect(hp);
      const hg = ctx.createGain();
      hg.gain.setValueAtTime(0.15, t);
      hg.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      hp.connect(hg);
      hg.connect(beatGain);
      hat.start(t);
      hat.stop(t + 0.04);
    });

    timeoutId = setTimeout(() => scheduleBar(barIndex + 1), barSec * 1000 - 50);
  }

  scheduleBar(0);

  return {
    stop: () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      activeOscs.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* already stopped */
        }
      });
      padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      beatGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    },
  };
}

/** Singing-bowl strike — session begin */
export function playPeaceBeginChime(
  ctx: AudioContext,
  dest: AudioNode,
  volume: number
) {
  const now = ctx.currentTime;
  const v = volume * 0.45;
  const freqs = [220, 329.63, 440, 554.37];

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    const attack = 0.02 + i * 0.01;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(v * (1 - i * 0.15), now + attack);
    g.gain.exponentialRampToValueAtTime(0.001, now + 2.8 + i * 0.2);
    osc.connect(g);
    g.connect(dest);
    osc.start(now);
    osc.stop(now + 3.2);
  });
}

/** Completion bell — session end */
export function playPeaceEndChime(
  ctx: AudioContext,
  dest: AudioNode,
  volume: number
) {
  const now = ctx.currentTime;
  const v = volume * 0.5;
  const tones = [
    { freq: 523.25, at: 0, dur: 1.4 },
    { freq: 783.99, at: 0.35, dur: 2.2 },
  ];

  tones.forEach(({ freq, at, dur }) => {
    const t = now + at;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(v, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  });
}

/** Soft tick when a timed step advances */
export function playPeaceStepTick(
  ctx: AudioContext,
  dest: AudioNode,
  volume: number
) {
  const now = ctx.currentTime;
  const v = volume * 0.22;
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
  connect(ctx, osc, now, 0.15, v).connect(dest);
  osc.start(now);
  osc.stop(now + 0.15);
}

/** Transcendental lo-fi ambient — slow pads, no drums */
export function startProceduralPeaceBgm(
  ctx: AudioContext,
  dest: AudioNode,
  volume: number
): BgmHandle {
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const barSec = 8;
  const chords = [
    [174.61, 220, 261.63],
    [196, 246.94, 293.66],
    [220, 261.63, 329.63],
    [164.81, 207.65, 246.94],
  ];

  const masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = 900;
  masterFilter.connect(dest);

  const padGain = ctx.createGain();
  padGain.gain.value = volume * 0.14;
  padGain.connect(masterFilter);

  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = volume * 0.06;
  shimmerGain.connect(masterFilter);

  const activeOscs: OscillatorNode[] = [];

  function scheduleBar(barIndex: number) {
    if (stopped) return;
    const start = ctx.currentTime + 0.05;
    const chord = chords[barIndex % chords.length];

    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(1, start + 1.2 + i * 0.15);
      g.gain.setValueAtTime(0.7, start + barSec - 1);
      g.gain.linearRampToValueAtTime(0, start + barSec);
      osc.connect(g);
      g.connect(padGain);
      osc.start(start);
      osc.stop(start + barSec);
      activeOscs.push(osc);
    });

    if (barIndex % 2 === 0) {
      const t = start + barSec * 0.6;
      const chime = ctx.createOscillator();
      chime.type = "triangle";
      chime.frequency.value = chord[2] * 2;
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0.001, t);
      cg.gain.linearRampToValueAtTime(1, t + 0.05);
      cg.gain.exponentialRampToValueAtTime(0.001, t + 1.8);
      chime.connect(cg);
      cg.connect(shimmerGain);
      chime.start(t);
      chime.stop(t + 2);
    }

    timeoutId = setTimeout(() => scheduleBar(barIndex + 1), barSec * 1000 - 80);
  }

  scheduleBar(0);

  return {
    stop: () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      activeOscs.forEach((o) => {
        try {
          o.stop();
        } catch {
          /* */
        }
      });
      padGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    },
    fade: (to: number, sec = 0.6) => {
      const t = ctx.currentTime;
      padGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, to * volume * 0.14),
        t + sec
      );
      shimmerGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, to * volume * 0.06),
        t + sec
      );
    },
  };
}

/** Gentle melodic flute — pentatonic phrases for Tai Chi */
export function startProceduralFluteBgm(
  ctx: AudioContext,
  dest: AudioNode,
  volume: number
): BgmHandle {
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let noteIndex = 0;

  const scale = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25];
  const melody = [0, 2, 4, 3, 2, 1, 0, 2, 4, 5, 4, 2, 1, 3, 2, 0];

  const masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = 3200;
  masterFilter.Q.value = 0.6;
  masterFilter.connect(dest);

  const fluteGain = ctx.createGain();
  fluteGain.gain.value = volume * 0.22;
  fluteGain.connect(masterFilter);

  const padGain = ctx.createGain();
  padGain.gain.value = volume * 0.07;
  padGain.connect(masterFilter);

  const activeNodes: (OscillatorNode | AudioBufferSourceNode)[] = [];

  function playFluteNote(freq: number, durationSec: number) {
    if (stopped) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    const vibrato = ctx.createOscillator();
    vibrato.type = "sine";
    vibrato.frequency.value = 4.5;
    const vibratoDepth = ctx.createGain();
    vibratoDepth.gain.value = 2.5;
    vibrato.connect(vibratoDepth);
    vibratoDepth.connect(osc.frequency);
    vibrato.start(now);
    vibrato.stop(now + durationSec + 0.2);
    activeNodes.push(vibrato);

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.001, now);
    envelope.gain.linearRampToValueAtTime(1, now + 0.25);
    envelope.gain.setValueAtTime(0.75, now + durationSec - 0.5);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(envelope);
    envelope.connect(fluteGain);
    osc.start(now);
    osc.stop(now + durationSec + 0.15);
    activeNodes.push(osc);

    const echo = ctx.createOscillator();
    echo.type = "sine";
    echo.frequency.value = freq;
    const echoEnv = ctx.createGain();
    echoEnv.gain.setValueAtTime(0.001, now + 0.35);
    echoEnv.gain.linearRampToValueAtTime(0.35, now + 0.5);
    echoEnv.gain.exponentialRampToValueAtTime(0.001, now + durationSec + 0.5);
    echo.connect(echoEnv);
    echoEnv.connect(fluteGain);
    echo.start(now + 0.35);
    echo.stop(now + durationSec + 0.6);
    activeNodes.push(echo);

    const pad = ctx.createOscillator();
    pad.type = "sine";
    pad.frequency.value = freq * 0.5;
    const padEnv = ctx.createGain();
    padEnv.gain.setValueAtTime(0.001, now);
    padEnv.gain.linearRampToValueAtTime(1, now + 0.6);
    padEnv.gain.exponentialRampToValueAtTime(0.001, now + durationSec + 0.8);
    pad.connect(padEnv);
    padEnv.connect(padGain);
    pad.start(now);
    pad.stop(now + durationSec + 1);
    activeNodes.push(pad);
  }

  function scheduleNote() {
    if (stopped) return;
    const idx = melody[noteIndex % melody.length];
    const freq = scale[idx];
    const durationSec = 2.6 + (noteIndex % 3) * 0.4;
    playFluteNote(freq, durationSec);
    noteIndex++;
    timeoutId = setTimeout(scheduleNote, durationSec * 1000 - 300);
  }

  scheduleNote();

  return {
    stop: () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      activeNodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* */
        }
      });
      const t = ctx.currentTime;
      fluteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      padGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    },
    fade: (to: number, sec = 0.6) => {
      const t = ctx.currentTime;
      fluteGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, to * volume * 0.22),
        t + sec
      );
      padGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, to * volume * 0.07),
        t + sec
      );
    },
  };
}