"use client";

import { useState } from "react";
import { useGame } from "@/game/GameProvider";
import { scenes } from "@/game/scenes";
import { SceneRenderer } from "./SceneRenderer";

// The compositor. It paints the persistent layers for the current node and
// hands the interaction layer off to SceneRenderer. It does NOT know which
// interaction is active — that dispatch lives in SceneRenderer.
export function Stage() {
  const { state, dispatch } = useGame();
  const node = scenes[state.current];

  // Ephemeral pacing state — lives here (not in the reducer) so the compositor
  // can move the dialogue and the sprite together. `script` is the line list we
  // actually walk: it starts as the node's script, but an in-scene choice can
  // splice extra lines into it. Reset both when we land on a new node, during
  // render (React's recommended pattern) instead of in an effect.
  const [lineIndex, setLineIndex] = useState(0);
  const [script, setScript] = useState(node.script ?? []);
  const [shownNode, setShownNode] = useState(state.current);
  if (shownNode !== state.current) {
    setShownNode(state.current);
    setLineIndex(0);
    setScript(node.script ?? []);
  }

  const activeLine = script[lineIndex];

  // Sprite and speaker both carry forward: a line that omits either keeps the
  // last value set by an earlier line, so you only set them when they change.
  // Sprite starts from the scene's character sprite; speaker defaults to
  // "narration" until a line names one.
  let sprite = node.character?.sprite;
  let speaker = "narration";
  for (let i = 0; i <= lineIndex && i < script.length; i++) {
    if (script[i]?.sprite) sprite = script[i].sprite;
    if (script[i]?.speaker) speaker = script[i].speaker;
  }

  const atLastLine = lineIndex >= script.length - 1;
  const advanceLine = () => setLineIndex((i) => Math.min(i + 1, script.length - 1));

  // Choices to offer at the current line: the line's own inline `choices`, or
  // (legacy) a choice node's `choices` at the end of its base script.
  const baseLen = node.script?.length ?? 0;
  const choices =
    activeLine?.choices ??
    (node.type === "choice" && lineIndex === baseLen - 1 ? node.choices : undefined);

  // Picking a choice does ONE of three things — none of which has to leave the
  // scene:
  //   • `lines` — splice them in right after the current line and play them,
  //               then the script flows on into whatever followed.
  //   • `next`  — classic jump to another node.
  //   • neither — just record its flags and continue to the next line.
  const choose = (choice) => {
    if (choice.lines && choice.lines.length > 0) {
      if (choice.set) dispatch({ type: "SET_FLAGS", flags: choice.set });
      const at = lineIndex;
      setScript((prev) => [...prev.slice(0, at + 1), ...choice.lines, ...prev.slice(at + 1)]);
      setLineIndex(at + 1); // step into the first spliced line
    } else if (choice.next) {
      dispatch({ type: "CHOOSE", choice }); // applies flags + jumps
    } else {
      if (choice.set) dispatch({ type: "SET_FLAGS", flags: choice.set });
      advanceLine(); // stay in the scene, just move on
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-black to-slate-950">
      {/* Fixed-aspect, letterboxed viewport. Children are absolutely stacked. */}
      <div className="relative w-full max-w-5xl aspect-video overflow-hidden bg-neutral-900">
        {/* z-0 — background art */}
        {node.background && (
          <div
            className="absolute inset-0 z-0 bg-cover bg-center transition-opacity duration-500"
            style={{ backgroundImage: `url(${node.background})` }}
          />
        )}

        {/* z-10 — character sprite, driven by the active line. `key` remounts the
            sprite on a change so it fades in from scratch (see CharacterSprite). */}
        {sprite && <CharacterSprite key={sprite} src={sprite} />}

        {/* z-20 — interaction layer, chosen by node.type inside SceneRenderer */}
        <div className="absolute inset-0 z-20">
          <SceneRenderer
            line={activeLine}
            speaker={speaker}
            lineKey={`${state.current}:${lineIndex}`}
            atLastLine={atLastLine}
            choices={choices}
            onAdvanceLine={advanceLine}
            onChoose={choose}
          />
        </div>

        {/* z-30 — full-screen effects overlay (collapse, glitch). Stub for now. */}
        {node.effect && (
          <div className="absolute inset-0 z-30 pointer-events-none" data-effect={node.effect} />
        )}
      </div>
    </main>
  );
}

// The character sprite, faded in once its pixels are ready. It starts at
// opacity-0 and transitions to full on load — so even a not-yet-cached sprite
// never pops in half-painted. The ref's `complete` check covers the case where
// a preloaded sprite is already cached before React's onLoad can attach.
function CharacterSprite({ src }) {
  const [loaded, setLoaded] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(el) => {
        if (el?.complete) setLoaded(true);
      }}
      src={src}
      alt=""
      onLoad={() => setLoaded(true)}
      className={`absolute bottom-0 left-1/2 z-10 h-[85%] -translate-x-1/2 object-contain transition-opacity duration-500 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
