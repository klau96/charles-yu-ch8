// Shared types for the visual-novel engine.
// Interfaces may reference types declared later in this module — TS hoists them.

export type Speaker = "narration" | "woman" | "yu";

// Screen effects, triggered from a line's `fx`.
//  • One-shot — plays once when the line shows (replays if the line is revisited).
//  • Persistent — a filter that carries forward (like sprite/dimmed) until you
//    turn it off with "clear" (all) or "-name" (one).
export type OneShotEffect = "flash" | "shake";
export type PersistentEffect = "grayscale" | "threshold";
export type EffectToken = OneShotEffect | PersistentEffect | `-${PersistentEffect}` | "clear";

export interface Line {
  // Optional speaker. When omitted, the line carries forward the previous line's
  // speaker (set it only when the speaker changes); the first line defaults to
  // "narration". Resolution happens in Stage, like the per-line sprite.
  speaker?: Speaker;
  text: string;
  // Optional per-line sprite. When set, the character art swaps to this as the
  // line is shown; when omitted, the line keeps the scene's character.sprite.
  sprite?: string;
  // Optional dim. true shows the current sprite at 50% opacity; carries forward
  // like sprite/speaker, but a line that changes the sprite resets it to false.
  dimmed?: boolean;
  // Optional inline choices. When present, this line ends in a decision instead
  // of a plain "continue": the player picks an option and the scene keeps going
  // (the choice can splice in more lines, set flags, or jump). A pure prompt
  // line can use text: "". See Choice for what an option can do.
  choices?: Choice[];
  // Optional screen effect(s) for this line — a single token or a list, e.g.
  // fx: "flash", fx: "grayscale", fx: ["shake", "threshold"], fx: "clear".
  fx?: EffectToken | EffectToken[];
}

export interface Choice {
  label: string;
  set?: Partial<Flags>;
  // A choice does ONE of two things when picked:
  //   • `next`  — jump to another node (classic branching), OR
  //   • `lines` — play these lines inline, staying in the SAME scene; afterwards
  //               the scene continues via the node's own `next`/`branch`.
  // If both are given, `lines` wins (the in-scene continuation runs).
  next?: string;
  lines?: Line[];
}

export type SceneType = "narration" | "choice" | "hotspot" | "minigame" | "ending";

export interface Hotspot {
  flag: FlagKey;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Scene {
  type: SceneType;
  background?: string;
  character?: { sprite: string; name?: string };
  script?: Line[];

  // narration / hotspot: where ADVANCE goes
  next?: string;

  // conditional edge — a guard reading extended state (overrides `next`)
  branch?: (state: GameState) => string;

  // choice nodes
  choices?: Choice[];

  // hotspot nodes
  hotspots?: Hotspot[];
  requiredFlags?: FlagKey[];

  // minigame nodes
  game?: string;

  // ending nodes
  effect?: string;
}

// Extended state. CLOSED set of flags — a typo'd key is a compile error, and
// Record forces every flag to be initialized. Add a flag = add a member here.
export type FlagKey = "modulatorFixed" | "broachedGrief" | "noticedPhoto";
export type Flags = Record<FlagKey, boolean>;

export interface GameState {
  current: string;
  loop: number;
  flags: Flags;
  history: string[];
}

export type Action =
  | { type: "ADVANCE" }
  | { type: "CHOOSE"; choice: Choice }
  | { type: "SET_FLAG"; key: FlagKey; value: boolean }
  | { type: "SET_FLAGS"; flags: Partial<Flags> } // merge several flags at once (in-scene choices)
  | { type: "RESTART_LOOP" }
  | { type: "RESTART_GAME" }
  | { type: "LOAD"; state: GameState };
