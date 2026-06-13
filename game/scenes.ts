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
      { speaker: "narration", text: "Client call. I'm in Oakland, in Chinatown, sometime in the third quarter of the twentieth century.", fx: "flash", },
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
      
      // -------- APARTMENT — PART 1 -----------------------------------------
      { speaker: "narration", text: "A woman a little younger than I am, maybe twenty-five, twenty six. She's kneeling over an older woman who lies still, in an awkward position, her limbs slumped over the couch." },
      { text: "The older woman looks up at the ceiling, looking through it, filled with a clear-eyed awareness of what's happening." },
      // This line swaps the sprite as it's shown.
      { text: "The younger woman does not notice your presence. Her face is covered in tears that have long been dried. Her eyes stained and red." },

      { text: "Her hands embrace her grandmother's hands, but without physical contact, her warmth is left unreciprocated.", 
        
        // FIX: If adding a lines array inside a choice, it will show choices from the ending choices array
        choices: [
          { label: "She can't see you.", lines: [
            { speaker: "woman", text:"\"But I can see her.\" \nShe says."},
            { speaker: "narration",
              text: "She doesn't turn around or look in my direction.",
              choices: [
                {label: "\"You can't actually see her. This didn't really happen. You weren't there when she died.\"", 
                  lines: [
                    { speaker: "narration", text: "The younger woman glares at me, angry for a moment.", sprite: "/mari/mari_angry.png",},
                  ]
                },
              ]},
          ]
          },
          { label: "...", lines: [
            {text: "..."},
            {text: "......"},
            {text: "She finally notices you. But her attention doesn't waver."}
          ]},
        ],
      },

      {text: "She remains focused on the older woman.",
        choices: [
          { label: "\"Is this your mother?\"", 
            lines: [
              { speaker: "woman", text:"\"Grandmother.\" She replies.", sprite:"/mari/mari_neutral.png"},
              { speaker: "narration", text:"I realize in my time away from time, spent idling in my machine, I've become terrible at guessing someone's age."}
            ]
          }
        ]
      },
      
      // -------- APARTMENT — PART 2 -----------------------------------------
      {speaker: "narration", dimmed: true, text:"I nod. We both watch the old woman lying there, coming to terms with whatever she's coming to terms with."},
      {speaker: "narration", text:"TAMMY discreetly beeps, reminding me of the job I'm here to do; Fix the rift in our fabric of space-time."},
      {speaker: "narration", text:"If we stay too long, the damage could get worse."},

      {speaker: "narration", text: "",
        choices: [
          {label: "\”You shouldn't be here. I’m not saying this to hurt you. All I’m saying is that since you weren’t there when this actually happened, you can’t be here now.\”"},
        ]
      },
      {dimmed: true, text: "The woman ignores me and doesn't take her eyes off her grandmother. "},
      {text: "For a while, I’m not sure she’s heard or maybe she heard me but doesn’t understand, but then she looks at me."},
      {speaker: "woman", dimmed: false, text: "\"So what is this, an illusion? A dream?\""},
      {speaker: "narration", text: "",
        choices: [{label: "\"More like a window.\""},]
      },
      {speaker: "narration", text: "",
        choices: [{label: "\"By using your time machine this way, you are creating a small porthole into another universe, a neighboring universe.\""},]
      },

      {speaker: "woman", text: "She understands immediately. Smart cookie. Let's hope she understands the rest."},

      {speaker: "narration", text: "",
        choices: [{label: "\"This living room is the vertex between U-31 and U-31A. You are bending space and time and light to see into a past.\""},]
      },
      {
        speaker: "narration", text: "",
        choices: [{label: "\"A false past, a past you wish to go to.\""},]
      },
      {speaker: "narration", text: "",
        choices: [{label: "\"Although you can see what happened then over there, you're not really standing next to her.\""},]
      },
      {
        speaker: "narration", text: "",
        choices: [{label: "\"You are in your own universe, our universe. You are infinitely far away.\""},]
      },
      {speaker: "woman", text: "She takes a moment to digest this. Intuition allows me to guess the issue:"},
      
      // -------- APARTMENT — PART 3 -----------------------------------------
      {speaker: "narration", text: "",
        choices: [{label: "\"You tampered with your Tau modulator.\""},]
      },

      {
        sprite:"/mari/mari_embarassed.png",
        speaker: "woman", text: "She gives me a guilty look.",
      },

      {speaker: "narration", text: "",
        choices: [{label: "\"Don't worry, I see it all the time.\""},]
      },

      {sprite: "/mari/mari_slightfrown.png",
        speaker: "woman", text: "\"I was a sophomore in college. She was the only reason I even made it there...\" She says."},
      { speaker: "woman", text: "\"She called and I could hear something in her voice. I should have known. I should have known to come home...\""},

      {speaker: "narration", text: "",
        choices: [
          {label: "\"You had your own life to start.\""},
          {label: "\"Coming here won't fix the past.\""},
        ]
      },

      { speaker: "woman", text: "\"I could have come home. My dad told me it would be soon. I could have come home.\""},
      {
        speaker: "narration", 
        dimmed: true, 
        text: "The young woman turns back to her grandmother, who is slowly closes her eyes. A look of something unresolved twists across her face. A flicker of disappointment, and exhaust,"},
      {text: "And then she takes her last breath, alone, the pot of stew untouched in the next room."},
      {text: "."},
      {text: ". ."},
      {text: ". . ."},
      {text: "I wait for what I hope is a respectful interval of silence, then quietly finish the repair and go back into the kitchen to allow her a few more minutes.", sprite:""},
      {text: "I can hear crying, then low talking, then what sounds like a song, once sung to a little girl maybe, now sung one final time."},
      {text: "Yummy. The stew smells really good. I'm trying to figure out whether it will cause a paradox if I have a bowl when the young woman comes into the kitchen."},

      // -------- APARTMENT — PART 4 -----------------------------------------
      {speaker: "woman", sprite: "/mari/mari_smile.png",
        dimmed: false,
        text: "\"Thanks for that,\" she says.",
        choices: [{label: "\"Yeah, take all the time you want. Well, not all the time.\""},]
      },
      {speaker: "woman", 
        text: "\"I suppose I can't stay here.\"",
        choices: [{label: "(Shake your head)"},]
      },
      {speaker: "narration", text:"",
        choices: [{label: "\"If you bend too much and for too long, the porthole becomes an actual hole, and you might end up over there.\""}],
      },
      {speaker: "woman",
        text: "\"Maybe that's what I want.\"",
        choices: [
          {label: "\"Trust me. It’s not. That’s not home.\""},
          {label: "..."},
        ]
      },
      {speaker: "narration", text:"",
        choices: [{label: "\"I know it seems like home, everything looks the same, but it’s not. You weren’t there. It will never be the case that you were.\""}],
      },
      {speaker: "woman", dimmed: true, sprite: "/mari/mari_neutral.png",
        text: "...",
      },
      
      // BRANCH 1: ENDING DIALOGUE -> Cuts to choices array
    ],
    // After an in-scene choice's lines play out, the scene advances via this.
    next: "ending_collapse",
    choices: [
      // IN-SCENE choice: `lines` play here in the apartment, then `next` above
      // fires. (Demo lines — replace with your own.)
      {
        label: "(Leave the Apartment)",
        next: "ending_collapse",
        // lines: [
        //   { speaker: "narration", text: "You say nothing. The room holds its breath with her.", sprite: "/mari/mari_neutral.png" },
        //   { speaker: "woman", text: "...Most people would have left by now.", sprite: "/mari/mari_off.png" },
        // ],
      },
      // CLASSIC choice: jumps straight to another node.
      // { label: "\"She can't see you, can she?\"", next: "ending_collapse", set: { broachedGrief: true } },
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
