// Dronalytics CSR Diagnostic Competency Assessment — real question bank.
// Bloom order fixed R -> U -> A -> An -> E -> C per hand. R/U/A are objective MCQ;
// An/E/C are subjective free response, graded against an expected_response_guide
// (not auto-graded here — only the 3 MCQ per hand are scored client-side).

export type Bloom = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYSE' | 'EVALUATE' | 'CREATE';
export type Decl = 'READY' | 'ASSIST' | 'PASS';

export interface MCQQuestion {
  type: 'mcq';
  bloom: Bloom;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  isPractical?: boolean;
}

export interface EssayQuestion {
  type: 'essay';
  bloom: Bloom;
  question: string;
  isPractical?: boolean;
  wordCountMin?: number | null;
  wordCountMax?: number | null;
}

export type TrackQuestion = MCQQuestion | EssayQuestion;

export interface Hand {
  index: number;
  difficulty: 'medium' | 'hard';
  coverageNote: string;
  questions: TrackQuestion[];
}

export interface Track {
  key: string;
  label: string;
  sector: string;
  tradeCode: string;
  nsqfLevel: number;
  hands: Hand[];
}

export const TRACKS: Track[] = [
  {
    "key": "assistant-electrician",
    "label": "Assistant Electrician Assessment",
    "sector": "Earthing",
    "tradeCode": "TSV/1001",
    "nsqfLevel": 4,
    "hands": [
      {
        "index": 0,
        "difficulty": "medium",
        "coverageNote": "Purpose of earthing; plate earthing vs pipe earthing as electrode types; the components of an earthing installation (electrode, charcoal/salt layer, watering arrangement, earthing lead, inspection chamber).",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "What is the primary purpose of earthing an electrical installation?",
            "options": [
              { "key": "A", "text": "To provide a low-resistance path for fault current to flow safely to ground, reducing the risk of electric shock and helping protective devices operate." },
              { "key": "B", "text": "To increase the voltage supplied to connected equipment." },
              { "key": "C", "text": "To reduce the electricity bill by lowering current consumption." },
              { "key": "D", "text": "To improve the appearance of the electrical wiring installation." }
            ],
            "correctKey": "A",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains the difference between plate earthing and pipe earthing as commonly used electrode types?",
            "options": [
              { "key": "A", "text": "Plate earthing and pipe earthing serve completely different, unrelated purposes in an electrical system." },
              { "key": "B", "text": "Plate earthing uses a metal plate buried vertically in the ground as the electrode, while pipe earthing uses a perforated metal pipe driven vertically into the ground; both serve the same purpose but differ in electrode shape and installation method." },
              { "key": "C", "text": "Pipe earthing is only used for underground cables, while plate earthing is only used for overhead lines." },
              { "key": "D", "text": "Plate earthing does not require any electrode to be buried in the ground." }
            ],
            "correctKey": "B",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "An electrician is installing an earthing system in an area with rocky, dry soil where maintaining consistent moisture around the electrode is difficult. Applying knowledge of earthing components, which component is specifically intended to help address this kind of soil condition?",
            "options": [
              { "key": "A", "text": "The earth wire connecting the electrical equipment to the electrode." },
              { "key": "B", "text": "The inspection chamber cover, which only protects the pit from debris." },
              { "key": "C", "text": "The funnel and watering arrangement, along with charcoal/salt layering around the electrode, which help maintain moisture and improve conductivity around the electrode." },
              { "key": "D", "text": "The earthing lead/strip, which carries current between the electrode and the conductor." }
            ],
            "correctKey": "C",
            "isPractical": true
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "An earthing installation includes not just the buried electrode (plate or pipe) but also a layer of charcoal and salt around it, along with a funnel arrangement for periodically adding water. Analyse why these additional components are included around the electrode, connecting them to the purpose of earthing.",
            "isPractical": true,
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "An electrician proposes skipping the charcoal/salt layer and watering arrangement for a new earthing installation to reduce material and installation cost, arguing that the buried electrode alone is sufficient. Evaluate whether this is a sound practice, and justify your answer.",
            "isPractical": true,
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a simple labelled description, in words, of a complete pipe earthing installation, showing how the electrode and its surrounding components work together to serve the purpose of earthing. Include at least four distinct components and explain their role.",
            "isPractical": true,
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      },
      {
        "index": 1,
        "difficulty": "medium",
        "coverageNote": "Installation and site-condition principles; why periodic earth resistance testing is required; how earthing works together with protective devices for electrical safety.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "Which instrument is commonly used to measure the resistance of an earthing installation?",
            "options": [
              { "key": "A", "text": "Earth resistance tester (earth tester / megger-type instrument)" },
              { "key": "B", "text": "Voltmeter" },
              { "key": "C", "text": "Clamp-on ammeter" },
              { "key": "D", "text": "Insulation tape" }
            ],
            "correctKey": "A",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains why earthing installations require periodic testing rather than being tested only once at installation?",
            "options": [
              { "key": "A", "text": "Periodic testing is required only to check whether the earth wire's colour coding is correct." },
              { "key": "B", "text": "Soil conditions such as moisture and temperature change over time and can cause the earth resistance to increase, so periodic testing verifies the earthing system still meets the required low-resistance condition." },
              { "key": "C", "text": "Earth resistance never changes after installation, so periodic testing is done purely as a formality." },
              { "key": "D", "text": "Periodic testing is required to increase the electrical load the installation can handle." }
            ],
            "correctKey": "B",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "During a routine electrical safety inspection, an earth resistance test shows a significantly higher resistance value than when the same installation was tested a year earlier, even though no equipment has been added. Applying knowledge of earthing principles, what is a likely explanation that should be investigated?",
            "options": [
              { "key": "A", "text": "The electrical load connected to the installation has increased, which directly raises earth resistance." },
              { "key": "B", "text": "The colour of the earth wire insulation has faded, which increases earth resistance." },
              { "key": "C", "text": "A change in soil condition around the electrode (such as reduced moisture or soil disturbance) that has increased the earth resistance over time." },
              { "key": "D", "text": "Earth resistance always increases every year regardless of soil or installation condition, and requires no investigation." }
            ],
            "correctKey": "C",
            "isPractical": true
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "Earthing systems are designed to work together with protective devices such as fuses, circuit breakers, and RCDs (residual current devices) to protect people from electric shock during a fault. Analyse why earthing alone, without these protective devices, would not fully achieve the intended electrical safety goal, connecting the two together.",
            "isPractical": true,
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "A building owner argues that since the earthing system passed its resistance test when installed several years ago, there is no need to test it again, and that money would be better spent elsewhere. Evaluate this argument, and justify your answer using what you know about earthing installation and testing principles.",
            "isPractical": true,
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a basic periodic maintenance and testing routine an assistant electrician could follow to help ensure an earthing installation continues to provide effective electrical safety protection over time. Include at least four distinct steps.",
            "isPractical": true,
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      }
    ]
  },
  {
    "key": "ev-service-technician",
    "label": "EV Service Technician Assessment",
    "sector": "EV Battery System",
    "tradeCode": "TSV/1002",
    "nsqfLevel": 4,
    "hands": [
      {
        "index": 0,
        "difficulty": "medium",
        "coverageNote": "Battery pack components (cells, modules, BMS, thermal management, enclosure) and how they relate to each other; common EV battery chemistries (NMC vs LFP) and their trade-offs.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "Which component of an EV battery pack continuously monitors cell voltage, current, and temperature to protect the battery and optimize its performance?",
            "options": [
              { "key": "A", "text": "Battery Management System (BMS)" },
              { "key": "B", "text": "Busbar" },
              { "key": "C", "text": "Battery enclosure" },
              { "key": "D", "text": "High-voltage fuse" }
            ],
            "correctKey": "A",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains the relationship between battery cells, modules, and the battery pack in an EV?",
            "options": [
              { "key": "A", "text": "The battery pack is a single large cell with no smaller subdivisions." },
              { "key": "B", "text": "Individual cells are grouped and connected together to form modules, and multiple modules are then combined, along with supporting systems like the BMS and thermal management, to form the complete battery pack." },
              { "key": "C", "text": "Modules are formed by combining multiple complete battery packs." },
              { "key": "D", "text": "Cells, modules, and packs are three unrelated components with no structural connection." }
            ],
            "correctKey": "B",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "A vehicle manufacturer is designing a budget-friendly EV model where long cycle life, thermal stability, and lower cost are prioritized over maximizing driving range. Applying knowledge of common EV battery chemistries, which type of lithium-ion battery would most likely be selected?",
            "options": [
              { "key": "A", "text": "NMC (Nickel Manganese Cobalt), since it always has lower cost than LFP." },
              { "key": "B", "text": "NiMH, since it is the standard chemistry used in nearly all modern EVs." },
              { "key": "C", "text": "LFP (Lithium Iron Phosphate), since it offers greater thermal stability, longer cycle life, and lower cost, though with lower energy density than NMC." },
              { "key": "D", "text": "Lead-acid, since it offers the highest energy density of all EV battery types." }
            ],
            "correctKey": "C",
            "isPractical": true
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "An EV battery pack contains many individual cells connected together within modules. Analyse why even a single faulty or weak cell within a module can affect the performance and safety of the entire battery pack, connecting this to how cells are interconnected.",
            "isPractical": true,
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "A technician suggests that battery chemistry choice (e.g., NMC vs LFP) only matters for driving range and has no real connection to vehicle safety. Evaluate this claim, and justify your answer using what you know about EV battery types.",
            "isPractical": true,
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a simple labelled overview, described in words, that a new EV technician trainee could use to understand how the major components of an EV battery pack - cells, modules, BMS, thermal management, and enclosure - relate to and protect each other. Include at least five components in your explanation.",
            "isPractical": true,
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      },
      {
        "index": 1,
        "difficulty": "medium",
        "coverageNote": "BMS function during charging; safe charge/discharge behaviour; battery safety; basic fault identification for battery warnings.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "Besides monitoring cell conditions, which of the following is a primary function of the Battery Management System (BMS) during charging?",
            "options": [
              { "key": "A", "text": "Preventing overcharging by controlling or stopping the charging process once cells reach their safe voltage limit." },
              { "key": "B", "text": "Increasing the vehicle's driving range beyond its rated capacity." },
              { "key": "C", "text": "Physically cooling the battery pack using refrigerant." },
              { "key": "D", "text": "Changing the battery's chemistry to improve performance." }
            ],
            "correctKey": "A",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains why EV batteries are generally not charged to 100% or discharged to 0% during normal use, even though the battery technically has that capacity range?",
            "options": [
              { "key": "A", "text": "Charging to 100% or discharging to 0% is dangerous and will always cause an immediate fire." },
              { "key": "B", "text": "Operating at the extreme ends of charge (very full or very empty) accelerates battery degradation and can reduce the battery's usable lifespan, so a buffer is typically maintained at both ends." },
              { "key": "C", "text": "The battery physically cannot reach 100% or 0% charge under any circumstances." },
              { "key": "D", "text": "Maintaining a buffer has no effect on battery lifespan and is done only for marketing reasons." }
            ],
            "correctKey": "B",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "During a routine inspection, a technician notices that one specific area of a battery pack's casing feels noticeably warmer than the rest, and the vehicle's dashboard shows a battery warning indicator. Applying basic fault-identification knowledge, what should the technician consider as a likely area of concern?",
            "options": [
              { "key": "A", "text": "This is a completely normal condition requiring no further investigation." },
              { "key": "B", "text": "The warning indicator is unrelated to the battery and should be ignored." },
              { "key": "C", "text": "A possible fault (such as an imbalance, faulty cell, or thermal management issue) localized to that warmer area of the pack, which should be further diagnosed before continued use." },
              { "key": "D", "text": "The vehicle should be immediately fast-charged to resolve the warning." }
            ],
            "correctKey": "C",
            "isPractical": true
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "A battery pack shows a BMS warning for 'cell imbalance,' where some cells within a module have noticeably different voltage levels than others in the same module. Analyse what this imbalance could mean for battery performance and safety, and why the BMS is specifically designed to detect and respond to this condition.",
            "isPractical": true,
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "A workshop manager proposes allowing technicians to charge any EV battery pack using any available charger, regardless of the charger's voltage/current rating or the specific battery's specifications, arguing that 'a charger is a charger.' Evaluate this practice from a battery safety standpoint, and justify your answer.",
            "isPractical": true,
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a basic fault-identification checklist a technician could follow when a vehicle shows a general battery warning indicator, to help narrow down whether the issue relates to a cell/module problem, a BMS/sensor problem, or a charging-related problem. Include at least four distinct checks.",
            "isPractical": true,
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      }
    ]
  },
  {
    "key": "commis-chef",
    "label": "Commis Chef Assessment",
    "sector": "Food Safety & Hygiene",
    "tradeCode": "TSV/1006",
    "nsqfLevel": 3,
    "hands": [
      {
        "index": 0,
        "difficulty": "medium",
        "coverageNote": "Personal hygiene practices; the concept of contamination and cross-contamination; safe basic food handling to prevent contamination.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "Which of the following is a basic personal hygiene practice a commis chef should follow before starting to handle food?",
            "options": [
              { "key": "A", "text": "Thoroughly wash hands with soap and water." },
              { "key": "B", "text": "Apply strong perfume to mask kitchen odours." },
              { "key": "C", "text": "Wear loose jewellery to identify as kitchen staff." },
              { "key": "D", "text": "Tie long hair loosely without any covering." }
            ],
            "correctKey": "A",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains what 'cross-contamination' means in a kitchen setting?",
            "options": [
              { "key": "A", "text": "Cooking two different dishes on the same stove at the same time." },
              { "key": "B", "text": "The transfer of harmful microorganisms or substances from one food, surface, or piece of equipment to another, such as from raw meat to a ready-to-eat food via an unwashed cutting board or hands." },
              { "key": "C", "text": "Using more than one type of cleaning chemical in the kitchen." },
              { "key": "D", "text": "Storing hot food and cold food in the same refrigerator." }
            ],
            "correctKey": "B",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "A commis chef uses the same cutting board and knife to cut raw chicken and then, without cleaning them, uses the same board and knife to chop vegetables that will be served raw in a salad. Applying knowledge of contamination, what risk does this practice create?",
            "options": [
              { "key": "A", "text": "No risk, since chicken and vegetables are both natural food products." },
              { "key": "B", "text": "A risk of chemical contamination only, unrelated to biological contamination." },
              { "key": "C", "text": "Cross-contamination, since harmful microorganisms from the raw chicken could transfer to the vegetables, which will not be cooked to kill them." },
              { "key": "D", "text": "A risk only if the vegetables are stored for more than a week afterward." }
            ],
            "correctKey": "C",
            "isPractical": true
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "A commis chef follows correct handwashing practice at the start of a shift but then handles raw chicken, and immediately afterward touches ready-to-eat bread rolls without washing hands in between. Analyse why this sequence of actions still creates a food safety risk, even though correct handwashing was performed earlier in the shift, connecting this to the concept of contamination.",
            "isPractical": true,
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "A kitchen supervisor proposes that staff only need to wash their hands at the start of their shift and after using the washroom, arguing that washing hands more frequently than this wastes time during busy service. Evaluate whether this handwashing policy is adequate for food safety, and justify your answer.",
            "isPractical": true,
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a simple personal hygiene and contamination-prevention routine that a new commis chef trainee could follow throughout a shift to reduce food safety risk. Include at least five distinct practices.",
            "isPractical": true,
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      },
      {
        "index": 1,
        "difficulty": "medium",
        "coverageNote": "Correct food storage practice (FIFO, raw vs ready-to-eat placement); the temperature danger zone; cleaning versus sanitizing.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "What does the temperature 'danger zone' refer to in food safety?",
            "options": [
              { "key": "A", "text": "The range of temperatures (roughly 5°C to 60°C) within which bacteria multiply most rapidly in food." },
              { "key": "B", "text": "The temperature range used for deep-freezing food for long-term storage." },
              { "key": "C", "text": "The temperature at which food is safely cooked to kill all bacteria." },
              { "key": "D", "text": "The temperature range used only for washing kitchen equipment." }
            ],
            "correctKey": "A",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains the purpose of the FIFO (First In, First Out) principle in food storage?",
            "options": [
              { "key": "A", "text": "It ensures that the most expensive ingredients are always used first, regardless of delivery date." },
              { "key": "B", "text": "It ensures that older stock is used before newer stock, reducing the risk of food being stored past its safe use-by date and going to waste or causing illness." },
              { "key": "C", "text": "It ensures that frozen food is always used before chilled food." },
              { "key": "D", "text": "It has no effect on food safety and is used only to save storage space." }
            ],
            "correctKey": "B",
            "isPractical": false
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "A commis chef is storing food in the refrigerator and has raw chicken, raw fish, and a container of ready-to-eat cooked rice to place on the shelves. Applying knowledge of correct storage practice, how should these items generally be arranged relative to each other?",
            "options": [
              { "key": "A", "text": "All three items should be stored together on the same shelf to save space, since they will all be cooked eventually." },
              { "key": "B", "text": "The ready-to-eat rice should be stored below the raw chicken and fish, since ready-to-eat food is less important to protect." },
              { "key": "C", "text": "The raw chicken and raw fish should be stored on lower shelves, below and separate from the ready-to-eat cooked rice, to prevent any drips or contact from contaminating the ready-to-eat food." },
              { "key": "D", "text": "Storage position does not matter as long as all items are inside the refrigerator." }
            ],
            "correctKey": "C",
            "isPractical": true
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "A kitchen has a policy requiring cooked food to be cooled quickly before being placed in the refrigerator, rather than being left to cool slowly at room temperature for an extended period first. Analyse why this policy exists, connecting it to the concept of the temperature danger zone.",
            "isPractical": true,
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "A kitchen staff member proposes using the same cloth to wipe down the raw meat preparation area and the ready-to-eat food plating area, arguing that the cloth is 'rinsed with water' between uses and this is sufficient. Evaluate whether rinsing with water alone is an adequate cleaning/sanitation practice in this situation, and justify your answer.",
            "isPractical": true,
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a basic daily cleaning and food-storage checklist a commis chef could follow at the end of a shift to help maintain food safety overnight. Include at least five distinct checks or tasks.",
            "isPractical": true,
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      }
    ]
  }
];

export function getTrack(key: string): Track | undefined {
  return TRACKS.find(t => t.key === key);
}
