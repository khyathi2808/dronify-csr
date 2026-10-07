import { LENSES, LENS_LABEL, type Institute, type Lens } from './_platform-data';

export type Quadrant = 'confident-capable' | 'quiet-achievers' | 'overconfident-risk' | 'needs-intervention';

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  'confident-capable': 'Confident & Capable',
  'quiet-achievers': 'Quiet Achievers',
  'overconfident-risk': 'Overconfident Risk',
  'needs-intervention': 'Needs Intervention',
};

export const QUADRANT_DESC: Record<Quadrant, string> = {
  'confident-capable': 'On track — model cohort.',
  'quiet-achievers': 'Under-confident, needs encouragement.',
  'overconfident-risk': 'Scoring low but acting sure — a hidden dropout risk.',
  'needs-intervention': 'Low competency, low confidence — the clearest gap signal.',
};

export function quadrantFor(confidence: number, competency: number): Quadrant {
  const highConf = confidence >= 50;
  const highComp = competency >= 50;
  if (highConf && highComp) return 'confident-capable';
  if (!highConf && highComp) return 'quiet-achievers';
  if (highConf && !highComp) return 'overconfident-risk';
  return 'needs-intervention';
}

export function portfolioLensAverages(institutes: Institute[]): Record<Lens, number> {
  const withLenses = institutes.filter(d => d.lenses);
  const out = {} as Record<Lens, number>;
  LENSES.forEach(lens => {
    out[lens] = withLenses.length
      ? Math.round(withLenses.reduce((s, d) => s + (d.lenses?.[lens] ?? 0), 0) / withLenses.length)
      : 0;
  });
  return out;
}

export function weakestLens(averages: Record<Lens, number>): Lens {
  return LENSES.reduce((worst, l) => (averages[l] < averages[worst] ? l : worst), LENSES[0]);
}

export function lensBand(v: number): 'green' | 'amber' | 'red' { return v >= 70 ? 'green' : v >= 50 ? 'amber' : 'red'; }

export function costPerLearner(d: Institute): number | null {
  if (!d.allocated || !d.enrolled) return null;
  return Math.round(d.allocated / d.enrolled);
}

export function costPerLdiPoint(d: Institute): number | null {
  const gain = (d.current ?? 0) - (d.baseline ?? 0);
  if (!d.allocated || gain <= 0) return null;
  return Math.round(d.allocated / gain);
}

export function needsInterventionShare(institutes: Institute[]): number {
  const withData = institutes.filter(d => d.current != null && d.confidence != null);
  if (!withData.length) return 0;
  const count = withData.filter(d => quadrantFor(d.confidence!, d.current!) === 'needs-intervention').length;
  return Math.round((count / withData.length) * 100);
}

export { LENSES, LENS_LABEL };
