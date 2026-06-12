"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { gameReducer, initialState } from "./gameReducer";
import { loadGame, saveGame } from "./save";
import { collectSprites, preloadImages } from "./assets";
import type { GameState, Action } from "@/lib/types";

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<Action>;
  hydrated: boolean; // true once any save has been read on the client
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  // Start from DEFAULT state so the server render and the first client render
  // are identical — reading localStorage here would cause a hydration mismatch.
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Mount-only: this effect runs on the client after hydration, so localStorage
  // is safe to touch. Restore a save if one exists, then mark hydration done.
  useEffect(() => {
    const saved = loadGame();
    if (saved) dispatch({ type: "LOAD", state: saved });
    setHydrated(true);
  }, []);

  // Warm the browser's image cache once on mount so sprite swaps don't flash.
  // The set is small, so we preload everything; switch to per-scene lookahead
  // if the sprite count ever grows large.
  useEffect(() => {
    preloadImages(collectSprites());
  }, []);

  // Autosave on every state change — but NOT before hydration. Without this
  // guard the first commit would write the default state over a real save
  // before the LOAD above has a chance to run.
  useEffect(() => {
    if (hydrated) saveGame(state);
  }, [state, hydrated]);

  return (
    <GameContext.Provider value={{ state, dispatch, hydrated }}>
      {children}
    </GameContext.Provider>
  );
}
