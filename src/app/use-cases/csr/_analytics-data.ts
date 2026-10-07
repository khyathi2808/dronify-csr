// Dronalytics CSR analytics — same shape as the Tomcom (ITI) analytics product
// (Cognitive + Behavioral metric views, "Pre-Placement Assessment" snapshot), but
// re-derived for the 14 Tata STRIVE delivery points using each point's real
// avg / ready / ccg / tdr fields from _data.ts, rather than re-typed arbitrary
// hex values. See the helper functions below for exactly how each metric's
// chart values are grounded in those real fields.

import { DELIVERY_POINTS, type DeliveryPoint } from './_data';

export const CENTRES = DELIVERY_POINTS.map(d => d.name);

export const ASSESSMENTS = [
  'Workshop Safety Induction', 'Basic Trade Skills', 'Tool Handling & Measurement',
  'Applied Trade Practice I', 'Applied Trade Practice II', 'Mid-Term Skill Evaluation',
  'Advanced Trade Techniques', 'Pre-Placement Assessment',
] as const;

type HeatRow = { centre: string; cells: (string | null)[] };
type BarRow = { centre: string; segments: { color: string; pct: number }[] };
type StemRow = { centre: string; color: string; pct: number };
type CcgRow = { centre: string; bands: ('calibrated' | 'mild' | 'large')[] };

export interface MetricDef {
  key: string;
  category: 'Cognitive' | 'Behavioral';
  name: string;
  eyebrow: string;
  title: string;
  formula: string;
  legend: { label: string; color: string }[];
  chart:
    | { type: 'heatmap'; columns: string[]; rows: HeatRow[] }
    | { type: 'bar'; rows: BarRow[] }
    | { type: 'waffle'; rows: { centre: string; squares: string[] }[] }
    | { type: 'stem'; rows: StemRow[] }
    | { type: 'trail'; columns: string[]; rows: CcgRow[] };
}

// ── Derivation helpers — ground every chart value in a delivery point's real ──
// ── avg / ready / ccg / tdr field instead of an arbitrary hex sequence.       ──

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function bandFromScore(score: number, nBands: number): number {
  const step = 100 / nBands;
  return clamp(Math.floor(score / step), 0, nBands - 1);
}

// Picks one of the legend's exact stop colors for a 0-100 score — never an
// interpolated in-between hex — so every heatmap cell's color always has a
// matching legend entry (HeatmapChart looks up the label by exact hex match).
function pickStop(stops: string[], score: number): string {
  return stops[bandFromScore(score, stops.length)];
}

function ccgBand(ccgVal: number): 'calibrated' | 'mild' | 'large' {
  if (ccgVal < 10) return 'calibrated';
  if (ccgVal < 20) return 'mild';
  return 'large';
}

// Distributes 100 (integer) across nBands, peaked at `peak` — used for stacked-bar
// and waffle charts derived from a single real score (avg / ready / tdr).
function peakedDistribution(peak: number, nBands: number, spread = 1.1): number[] {
  const weights = Array.from({ length: nBands }, (_, i) => Math.exp(-((i - peak) ** 2) / (2 * spread * spread)));
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / sum) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - floors[i] })).sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder && k < nBands; k++) floors[order[k].i]++;
  return floors;
}

// Same idea as peakedDistribution but returns integer counts summing to `total`
// (used for waffle square counts, where total is the row's square count, not 100).
function peakedCounts(peak: number, nBands: number, total: number, spread = 0.9): number[] {
  const pct = peakedDistribution(peak, nBands, spread);
  const raw = pct.map(p => (p / 100) * total);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, frac: r - floors[i] })).sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder && k < nBands; k++) floors[order[k].i]++;
  return floors;
}

// ── BPI — Bloom Proficiency Index. Grounded in avg, with a mild upward drift ──
// across the 8 assessment columns (later assessments trend stronger), same    ──
// shape as the improvement-over-term pattern in the ITI source data.          ──

const BPI_STOPS = ['#d85a30', '#ef9f27', '#5dcaa5', '#1d9e75'];

function bpiRow(dp: DeliveryPoint): HeatRow {
  const cells = ASSESSMENTS.map((_, j) => {
    const drift = -10 + j * (20 / (ASSESSMENTS.length - 1));
    const colScore = clamp(dp.avg + drift, 0, 100);
    return pickStop(BPI_STOPS, colScore);
  });
  return { centre: dp.name, cells };
}

