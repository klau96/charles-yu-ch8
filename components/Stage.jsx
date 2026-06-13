"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game/GameProvider";
import { scenes } from "@/game/scenes";
import { filterCss, oneShotsOf, resolvePersistent } from "@/lib/effects";
import { sfxOf, resolveMusic, sfxClip, musicClip } from "@/lib/audio";
import { playSfx, playMusic, stopMusic } from "@/lib/sound";
import { SceneRenderer } from "./SceneRenderer";
import { EndingScreen } from "./EndingScreen";

// Earthquake jitter, played imperatively (Web Animations API) so it replays per
// shake-line without remounting the frame.
const SHAKE_KEYFRAMES = [
  { transform: "translate(0, 0)" },
  { transform: "translate(-4px, 2px) rotate(-0.4deg)" },
  { transform: "translate(4px, -2px) rotate(0.3deg)" },
  { transform: "translate(-3px, 1px)" },
  { transform: "translate(3px, 2px) rotate(0.3deg)" },
  
  { transform: "translate(-4px, 2px) rotate(-0.4deg)" },
  { transform: "translate(4px, -2px) rotate(0.3deg)" },
  { transform: "translate(-3px, 1px)" },
  { transform: "translate(3px, 2px) rotate(0.3deg)" },

  { transform: "translate(0, 0)" },
];
const SHAKE_OPTIONS = { duration: 600, easing: "ease-in-out" };

// One-shot flash, also via the Web Animations API (a CSS @keyframes referenced
// only from inline style gets tree-shaken out of the built CSS by Tailwind v4).
const FLASH_KEYFRAMES = [{ opacity: 0.95 }, { opacity: 0 }];
const FLASH_OPTIONS = { duration: 1000, easing: "ease-out" };

