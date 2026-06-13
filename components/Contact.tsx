"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A second colophon-style dropdown — same visual language as the About menu,
// but holding contact links. Edit SECTIONS below to change the contents.
interface Section {
  label: string;
  body: ReactNode;
}

// Shared link styling so every entry matches the panel's muted aesthetic.
const linkClass =
  "text-neutral-300 underline-offset-2 transition hover:text-neutral-100 hover:underline";

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
    label: "Email",
    body: (
      <div className="flex flex-col justify-start">
        <a href="mailto:kylau@ucsc.edu" className={`text-[13px] ${linkClass}`}>
          kylau@ucsc.edu
        </a>
        <a href="mailto:lau.kiaran@gmail.com" className={`text-[13px] ${linkClass}`}>
          lau.kiaran@gmail.com
        </a>
      </div>
    ),
  },
  {
    label: "GitHub",
    body: (
      <a
        href="https://github.com/klau96"
        target="_blank"
        rel="noreferrer"
        className={`text-[13px] ${linkClass}`}
      >
        github.com/klau96
      </a>
    ),
  },
];

export function Contact() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click-outside or Escape, only while open. (Clicking the sibling
  // "About" trigger counts as outside, so the two dropdowns are mutually
  // exclusive automatically.)
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
    <div ref={ref} className="relative select-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="group flex items-center gap-2 rounded-md border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur transition hover:border-white/30 hover:bg-black/70 cursor-pointer"
      >
        <span className="h-3 w-px bg-white/20" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 group-hover:text-neutral-300">
          Contact
        </span>
        <span className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          ⌄
        </span>
      </button>

      {open && (
        <div
          role="group"
          aria-label="Contact"
          className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-lg border border-white/12 bg-black/75 shadow-2xl shadow-black/60 backdrop-blur-md sm:w-80"
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
