// Image preloading. Sprite swaps flash when the file isn't in the browser cache
// yet, so we warm the cache up front by creating Image objects and decoding
// them. This is the browser's own image pipeline — the same cache the <img>
// tags read from — which is exactly why a data-fetching cache (TanStack Query,
// etc.) wouldn't help here: <img> never reads from it.

import type { Line } from "@/lib/types";
import { scenes } from "./scenes";

// Walk a line list, collecting every sprite — including those on the inline
// continuation lines hidden inside a choice's `lines` (recursively).
function spritesFromLines(lines: Line[] | undefined, out: Set<string>): void {
  for (const line of lines ?? []) {
    if (line.sprite) out.add(line.sprite);
    for (const choice of line.choices ?? []) spritesFromLines(choice.lines, out);
  }
}

// Every sprite URL referenced anywhere in the scene graph.
export function collectSprites(): string[] {
  const out = new Set<string>();
  for (const scene of Object.values(scenes)) {
    if (scene.character?.sprite) out.add(scene.character.sprite);
    spritesFromLines(scene.script, out);
    for (const choice of scene.choices ?? []) spritesFromLines(choice.lines, out);
  }
  return [...out];
}

// Every background URL referenced by the scene graph. These are CSS
// background-image url()s, not <img>, but preloading still warms the same HTTP
// cache the url() reads from — so the background is ready when the scene paints.
export function collectBackgrounds(): string[] {
  const out = new Set<string>();
  for (const scene of Object.values(scenes)) {
    if (scene.background) out.add(scene.background);
  }
  return [...out];
}

// Pull each URL into the browser cache and decode it, so a later <img> swap or
// CSS background paint is instant. Client-only; failures are ignored (a missing
// asset shouldn't break the game).
export function preloadImages(urls: string[]): void {
  if (typeof window === "undefined") return;
  for (const src of urls) {
    const img = new Image();
    img.src = src;
    img.decode?.().catch(() => {});
  }
}
