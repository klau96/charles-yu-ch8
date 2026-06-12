import type { Scene } from "@/lib/types";

// SKELETON content. Three nodes prove the full loop works:
//   chinatown (narration) -> apartment (choice) -> ending_collapse (ending) -> loop back
// Replace with your real eight-beat graph; the engine doesn't change as this grows.
export const scenes: Record<string, Scene> = {
  chinatown: {
    type: "narration",
    background: "/oakland_chinatown_oaklandnorth.jpeg",
    script: [
      { speaker: "narration", text: "Client call. I'm in Oakland, in Chinatown, sometime in the third quarter of the twentieth century.", },
      { text: "People are bustling, cars are driving past, the smell of a chinese uncle's cigarette smoke lingers. He sits on a red and metal chair the size of a small cardboard box.", },
      { text: "Quite the place for a momentary rift disruption. Though I'm not surprised, most of the time it's a normal place in a normal city.", },
      { text: "I say this all the time, as if it changes anything. This is how it is on the regular.", },
      { text: "I head up the stairs behind me, into a ragged apartment building and into a sun-lit living room.", },
    ],
    next: "apartment",
  },

  apartment: {
    type: "choice",
    background: "living-room.jpeg",
    character: { sprite: "/mari/mari_behindshadow.png", name: "The Woman" },
    script: [
      // No `sprite` here — falls back to the scene's character.sprite (behindshadow).
      { speaker: "narration", text: "A woman is kneeling down next to what appears to be her grandmother, who's laying peacefully on the wrinkly couch." },
      { text: "Grandmother looks off into the window, looking as though her mind is reliving a past memory, over and over again." },
      // This line swaps the sprite as it's shown.
      { text: "The woman does not notice your presence. Her face is covered in tears that have long been dried around her strained red eyes." },
      
      { text: "Her hands embrace her grandmother's hands, but without physical contact, her warmth is left unreciprocated.", 
        choices: [
          { label: "You're not supposed to be here.", lines: [
            {speaker: "woman", text: "..."},
          ]},
          { label: "(Say nothing)" },
        ],
        
      },
      
      { speaker: "woman", text: "Who are you?", sprite: "/mari/mari_slightfrown.png",}
    ],
    // After an in-scene choice's lines play out, the scene advances via this.
    next: "ending_collapse",
    choices: [
      // IN-SCENE choice: `lines` play here in the apartment, then `next` above
      // fires. (Demo lines — replace with your own.)
      {
        label: "…",
        lines: [
          { speaker: "narration", text: "You say nothing. The room holds its breath with her.", sprite: "/mari/mari_neutral.png" },
          { speaker: "woman", text: "...Most people would have left by now.", sprite: "/mari/mari_off.png" },
        ],
        next: "ending_collapse",
      },
      // CLASSIC choice: jumps straight to another node.
      { label: "\"She can't see you, can she?\"", next: "ending_collapse", set: { broachedGrief: true } },
    ],
  },

  ending_collapse: {
    type: "ending",
    background: "living-room.jpeg",
    effect: "collapse",
    script: [
      {
        speaker: "narration",
        text: "The grandmother looks up. She smiles at the woman. The room begins to fold inward.",
      },
    ],
  },
};
