import type { GameState } from "@/lib/types";
import { scenes } from "./scenes";

// Single-slot autosave. All the fragile concerns (SSR guard, JSON, version,
// validation, exceptions) live HERE so no component has to know it's localStorage.
// Swapping to IndexedDB or a server save later means rewriting only this file.

const KEY = "htls-vn:save";
const VERSION = 1; // bump when the save shape or scene IDs change

export function saveGame(state: GameState): void {
  if (typeof window === "undefined") return; // never runs on the server
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, state }));
  } catch {
    // private mode / quota / disabled — fail silently; the game stays playable
  }
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { version: number; state: GameState };
    if (parsed.version !== VERSION) return null; // old schema — discard
    if (!parsed.state || !scenes[parsed.state.current]) return null; // stale node — discard

    return parsed.state;
  } catch {
    return null; // corrupt JSON — discard rather than crash
  }
}

export function clearGame(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function hasSave(): boolean {
  return loadGame() !== null;
}
