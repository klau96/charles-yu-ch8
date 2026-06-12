"use client";

import Image from "next/image";

import { useState } from "react";
import { GameProvider } from "@/game/GameProvider";
import { TitleScreen } from "@/components/TitleScreen";
import { Stage } from "@/components/Stage";

export default function Home() {
  const [screen, setScreen] = useState<"title" | "playing">("title");

  return (
    <GameProvider>
      {screen === "title" ? <TitleScreen onPlay={() => setScreen("playing")} /> : <Stage />}
    </GameProvider>
  );
}
