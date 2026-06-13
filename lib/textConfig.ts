// Central, customizable config for how dialogue text is presented.
// Tweak these to taste — every knob for the typewriter + per-letter sound lives
// here. For one-off overrides, <DialogueText/> also accepts `speed`/`typewriter`
// props that win over these defaults.

export interface TextFxConfig {
  typewriter: {
    enabled: boolean; // false = the whole line appears instantly
    speed: number; // ms between characters (lower = faster)
  };
  sound: {
    enabled: boolean;
    src: string | null; // path to a click sample in /public (e.g. "/sfx/blip.wav"); null = synthesized blip
    volume: number; // 0..1
    everyN: number; // play once per N revealed characters (1 = every char, 2 = every other…)
    skipWhitespace: boolean; // stay silent on spaces / line breaks
  };
}

export const textFx: TextFxConfig = {
  typewriter: {
    enabled: true,
    speed: 24,
  },
  sound: {
    enabled: true,
    src: null, // drop a file in /public and point here, or leave null for the built-in blip
    volume: 0.5,
    everyN: 2,
    skipWhitespace: true,
  },
};
