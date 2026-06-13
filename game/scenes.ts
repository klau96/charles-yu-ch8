import type { Scene } from "@/lib/types";

// SKELETON content. Three nodes prove the full loop works:
//   chinatown (narration) -> apartment (choice) -> ending_collapse (ending) -> loop back
// Replace with your real eight-beat graph; the engine doesn't change as this grows.
export const scenes: Record<string, Scene> = {

  // BRANCH 0: CHINATOWN ARRIVAL
  chinatown: {
    type: "narration",
    background: "oakland-chinatown.jpeg",
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
      { speaker: "narration", dimmed: true, text:"I nod. We both watch the old woman lying there, coming to terms with whatever she's coming to terms with."},
      { speaker: "narration", text:"TAMMY discreetly beeps, reminding me of the job I'm here to do; Fix the rift in our fabric of space-time."},
      { speaker: "narration", text:"If we stay too long, the damage could get worse."},

      { speaker: "narration", text: "",
        choices: [
          {label: "\”You shouldn't be here. I’m not saying this to hurt you. All I’m saying is that since you weren’t there when this actually happened, you can’t be here now.\”"},
        ]
      },
      { dimmed: true, text: "The woman ignores me and doesn't take her eyes off her grandmother. "},
      { text: "For a while, I’m not sure she’s heard or maybe she heard me but doesn’t understand, but then she looks at me."},
      { speaker: "woman", dimmed: false, text: "\"So what is this, an illusion? A dream?\""},
      { speaker: "narration", text: "",
        choices: [{label: "\"More like a window.\""},]
      },
      { speaker: "narration", text: "",
        choices: [{label: "\"By using your time machine this way, you are creating a small porthole into another universe, a neighboring universe.\""},]
      },

      { speaker: "woman", text: "She understands immediately. Smart cookie. Let's hope she understands the rest."},

      { speaker: "narration", text: "",
        choices: [{label: "\"This living room is the vertex between U-31 and U-31A. You are bending space and time and light to see into a past.\""},]
      },
      { speaker: "narration", text: "",
        choices: [{label: "\"A false past, a past you wish to go to.\""},]
      },
      { speaker: "narration", text: "",
        choices: [{label: "\"Although you can see what happened then over there, you're not really standing next to her.\""},]
      },
      { speaker: "narration", text: "",
        choices: [{label: "\"You are in your own universe, our universe. You are infinitely far away.\""},]
      },
      {speaker: "woman", text: "She takes a moment to digest this. Intuition allows me to guess the issue:"},
      
      // -------- APARTMENT — PART 3 -----------------------------------------
      {speaker: "narration", text: "",
        choices: [{label: "\"You tampered with your Tau modulator.\""},]},

      { sprite:"/mari/mari_embarassed.png",
        speaker: "woman", text: "She gives me a guilty look.",},

      { speaker: "narration", text: "",
        choices: [{label: "\"Don't worry, I see it all the time.\""},]},

      { sprite: "/mari/mari_slightfrown.png",
        speaker: "woman", text: "\"I was a sophomore in college. She was the only reason I even made it there...\" She says."},
      { speaker: "woman", text: "\"She called and I could hear something in her voice. I should have known. I should have known to come home...\""},

      { speaker: "narration", text: "",
        choices: [
          {label: "\"You had your own life to start.\""},
          {label: "\"Coming here won't fix the past.\""},
        ]
      },

      { speaker: "woman", text: "\"I could have come home. My dad told me it would be soon. I could have come home.\""},
      { speaker: "narration", 
        dimmed: true, 
        text: "The young woman turns back to her grandmother, who is slowly closes her eyes. A look of something unresolved twists across her face. A flicker of disappointment, and exhaust,"},
      { text: "And then she takes her last breath, alone, the pot of stew untouched in the next room."},
      { text: "."},
      { text: ". ."},
      { text: ". . ."},
      { text: "I wait for what I hope is a respectful interval of silence, then quietly finish the repair and go back into the kitchen to allow her a few more minutes.", sprite:""},
      { text: "I can hear crying, then low talking, then what sounds like a song, once sung to a little girl maybe, now sung one final time."},
      { text: "Yummy. The stew smells really good. I'm trying to figure out whether it will cause a paradox if I have a bowl when the young woman comes into the kitchen."},

      // -------- APARTMENT — PART 4 -----------------------------------------
      { speaker: "woman", sprite: "/mari/mari_smile.png",
        dimmed: false,
        text: "\"Thanks for that,\" she says.",
        choices: [{label: "\"Yeah, take all the time you want. Well, not all the time.\""},]
      },
      { speaker: "woman", 
        text: "\"I suppose I can't stay here.\"",
        choices: [{label: "(Shake your head)"},]
      },
      { speaker: "narration", text:"",
        choices: [{label: "\"If you bend too much and for too long, the porthole becomes an actual hole, and you might end up over there.\""}],
      },
      { speaker: "woman",
        text: "\"Maybe that's what I want.\"",
        choices: [
          {label: "\"Trust me. It’s not. That’s not home.\""},
          {label: "..."},
        ]
      },
      { speaker: "narration", text:"",
        choices: [{label: "\"I know it seems like home, everything looks the same, but it’s not. You weren’t there. It will never be the case that you were.\""}],
      },
      { speaker: "woman", sprite: "/mari/mari_slightfrown.png",
        text: "...",
      },
      
      // BRANCH 1: ENDING DIALOGUE -> Cuts to choices array
    ],
    // After an in-scene choice's lines play out, the scene advances via this.
    next: "return_to_tm31",
    choices: [
      // IN-SCENE choice: `lines` play here in the apartment, then `next` above
      // fires. (Demo lines — replace with your own.)
      {
        label: "(Leave the Apartment, return to the TM-31)",
        next: "return_to_tm31",
      },
      // CLASSIC choice: jumps straight to another node.
      // { label: "\"She can't see you, can she?\"", next: "ending_collapse", set: { broachedGrief: true } },
    ],
  },

  // BRANCH 2: ENDING COLLAPSE 
  return_to_tm31: {
    type: "choice",
    background: "tm-31.jpeg",
    effect: "collapse",
    script: [
      { speaker: "narration", text: "Day in the life of a time traveling technician living in the TM-31.",},
      { text: "A typical customer gets into a machine that can literally take her whenever she’d like to go. Do you want to know what the first stop usually is? Take a guess.",},
      { text: "Don’t guess. You already know: the unhappiest day of her life—",},
      { fx: "shake", text: "—The world shakes, and a loud tear ripples across the world.",},
      { text: ". . .",},
      { text: "That does not sound regular.",},
      { fx: "redblink", text: "The TM-31 sounds the alarm. Code Red. TAMMY begins panicking, so I place her back into the charging dock.",},
      { fx: "shake", text: "I have to stay calm. I've read the instructions manual enough times to know protocol.",},
      { text: "According to the instructions manual, it's a 0.9 alpha-gradient rift collapse. Imminent situation.",},
      { text: "I'm safe in this box, as long as I switch lines and follow the temporal tangent back to U-31.",},
      { fx: "shake",text: "TAMMY's beeping has syncronized with the alarm. She wants me to switch lines, immediately.",},
      { text: "But I can't help but wonder. What the hell happened? Is that woman going to be okay?",},
      { text: "",
        choices: [
          {label: "(Leave the TM-31)"},
          {label: "(Set the line back to U-31)", lines: [
            { text: "I can't just leave yet.", fx: "shake",
              choices: [
                {label: "(Exit the TM-31)"},
                {label: "(Set the line back to U-31)", lines: [
                  { text: "I can't just leave yet.", fx: "shake",
                    choices: [
                      {label: "(Exit the TM-31)"},
                      {label: "(Set the line back to U-31)", lines: [
                        { text: "I can't just leave yet.", fx: "shake",
                          choices: [
                            {label: "(Exit the TM-31)"},
                            // Jump to the protocol ending. NOTE: a choice with
                            // both `lines` and `next` plays the lines and
                            // IGNORES next (lines wins — see the Choice type), so
                            // use `next` alone here. The pre-ending lines live in
                            // ending_protocol.script, so add as many as you like.
                            {label: "(Set the line back to U-31)", next: "ending_protocol"},
                          ]
                        },
                      ]},
                    ]
                  },
                ]},
              ]
            },
          ]},
        ]
      },

      { text: "Alright. TAMMY, take care of the box. I'll be right back.", 
        next: "return_to_apartment1"},
    ],
  },

  return_to_apartment1: {
    type: "ending",
    background: "living-room.jpeg",
    names: { woman: "The Woman", grandmother: "Grandmother" },
    script: [
      { speaker: "narration",
        fx: "grayscale",
        background: "oakland-chinatown.jpeg",
        text: "The atmosphere has changed to be thin and rusty. Cars, inhabitants, and even the air has stopped moving.",
      },
      { text: "In fact, all movement in this temporal dimension has ceased. The timeline has lost its clutch on entropy, ceasing the energy of nearby occupants. But they don't know this yet. By the looks of it, they'll never know.",},
      { fx: "shake",
        text: "For the first time as a time travel technician, I can sense the amount of time in this moment decreasing. I rush up the stairs to the apartment.",},

      { speaker: "narration", 
        background: "living-room.jpeg",
        fx: "grayscale",
        text: "I open the door and see the young woman again.",},
      { speaker: "narration", 
        sprite: "/mari/mari_off.png",
        dimmed: true,
        text: "To my relief, she is still okay, kneeling beside her grandmother who had passed recently and long ago.",},
      { speaker: "narration", text: "Or so I thought. This shouldn't be possible. ",},
      { speaker: "narration", text: "The grandmother's frail and soft voice whispers to the woman. ",},
      { speaker: "grandmother", text: "我那甜甜的小花朵，你来看奶奶啦。(My sweet little flower, you’ve come to see Grandma)",},
      { speaker: "narration",
        dimmed: false,
        text: "A mysterious smile sticks itself to the face of the woman. She knows what she has done, is doing, and will always do.",
      },
    ],
    // EndingScreen for the "Leave the TM-31" path. `next` makes the card's
    // button CONTINUE the loop into chinatown2 instead of restarting — see
    // EndingConfig. Customize the copy/color freely.
    ending: {
      title: "Ending 1: TIMELINE DIVERSION",
      description:
        "The woman, against the advice of the time travel technician, against her acceptance of death, cannot shake her past. Her grievances scream louder than her existence, causing the rift to fully collapse.",
      textColor: "#C41818",
      next: "chinatown2",
      buttonLabel: "Continue ▸",
    },
  },

  // FOLLOWED_PROTOCOL ENDING — reached when the player sets the line back to
  // U-31. Anything in `script` plays first (add as many lines as you like); the
  // EndingScreen card appears only after the last line types. `ending.next`
  // makes its button CONTINUE the story at that node — here, back to the loop —
  // instead of restarting. Drop `next` to make it a terminal restart instead.
  ending_protocol: {
    type: "ending",
    background: "tm-31.jpeg",
    script: [
      { text: "My conscious begs to differ, but before I could regret the decision, I switch the line and set course back to U-31." },
      { text: "The alarm dies down to a hum. The needle settles. Just following protocol." },
    ],
    ending: {
      title: "Ending 0: FOLLOWING PROTOCOL",
      description:
        "You did what the manual said. You see sight of the rift disappear behind you, and you wonder about the woman.",
      textColor: "#9ca3af",
      next: "chinatown",
      buttonLabel: "Begin again ▸",
    },
  },

  // The story beat AFTER the Ending-1 loop. Reached from return_to_apartment1's
  // EndingScreen "Continue" button (its ending.next). STUB — fill in the script
  // and wire its own `next`/choices to whatever follows.
  chinatown2: {
    type: "narration",
    background: "oakland-chinatown.jpeg",
    script: [
      { speaker: "narration", text: "Chinatown 2: IN PROGRESS! Refresh the page to return to the menu." },
    ],
    // next: "...",
  },
};