// ── DCI — Decisive Capability Index. 6-band stacked distribution peaked on ──
// avg (Fragile..Highly Reliable, worst to best).                            ──

function dciRow(dp: DeliveryPoint): BarRow {
  const colors = ['#d85a30', '#ba7517', '#ef9f27', '#5dcaa5', '#1d9e75', '#085041'];
  const peak = clamp((dp.avg / 100) * (colors.length - 1), 0, colors.length - 1);
  const pcts = peakedDistribution(peak, colors.length, 1.15);
  return {
    centre: dp.name,
    segments: colors.map((color, i) => ({ color, pct: pcts[i] })).filter(s => s.pct > 0),
  };
}

// ── Zone — Capability zone waffle. Squares scaled to n, band peak driven by  ──
// ready% (higher ready → more weight on Ready Performer / Assisted).         ──

function zoneRow(dp: DeliveryPoint): { centre: string; squares: string[] } {
  const colors = ['#085041', '#1d9e75', '#ef9f27', '#d85a30']; // Ready > Assisted > Emerging > At Risk
  const squareTotal = clamp(Math.round(dp.n / 12), 6, 20);
  const peak = clamp(((100 - dp.ready) / 100) * (colors.length - 1), 0, colors.length - 1);
  const counts = peakedCounts(peak, colors.length, squareTotal, 0.85);
  const squares: string[] = [];
  colors.forEach((c, i) => { for (let k = 0; k < counts[i]; k++) squares.push(c); });
  return { centre: dp.name, squares };
}

// ── DQS — Decision Quality Score. 3-band bar (Weak/Moderate/Strong) peaked ──
// on avg.                                                                   ──

function dqsRow(dp: DeliveryPoint): BarRow {
  const colors = ['#d85a30', '#ef9f27', '#1d9e75'];
  const peak = bandFromScore(dp.avg, colors.length);
  const pcts = peakedDistribution(peak, colors.length, 0.95);
  return {
    centre: dp.name,
    segments: colors.map((color, i) => ({ color, pct: pcts[i] })).filter(s => s.pct > 0),
  };
}

// ── CCG — Confidence Calibration Gap. Directly uses the real ccg field, with ──
// a mild per-assessment drift (calibration improves slightly across the term).──

const CCG_COL_DRIFT = [4, 3, 2, 1, 0, -1, -2, -3];

function ccgRow(dp: DeliveryPoint): CcgRow {
  const bands = ASSESSMENTS.map((_, j) => ccgBand(dp.ccg + CCG_COL_DRIFT[j % CCG_COL_DRIFT.length]));
  return { centre: dp.name, bands };
}

// ── CI Time — performance consistency, 3-band heatmap over the last 6        ──
// assessments, grounded in ccg (a tighter calibration gap implies a more     ──
// consistent performer here) with a mild upward drift.                      ──

const CITIME_STOPS = ['#d85a30', '#ef9f27', '#1d9e75'];
const CITIME_COLS = ASSESSMENTS.slice(2);

function citimeRow(dp: DeliveryPoint): HeatRow {
  const base = clamp(100 - dp.ccg * 2.2, 0, 100);
  const cells = CITIME_COLS.map((_, j) => {
    const drift = -8 + j * (16 / (CITIME_COLS.length - 1));
    const colScore = clamp(base + drift, 0, 100);
    return pickStop(CITIME_STOPS, colScore);
  });
  return { centre: dp.name, cells };
}

// ── PI — Procrastination Index. Best->worst legend (Early Starter, On Time, ──
// Last Minute); higher avg trends toward "Early Starter".                   ──

const PI_STOPS = ['#1d9e75', '#ef9f27', '#d85a30'];

function piRow(dp: DeliveryPoint): HeatRow {
  const baseT = dp.avg / 100;
  const cells = ASSESSMENTS.map((_, j) => {
    const drift = -0.05 + j * (0.1 / (ASSESSMENTS.length - 1));
    const tj = clamp(baseT + drift, 0, 1);
    return pickStop(PI_STOPS, (1 - tj) * 100); // high avg -> low t -> stop 0 (Early Starter)
  });
  return { centre: dp.name, cells };
}

// ── AI Tool Use Pattern — 6-band bar peaked by tdr (tool dependence ratio). ──

