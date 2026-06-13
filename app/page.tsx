"use client";

import { useState } from "react";
import { GameProvider } from "@/game/GameProvider";
import { TitleScreen } from "@/components/TitleScreen";
import { Stage } from "@/components/Stage";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const [screen, setScreen] = useState<"title" | "playing">("title");

  return (
    <GameProvider>
      {/* Persistent colophon, overlaid top-left on both the title and the game. */}
      <Navbar />
      {screen === "title" ? <TitleScreen onPlay={() => setScreen("playing")} /> : <Stage />}
    </GameProvider>
  );
}
