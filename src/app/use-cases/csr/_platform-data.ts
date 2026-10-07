// CSR Education & Skilling Intelligence Platform — deterministic sample
// dataset. State/district names are real Indian geography; institute names,
// scores, and financials are illustrative sample data generated with a
// seeded PRNG so the numbers are stable across reloads. The Learning Depth
// Index (LDI) fields below stand in for Dronalytics' Cognitive Analytics
// engine output, per the CSR Education & Skilling Intelligence blueprint.

function mulberry32(seed: number) {
  let s = seed;
  return function rand() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
function pick<T>(arr: readonly T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function randInt(lo: number, hi: number) { return Math.floor(lo + rand() * (hi - lo + 1)); }
function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

export function fmt(n: number) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
export function fmtCr(n: number) { return '₹' + (n / 10000000).toFixed(2) + ' Cr'; }
export function fmtL(n: number) { return '₹' + (n / 100000).toFixed(1) + ' L'; }
export function fmtRs(n: number) { return '₹' + fmt(Math.round(n)); }

export const GEO = [
  { state: 'Maharashtra', districts: ['Nashik', 'Jalgaon', 'Nandurbar'] },
  { state: 'Bihar', districts: ['Bhagalpur', 'Gaya', 'Purnia'] },
  { state: 'Telangana', districts: ['Warangal', 'Khammam'] },
  { state: 'West Bengal', districts: ['Siliguri', 'Jalpaiguri'] },
  { state: 'Madhya Pradesh', districts: ['Ujjain', 'Dewas'] },
  { state: 'Rajasthan', districts: ['Kota', 'Alwar'] },
  { state: 'Chhattisgarh', districts: ['Bilaspur', 'Raipur'] },
  { state: 'Tamil Nadu', districts: ['Hosur', 'Dharmapuri'] },
] as const;

const SCHOOL_TYPES = ['Govt Primary School', 'Govt Upper Primary School', 'Municipal School'] as const;
const ITI_TRADES = ['Electrician', 'Fitter', 'Welder', 'COPA'] as const;
export const ONBOARD_STAGES = ['Invited', 'Documentation Submitted', 'Baseline Assessment'] as const;
export type OnboardStage = (typeof ONBOARD_STAGES)[number];
export type InstituteStatus = 'active' | 'onboarding' | 'atrisk';
export type InstituteKind = 'School' | 'ITI';

export const LENSES = ['thinkingDepth', 'appliedLearning', 'problemSolving', 'learningAgility'] as const;
export type Lens = (typeof LENSES)[number];
export const LENS_LABEL: Record<Lens, string> = {
  thinkingDepth: 'Thinking Depth',
  appliedLearning: 'Applied Learning',
  problemSolving: 'Problem-Solving Ability',
  learningAgility: 'Learning Agility',
};

export type Institute = {
  id: number;
  name: string;
  state: string;
  district: string;
  tier: 'Tier 2' | 'Tier 3';
  status: InstituteStatus;
  kind: InstituteKind;
  domain: string; // subject (schools) or trade (ITIs)
  programme: string;
  stage?: OnboardStage;
  daysInStage?: number;
  target?: number;
  enrolled?: number;
  attendance?: number;
  baseline?: number; // LDI baseline score (0-100)
  growth?: number; // LDI points gained since baseline
  current?: number; // LDI current score (0-100) — the platform's headline "learning" number
  lenses?: Record<Lens, number>; // the four LDI lenses, 0-100 each
  confidence?: number; // behavioural confidence proxy, 0-100
  missedAttempts?: number; // % of learners disengaging on questions
  rushedDecisions?: number; // % of learners racing through without thinking
  aiReliance?: number; // % of learners over-relying on AI assistance
  assessmentsScheduled?: number;
  assessmentsCompleted?: number;
  allocated?: number;
  disbursed?: number;
  utilised?: number;
  ucPending?: boolean;
};

function generateInstitutes(): Institute[] {
  const institutes: Institute[] = [];
  let seq = 1;
  GEO.forEach(g => {
    g.districts.forEach(district => {
      const count = randInt(4, 7);
      for (let i = 0; i < count; i++) {
        const isITI = rand() < 0.22;
        const type = isITI ? 'ITI' : pick(SCHOOL_TYPES);
        const kind: InstituteKind = isITI ? 'ITI' : 'School';
        const domain = isITI ? pick(ITI_TRADES) : 'Foundational Literacy & Numeracy';
        const programme = isITI ? 'ITI Trade Readiness' : 'Foundational Literacy';
        const tier: 'Tier 2' | 'Tier 3' = rand() < 0.55 ? 'Tier 2' : 'Tier 3';
        const statusRoll = rand();
        const status: InstituteStatus = statusRoll < 0.72 ? 'active' : statusRoll < 0.86 ? 'onboarding' : 'atrisk';
        const label = isITI ? `Govt ITI, ${district} — ${domain}` : `${type} #${i + 1}, ${district}`;

        const rec: Institute = { id: seq++, name: label, state: g.state, district, tier, status, kind, domain, programme };

        if (status === 'onboarding') {
          rec.stage = pick(ONBOARD_STAGES);
          rec.daysInStage = randInt(4, 48);
        } else {
          const target = randInt(80, 220);
          const enrollFactor = 0.82 + rand() * 0.24;
          const enrolled = Math.round(target * enrollFactor);
          const attendance = randInt(64, 97);
          const baseline = randInt(26, 48);
          const growthRoll = rand();
          const growth = status === 'atrisk'
            ? (growthRoll < 0.5 ? randInt(-8, -1) : randInt(0, 6))
            : (growthRoll < 0.15 ? randInt(2, 9) : randInt(9, 26));
          const current = clamp(baseline + growth, 0, 100);

          // Four LDI lenses, varying around the headline score. Problem-Solving
          // is deliberately skewed lower for at-risk/slow-growth institutes so
          // portfolio-wide it reads as the weakest lens — matching the
          // blueprint's own example narrative (Section 10, 17).
          const lensJitter = () => randInt(-10, 10);
          const problemSolvingPenalty = growth < 10 ? randInt(6, 16) : randInt(0, 6);
          const lenses: Record<Lens, number> = {
            thinkingDepth: clamp(current + lensJitter(), 0, 100),
            appliedLearning: clamp(current + lensJitter(), 0, 100),
            problemSolving: clamp(current - problemSolvingPenalty + lensJitter(), 0, 100),
            learningAgility: clamp(current + lensJitter(), 0, 100),
          };

          // Confidence: usually tracks competency, but ~40% of at-risk
          // institutes read as "overconfident" — scoring low while acting
          // sure, the quadrant's hidden-dropout-risk case (Section 3).
          const overconfident = status === 'atrisk' && rand() < 0.4;
          const confidence = overconfident
            ? randInt(60, 85)
            : clamp(current + randInt(-15, 15), 5, 95);

          const missedAttempts = status === 'atrisk' ? randInt(14, 30) : status === 'active' && growth < 10 ? randInt(8, 16) : randInt(2, 9);
          const rushedDecisions = status === 'atrisk' ? randInt(10, 24) : randInt(2, 12);
          const aiReliance = randInt(2, 22);

          const cost = randInt(280000, 420000);
          const utilFactor = 0.45 + rand() * 0.5;

          rec.target = target;
          rec.enrolled = enrolled;
          rec.attendance = attendance;
          rec.baseline = baseline;
          rec.growth = growth;
          rec.current = current;
          rec.lenses = lenses;
          rec.confidence = confidence;
          rec.missedAttempts = missedAttempts;
          rec.rushedDecisions = rushedDecisions;
          rec.aiReliance = aiReliance;
          rec.assessmentsScheduled = Math.ceil(enrolled / 28);
          rec.assessmentsCompleted = Math.round(rec.assessmentsScheduled * (0.8 + rand() * 0.2));
          rec.allocated = cost;
          rec.disbursed = Math.round(cost * Math.min(1, utilFactor + 0.12 + rand() * 0.1));
          rec.utilised = Math.round(cost * utilFactor);
          rec.ucPending = rand() < 0.08;
        }
        institutes.push(rec);
      }
    });
  });
  return institutes;
}

export const INSTITUTES: Institute[] = generateInstitutes();

export const STATES = GEO.map(g => g.state);
export const TOTAL_STATES = STATES.length;
export const TOTAL_DISTRICTS = GEO.reduce((s, g) => s + g.districts.length, 0);
export const LIVE = INSTITUTES.filter(d => d.status === 'active' || d.status === 'atrisk');
export const TOTAL_STUDENTS = LIVE.reduce((s, d) => s + (d.enrolled || 0), 0);
export const TOTAL_ALLOCATED = LIVE.reduce((s, d) => s + (d.allocated || 0), 0);
export const TOTAL_DISBURSED = LIVE.reduce((s, d) => s + (d.disbursed || 0), 0);
export const TOTAL_UTILISED = LIVE.reduce((s, d) => s + (d.utilised || 0), 0);
export const TOTAL_OBLIGATION = Math.round(TOTAL_ALLOCATED * 1.08);

export const PROGRAMMES = [
  {
    key: 'foundational-literacy', name: 'Foundational Literacy', kind: 'School' as const,
    blurb: 'Reading and basic-maths competency across funded government and municipal schools.',
  },
  {
    key: 'iti-trade-readiness', name: 'ITI Trade Readiness', kind: 'ITI' as const,
    blurb: 'Trade-theory competency and job readiness across funded government ITIs.',
  },
] as const;

export const PARTNERS = [
  { name: 'Vidya Trust', delivery: 87, finance: 91, reporting: 96, compliance: 100 },
  { name: 'Disha Foundation', delivery: 78, finance: 84, reporting: 88, compliance: 92 },
  { name: 'Prayas Skilling Society', delivery: 91, finance: 95, reporting: 90, compliance: 100 },
] as const;
