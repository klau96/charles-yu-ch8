// Resolves a line/scene's audio fields into what Stage needs to play, and looks
// names up in the registry. Mirrors lib/effects: the vocabulary + resolution
// live here, the playback lives in lib/sound, and the wiring lives in Stage.

import type { Line } from "./types";
import { SFX, MUSIC, type SfxClip, type MusicClip } from "./audioConfig";

// One-shot sound names on the active line (parallels oneShotsOf). Replays when
// the line is revisited; never accumulates.
export function sfxOf(line: Line | undefined): string[] {
  if (!line?.sfx) return [];
  return Array.isArray(line.sfx) ? line.sfx : [line.sfx];
}

// The single track that should be playing at `lineIndex` (parallels
// resolvePersistent, but a lone value — only one track plays at a time). The
// scene's own `music` seeds the walk; "name" sets/replaces, "-name" clears it
// if it matches. Returns null when nothing should play. Pass the LIVE script
// (the one Stage walks) so music on choice-spliced lines is honored.
export function resolveMusic(
  sceneMusic: string | undefined,
  script: Line[],
  lineIndex: number,
): string | null {
  let track: string | null = sceneMusic ?? null;
  for (let i = 0; i <= lineIndex && i < script.length; i++) {
    const m = script[i]?.music;
    if (!m) continue;
    if (m.startsWith("-")) {
      if (track === m.slice(1)) track = null;
    } else {
      track = m;
    }
  }
  return track;
}

// Registry lookups. A missing name warns once (deduped) and resolves to
// undefined, so callers can skip it without spamming the console.
const warned = new Set<string>();
function warnUnknown(kind: string, name: string): void {
  const key = `${kind}:${name}`;
  if (warned.has(key)) return;
  warned.add(key);
  if (typeof console !== "undefined") {
    console.warn(`[audio] unknown ${kind} "${name}" — add it to lib/audioConfig`);
  }
}

export function sfxClip(name: string): SfxClip | undefined {
  const clip = SFX[name];
  if (!clip) warnUnknown("sfx", name);
  return clip;
}

export function musicClip(name: string): MusicClip | undefined {
  const clip = MUSIC[name];
  if (!clip) warnUnknown("music", name);
  return clip;
}
