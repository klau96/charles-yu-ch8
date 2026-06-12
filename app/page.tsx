import Image from "next/image";

import { useState } from "react";


export default function Home() {
  const [screen, setScreen] = useState<"title" | "playing">("title");
  
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-linear-to-br from-black  to-slate-950 font-sans dark:bg-black">
      <main className="flex flex-1 bg-zinc-200 dark:bg-black w-full max-w-full h-full max-h-4/5 min-h-100 flex-col items-center justify-between my-32 mx-16 sm:items-start">

      </main>
    </div>
  );
}
