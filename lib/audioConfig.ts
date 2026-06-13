// Central registry for sound effects and music — the audio parallel of how
// sprites/backgrounds are referenced. Authors write short names in scripts
// (sfx: "door", music: "rain", music: "-rain") and this maps them to files in
// /public plus per-clip volume. Unknown names are ignored at playback with a
// one-time console warning, so a typo never throws or 404-loops.
//
// To add audio: drop a file in /public/sfx or /public/music and add an entry
// below. With no entries the features are inert (silent) but fully wired.

export interface SfxClip {
  src: string; // path under /public, e.g. "/sfx/door.mp3"
  volume?: number; // 0..1, default 1
}

export interface MusicClip {
  src: string; // path under /public, e.g. "/music/rain.mp3"
  volume?: number; // 0..1, default 1
  loop?: boolean; // default true
}

// One-shot sound effects, fired from a line's `sfx`.
export const SFX: Record<string, SfxClip> = {
  door:  { src: "/sfx/door.opus", volume: 0.25 },
  // glass: { src: "/sfx/glass.mp3" },
};

// Looping background music, controlled from a line's / scene's `music`.
export const MUSIC: Record<string, MusicClip> = {
  chinatown: {src: "/music/chinatown.opus", volume: 0.4},
  // rain:  { src: "/music/rain.mp3", volume: 0.4 },
  // alarm: { src: "/music/alarm.mp3", volume: 0.6 },
};
