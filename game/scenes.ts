import type { Scene } from "@/lib/types";

// SKELETON content. Three nodes prove the full loop works:
//   chinatown (narration) -> apartment (choice) -> ending_collapse (ending) -> loop back
// Replace with your real eight-beat graph; the engine doesn't change as this grows.
export const scenes: Record<string, Scene> = {

  // BRANCH 0: CHINATOWN ARRIVAL
  chinatown: {
    type: "narration",
    background: "oakland_chinatown.jpeg",
    script: [
      { speaker: "narration", text: "Client call. I'm in Oakland, in Chinatown, sometime in the third quarter of the twentieth century.", },
      { text: "People are bustling, cars are driving past, the smell of a chinese uncle's cigarette smoke lingers. He sits on a red and metal chair the size of a small cardboard box.", },
      { text: "Quite the place for a momentary rift disruption. Though I'm not surprised, most of the time it's a normal place in a normal city.", },
      { text: "I say this all the time, as if it changes anything. This is how it is on the regular.", },
      { text: "I head up the stairs behind me, into a ragged apartment building and into a sun-lit living room.", },
    ],
    next: "apartment",
  },

  // BRANCH 1: APARTMENT
  apartment: {
    type: "choice",
    background: "living-room.jpeg",
    character: { sprite: "/mari/mari_behindshadow.png", name: "The Woman" },
    script: [
      // No `sprite` here — falls back to the scene's character.sprite (behindshadow).
      { speaker: "narration", text: "A woman a little younger than I am, maybe twenty-five, twenty six. She's kneeling over an older woman who lies still, in an awkward position, her limbs slumped over the couch." },
      { text: "The older woman looks up at the ceiling, looking through it, filled with a clear-eyed awareness of what's happening." },
      // This line swaps the sprite as it's shown.
      { text: "The woman does not notice your presence. Her face is covered in tears that have long been dried. Her eyes stained and red." },

      { text: "Her hands embrace her grandmother's hands, but without physical contact, her warmth is left unreciprocated.", 
        
        // FIX: If adding a lines array inside a choice, it will show choices from the ending choices array
        choices: [
          { label: "She can't see you.", lines: [
            { speaker: "woman", text:"\"But I can see her.\" \nShe says."},
            { speaker: "narration",
              text: "She doesn't turn around or look in my direction.",
              choices: [
                {label: "You can't actually see her. This didn't really happen. You weren't there when she died. "}
              ]},
              { speaker: "narration", text: "The younger woman glares at me, angry for a moment.", sprite: "/mari/mari_angry.png",},
          ]
          },
          { label: "(Say nothing)", lines: [
            {text: "..."},
            {text: "......"},
            {text: "........."},
            {text: "She finally notices you. But she doesn't waver."}
          ]},
        ],
      },

      {text: "She remains focused on the older woman.",
        choices: [
          { label: "Is this your mother?", 
            lines: [
              { speaker: "woman", text:"\"Grandmother.\" She replies.", sprite:"/mari/mari_neutral.png"},
              { speaker: "narration", dimmed: true, text:"I realize in my time away from time, spent idling in my machine, I've become terrible at guessing someone's age."}
            ]
          }
        ]
      },
      {speaker: "narration", dimmed: true, text:"I nod. We both watch the old woman lying there, coming to terms with whatever she's coming to terms with."},
      {speaker: "narration", text:"TAMMY discreetly beeps, reminding me of the job I'm here to do; Fix the rift in our fabric of space-time."},

      {speaker: "narration", text:"If we stay too long, the damage could get worse.",
        choices: [
          {label: "\”I’m not saying this to hurt you. All I’m saying is that since you weren’t there when this actually happened, you can’t be here now.\”"}
        ]
      },



      // BRANCH 1: ENDING DIALOGUE -> Cuts to choices array
      {speaker: "woman", text: "Who are you?", sprite: "/mari/mari_neutral.png",},
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

  // BRANCH 2: ENDING COLLAPSE 
  ending_collapse: {
    type: "ending",
    background: "tm-31.jpeg",
    effect: "collapse",
    script: [
      {
        speaker: "narration",
        text: "The grandmother looks up. She smiles at the woman. The room begins to fold inward.",
      },
    ],
  },
};
