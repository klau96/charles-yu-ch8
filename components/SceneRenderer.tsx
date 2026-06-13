"use client";

import { useRef, useState } from "react";
import { useGame } from "@/game/GameProvider";
import { scenes } from "@/game/scenes";
import { DialogueText, type DialogueHandle } from "./DialogueText";
import type { Choice, Line, Speaker } from "@/lib/types";

interface SceneRendererProps {
  line?: Line; // the line currently being shown (chosen by Stage)
  speaker: Speaker; // resolved speaker (Stage carries it forward across lines)
  lineKey: string; // stable id for the active line (node + index) — restarts the typewriter
  atLastLine: boolean; // true once the script has no more lines to walk
  choices?: Choice[]; // choices to offer at the current line (inline or node-level), if any
  onAdvanceLine: () => void; // step to the next line within this node
  onChoose: (choice: Choice) => void; // pick a choice (in-scene continuation or jump — Stage decides)
}

// SKELETON dispatcher. Walks the script via DialogueText (letter-by-letter), and
// only reveals the node's real transition (ADVANCE / CHOOSE / ending) once the
// current line has finished typing. Eventually split into the per-interaction
// components + a shared DialogueBox.
export function SceneRenderer({
  line,
  speaker,
  lineKey,
  atLastLine,
  choices,
  onAdvanceLine,
  onChoose,
}: SceneRendererProps) {
  const { state, dispatch } = useGame();
  const node = scenes[state.current];
  const isNarration = speaker === "narration";
  const hasChoices = !!choices?.length;

  // Handle to the active DialogueText, so a click anywhere on the panel can skip
  // its typewriter animation.
  const dialogueRef = useRef<DialogueHandle>(null);

  // Narration and the woman render bare (she carries her own quotes in the
  // script when a line needs them); other spoken voices (yu) get auto-quotes.
  // The typewriter slices this whole string, so any quotes reveal naturally at
  // the start and end.
  const quoted = speaker !== "narration" && speaker !== "woman";
  const display = line ? (quoted ? `“${line.text}”` : line.text) : "";
  const textClass = isNarration
    ? "font-serif italic text-neutral-100 leading-relaxed"
    : "font-sans";

  // Gate the controls until the line has finished typing. Reset per line during
  // render (React's recommended pattern) rather than in an effect.
  const [typingDone, setTypingDone] = useState(false);
  const [doneKey, setDoneKey] = useState(lineKey);
  if (doneKey !== lineKey) {
    setDoneKey(lineKey);
    setTypingDone(false);
  }

  return (
    /* DIALOGUE PANEL — the bottom letterboxed bar. Clicking anywhere on it skips
       the typewriter (skip() is a no-op once the line is fully shown). */
    <div
      onClick={() => dialogueRef.current?.skip()}
      className={`text-lg absolute inset-x-0 bottom-0 p-6 bg-black/60 backdrop-blur text-neutral-100 select-none ${
        typingDone ? "" : "cursor-pointer"
      }`}
    >
      {/* SPEAKER NAMEPLATE — only for spoken lines; narration is unattributed. */}
      {node.character?.name && !isNarration && (
        <div className="mb-1 text-sm font-medium tracking-wide text-emerald-300">
          {node.character.name}
        </div>
      )}

      {/* DIALOGUE TEXT — the line, typed out character by character. An invisible
          full-text "ghost" reserves the line's final height so the bottom-anchored
          panel doesn't grow upward as it types (which made the cursor flicker at
          the panel's moving top edge). The typed text overlays the ghost. */}
      <div className="relative">
        <p className={`${textClass} invisible`} aria-hidden="true">
          {display}
        </p>
        <div className="absolute inset-0">
          <DialogueText
            ref={dialogueRef}
            key={lineKey}
            text={display}
            className={textClass}
            onDone={() => setTypingDone(true)}
          />
        </div>
      </div>

      {/* CONTROLS — hidden until the line finishes typing. */}
      <div className="mt-4 flex flex-col gap-2">
        {/* Still typing — hint that the panel can be clicked to skip. */}
        {!typingDone && <span className="self-end text-xs opacity-40">click to skip</span>}

        {/* CHOICES — this line ends in a decision (inline on the line, or a
            choice node's options). Picking one may continue in-scene, set flags,
            or jump; Stage decides via onChoose. */}
        {typingDone &&
          hasChoices &&
          choices?.map((choice, i) => (
            <button
              key={i}
              onClick={() => onChoose(choice)}
              className="rounded border border-white/20 px-4 py-2 text-left hover:bg-white/10 cursor-pointer"
            >
              {choice.label}
            </button>
          ))}

        {/* No choices here, more lines to read — walk to the next script line
            (this also walks lines spliced in by an in-scene choice). */}
        {typingDone && !hasChoices && !atLastLine && (
          <button
            onClick={onAdvanceLine}
            className="self-end text-sm opacity-70 hover:opacity-100 cursor-pointer"
          >
            continue ▸
          </button>
        )}

        {/* No choices, FINAL line, not an ending — advance via the node's own
            next/branch. */}
        {typingDone && !hasChoices && atLastLine && node.type !== "ending" && (
          <button
            onClick={() => dispatch({ type: "ADVANCE" })}
            className="self-end text-sm opacity-70 hover:opacity-100 cursor-pointer"
          >
            continue ▸
          </button>
        )}

        {/* ENDING node, fully typed — loop back, or end the game. */}
        {typingDone && atLastLine && node.type === "ending" && (
          <button
            onClick={() => dispatch({ type: state.loop === 0 ? "RESTART_LOOP" : "RESTART_GAME" })}
            className="self-end text-sm opacity-70 hover:opacity-100 cursor-pointer"
          >
            {state.loop === 0 ? "Use the machine again" : "↺ The end"}
          </button>
        )}
      </div>
    </div>
  );
}
