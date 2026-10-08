// Dronalytics School Diagnostic Competency Assessment — real Class 8 question bank.
// Same engine as the ITI assessments: no shared reading passage, subject knowledge tested
// directly. Bloom order fixed R -> U -> A -> An -> E -> C. R/U/A are objective MCQ;
// An/E/C are subjective free response.

export type Bloom = 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYSE' | 'EVALUATE' | 'CREATE';
export type Decl = 'READY' | 'ASSIST' | 'PASS';

export interface MCQQuestion {
  type: 'mcq';
  bloom: Bloom;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
}

export interface EssayQuestion {
  type: 'essay';
  bloom: Bloom;
  question: string;
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
  subject: string;
  gradeLevel: string;
  topic: string;
  hands: Hand[];
}

export const TRACKS: Track[] = [
  {
    "key": "science-force-pressure",
    "label": "Science — Force and Pressure",
    "subject": "Science",
    "gradeLevel": "Class 8",
    "topic": "Force and Pressure",
    "hands": [
      {
        "index": 0,
        "difficulty": "medium",
        "coverageNote": "All eight given learning outcomes: force as push/pull and interaction, magnitude+direction, change in state of motion, contact vs non-contact force, pressure as force per unit area, liquid/gas pressure on container walls, atmospheric pressure.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "Which term describes the force acting on a unit area of a surface?",
            "options": [
              { "key": "A", "text": "Energy" },
              { "key": "B", "text": "Volume" },
              { "key": "C", "text": "Speed" },
              { "key": "D", "text": "Pressure" }
            ],
            "correctKey": "D"
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which of the following is the best example of a force acting on an object without the two objects touching each other?",
            "options": [
              { "key": "A", "text": "Two children pulling opposite ends of a rope in a tug of war." },
              { "key": "B", "text": "A carpenter hammering a nail into a piece of wood." },
              { "key": "C", "text": "A magnet attracting an iron nail lying a short distance away." },
              { "key": "D", "text": "A girl pushing a shopping trolley." }
            ],
            "correctKey": "C"
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "A football rolling in a straight line at a constant speed is kicked again in the exact same direction it was already moving, and it moves away faster than before. Which of the following correctly describes the change caused by this force?",
            "options": [
              { "key": "A", "text": "The force has changed the speed of the ball, without changing its direction." },
              { "key": "B", "text": "The force has changed the direction of the ball, without changing its speed." },
              { "key": "C", "text": "The force has changed the shape of the ball, not its speed or direction." },
              { "key": "D", "text": "The force has changed neither the speed nor the direction of the ball." }
            ],
            "correctKey": "A"
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "A sharp knife cuts a vegetable more easily than a blunt knife, even when the same force is applied by hand in both cases. Using the idea that pressure is force acting per unit area, analyse why the sharp knife is more effective at cutting.",
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "A rubber ball is held fully underwater. Student A says the water pushes on the ball only from above, because pressure is caused by the weight of water pressing down. Student B says the water pushes on the ball from all sides - top, bottom, and sides - because liquids exert pressure on the walls of their container in every direction. Evaluate which student's explanation is more accurate, and justify your answer.",
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a simple activity, using easily available materials, that a Class 8 student could carry out at home or in the classroom to show that air (a gas) exerts pressure. Describe the materials needed, the steps to follow, and the observation that would prove air exerts pressure.",
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      },
      {
        "index": 1,
        "difficulty": "medium",
        "coverageNote": "Force changing the shape of an object; force as an interaction between two objects; magnitude and direction of force in a tug of war; pressure and area in the opposite direction to hand 1 (spreading force over a larger area to reduce pressure); atmospheric pressure via drinking through a straw; a new shape-change demonstration.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "Besides changing an object's state of motion, what other kind of change can a force cause in an object?",
            "options": [
              { "key": "A", "text": "A change in its colour" },
              { "key": "B", "text": "A change in its temperature" },
              { "key": "C", "text": "A change in its mass" },
              { "key": "D", "text": "A change in its shape" }
            ],
            "correctKey": "D"
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains why a force cannot exist without two objects being involved, even if the two objects never touch each other?",
            "options": [
              { "key": "A", "text": "Because a single object can create a force entirely on its own, with no other object needed." },
              { "key": "B", "text": "Because a force arises from the interaction between two objects - one object exerts the force and the other object experiences its effect." },
              { "key": "C", "text": "Because a force only exists when two objects are moving in the same direction as each other." },
              { "key": "D", "text": "Because a force can only be measured when both objects are exactly the same size." }
            ],
            "correctKey": "B"
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "In a tug of war, Team A pulls the rope to the left with a certain force, while Team B pulls the rope to the right at the same time with a greater force. Applying the idea that force has both magnitude and direction, what will happen to the rope?",
            "options": [
              { "key": "A", "text": "The rope will move to the right, since Team B's force is greater in magnitude in that direction." },
              { "key": "B", "text": "The rope will move in a completely new direction, different from both teams' pulling directions." },
              { "key": "C", "text": "The rope will remain exactly still, since both teams are applying force." },
              { "key": "D", "text": "The rope will move to the left, since Team A started pulling first." }
            ],
            "correctKey": "A"
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "A camel can walk easily on loose desert sand without sinking, while a person wearing normal shoes sinks into the same sand. A camel's feet are broad and flat compared to its body weight. Using the idea that pressure is force per unit area, analyse why the camel's broad feet help it avoid sinking into the sand.",
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "Two students discuss how a straw is used to drink water. Student A says the mouth 'sucks' the water up the straw by directly pulling it with muscle force. Student B says that when air is drawn out of the straw by the mouth, the atmospheric pressure pushing down on the water's surface outside the straw pushes the water up into the straw to fill the space. Evaluate which explanation is more accurate, given what you know about air exerting pressure around us, and justify your answer.",
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a simple activity, using easily available materials, that a Class 8 student could use to show that a force can change the shape of an object without changing its state of motion (that is, without making the object move from its place). Describe the materials, the steps, and the observation that proves a force can change shape.",
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      }
    ]
  },
  {
    "key": "social-science-constitution",
    "label": "Social Science — The Indian Constitution",
    "subject": "Social Science - Political Life (Civics)",
    "gradeLevel": "Class 8",
    "topic": "The Indian Constitution",
    "hands": [
      {
        "index": 0,
        "difficulty": "medium",
        "coverageNote": "Why a country needs a constitution; the principle that rules apply equally to everyone including those in power; the historical influence of the anti-colonial freedom struggle on constitutional values; the basic timeline of the Constitution's adoption and commencement.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "On which date did the Indian Constitution come into effect?",
            "options": [
              { "key": "A", "text": "2 October 1950" },
              { "key": "B", "text": "26 January 1950" },
              { "key": "C", "text": "26 November 1949" },
              { "key": "D", "text": "15 August 1947" }
            ],
            "correctKey": "B"
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains why a country needs a constitution?",
            "options": [
              { "key": "A", "text": "It lays down basic rules that allow people in a society to live together with a minimum degree of coordination, while also specifying who has the power to make decisions and setting limits on that power." },
              { "key": "B", "text": "It gives the ruling political party unlimited power to make any decision without restriction." },
              { "key": "C", "text": "It provides a fixed set of laws that never need to change once a country becomes independent." },
              { "key": "D", "text": "It is a document that mainly describes the geography and boundaries of the country." }
            ],
            "correctKey": "A"
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "In a classroom, the teacher makes a rule that all students must submit their homework on time, but the teacher herself often returns students' checked test papers very late without any consequence to herself. Which basic principle of a constitution does this situation fail to reflect?",
            "options": [
              { "key": "A", "text": "That a constitution should specify the official national language of a country." },
              { "key": "B", "text": "That a constitution should always be written down in a single physical document." },
              { "key": "C", "text": "That rules made under a constitution should apply equally to everyone, including those who hold power or authority." },
              { "key": "D", "text": "That a constitution should describe the geography and history of a nation." }
            ],
            "correctKey": "C"
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "The Indian Constitution reflects values such as equality, freedom, and justice - values that were also central to India's freedom struggle against colonial rule. Analyse why the framers of the Constitution, many of whom had taken part in the freedom movement, might have wanted to build these particular values into the Constitution.",
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "Two students discuss why India needed a constitution after independence. Student A says the most important reason was to clearly specify who would have the power to make decisions for the country. Student B says the most important reason was to set clear limits on what the government could do to its citizens, so that people's freedoms would be protected. Evaluate whether one of these reasons is more important than the other, or whether both are equally necessary, and justify your answer.",
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a short classroom storyboard, in the same style used in this chapter, based on an everyday classroom situation, that could help a younger student understand the constitutional principle that even people in positions of power (such as a class monitor or a teacher) must follow the same rules as everyone else. Describe the situation, what happens in it, and the lesson it is meant to teach.",
            "wordCountMin": 60,
            "wordCountMax": 120
          }
        ]
      },
      {
        "index": 1,
        "difficulty": "medium",
        "coverageNote": "Historical formation and drafting of the Constitution via the Constituent Assembly; the constitutive principle that a constitution specifies who has the power to make decisions and how; the constitutive principle that a constitution sets limits on what a government can impose on citizens.",
        "questions": [
          {
            "type": "mcq",
            "bloom": "REMEMBER",
            "question": "Who chaired the Drafting Committee that prepared the text of the Indian Constitution?",
            "options": [
              { "key": "A", "text": "Jawaharlal Nehru" },
              { "key": "B", "text": "Dr. B. R. Ambedkar" },
              { "key": "C", "text": "Sardar Vallabhbhai Patel" },
              { "key": "D", "text": "Mahatma Gandhi" }
            ],
            "correctKey": "B"
          },
          {
            "type": "mcq",
            "bloom": "UNDERSTAND",
            "question": "Which statement best explains why a constitution needs to specify who has the power to make decisions for a country?",
            "options": [
              { "key": "A", "text": "So that only the wealthiest citizens are allowed to take part in decision-making." },
              { "key": "B", "text": "So that the country's boundaries and geography are clearly defined." },
              { "key": "C", "text": "So that there is a clear, agreed process for choosing who governs and makes decisions, preventing confusion or conflict over authority." },
              { "key": "D", "text": "So that any person can make decisions for the country at any time, without any agreed process." }
            ],
            "correctKey": "C"
          },
          {
            "type": "mcq",
            "bloom": "APPLY",
            "question": "A school principal decides, without asking anyone, that all students must stay back for two extra hours every day, with no advance notice and no chance for students to object. Which constitutional principle does this situation fail to reflect?",
            "options": [
              { "key": "A", "text": "That a constitution should set limits on what those in power can impose on the people under their authority, protecting individual freedoms." },
              { "key": "B", "text": "That a constitution should specify the official national language of a country." },
              { "key": "C", "text": "That a constitution should describe the geography and history of a nation." },
              { "key": "D", "text": "That a constitution should specify the national anthem of a country." }
            ],
            "correctKey": "A"
          },
          {
            "type": "essay",
            "bloom": "ANALYSE",
            "question": "The Constituent Assembly that drafted the Indian Constitution was formed of representatives from across India, who debated and voted on the Constitution's contents over nearly three years before it was adopted. Analyse how the way the Constitution itself was created reflects the constitutional principle that a country's basic rules should specify who has the power to make decisions, and how that power should be exercised.",
            "wordCountMin": 40,
            "wordCountMax": 80
          },
          {
            "type": "essay",
            "bloom": "EVALUATE",
            "question": "A government official argues that during an emergency, elected leaders should be allowed to make any decision they consider necessary without being limited by the Constitution, so that problems can be solved quickly. Evaluate this argument using the constitutional principle that a constitution sets limits on what a government can impose on its citizens, and justify your answer.",
            "wordCountMin": 50,
            "wordCountMax": 100
          },
          {
            "type": "essay",
            "bloom": "CREATE",
            "question": "Design a short classroom storyboard, in the style used in this chapter, based on an everyday classroom situation, that could help a younger student understand the constitutional principle that a country's basic rules need to clearly specify who has the power to make decisions and how that power should be used. Describe the situation, what happens in it, and the lesson it is meant to teach.",
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
