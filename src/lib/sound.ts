type ToneKind = "correct" | "wrong" | "finish" | "start" | "tap";

let audio: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audio) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audio = new Ctor();
    }
    if (audio.state === "suspended") void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

function blip(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume = 0.045,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + start);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + start + duration,
  );
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.02);
}

const patterns: Record<ToneKind, Array<[number, number, number]>> = {
  tap: [[420, 0, 0.06]],
  start: [
    [392, 0, 0.09],
    [523, 0.07, 0.12],
  ],
  correct: [
    [659, 0, 0.09],
    [880, 0.07, 0.16],
  ],
  wrong: [
    [220, 0, 0.12],
    [174, 0.1, 0.18],
  ],
  finish: [
    [523, 0, 0.1],
    [659, 0.09, 0.1],
    [784, 0.18, 0.18],
  ],
};

export function playTone(kind: ToneKind) {
  const ctx = context();
  if (!ctx) return;
  try {
    for (const [frequency, start, duration] of patterns[kind]) {
      blip(ctx, frequency, start, duration);
    }
  } catch {
    // Audio is decoration. Never block the quiz for it.
  }
}