function patternRow(dp: DeliveryPoint): BarRow {
  const colors = ['#085041', '#e8eff3', '#ef9f27', '#1d9e75', '#5dcaa5', '#d85a30'];
  const tdrNorm = clamp((dp.tdr - 0.2) / 0.4, 0, 1);
  const peak = tdrNorm * (colors.length - 1);
  const pcts = peakedDistribution(peak, colors.length, 1.3);
  return {
    centre: dp.name,
    segments: colors.map((color, i) => ({ color, pct: pcts[i] })).filter(s => s.pct > 0),
  };
}

function fireColor(pct: number): string {
  if (pct > 25) return '#d85a30';
  if (pct > 10) return '#ef9f27';
  return '#e8eff3';
}

// ── Impulsive Decisions — driven by tdr (over-reliance) and ccg (poor        ──
// self-read), both real correlates of acting without deliberation.          ──

function g10Row(dp: DeliveryPoint): StemRow {
  const pct = clamp(dp.tdr * 45 + (dp.ccg - 14) * 1.0, 2, 55);
  return { centre: dp.name, color: fireColor(pct), pct: Math.round(pct * 10) / 10 };
}

// ── Missed Opportunities — driven by ccg (a large calibration gap means      ──
// trainees under-read situations they should have engaged with).            ──

function g11Row(dp: DeliveryPoint): StemRow {
  const pct = clamp(dp.ccg * 1.1, 2, 45);
  return { centre: dp.name, color: fireColor(pct), pct: Math.round(pct * 10) / 10 };
}

