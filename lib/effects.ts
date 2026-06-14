// Resolves a line's `fx` tokens into what Stage needs to render. Keeping the
// vocabulary here means adding an effect is a one-file change: add the token to
// ONE_SHOT/PERSISTENT (and a EffectToken in types), then handle it in Stage.

import type { EffectToken, Line } from "./types";

const ONE_SHOT = new Set<string>(["flash", "shake"]);
const PERSISTENT = new Set<string>(["grayscale", "threshold", "redblink"]);

function tokens(fx: Line["fx"]): EffectToken[] {
  if (!fx) return [];
  return Array.isArray(fx) ? fx : [fx];
}

// Persistent filters carry forward across the script (like sprite/dimmed): walk
// up to the current line, accumulating a set. "clear" empties it; "-name"
// removes one. One-shot tokens are ignored here.
export function resolvePersistent(script: Line[], lineIndex: number): Set<string> {
  const active = new Set<string>();
  for (let i = 0; i <= lineIndex && i < script.length; i++) {
    for (const t of tokens(script[i]?.fx)) {
      if (t === "clear") active.clear();
      else if (t.startsWith("-")) active.delete(t.slice(1));
      else if (PERSISTENT.has(t)) active.add(t);
    }
  }
  return active;
}

// One-shots fire only on the active line — they replay, they don't accumulate.
export function oneShotsOf(line: Line | undefined): string[] {
  return tokens(line?.fx).filter((t) => ONE_SHOT.has(t));
}

// The CSS `filter` value for the world layer. grayscale stays in the string at 0
// when off so it transitions smoothly; threshold (an SVG filter) is appended
// only when active (it snaps — a hard 1-bit cut shouldn't ease).
export function filterCss(active: Set<string>): string {
  // grayscale also dims to 50% brightness. Both stay in the string at their
  // "off" values (0 / 1) when inactive so they ease via transition-[filter].
  const gray = active.has("grayscale");
  const parts = [`grayscale(${gray ? 1 : 0})`, `brightness(${gray ? 0.8 : 1})`];
  if (active.has("threshold")) parts.push("url(#fx-threshold)");
  return parts.join(" ");
}
