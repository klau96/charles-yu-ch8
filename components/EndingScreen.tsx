"use client";

import { useGame } from "@/game/GameProvider";
import type { EndingConfig } from "@/lib/types";

// A full-screen ending card, sibling in spirit to TitleScreen. Stage mounts it
// (fixed, above the letterbox) once an ending node's dialogue has fully typed.
// Everything visible is driven by the node's `ending` config:
//   • title / description — the text
//   • textColor           — color applied to that text
//   • next                — if set, the button CONTINUES the story at that node
//                           (keeps the graph flowing); otherwise it restarts the
//                           loop on the first pass and the game afterwards.
export function EndingScreen({ config }: { config: EndingConfig }) {
  const { state, dispatch } = useGame();

  const continues = !!config.next;
  const label =
    config.buttonLabel ??
    (continues ? "Continue ▸" : state.loop === 0 ? "Use the machine again" : "↺ The end");

  function onClick() {
    if (config.next) {
      dispatch({ type: "GOTO", node: config.next });
    } else {
      dispatch({ type: state.loop === 0 ? "RESTART_LOOP" : "RESTART_GAME" });
    }
  }

  return (
    <main
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-neutral-950 text-neutral-100"
      style={{ animation: "navPanelIn 600ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
    >
      <header
        className="text-center space-y-3 px-6 max-w-2xl"
        style={config.textColor ? { color: config.textColor } : undefined}
      >
        <h1 className="font-serif italic text-4xl tracking-tight select-none">{config.title}</h1>
        {config.description && (
          <p className="text-sm leading-relaxed opacity-80">{config.description}</p>
        )}
      </header>

      <nav className="flex flex-col gap-3 w-56">
        <button
          onClick={onClick}
          className="px-4 py-2 rounded border border-neutral-700 hover:bg-neutral-800 transition cursor-pointer"
        >
          {label}
        </button>
      </nav>
    </main>
  );
}
