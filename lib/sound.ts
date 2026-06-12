// Per-letter typewriter sound. Uses Web Audio (not a single <audio> element) so
// rapid letters overlap cleanly instead of cutting each other off. Nothing here
// touches the browser until playBlip() is called from a user-driven render, so
// it's SSR-safe. If a sample is configured it's loaded once and reused; if none
// is set (or it fails to load) a short synthesized click is played instead, so
// the feature works with zero assets.

import { textFx } from "./textConfig";

let ctx: AudioContext | null = null;
let buffer: AudioBuffer | null = null;
let loading = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers start the context suspended until a gesture; the game begins on a
  // click, so resuming here is allowed.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function loadBuffer(audio: AudioContext, src: string): void {
  if (buffer || loading) return;
  loading = true;
  fetch(src)
    .then((res) => res.arrayBuffer())
    .then((arr) => audio.decodeAudioData(arr))
    .then((decoded) => {
      buffer = decoded;
    })
    .catch(() => {
      buffer = null; // leave it null — we fall back to the synth blip
    })
    .finally(() => {
      loading = false;
    });
}

export function playBlip(): void {
  const s = textFx.sound;
  if (!s.enabled) return;

  const audio = getCtx();
  if (!audio) return;

  if (s.src) {
    // Kick off a one-time load; until it's ready this letter uses the synth.
    if (!buffer) loadBuffer(audio, s.src);
    if (buffer) {
      const source = audio.createBufferSource();
      source.buffer = buffer;
      const gain = audio.createGain();
      gain.gain.value = s.volume;
      source.connect(gain).connect(audio.destination);
      source.start();
      return;
    }
  }

  synth(audio, s.volume);
}

// A short, quiet square-wave click — the default typewriter tick.
function synth(audio: AudioContext, volume: number): void {
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "square";
  osc.frequency.value = 660;

  const peak = Math.max(0.0001, volume * 0.15); // square waves are harsh — keep it low
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

  osc.connect(gain).connect(audio.destination);
  osc.start(t);
  osc.stop(t + 0.06);
}
