"use client";

import { useState } from "react";
import { GameProvider } from "@/game/GameProvider";
import { TitleScreen } from "@/components/TitleScreen";
import { Stage } from "@/components/Stage";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

export default function Home() {
  const [screen, setScreen] = useState<"title" | "playing">("title");

  return (
    <GameProvider>
      {/* Persistent colophon + contact, overlaid top-left on both the title and
          the game. Shared fixed bar so the two triggers sit side by side; each
          dropdown's panel is absolute, so opening one doesn't shift the other. */}
      <div className="fixed left-0 top-0 z-50 flex items-start gap-2 p-3 sm:p-4">
        <About />
        <Contact />
      </div>
      {screen === "title" ? <TitleScreen onPlay={() => setScreen("playing")} /> : <Stage />}
    </GameProvider>
  );
}
