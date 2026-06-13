// Shared types for the visual-novel engine.
// Interfaces may reference types declared later in this module — TS hoists them.

export type Speaker = "narration" | "woman" | "yu" | "grandmother";

// Screen effects, triggered from a line's `fx`.
//  • One-shot — plays once when the line shows (replays if the line is revisited).
//  • Persistent — a filter that carries forward (like sprite/dimmed) until you
//    turn it off with "clear" (all) or "-name" (one).
export type OneShotEffect = "flash" | "shake";
export type PersistentEffect = "grayscale" | "threshold" | "redblink";
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
  // Optional per-line background, carried forward like `sprite`. When set, the
  // backdrop swaps to this as the line is shown; when omitted, the line keeps
  // the current background (starting from the scene's `background`). An explicit
  // background: "" clears it (bare viewport), mirroring sprite: "".
  background?: string;
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
  // Optional line-level jump. Advancing past this line traverses to that node
  // (via GOTO) instead of stepping to the next line — so a script, or a choice's
  // spliced `lines`, can flow straight into another node. It wins over the
  // node's own `next`/`branch`. A line with `choices` shows those instead of a
  // continue control, so `next` applies to the plain "continue" path.
  next?: string;
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

// Customizes the full-screen card shown by EndingScreen when an ending node's
// dialogue finishes (see components/EndingScreen). An ending node with no
// `ending` config falls back to the legacy inline restart button in the
// dialogue panel, so adding this is opt-in and non-breaking.
export interface EndingConfig {
  title: string;
  // Optional supporting line under the title.
  description?: string;
  // CSS color for the title + description (e.g. "#fca5a5", "rgb(120 200 255)").
  // Omit to inherit the default neutral text.
  textColor?: string;
  // When set, the button CONTINUES the story at this node instead of
  // restarting — so an "ending" can feed back into the graph and keep the flow
  // continuous (e.g. a loop). When omitted, the button restarts the loop on the
  // first pass and the whole game afterwards (the original ending behavior).
  next?: string;
  // Optional override for the button text.
  buttonLabel?: string;
}

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
  // Per-speaker nameplate labels, for scenes where more than one non-narration
  // voice speaks (e.g. the woman AND her grandmother). The dialogue box shows
  // names[speaker] for the active line, falling back to character.name.
  names?: Partial<Record<Speaker, string>>;
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
  // Per-ending presentation + flow for the EndingScreen card.
  ending?: EndingConfig;
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
  | { type: "GOTO"; node: string } // jump to a node (EndingScreen "continue")
  | { type: "RESTART_LOOP" }
  | { type: "RESTART_GAME" }
  | { type: "LOAD"; state: GameState };
