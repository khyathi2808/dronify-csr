import type { Institute } from './_platform-data';
import {
  LIVE, TOTAL_ALLOCATED, TOTAL_DISBURSED, TOTAL_OBLIGATION, TOTAL_STUDENTS, TOTAL_UTILISED,
} from './_platform-data';
import { LENS_LABEL, needsInterventionShare, portfolioLensAverages, weakestLens } from './_platform-ldi';

export const CURRENT_MONTH_KEY = '2024-09';
export const REPORT_MONTHS = [
  { key: '2024-09', label: 'September 2024', pdf: '/reports/portfolio-impact-report-september-2024.pdf' },
  { key: '2024-08', label: 'August 2024', pdf: '/reports/portfolio-impact-report-august-2024.pdf' },
] as const;

export type Snapshot = {
  key: string; label: string; isCurrent: boolean;
  live: number; active: number; atrisk: number; onboarding: number;
  students: number; attendance: number; improving: number; attendingWell: number; ucPending: number;
  obligation: number; allocated: number; disbursed: number; utilised: number; utilPct: number;
  ldiBaseline: number; ldiCurrent: number; weakestLensLabel: string; needsInterventionPct: number;
};

function avgField(list: Institute[], key: 'baseline' | 'current' | 'attendance'): number {
  const withField = list.filter(d => d[key] != null);
  return withField.length ? Math.round(withField.reduce((s, d) => s + (d[key] as number), 0) / withField.length) : 0;
}

export function computeSnapshot(monthKey: string, allInstitutes: Institute[]): Snapshot {
  const isCurrent = monthKey === CURRENT_MONTH_KEY;
  const liveCount = LIVE.length;
  const activeCount = allInstitutes.filter(d => d.status === 'active').length;
  const atRiskCount = allInstitutes.filter(d => d.status === 'atrisk').length;
  const onboardingCount = allInstitutes.filter(d => d.status === 'onboarding').length;
  const ucPendingCount = LIVE.filter(d => d.ucPending).length;
  const avgAttendance = avgField(LIVE, 'attendance');
  const improvingWell = LIVE.filter(d => (d.growth ?? -Infinity) >= 15).length;
  const attendingWell = LIVE.filter(d => (d.attendance ?? 0) >= 70).length;
  const lensAvgs = portfolioLensAverages(LIVE);
  const weakest = LENS_LABEL[weakestLens(lensAvgs)];
  const needsIntervention = needsInterventionShare(LIVE);

  if (isCurrent) {
    return {
      key: monthKey, label: 'September 2024', isCurrent: true,
      live: liveCount, active: activeCount, atrisk: atRiskCount, onboarding: onboardingCount,
      students: TOTAL_STUDENTS, attendance: avgAttendance, improving: improvingWell, attendingWell, ucPending: ucPendingCount,
      obligation: TOTAL_OBLIGATION, allocated: TOTAL_ALLOCATED, disbursed: TOTAL_DISBURSED, utilised: TOTAL_UTILISED,
      utilPct: Math.round((TOTAL_UTILISED / TOTAL_ALLOCATED) * 100),
      ldiBaseline: avgField(LIVE, 'baseline'), ldiCurrent: avgField(LIVE, 'current'),
      weakestLensLabel: weakest, needsInterventionPct: needsIntervention,
    };
  }

  const liveAug = liveCount - 3;
  const atRiskAug = atRiskCount + 2;
  const activeAug = liveAug - atRiskAug;
  const onboardingAug = onboardingCount + 3;
  const allocatedAug = Math.round(TOTAL_ALLOCATED * 0.95);
  const disbursedAug = Math.round(TOTAL_DISBURSED * 0.90);
  const utilisedAug = Math.round(TOTAL_UTILISED * 0.85);
  return {
    key: monthKey, label: 'August 2024', isCurrent: false,
    live: liveAug, active: activeAug, atrisk: atRiskAug, onboarding: onboardingAug,
    students: Math.round(TOTAL_STUDENTS * 0.97), attendance: avgAttendance - 2,
    improving: Math.round(improvingWell * 0.88), attendingWell: Math.round(attendingWell * 0.90),
    ucPending: ucPendingCount + 3,
    obligation: TOTAL_OBLIGATION, allocated: allocatedAug, disbursed: disbursedAug, utilised: utilisedAug,
    utilPct: Math.round((utilisedAug / allocatedAug) * 100),
    ldiBaseline: avgField(LIVE, 'baseline'), ldiCurrent: Math.max(0, avgField(LIVE, 'current') - 4),
    weakestLensLabel: weakest, needsInterventionPct: needsIntervention + 3,
  };
}

export type Health = { financial: number; execution: number; impact: number; compliance: number; risk: number; overall: number };

export function computeHealth(snap: Snapshot): Health {
  const financial = Math.min(100, snap.utilPct + 15);
  const execution = Math.round((snap.active / snap.live) * 100);
  const impact = Math.round((snap.improving / snap.live) * 100);
  const compliance = Math.max(0, Math.min(100, Math.round(100 - (snap.ucPending / snap.live) * 100 * 3)));
  const risk = Math.max(0, Math.min(100, Math.round(100 - (snap.atrisk / snap.live) * 100 * 4)));
  const overall = Math.round((financial + execution + impact + compliance + risk) / 5);
  return { financial, execution, impact, compliance, risk, overall };
}

export function healthBand(v: number): 'green' | 'amber' | 'red' { return v >= 80 ? 'green' : v >= 60 ? 'amber' : 'red'; }
export function healthLabel(v: number) { return v >= 80 ? 'Healthy' : v >= 60 ? 'Watch' : 'At risk'; }

export type Alert = { d: Institute; reasons: string[]; score: number };

export function computeTopAlerts(): Alert[] {
  const alerts: Alert[] = [];
  LIVE.forEach(d => {
    const reasons: string[] = [];
    let score = 0;
    if ((d.attendance ?? 100) < 70) { reasons.push(`Attendance ${d.attendance}%`); score += 2; }
    if ((d.growth ?? 100) < 5) { reasons.push('Little or no LDI improvement'); score += 2; }
    if ((d.missedAttempts ?? 0) >= 20) { reasons.push(`Missed Attempts ${d.missedAttempts}%`); score += 2; }
    if (d.ucPending) { reasons.push('UC pending'); score += 1; }
    if (reasons.length) alerts.push({ d, reasons, score });
  });
  alerts.sort((a, b) => b.score - a.score);
  return alerts.slice(0, 5);
}

export function computeRecovered(currentTop5: Alert[]): Institute[] {
  const ids = currentTop5.map(a => a.d.id);
  return LIVE.filter(d => d.status === 'active' && (d.growth ?? -Infinity) >= 15 && !ids.includes(d.id)).slice(0, 2);
}

export function topFlaggedDistrict(top5: Alert[]): string | null {
  const counts: Record<string, number> = {};
  let best: string | null = null;
  top5.forEach(a => { counts[a.d.district] = (counts[a.d.district] || 0) + 1; });
  for (const k in counts) { if (!best || counts[k] > counts[best]) best = k; }
  return best;
}

export function deltaValue(curr: number, prev: number | null, higherIsBetter: boolean): { diff: number; up: boolean } | null {
  if (prev == null || curr === prev) return null;
  const diff = curr - prev;
  return { diff, up: higherIsBetter ? diff > 0 : diff < 0 };
}