export const METRICS: MetricDef[] = [
  {
    key: 'bpi', category: 'Cognitive', name: 'Bloom Proficiency Index (BPI)',
    eyebrow: 'BLOOM PROFICIENCY INDEX (BPI)',
    title: 'BPI label — all delivery points × assessments',
    formula: 'Colour intensity = concentration of dominant label · Faded = thin data (n < 5)',
    legend: [
      { label: 'Developing', color: '#d85a30' },
      { label: 'Emerging', color: '#ef9f27' },
      { label: 'Proficient', color: '#5dcaa5' },
      { label: 'Strong', color: '#1d9e75' },
    ],
    chart: { type: 'heatmap', columns: [...ASSESSMENTS], rows: DELIVERY_POINTS.map(bpiRow) },
  },
  {
    key: 'dci', category: 'Cognitive', name: 'Decisive Capability Index (DCI)',
    eyebrow: 'DECISIVE CAPABILITY INDEX (DCI)',
    title: 'DCI label distribution — all delivery points',
    formula: 'Stacked bars, one per delivery point, at the Pre-Placement Assessment',
    legend: [
      { label: 'Fragile', color: '#d85a30' },
      { label: 'Emerging', color: '#ba7517' },
      { label: 'Developing', color: '#ef9f27' },
      { label: 'Competent', color: '#5dcaa5' },
      { label: 'Strong', color: '#1d9e75' },
      { label: 'Highly Reliable', color: '#085041' },
    ],
    chart: { type: 'bar', rows: DELIVERY_POINTS.map(dciRow) },
  },
  {
    key: 'zone', category: 'Cognitive', name: 'Capability Zone',
    eyebrow: 'CAPABILITY ZONE',
    title: 'Zone distribution — per delivery point · one square ≈ 12 trainees',
    formula: 'Zone 1 = Ready Performer · Zone 4 = At Risk',
    legend: [
      { label: 'Zone 1 · Ready Performer', color: '#085041' },
      { label: 'Zone 2 · Assisted Performer', color: '#1d9e75' },
      { label: 'Zone 3 · Emerging Independent', color: '#ef9f27' },
      { label: 'Zone 4 · At Risk', color: '#d85a30' },
    ],
    chart: { type: 'waffle', rows: DELIVERY_POINTS.map(zoneRow) },
  },
  {
    key: 'dqs', category: 'Cognitive', name: 'Decision Quality Score (DQS)',
    eyebrow: 'DECISION QUALITY SCORE (DQS)',
    title: 'DQS label — all delivery points · Low ← diverging → Aligned',
    formula: 'DQS = DMS² / 100 · bar proportion shows balance between Low and Aligned',
    legend: [
      { label: 'Weak', color: '#d85a30' },
      { label: 'Moderate', color: '#ef9f27' },
      { label: 'Strong', color: '#1d9e75' },
    ],
    chart: { type: 'bar', rows: DELIVERY_POINTS.map(dqsRow) },
  },
  {
    key: 'ccg', category: 'Cognitive', name: 'Confidence Calibration Gap (CCG)',
    eyebrow: 'CONFIDENCE CALIBRATION GAP (CCG)',
    title: 'Calibration trail — all delivery points across assessments',
    formula: 'CCG = |perceived_conf − BPI| · Calibrated = CCG < 10',
    legend: [
      { label: 'Calibrated', color: '#2a78d6' },
      { label: 'Mild gap', color: '#1D9E75' },
      { label: 'Large gap', color: '#d85a30' },
    ],
    chart: { type: 'trail', columns: [...ASSESSMENTS], rows: DELIVERY_POINTS.map(ccgRow) },
  },
  {
    key: 'citime', category: 'Cognitive', name: 'Performance Consistency — CI Time',
    eyebrow: 'PERFORMANCE CONSISTENCY — CI TIME',
    title: 'CI Time label — all delivery points × assessments',
    formula: 'CI Time = (1 − pstdev / mean) × 100 · requires ≥ 3 assessments',
    legend: [
      { label: 'Inconsistent', color: '#d85a30' },
      { label: 'Developing Consistency', color: '#ef9f27' },
      { label: 'Consistent', color: '#1d9e75' },
    ],
    chart: { type: 'heatmap', columns: CITIME_COLS, rows: DELIVERY_POINTS.map(citimeRow) },
  },
  {
    key: 'pi', category: 'Behavioral', name: 'Procrastination Index (PI)',
    eyebrow: 'PROCRASTINATION INDEX (PI)',
    title: 'Start timing — all delivery points × assessments',
    formula: 'PI = attempt_start / window · Early < 0.20 · Mid 0.20–0.60 · Late > 0.60',
    legend: [
      { label: 'Early Starter', color: '#1d9e75' },
      { label: 'On Time', color: '#ef9f27' },
      { label: 'Last Minute', color: '#d85a30' },
    ],
    chart: { type: 'heatmap', columns: [...ASSESSMENTS], rows: DELIVERY_POINTS.map(piRow) },
  },
  {
    key: 'pattern', category: 'Behavioral', name: 'AI Tool Use Pattern (TDR × TUI)',
    eyebrow: 'AI TOOL USE PATTERN (TDR × TUI)',
    title: 'Tool use pattern mix — all delivery points',
    formula: 'TDR = sum(tool_time)/sum(answer_time) · TUI = reflective_uses/total_uses × 100',
    legend: [
      { label: 'No Use', color: '#085041' },
      { label: 'Minimal Use', color: '#e8eff3' },
      { label: 'Strategic Use', color: '#ef9f27' },
      { label: 'Balanced Use', color: '#1d9e75' },
      { label: 'High Support Use', color: '#5dcaa5' },
      { label: 'Overreliant Use', color: '#d85a30' },
    ],
    chart: { type: 'bar', rows: DELIVERY_POINTS.map(patternRow) },
  },
  {
    key: 'g10', category: 'Behavioral', name: 'Impulsive Decisions',
    eyebrow: 'IMPULSIVE DECISIONS',
    title: '% learners at Fire level — all delivery points',
    formula: 'Fires when ALL-IN + es_user < 0.40 + dt_ratio < 0.30 and count ≥ 3',
    legend: [
      { label: 'High', color: '#d85a30' },
      { label: 'Moderate', color: '#ef9f27' },
      { label: 'Low', color: '#e8eff3' },
    ],
    chart: { type: 'stem', rows: DELIVERY_POINTS.map(g10Row) },
  },
  {
    key: 'g11', category: 'Behavioral', name: 'Missed Opportunities',
    eyebrow: 'MISSED OPPORTUNITIES',
    title: '% learners at Fire level — all delivery points',
    formula: 'Fires when SKIP + es_shadow ≥ 0.70 and count ≥ 2',
    legend: [
      { label: 'High', color: '#d85a30' },
      { label: 'Moderate', color: '#ef9f27' },
      { label: 'Low', color: '#e8eff3' },
    ],
    chart: { type: 'stem', rows: DELIVERY_POINTS.map(g11Row) },
  },
];

export function getMetric(key: string): MetricDef | undefined {
  return METRICS.find(m => m.key === key);
}
