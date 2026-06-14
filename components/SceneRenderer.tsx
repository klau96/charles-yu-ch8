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
  onEndingComplete?: () => void; // ending node fully typed — Stage raises the EndingScreen
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
  onEndingComplete,
}: SceneRendererProps) {
  const { state, dispatch } = useGame();
  const node = scenes[state.current];
  const isNarration = speaker === "narration";
  const hasChoices = !!choices?.length;
  // Nameplate label for the active speaker: a per-speaker name wins, otherwise
  // the scene's single character name. Narration is unattributed (see below).
  const speakerName = node.names?.[speaker] ?? node.character?.name;

  // Handle to the active DialogueText, so a click anywhere on the panel can skip
  // its typewriter animation.
  const dialogueRef = useRef<DialogueHandle>(null);

  // Narration and the woman render bare (she carries her own quotes in the
  // script when a line needs them); other spoken voices (yu) get auto-quotes.
  // The typewriter slices this whole string, so any quotes reveal naturally at
  // the start and end.
  const quoted = speaker !== "narration" && speaker !== "woman";
  // `text` is optional and defaults to "". `hasText` decides whether the text
  // area renders at all — an empty line collapses to 0 height so the choices can
  // sit centered in the panel.
  const text = line?.text ?? "";
  const hasText = text !== "";
  const display = hasText ? (quoted ? `“${text}”` : text) : "";
  const textClass = isNarration
    ? "text-lg font-sans text-neutral-100 leading-relaxed"
    : "font-sans";

  // Gate the controls until the line has finished typing. Reset per line during
  // render (React's recommended pattern) rather than in an effect.
  const [typingDone, setTypingDone] = useState(false);
  const [doneKey, setDoneKey] = useState(lineKey);
  if (doneKey !== lineKey) {
    setDoneKey(lineKey);
    setTypingDone(false);
  }

  // A line with no text has nothing to type, so it counts as "complete" right
  // away — its controls/choices appear immediately (DialogueText isn't rendered
  // for an empty line, so it would never fire onDone).
  const typingComplete = !hasText || typingDone;

  return (
    /* DIALOGUE PANEL — the bottom letterboxed bar. Clicking anywhere on it skips
       the typewriter (skip() is a no-op once the line is fully shown). */
    <div
      onClick={() => dialogueRef.current?.skip()}
      className={`absolute inset-x-0 bottom-0 p-6 bg-black/60 backdrop-blur text-neutral-100 select-none ${
        typingComplete ? "" : "cursor-pointer"
      }`}
    >
      {/* SPEAKER NAMEPLATE — only for spoken lines; narration is unattributed. */}
      {speakerName && !isNarration && (
        <div className="mb-1 text-sm font-medium tracking-wide text-emerald-300">
          {speakerName}
        </div>
      )}

      {/* DIALOGUE TEXT — only when the line has text. An invisible full-text
          "ghost" reserves the line's final height so the bottom-anchored panel
          doesn't grow upward as it types. An empty line omits this whole block
          (0 height), so the choices below centre in the panel's padding. */}
      {hasText && (
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
      )}

      {/* CONTROLS — hidden until the line finishes typing. `mt-4` only when
          there's text above; with no text the choices centre in the padding. */}
      <div className={`flex flex-col gap-2 ${hasText ? "mt-4" : ""}`}>
        {/* Still typing — hint that the panel can be clicked to skip. */}
        {!typingComplete && <span className="self-end text-xs opacity-40">click to skip</span>}

        {/* CHOICES — this line ends in a decision (inline on the line, or a
            choice node's options). Picking one may continue in-scene, set flags,
            or jump; Stage decides via onChoose. */}
        {typingComplete &&
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

        {/* No choices — a single "continue" that walks the script: to the next
            line, across a line-level `next`, or off the end via the node's own
            edge. Stage's onAdvanceLine picks which. Endings show their own
            control at the last line, so suppress continue there. */}
        {typingComplete && !hasChoices && !(atLastLine && node.type === "ending") && (
          <button
            onClick={onAdvanceLine}
            className="self-end text-sm opacity-70 hover:opacity-100 cursor-pointer"
          >
            continue ▸
          </button>
        )}

        {/* ENDING node WITH an `ending` config — raise the EndingScreen only on
            an explicit click, not automatically when the last line finishes.
            `!hasChoices` so a last line that still offers choices shows those
            first; the ending control appears only once the choice's lines have
            played out onto a choices-less last line. */}
        {typingComplete && !hasChoices && atLastLine && node.type === "ending" && node.ending && (
          <button
            onClick={() => onEndingComplete?.()}
            className="self-end text-sm opacity-70 hover:opacity-100 cursor-pointer"
          >
            continue ▸
          </button>
        )}

        {/* ENDING node WITHOUT an `ending` config — legacy inline control:
            loop back, or end the game. Endings with a config use EndingScreen.
            Also gated on `!hasChoices` so it doesn't show alongside choices. */}
        {typingComplete && !hasChoices && atLastLine && node.type === "ending" && !node.ending && (
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