// Persistent red alarm — an infinite pulse on a red overlay. WAAPI so it loops
// and isn't pruned; runs while the "redblink" effect is active, cancels when off.
const RED_BLINK_KEYFRAMES = [{ opacity: 0 }, { opacity: 0.5 }, { opacity: 0 }];
const RED_BLINK_OPTIONS = { duration: 1200, easing: "ease-in-out", iterations: Infinity };

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
  // Whether the ending card is up. Flipped on once an ending node's dialogue has
  // fully played (SceneRenderer reports it), reset whenever we enter a new node.
  const [showEnding, setShowEnding] = useState(false);
  const [shownNode, setShownNode] = useState(state.current);
  if (shownNode !== state.current) {
    setShownNode(state.current);
    setLineIndex(0);
    setScript(node.script ?? []);
    setShowEnding(false);
  }

  const activeLine = script[lineIndex];

  // Sprite, dim, and speaker all carry forward: a line that omits one keeps the
  // last value set earlier, so you only set them when they change. Sprite starts
  // from the scene's character sprite; speaker defaults to "narration". A line's
  // `dimmed` overrides the carried value — but changing the sprite first resets
  // dim to false, so a new sprite shows full unless that same line re-dims it.
  let sprite = node.character?.sprite;
  let background = node.background;
  let dimmed = false;
  let speaker = "narration";
  for (let i = 0; i <= lineIndex && i < script.length; i++) {
    const line = script[i];
    // `!== undefined` (not truthiness) so an explicit sprite: "" clears the
    // sprite (nothing renders), while an omitted sprite carries the current one
    // forward. Either way, an explicit sprite resets the dim.
    if (line?.sprite !== undefined) {
      sprite = line.sprite;
      dimmed = false;
    }
    // Same `!== undefined` rule for the background: an explicit "" clears it,
    // an omitted background carries the current one forward.
    if (line?.background !== undefined) background = line.background;
    if (line?.dimmed !== undefined) dimmed = line.dimmed;
    if (line?.speaker) speaker = line.speaker;
  }

  const atLastLine = lineIndex >= script.length - 1;
  // Walk forward from the active line. A line-level `next` traverses to another
  // node from anywhere in the script (including the last line of a choice's
  // spliced `lines`) and wins over the node's own edge; at the end of the script
  // with no line jump, we follow the node's `next`/`branch`; otherwise step on.
  const advanceLine = () => {
    if (activeLine?.next) {
      dispatch({ type: "GOTO", node: activeLine.next });
    } else if (atLastLine) {
      dispatch({ type: "ADVANCE" });
    } else {
      setLineIndex((i) => i + 1);
    }
  };

  // Screen effects resolved from `fx` tokens (see lib/effects). Persistent
  // filters (grayscale/threshold) carry forward through the script; one-shots
  // (flash/shake) fire only on the active line.
  const lineKey = `${state.current}:${lineIndex}`;
  const activeEffects = resolvePersistent(script, lineIndex);
  const filter = filterCss(activeEffects);
  const oneShots = oneShotsOf(activeLine);

  // One-shots played imperatively (Web Animations API) on the active line —
  // keyed on lineKey so they re-fire each time their line is reached. Earthquake
  // jitters the whole viewport; flash washes a white overlay and settles back.
  const viewportRef = useRef(null);
  const flashRef = useRef(null);
  const shaking = oneShots.includes("shake");
  const flashing = oneShots.includes("flash");
  useEffect(() => {
    if (shaking) viewportRef.current?.animate(SHAKE_KEYFRAMES, SHAKE_OPTIONS);
    if (flashing) flashRef.current?.animate(FLASH_KEYFRAMES, FLASH_OPTIONS);
  }, [lineKey, shaking, flashing]);

  // Persistent red alarm: starts an infinite pulse when "redblink" becomes
  // active (carried forward like the other persistent effects) and cancels it
  // when cleared. Keyed on the boolean so it doesn't restart every line.
  const redRef = useRef(null);
  const redBlinking = activeEffects.has("redblink");
  useEffect(() => {
    if (!redBlinking) return;
    const anim = redRef.current?.animate(RED_BLINK_KEYFRAMES, RED_BLINK_OPTIONS);
    return () => anim?.cancel();
  }, [redBlinking]);

  // One-shot sound effects on the active line — the audio sibling of flash/shake.
  // Keyed on lineKey (+ the sfx names) so they re-fire each time the line shows.
  const sfx = sfxOf(activeLine);
  const sfxKey = sfx.join("|");
  useEffect(() => {
    for (const name of sfx) {
      const clip = sfxClip(name);
      if (clip) playSfx(clip.src, clip.volume ?? 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineKey, sfxKey]);

  // Persistent music: the single track resolved for (scene, line). Crossfades in
  // on change and stops when it resolves to nothing — a scene change that drops
  // the track, or an explicit "-name". Re-declaring the same track (same string)
  // doesn't re-run this, so it plays through unchanged.
  const music = resolveMusic(node.music, script, lineIndex);
  useEffect(() => {
    if (!music) {
      stopMusic();
      return;
    }
    const clip = musicClip(music);
    if (clip) playMusic(clip.src, { volume: clip.volume ?? 1, loop: clip.loop ?? true });
    else stopMusic();
  }, [music]);

  // Stop music when the stage unmounts (e.g. back to the title screen, which
  // lives outside Stage). Separate from the effect above so it only fires on
  // teardown, not on every track change.
  useEffect(() => () => stopMusic(), []);

  // Choices to offer at the current line: the line's own inline `choices`, or
  // (legacy) a choice node's `choices` when we reach the LAST line of the base
  // script. Match that line by REFERENCE, not index — an in-scene choice earlier
  // in the script can splice lines in and shift indices, which would otherwise
  // make the node-level choices appear on a spliced line instead of the end.
  const baseScript = node.script ?? [];
  const lastBaseLine = baseScript[baseScript.length - 1];
  const choices =
    activeLine?.choices ??
    (node.type === "choice" && activeLine === lastBaseLine ? node.choices : undefined);

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
      {/* Fixed-aspect, letterboxed viewport. Children are absolutely stacked.
          `viewportRef` is the shake target — the whole frame jitters together. */}
      <div
        ref={viewportRef}
        className="relative w-full max-w-5xl aspect-video overflow-hidden bg-neutral-900"
      >
        {/* z-0 — WORLD layer: background + character. Color filters (grayscale /
            threshold) apply here only, so the dialogue above stays crisp. */}
        <div
          className="absolute inset-0 z-0 transition-[filter] duration-700"
          style={{ filter }}
        >
          {background && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{ backgroundImage: `url(${background})` }}
            />
          )}

          {/* character sprite, driven by the active line. `key` remounts the
              sprite on a change so it fades in from scratch (see CharacterSprite). */}
          {sprite && <CharacterSprite key={sprite} src={sprite} dim={dimmed} />}
        </div>

        {/* z-10 — persistent red alarm overlay, pulsed by WAAPI while "redblink"
            is active. Below the dialogue so text stays readable. */}
        <div ref={redRef} className="pointer-events-none absolute inset-0 z-10 bg-red-700 opacity-0" />

        {/* z-20 — interaction layer, chosen by node.type inside SceneRenderer */}
        <div className="absolute inset-0 z-20">
          <SceneRenderer
            line={activeLine}
            speaker={speaker}
            lineKey={lineKey}
            atLastLine={atLastLine}
            choices={choices}
            onAdvanceLine={advanceLine}
            onChoose={choose}
            onEndingComplete={() => setShowEnding(true)}
          />
        </div>

        {/* z-30 — legacy full-screen effect overlay (collapse). Stub for now. */}
        {node.effect && (
          <div className="absolute inset-0 z-30 pointer-events-none" data-effect={node.effect} />
        )}

        {/* z-40 — one-shot flash overlay. Permanently mounted at opacity 0; the
            WAAPI animation above washes it white then settles back to clear. */}
        <div ref={flashRef} className="pointer-events-none absolute inset-0 z-40 bg-white opacity-0" />

        {/* Hidden SVG: a true 1-bit black/white threshold filter (fx: "threshold").
            feColorMatrix → luminance grey, then a discrete transfer snaps each
            channel to 0 or 1. The "0 1" split is the cutoff. */}
        <svg aria-hidden="true" className="absolute h-0 w-0">
          <defs>
            <filter id="fx-threshold" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
              />
              <feComponentTransfer>
                <feFuncR type="discrete" tableValues="0 1" />
                <feFuncG type="discrete" tableValues="0 1" />
                <feFuncB type="discrete" tableValues="0 1" />
              </feComponentTransfer>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Full-screen ending card, shown once an ending node with an `ending`
          config has finished its dialogue. Fixed, so it covers the letterbox. */}
      {showEnding && node.ending && <EndingScreen config={node.ending} />}
    </main>
  );
}

// The character sprite, faded in once its pixels are ready. It starts at
// opacity-0 and transitions to full on load — so even a not-yet-cached sprite
// never pops in half-painted. The ref's `complete` check covers the case where
// a preloaded sprite is already cached before React's onLoad can attach. `dim`
// keeps the sprite fully opaque but darkens its colors (brightness 50%); since
// the element only remounts on a src change, toggling dim on the same sprite
// cross-fades the brightness.
function CharacterSprite({ src, dim }) {
  const [loaded, setLoaded] = useState(false);
  const opacity = loaded ? "opacity-100" : "opacity-0"; // fade in once decoded
  const brightness = dim ? "brightness-25" : "brightness-100"; // dim = darker, still opaque
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={(el) => {
        if (el?.complete) setLoaded(true);
      }}
      src={src}
      alt=""
      onLoad={() => setLoaded(true)}
      className={`absolute bottom-0 left-1/2 z-10 h-[85%] -translate-x-1/2 object-contain transition-[opacity,filter] duration-500 ${opacity} ${brightness}`}
    />
  );
}
