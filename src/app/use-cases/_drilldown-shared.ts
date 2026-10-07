// Shared, pillar-agnostic helpers behind the analytics drill-down (ITI + Schools both use these
// through the shared MetricChart renderer). There is no backend here, so per-student counts are
// synthesized deterministically from whatever a chart cell already encodes (a dominant color, a
// qualitative band, or — for bar/waffle/stem — an exact proportion already present in the data),
// seeded by the cell's own identity so the same cell always reproduces the same numbers.

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const COHORT_TOTAL = 28;

// Distributes `total` across `nLabels`, with `domIndex` holding `domShare` (a seeded 42%-72%
// unless an exact share is supplied) and the remainder split pseudo-randomly among the rest.
export function synthesizeVals(domIndex: number, nLabels: number, seed: string, total: number = COHORT_TOTAL, domShare?: number): number[] {
  const rnd = mulberry32(hashStr(seed));
  const di = domIndex >= 0 && domIndex < nLabels ? domIndex : 0;
  const share = domShare ?? (0.42 + rnd() * 0.3);
  const domCount = Math.max(1, Math.min(total, Math.round(total * share)));
  const vals = new Array(nLabels).fill(0);
  vals[di] = domCount;
  let remaining = total - domCount;
  const others = [...Array(nLabels).keys()].filter(i => i !== di);
  const weights = others.map(() => rnd() + 0.15);
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  others.forEach((i, idx) => {
    const isLast = idx === others.length - 1;
    const v = isLast ? remaining : Math.round(remaining * (weights[idx] / wSum));
    vals[i] = Math.max(0, v);
    remaining -= vals[i];
  });
  return vals;
}

export interface Selection {
  rowKey: string;
  colKey: string;
  vals: number[];
  prevVals: number[] | null;
}

const FIRST_NAMES = [
  'Farah', 'Nikhil', 'Sanjay', 'Ananya', 'Suresh', 'Deepa', 'Priya', 'Rahul', 'Kavya', 'Arjun',
  'Meera', 'Vikram', 'Divya', 'Rohan', 'Sneha', 'Aditya', 'Pooja', 'Karan', 'Ishita', 'Manoj',
];
const LAST_NAMES = [
  'Khan', 'Bhatt', 'Kumar', 'Rao', 'Nair', 'Krishnan', 'Sharma', 'Reddy', 'Iyer', 'Gupta',
  'Patel', 'Menon', 'Verma', 'Joshi', 'Pillai', 'Chauhan',
];

export function studentNameFor(seed: string, i: number): string {
  const h = hashStr(`${seed}::${i}`);
  const first = FIRST_NAMES[h % FIRST_NAMES.length];
  const last = LAST_NAMES[(h >>> 8) % LAST_NAMES.length];
  return `${first} ${last}`;
}
