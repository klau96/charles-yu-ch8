"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A "colophon" — the production-notes control framed into the top-left of the
// letterbox. A serif monogram trigger opens a panel (Name / Credits / Messages)
// with a staggered reveal. Edit SECTIONS below to change the contents.
interface Section {
  label: string;
  body: ReactNode;
}

const SECTIONS: Section[] = [
  {
    label: "Name",
    body: (
      <>
        <p className="font-serif text-lg leading-tight text-neutral-100">Kiaran Lau</p>
        <p className="mt-0.5 text-xs text-neutral-400">Developer, Interpreter</p>
      </>
    ),
  },
  {
    label: "Description",
    body: (
      <ul className="space-y-1.5 text-[13px] leading-relaxed text-neutral-300">
        <li>
          <u>Visual Novel Website</u> adapted from Chapter 8 of{" "}
          <span className="font-serif italic text-neutral-200">
            How to Live Safely in a Science-Fictional Universe
          </span>
          , by Charles Yu.
        </li>
        
        <li className="text-neutral-400">Art &amp; Sprites: u/TiaStoleYourToast on Reddit for the smiling Mari. I edited it to make the rest.</li>
      </ul>
    ),
  },
  {
    label: "Technologies",
    body: (
      <>
        <ul className="space-y-1.5 text-[13px] leading-relaxed text-neutral-300">
          <li>Built with Next.js, React, Tailwind &amp; Claude</li>
        </ul>
      </>
    )
  },
  {
    label: "Thanks",
    body: (
      <>
        <p className="font-serif text-md leading-tight text-neutral-100">Professor Zac Zimmer</p>
        <p className="font-serif italic text-[13px] leading-relaxed text-neutral-300">
          Many thanks for the wonderful quarter and for passionately introducing us to humanitarian side of time travel, and giving us the awareness to know whether we're in a modern day time loop.
        </p>
        <span className="my-3 block h-px w-full bg-white/20"></span>
        <p className="font-serif text-md leading-tight text-neutral-100">Nghiem Tran</p>
        <p className="font-serif italic text-[13px] leading-relaxed text-neutral-300">
          Thank you for leading section every week! It was fun to always have down-to-earth conversations in the middle of the section topics. 
        </p>
      </>
    ),
  },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click-outside or Escape, only while open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed left-0 top-0 z-50 select-none p-3 sm:p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="group flex items-center gap-2 rounded-md border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur transition hover:border-white/30 hover:bg-black/70 cursor-pointer"
      >
        {/* <span className="font-serif text-sm italic tracking-tight text-blue-200/90"></span> */}
        <span className="h-3 w-px bg-white/20" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 group-hover:text-neutral-300">
          About
        </span>
        <span className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div
          role="group"
          aria-label="Colophon"
          className="mt-2 w-72 overflow-hidden rounded-lg border border-white/12 bg-black/75 shadow-2xl shadow-black/60 backdrop-blur-md sm:w-80"
          style={{ animation: "navPanelIn 220ms cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          {/* decorative hairline across the top */}
          <div className="h-px w-full bg-linear-to-r from-emerald-400/0 to-blue-400/0" />

          <div className="divide-y divide-white/8">
            {SECTIONS.map((section, i) => (
              <section
                key={section.label}
                className="px-5 py-4"
                style={{ animation: "navItemIn 320ms ease-out both", animationDelay: `${80 + i * 70}ms` }}
              >
                <h3 className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.25em] text-blue-400/70">
                  {section.label}
                </h3>
                {section.body}
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
