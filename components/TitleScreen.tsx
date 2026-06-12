"use client";

import { useGame } from "@/game/GameProvider";
import { clearGame, hasSave } from "@/game/save";

export function TitleScreen({ onPlay }: { onPlay: () => void }) {
  const { dispatch, hydrated } = useGame();

  // Gate on `hydrated` so the server and first client render agree (no Continue
  // button) — that avoids a hydration mismatch. The button appears on the
  // re-render once hydration confirms a save exists.
  const saveExists = hydrated && hasSave();

  function newGame() {
    if (saveExists && !window.confirm("Start over? This erases your saved progress.")) return;
    clearGame();
    dispatch({ type: "RESTART_GAME" });
    onPlay();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-10 bg-neutral-950 text-neutral-100">
      <header className="text-center space-y-2">
        <h1 className="font-serif italic text-4xl tracking-tight">Chapter 8 — How to Live Safely in a Science Fictional Universe</h1>
        <p className="text-sm text-neutral-400">Kiaran Lau</p>
      </header>

      <nav className="flex flex-col gap-3 w-56">
        <button
          onClick={newGame}
          className="px-4 py-2 rounded border border-neutral-700 hover:bg-neutral-800 transition"
        >
          New game
        </button>

        {saveExists && (
          <button
            onClick={onPlay} // state was already restored by GameProvider on mount
            className="px-4 py-2 rounded border border-neutral-700 hover:bg-neutral-800 transition"
          >
            Continue
          </button>
        )}
      </nav>
    </main>
  );
}
