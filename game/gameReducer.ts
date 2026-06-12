import type { GameState, Action } from "@/lib/types";
import { scenes } from "./scenes";

export const initialState: GameState = {
  current: "chinatown",
  loop: 0,
  flags: { modulatorFixed: false, broachedGrief: false, noticedPhoto: false },
  history: [],
};

// The transition function. Stays PURE: no I/O, no localStorage, no Date.now().
// Persistence is a side effect handled in GameProvider, not here.
export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "ADVANCE": {
      const node = scenes[state.current];
      // A guard (branch) overrides the plain `next` edge when present.
      const next = node.branch ? node.branch(state) : node.next;
      if (!next) return state; // terminal node — nowhere to advance
      return { ...state, current: next, history: [...state.history, state.current] };
    }

    case "CHOOSE": {
      const { choice } = action;
      if (!choice.next) return state; // in-scene choices (no jump) are handled in Stage, not here
      return {
        ...state,
        flags: { ...state.flags, ...(choice.set ?? {}) },
        current: choice.next,
        history: [...state.history, state.current],
      };
    }

    case "SET_FLAG":
      return { ...state, flags: { ...state.flags, [action.key]: action.value } };

    case "SET_FLAGS":
      return { ...state, flags: { ...state.flags, ...action.flags } };

    // In-story time loop: reset to the start, but carry the loop counter forward.
    case "RESTART_LOOP":
      return { ...initialState, loop: state.loop + 1 };

    // Full reset from the title screen ("New game").
    case "RESTART_GAME":
      return initialState;

    // Restore a save (dispatched by GameProvider on hydration).
    case "LOAD":
      return action.state;

    default:
      return state;
  }
}
