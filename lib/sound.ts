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
let keepAlive: ConstantSourceNode | null = null;

function getCtx(resume = true): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Only wake the device and hold it open when we actually intend to make sound
  // (resume = true). Preloading decodes buffers with resume = false, staying
  // silent and gesture-free until the first real play. Browsers start the
  // context suspended until a gesture; the game begins on a click, so resuming
  // from a play call is allowed.
  if (resume) {
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    ensureKeepAlive(ctx);
  }
  return ctx;
}

// Hold the audio device open with a silent constant signal so the first blip
// after a quiet stretch (the player reading a line) doesn't wait for the device
// to wake up — Bluetooth outputs especially can take seconds. Started lazily on
// the first blip (via getCtx) and persists across the reading gaps; release it
// with releaseAudio(). Degrades gracefully where ConstantSourceNode is missing.
function ensureKeepAlive(audio: AudioContext): void {
  if (keepAlive || typeof audio.createConstantSource !== "function") return;
  const node = audio.createConstantSource();
  const gain = audio.createGain();
  gain.gain.value = 0; // inaudible — the device stays awake, the player hears nothing
  node.connect(gain).connect(audio.destination);
  node.start();
  keepAlive = node;
}

// Stop holding the device open (e.g. when the game tears down, or sound is
// turned off). Lets the device sleep again; safe to call when nothing's running.
export function releaseAudio(): void {
  if (!keepAlive) return;
  try {
    keepAlive.stop();
    keepAlive.disconnect();
  } catch {
    // already stopped — ignore
  }
  keepAlive = null;
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
      // Disconnect once the sample finishes so the nodes don't pile up.
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
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
  // `onended` fires at the scheduled stop time below — tear the nodes down then
  // so the graph never grows over a long session.
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
  osc.start(t);
  osc.stop(t + 0.06);
}

// ===========================================================================
// SFX + music. SFX are one-shots (like the blip's sample path); music is a
// single looping track with crossfades. Names are resolved to these `src`s by
// lib/audio before they reach here. All SSR-safe via getCtx().
// ===========================================================================

// General sample cache (separate from the typewriter blip's single buffer).
const sampleBuffers = new Map<string, AudioBuffer>();
const samplePromises = new Map<string, Promise<AudioBuffer | null>>();

// Fetch + decode a sample once, caching the in-flight promise so concurrent
// callers share one network+decode. Resolves null on any failure — callers skip
// silently, matching the blip's "missing sample → no crash" behavior.
function loadSample(audio: AudioContext, src: string): Promise<AudioBuffer | null> {
  const cached = sampleBuffers.get(src);
  if (cached) return Promise.resolve(cached);
  let p = samplePromises.get(src);
  if (!p) {
    p = fetch(src)
      .then((res) => res.arrayBuffer())
      .then((arr) => audio.decodeAudioData(arr))
      .then((decoded) => {
        sampleBuffers.set(src, decoded);
        return decoded;
      })
      .catch(() => null);
    samplePromises.set(src, p);
  }
  return p;
}

// Warm the cache ahead of first use (call on mount). Decodes without resuming,
// so the device stays asleep and no gesture is needed until something plays.
export function preloadAudio(srcs: string[]): void {
  if (srcs.length === 0) return;
  const audio = getCtx(false);
  if (!audio) return;
  for (const src of srcs) loadSample(audio, src);
}

// One-shot sound effect. Plays as soon as its sample is ready (a cold-cache hit
// loads first, so the very first play of an un-preloaded sfx may lag slightly).
export function playSfx(src: string, volume = 1): void {
  const audio = getCtx();
  if (!audio) return;
  loadSample(audio, src).then((buf) => {
    if (!buf) return;
    const source = audio.createBufferSource();
    source.buffer = buf;
    const gain = audio.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(audio.destination);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start();
  });
}

// ----- Persistent music, with crossfade -----------------------------------

const MUSIC_FADE = 0.4; // seconds, for both fade-in and fade-out
let currentMusic: { src: string; source: AudioBufferSourceNode; gain: GainNode } | null = null;
// The track we WANT playing right now. Guards against a slow-loading track
// starting after a newer change/stop has already superseded it.
let desiredMusicSrc: string | null = null;

function fadeOutAndStop(m: typeof currentMusic, audio: AudioContext): void {
  if (!m) return;
  const t = audio.currentTime;
  try {
    m.gain.gain.cancelScheduledValues(t);
    m.gain.gain.setValueAtTime(Math.max(0.0001, m.gain.gain.value), t);
    m.gain.gain.exponentialRampToValueAtTime(0.0001, t + MUSIC_FADE);
    m.source.stop(t + MUSIC_FADE + 0.02);
    m.source.onended = () => {
      m.source.disconnect();
      m.gain.disconnect();
    };
  } catch {
    // already stopped — ignore
  }
}

// Start (or crossfade to) a looping track. A repeat call for the track already
// playing is a no-op, so the same music survives same-track scene changes with
// no gap.
export function playMusic(src: string, opts: { volume?: number; loop?: boolean } = {}): void {
  const audio = getCtx();
  if (!audio) return;
  desiredMusicSrc = src;
  if (currentMusic?.src === src) return;

  const { volume = 1, loop = true } = opts;
  loadSample(audio, src).then((buf) => {
    if (!buf) return;
    if (desiredMusicSrc !== src) return; // superseded while loading
    if (currentMusic?.src === src) return; // already switched to it

    const source = audio.createBufferSource();
    source.buffer = buf;
    source.loop = loop;
    const gain = audio.createGain();
    const t = audio.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), t + MUSIC_FADE);
    source.connect(gain).connect(audio.destination);
    source.start();

    fadeOutAndStop(currentMusic, audio); // crossfade the previous track out
    currentMusic = { src, source, gain };
  });
}

// Fade out and stop whatever is playing.
export function stopMusic(): void {
  desiredMusicSrc = null;
  if (!currentMusic || !ctx) return;
  fadeOutAndStop(currentMusic, ctx);
  currentMusic = null;
}
