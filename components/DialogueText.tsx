"use client";

import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { textFx } from "@/lib/textConfig";
import { playBlip } from "@/lib/sound";

export interface DialogueHandle {
  // Reveal the whole line at once. No-op if it's already fully shown.
  skip: () => void;
}

interface DialogueTextProps {
  text: string;
  className?: string;
  onDone?: () => void; // fired once the line has fully revealed
  ref?: Ref<DialogueHandle>; // lets a parent trigger skip() (React 19 ref-as-prop)
  // Per-call overrides of the global textConfig defaults:
  speed?: number;
  typewriter?: boolean;
}

// Reveals `text` one character at a time and blips per character. Mount it with
// a `key` that changes per line, so it restarts cleanly each time a line begins.
export function DialogueText({ text, className, onDone, ref, speed, typewriter }: DialogueTextProps) {
  const enabled = typewriter ?? textFx.typewriter.enabled;
  const charMs = speed ?? textFx.typewriter.speed;

  const [count, setCount] = useState(enabled ? 0 : text.length);
  const done = count >= text.length;

  // Reveal one more character per tick. setState runs inside the timeout
  // callback (async), so it doesn't trip the set-state-in-effect lint rule.
  useEffect(() => {
    if (count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), charMs);
    return () => clearTimeout(id);
  }, [count, text.length, charMs]);

  // Blip per revealed character. Only on a normal one-character tick — a jump of
  // more than one (a skip, or an instant non-typewriter reveal) syncs silently,
  // so the skipped letters don't stack into one loud burst. The single skip
  // confirmation blip is played by skip() below instead.
  const sounded = useRef(0);
  useEffect(() => {
    const s = textFx.sound;
    if (s.enabled && count - sounded.current === 1) {
      const i = count - 1;
      const isWhitespace = s.skipWhitespace && /\s/.test(text[i]);
      if (!isWhitespace && i % s.everyN === 0) playBlip();
    }
    sounded.current = count;
  }, [count, text]);

  // Expose skip() to the parent (the dialogue panel calls it on click). Reveals
  // the rest of the line and plays ONE confirmation blip.
  useImperativeHandle(
    ref,
    () => ({
      skip: () => {
        if (done) return;
        setCount(text.length);
        if (textFx.sound.enabled) playBlip();
      },
    }),
    [done, text.length],
  );

  // Notify the parent exactly once, when the line finishes. Keep the latest
  // callback in a ref (updated in an effect, not during render) so the
  // done-effect can stay keyed only on `done`.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });
  useEffect(() => {
    if (done) onDoneRef.current?.();
  }, [done]);

  return <p className={className}>{text.slice(0, count)}</p>;
}
