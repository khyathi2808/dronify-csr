'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { T, cardStyle } from '@/lib/theme';
import { withBase } from '@/lib/base-path';
import { TONE, ToneTag } from './_ui';
import {
  GEO, STATES, LIVE, TOTAL_STUDENTS, PROGRAMMES, PARTNERS, LENSES, LENS_LABEL,
  fmt, fmtCr, fmtL, fmtRs, type Institute, type Lens,
} from './_platform-data';
import {
  Kpi, kpiRowStyle, StatusPill, tableWrapStyle, tableStyle, thStyle, tdStyle, DeltaBadge, HealthRow, PlatformCard,
} from './_platform-ui';
import { LearningDepthRadar, ConfidenceCompetencyQuadrant, Sparkline, LensHeatGrid } from './_platform-charts';
import { IndiaChoropleth } from './_india-choropleth';
import {
  portfolioLensAverages, weakestLens, lensBand, quadrantFor, QUADRANT_LABEL, QUADRANT_DESC,
  costPerLearner, costPerLdiPoint, needsInterventionShare,
} from './_platform-ldi';
import {
  computeSnapshot, computeHealth, computeTopAlerts, computeRecovered, topFlaggedDistrict, deltaValue,
  REPORT_MONTHS, type Snapshot,
} from './_platform-reports';

// ------------------------------------------------------------------ helpers ---

function avg(list: Institute[], key: 'baseline' | 'current' | 'attendance' | 'confidence'): number {
  const withField = list.filter(d => d[key] != null);
  return withField.length ? Math.round(withField.reduce((s, d) => s + (d[key] as number), 0) / withField.length) : 0;
}
function sum(list: Institute[], key: 'enrolled' | 'allocated' | 'utilised' | 'assessmentsScheduled' | 'assessmentsCompleted'): number {
  return list.reduce((s, d) => s + (d[key] as number || 0), 0);
}
function trend(current: number, delta: number, points = 6): number[] {
  return Array.from({ length: points }, (_, i) => {
    const base = current - delta * ((points - 1 - i) / (points - 1));
    return Math.round(base + Math.sin(i * 1.3) * Math.max(1, Math.abs(delta) * 0.15));
  });
}
function instituteWeakestLens(d: Institute): Lens | null {
  if (!d.lenses) return null;
  return LENSES.reduce((w, l) => (d.lenses![l] < d.lenses![w] ? l : w), LENSES[0]);
}
const sectionH = { fontFamily: T.sans, fontWeight: 600, fontSize: '0.92rem', color: T.text, margin: '26px 0 8px' } as const;
const sectionP = { fontFamily: T.sans, fontSize: '0.78rem', color: T.textDim, lineHeight: 1.6, maxWidth: 700, marginBottom: 14 } as const;
const pageH = { fontFamily: T.serif, fontWeight: 600, fontSize: '1.6rem', color: T.text, margin: '0 0 6px' } as const;
const pageP = { fontFamily: T.sans, fontSize: '0.86rem', color: T.textSec, maxWidth: 760, lineHeight: 1.6, marginBottom: 20 } as const;
const panelCTAStyle = {
  fontFamily: T.sans, fontWeight: 600, fontSize: '0.78rem', color: T.gold, textDecoration: 'none',
  border: `1px solid ${T.gold}`, borderRadius: 100, padding: '8px 16px', whiteSpace: 'nowrap' as const,
} as const;

// ============================================================= DASHBOARD ===

export function DashboardPanel({ allInstitutes }: { allInstitutes: Institute[] }) {
  const onboardingCount = allInstitutes.filter(d => d.status === 'onboarding').length;
  const atRiskCount = allInstitutes.filter(d => d.status === 'atrisk').length;
  const ldiBaseline = avg(LIVE, 'baseline');
  const ldiCurrent = avg(LIVE, 'current');
  const needsPct = needsInterventionShare(LIVE);
  const utilPct = Math.round((sum(LIVE, 'utilised') / sum(LIVE, 'allocated')) * 100);

  const pulse = [
    { label: 'Avg Learning Depth Index', value: `${ldiBaseline} → ${ldiCurrent}`, trend: trend(ldiCurrent, ldiCurrent - ldiBaseline), color: TONE.green.fg },
    { label: 'Institutions onboarded', value: String(allInstitutes.length), trend: trend(allInstitutes.length, 6), color: T.gold },
    { label: 'Fund utilisation', value: `${utilPct}%`, trend: trend(utilPct, 8), color: T.gold },
    { label: '"Needs Intervention" share', value: `${needsPct}%`, trend: trend(needsPct, -3), color: TONE.red.fg },
  ];

  const alerts = useMemo(() => {
    const list: { d: Institute; reason: string; critical: boolean }[] = [];
    LIVE.forEach(d => {
      if ((d.attendance ?? 100) < 70) list.push({ d, reason: `Attendance has slipped to ${d.attendance}% — worth checking in.`, critical: true });
      if ((d.growth ?? 100) < 5) list.push({ d, reason: `Little to no LDI improvement since baseline (${(d.growth ?? 0) >= 0 ? '+' : ''}${d.growth} pts).`, critical: d.status === 'atrisk' });
      if ((d.missedAttempts ?? 0) >= 20) list.push({ d, reason: `Missed Attempts at ${d.missedAttempts}% — learners disengaging on harder questions.`, critical: d.status === 'atrisk' });
      if (d.ucPending) list.push({ d, reason: "Utilisation certificate for this institute is overdue.", critical: false });
    });
    allInstitutes.filter(d => d.status === 'onboarding' && (d.daysInStage ?? 0) > 30).forEach(d => {
      list.push({ d, reason: `Stuck at "${d.stage}" for ${d.daysInStage} days — onboarding may be stalling.`, critical: false });
    });
    return list.sort((a, b) => (a.critical ? 0 : 1) - (b.critical ? 0 : 1));
  }, [allInstitutes]);

  const maxStateCount = Math.max(...GEO.map(g => allInstitutes.filter(d => d.state === g.state).length));

  return (
    <div>
      <h2 style={pageH}>Portfolio overview</h2>
      <p style={pageP}>
        Money + Institutions + Learners + Learning Depth + Learning Behaviour + Risk + Compliance — in one view. We don&apos;t ask your NGOs how well students are learning; we measure it, for every learner, automatically.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
        {pulse.map(p => (
          <div key={p.label} style={{ ...cardStyle({ padding: '16px 18px' }), flex: '1 1 200px', minWidth: 200 }}>
            <div style={{ fontFamily: T.sans, fontSize: '0.68rem', color: T.textDim, marginBottom: 6 }}>{p.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
              <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.4rem', color: T.text }}>{p.value}</div>
              <Sparkline values={p.trend} color={p.color} />
            </div>
          </div>
        ))}
      </div>

      <div style={kpiRowStyle}>
        <Kpi label="Institutions onboarded" value={allInstitutes.length} />
        <Kpi label="Students enrolled" value={fmt(TOTAL_STUDENTS)} />
        <Kpi label="Avg LDI (baseline → now)" value={`${ldiBaseline} → ${ldiCurrent}`} />
        <Kpi label="Needs Intervention" value={`${needsPct}%`} warn={needsPct > 20} />
        <Kpi label="Institutions at risk" value={atRiskCount} warn={atRiskCount > 0} />
        <Kpi label="In onboarding" value={onboardingCount} />
      </div>

      <div style={sectionH}>Needs attention</div>
      <p style={sectionP}>Each card is one institute that crossed a real concern — attendance, LDI stalling, disengagement (Missed Attempts), or an overdue compliance document.</p>
      {alerts.length === 0 ? (
        <p style={{ fontFamily: T.sans, fontSize: '0.84rem', color: T.textSec }}>Nothing flagged right now.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.slice(0, 10).map((a, i) => (
            <div key={i} style={{ ...cardStyle({ padding: '11px 16px' }), borderLeft: `4px solid ${a.critical ? TONE.red.fg : TONE.amber.fg}`, borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.84rem', color: T.text }}>{a.d.name}</div>
              <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim, margin: '2px 0 4px' }}>{a.d.district}, {a.d.state}</div>
              <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec }}>{a.reason}</div>
            </div>
          ))}
          {alerts.length > 10 && <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textDim }}>+ {alerts.length - 10} more flagged across the portfolio</div>}
        </div>
      )}

      <div style={sectionH}>Coverage by state</div>
      <PlatformCard>
        {GEO.map(g => {
          const count = allInstitutes.filter(d => d.state === g.state).length;
          const pct = Math.round((count / maxStateCount) * 100);
          return (
            <div key={g.state} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 40px', alignItems: 'center', gap: 12, padding: '7px 0', borderBottom: `1px solid ${T.line}`, fontSize: '0.82rem' }}>
              <div style={{ color: T.textSec }}>{g.state}</div>
              <div style={{ position: 'relative', height: 12, background: T.card, borderRadius: 6 }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`, background: T.gold, opacity: 0.7, borderRadius: 6 }} />
              </div>
              <div style={{ textAlign: 'right', color: T.text, fontFamily: T.mono }}>{count}</div>
            </div>
          );
        })}
      </PlatformCard>
    </div>
  );
}

// ============================================================ INSTITUTIONS ===

function InstitutionScorecard({ d, onBack }: { d: Institute; onBack: () => void }) {
  const lenses = d.lenses!;
  const weakest = instituteWeakestLens(d)!;
  const cpl = costPerLearner(d);
  const cplp = costPerLdiPoint(d);
  const quad = quadrantFor(d.confidence ?? 50, d.current ?? 0);
  const overallRisk = d.status === 'atrisk' ? 'red' : lensBand(lenses[weakest]) === 'red' ? 'amber' : 'green';
  const overallLabel = overallRisk === 'red' ? 'AT RISK' : overallRisk === 'amber' ? 'WATCH' : 'HEALTHY';

  return (
    <div>
      <span onClick={onBack} style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.gold, cursor: 'pointer', display: 'inline-block', marginBottom: 16 }}>
        ← Back to institutions
      </span>
      <PlatformCard style={{ padding: 'clamp(22px,4vw,30px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.3rem', color: T.text }}>{d.name}</div>
            <div style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec, marginTop: 4 }}>
              {d.district}, {d.state} · {d.tier} · {d.kind} — {d.domain}
            </div>
          </div>
          <StatusPill status={d.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LearningDepthRadar values={lenses} size={220} />
            <span style={{
              marginTop: 10, fontFamily: T.mono, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em',
              color: overallRisk === 'red' ? TONE.red.fg : overallRisk === 'amber' ? TONE.amber.fg : TONE.green.fg,
              background: overallRisk === 'red' ? TONE.red.bg : overallRisk === 'amber' ? TONE.amber.bg : TONE.green.bg,
              borderRadius: 100, padding: '5px 14px',
            }}>
              {overallLabel} — {LENS_LABEL[weakest]} gap
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim }}>LEARNERS ASSESSED</div>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.3rem', color: T.text }}>{d.enrolled} / {d.target}</div>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim }}>LEARNING DEPTH INDEX</div>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.3rem', color: T.text }}>
                  {d.baseline} → {d.current} <DeltaBadge diff={d.growth ?? 0} up={(d.growth ?? 0) > 0} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim }}>CONFIDENCE VS COMPETENCY</div>
                <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.9rem', color: T.text, marginTop: 4 }}>{QUADRANT_LABEL[quad]}</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim }}>{QUADRANT_DESC[quad]}</div>
              </div>
            </div>

            <div style={{ marginBottom: 4, fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>The four lenses</div>
            {LENSES.map(l => {
              const v = lenses[l];
              const band = lensBand(v);
              const tone = band === 'green' ? TONE.green : band === 'amber' ? TONE.amber : TONE.red;
              const label = band === 'green' ? 'On Track' : band === 'amber' ? 'Watch' : 'At Risk';
              return (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${T.line}`, fontSize: '0.82rem' }}>
                  <span style={{ color: T.textSec }}>{LENS_LABEL[l]}</span>
                  <span style={{ fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700, color: tone.fg, background: tone.bg, borderRadius: 100, padding: '3px 10px' }}>{v} · {label}</span>
                </div>
              );
            })}

            <div style={{ marginTop: 18, marginBottom: 4, fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Behaviour flags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                ['Missed Attempts', d.missedAttempts, 18],
                ['Rushed Decisions', d.rushedDecisions, 15],
                ['AI Tool Reliance', d.aiReliance, 20],
              ].map(([label, val, threshold]) => {
                const flagged = (val as number) >= (threshold as number);
                return (
                  <span key={label as string} style={{
                    fontFamily: T.mono, fontSize: '0.7rem', color: flagged ? TONE.amber.fg : T.textSec,
                    background: flagged ? TONE.amber.bg : T.card2, border: `1px solid ${flagged ? TONE.amber.border : T.line}`,
                    borderRadius: 100, padding: '5px 12px',
                  }}>
                    {label}: {val}% of learners
                  </span>
                );
              })}
            </div>

            {(cpl || cplp) && (
              <div style={{ marginTop: 18, display: 'flex', gap: 24 }}>
                {cpl && <div><div style={{ fontFamily: T.mono, fontSize: '0.64rem', color: T.textDim }}>COST / LEARNER ASSESSED</div><div style={{ fontFamily: T.serif, fontSize: '1.1rem', color: T.text }}>{fmtRs(cpl)}</div></div>}
                {cplp && <div><div style={{ fontFamily: T.mono, fontSize: '0.64rem', color: T.textDim }}>COST / LDI POINT GAINED</div><div style={{ fontFamily: T.serif, fontSize: '1.1rem', color: T.text }}>{fmtRs(cplp)}</div></div>}
              </div>
            )}
          </div>
        </div>
      </PlatformCard>
    </div>
  );
}

export function InstitutionsPanel({
  rows, total, onboardingRows, liveThisYear, onAdd,
}: { rows: Institute[]; total: number; onboardingRows: Institute[]; liveThisYear: number; onAdd: (i: Institute) => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Institute | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [state, setState] = useState<string>(STATES[0]);
  const [tier, setTier] = useState<'Tier 2' | 'Tier 3'>('Tier 2');
  const [msg, setMsg] = useState('');
  const districts = GEO.find(g => g.state === state)?.districts ?? [];
  const [district, setDistrict] = useState(districts[0] ?? '');

  if (selected) return <InstitutionScorecard d={selected} onBack={() => setSelected(null)} />;

  const shown = search ? rows.filter(d => d.name.toLowerCase().includes(search.toLowerCase())) : rows;
  const stages = ['Invited', 'Documentation Submitted', 'Baseline Assessment'] as const;
  const stageCounts = stages.map(s => ({ label: s, value: onboardingRows.filter(d => d.stage === s).length }));

  function handleStateChange(v: string) {
    setState(v);
    setDistrict(GEO.find(g => g.state === v)?.districts[0] ?? '');
  }
  function submit() {
    const trimmed = name.trim();
    if (!trimmed) { setMsg('Enter an institute name to continue.'); return; }
    onAdd({ id: Date.now(), name: trimmed, state, district, tier, status: 'onboarding', kind: 'School', domain: 'Foundational Literacy & Numeracy', programme: 'Foundational Literacy', stage: 'Invited', daysInStage: 0 });
    setName('');
    setMsg(`✓ ${trimmed} added to onboarding.`);
  }
  const selectStyle = { fontFamily: T.sans, fontSize: '0.8rem', padding: '9px 12px', borderRadius: 8, border: `1px solid ${T.line}`, background: T.card2, color: T.text, width: '100%' };
  const labelStyle = { fontSize: '0.7rem', color: T.textDim, display: 'block', marginBottom: 5 };

  return (
    <div>
      <h2 style={pageH}>Institutions</h2>
      <p style={pageP}>Every school, ITI, and skilling centre onboarded onto the programme — status, Learning Depth Index, and risk side by side. Click a row for its full Institution Scorecard.</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        {[...stageCounts, { label: 'Live', value: liveThisYear }].map(s => (
          <div key={s.label} style={{ ...cardStyle({ padding: '14px 16px' }), flex: 1, minWidth: 130, textAlign: 'center' }}>
            <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.4rem', color: T.text }}>{s.value}</div>
            <div style={{ fontFamily: T.sans, fontSize: '0.66rem', color: T.textDim, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <button type="button" onClick={() => setFormOpen(o => !o)} style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.8rem', color: T.gold, background: 'transparent', border: `1px solid ${T.gold}`, borderRadius: 100, padding: '9px 18px', cursor: 'pointer', marginBottom: 14 }}>
        + Initiate onboarding for a new institute
      </button>
      {formOpen && (
        <PlatformCard style={{ marginBottom: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 14 }}>
            <div><label style={labelStyle}>Institute name</label><input style={selectStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Govt Primary School, Sitapur" /></div>
            <div><label style={labelStyle}>State</label><select style={selectStyle} value={state} onChange={e => handleStateChange(e.target.value)}>{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={labelStyle}>District</label><select style={selectStyle} value={district} onChange={e => setDistrict(e.target.value)}>{districts.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label style={labelStyle}>Tier</label><select style={selectStyle} value={tier} onChange={e => setTier(e.target.value as 'Tier 2' | 'Tier 3')}><option>Tier 2</option><option>Tier 3</option></select></div>
          </div>
          <button type="button" onClick={submit} style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.82rem', padding: '10px 22px', borderRadius: 100, border: 'none', background: T.gold, color: T.felt0, cursor: 'pointer' }}>Start onboarding</button>
          {msg && <span style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.greenLt, marginLeft: 14 }}>{msg}</span>}
        </PlatformCard>
      )}

      <input type="text" placeholder="Search institute name..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...selectStyle, borderRadius: 100, width: 280, marginBottom: 12 }} />
      <div style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim, marginBottom: 12 }}>Showing {shown.length} of {total} institutions</div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead><tr>{['Institution', 'Type', 'State', 'District', 'Status', 'LDI (current)', 'LDI Δ', 'Weakest lens'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {shown.map(d => {
              const weakest = instituteWeakestLens(d);
              return (
                <tr key={d.id} onClick={() => d.status !== 'onboarding' && setSelected(d)} style={{ cursor: d.status !== 'onboarding' ? 'pointer' : 'default' }}>
                  <td style={{ ...tdStyle, color: T.text, fontWeight: 600 }}>{d.name}</td>
                  <td style={tdStyle}>{d.kind}</td>
                  <td style={tdStyle}>{d.state}</td>
                  <td style={tdStyle}>{d.district}</td>
                  <td style={tdStyle}><StatusPill status={d.status} /></td>
                  <td style={tdStyle}>{d.current ?? '—'}</td>
                  <td style={tdStyle}>{d.growth != null ? `${d.growth > 0 ? '+' : ''}${d.growth}` : '—'}</td>
                  <td style={tdStyle}>{weakest ? LENS_LABEL[weakest] : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================ ASSESSMENTS ===

export function AssessmentsPanel({ rows, showCTA = true }: { rows: Institute[]; showCTA?: boolean }) {
  const live = rows.filter(d => d.status !== 'onboarding');
  const scheduled = sum(live, 'assessmentsScheduled');
  const completed = sum(live, 'assessmentsCompleted');
  const completionPct = scheduled ? Math.round((completed / scheduled) * 100) : 0;

  const byDomain = useMemo(() => {
    const map = new Map<string, { domain: string; institutions: number; scheduled: number; completed: number }>();
    live.forEach(d => {
      if (!map.has(d.domain)) map.set(d.domain, { domain: d.domain, institutions: 0, scheduled: 0, completed: 0 });
      const g = map.get(d.domain)!;
      g.institutions++; g.scheduled += d.assessmentsScheduled || 0; g.completed += d.assessmentsCompleted || 0;
    });
    return [...map.values()].sort((a, b) => b.institutions - a.institutions);
  }, [live]);

  return (
    <div>
      {showCTA && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' as const }}>
          <h2 style={pageH}>Assessments</h2>
          <Link href="/use-cases/csr/assessments" style={panelCTAStyle}>Start a live assessment →</Link>
        </div>
      )}
      {!showCTA && <h2 style={pageH}>Assessments</h2>}
      <p style={pageP}>Native, Dronalytics-generated assessments per subject or trade — not partner self-reports. Every score traces back to the actual learner response.</p>
      <div style={kpiRowStyle}>
        <Kpi label="Scheduled" value={fmt(scheduled)} />
        <Kpi label="Completed" value={`${fmt(completed)} (${completionPct}%)`} />
        <Kpi label="Avg completion time" value="22 min" />
        <Kpi label="AI grading confidence" value="High on 96%" />
      </div>
      <div style={sectionH}>By subject / trade domain</div>
      <p style={sectionP}>Domain-agnostic by design — the same engine runs CBSE Mathematics and ITI trade theory.</p>
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead><tr>{['Domain', 'Institutions', 'Scheduled', 'Completed', 'Completion'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {byDomain.map(g => {
              const pct = g.scheduled ? Math.round((g.completed / g.scheduled) * 100) : 0;
              return (
                <tr key={g.domain}>
                  <td style={{ ...tdStyle, color: T.text, fontWeight: 600 }}>{g.domain}</td>
                  <td style={tdStyle}>{g.institutions}</td>
                  <td style={tdStyle}>{fmt(g.scheduled)}</td>
                  <td style={tdStyle}>{fmt(g.completed)}</td>
                  <td style={tdStyle}>{pct}% {pct < 85 && <ToneTag tone="amber">Behind</ToneTag>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================================================== LEARNING ANALYTICS ===

export function LearningAnalyticsPanel({ rows, showCTA = true }: { rows: Institute[]; showCTA?: boolean }) {
  const live = useMemo(() => rows.filter(d => d.status !== 'onboarding' && d.lenses), [rows]);
  const lensAvgs = useMemo(() => portfolioLensAverages(live), [live]);
  const weakest = weakestLens(lensAvgs);
  const needsPct = needsInterventionShare(live);

  const bands = useMemo(() => {
    const counts = { green: 0, amber: 0, red: 0 };
    live.forEach(d => { counts[lensBand(d.current ?? 0)]++; });
    return counts;
  }, [live]);

  const quadPoints = live.filter(d => d.confidence != null && d.current != null).map(d => ({ x: d.confidence!, y: d.current!, label: d.name }));

  const started = sum(live, 'enrolled');
  const engaged = Math.round(live.reduce((s, d) => s + (d.enrolled || 0) * (1 - (d.missedAttempts || 0) / 100), 0));
  const completed = sum(live, 'assessmentsCompleted') * 28; // approx learners represented by completed assessment batches
  const confidentCorrect = live.filter(d => quadrantFor(d.confidence ?? 0, d.current ?? 0) === 'confident-capable').reduce((s, d) => s + (d.enrolled || 0), 0);

  const [drillDistrict, setDrillDistrict] = useState<string | null>(null);
  const [drillInstitute, setDrillInstitute] = useState<Institute | null>(null);

  const byDistrict = useMemo(() => {
    const districts = Array.from(new Set(live.map(d => d.district)));
    return districts.map(district => {
      const members = live.filter(d => d.district === district);
      return { district, pct: needsInterventionShare(members), n: members.length };
    }).filter(x => x.n > 0).sort((a, b) => b.pct - a.pct);
  }, [live]);

  const districtInstitutes = drillDistrict ? live.filter(d => d.district === drillDistrict).sort((a, b) => needsInterventionShare([b]) - needsInterventionShare([a])) : [];

  return (
    <div>
      {showCTA && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' as const }}>
          <h2 style={pageH}>Analytics</h2>
          <Link href="/use-cases/csr/analytics" style={panelCTAStyle}>Explore metric-by-metric →</Link>
        </div>
      )}
      {!showCTA && <h2 style={pageH}>Analytics</h2>}
      <p style={pageP}>Cognitive Analytics (what learners know) and Behaviour Analytics (how they engaged while learning) — the two layers no partner self-report can produce.</p>

      <div style={sectionH}>Cognitive Analytics — Learning Depth Radar</div>
      <PlatformCard>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
          <LearningDepthRadar values={lensAvgs} size={240} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {LENSES.map(l => {
              const band = lensBand(lensAvgs[l]);
              const tone = band === 'green' ? TONE.green : band === 'amber' ? TONE.amber : TONE.red;
              return (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 170, flexShrink: 0, fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec }}>{LENS_LABEL[l]}</span>
                  <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: '0.78rem', color: tone.fg, background: tone.bg, borderRadius: 100, padding: '3px 10px' }}>{lensAvgs[l]}</span>
                  {l === weakest && <ToneTag tone="red">Weakest lens portfolio-wide</ToneTag>}
                </div>
              );
            })}
            <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textDim, marginTop: 6 }}>
              LDI distribution: <span style={{ color: TONE.green.fg }}>{bands.green} on track</span> · <span style={{ color: TONE.amber.fg }}>{bands.amber} watch</span> · <span style={{ color: TONE.red.fg }}>{bands.red} at risk</span>
            </div>
          </div>
        </div>
      </PlatformCard>

      <div style={sectionH}>Behaviour Analytics — Confidence vs Competency</div>
      <PlatformCard>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          <ConfidenceCompetencyQuadrant points={quadPoints} size={300} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 220 }}>
            {(['confident-capable', 'quiet-achievers', 'overconfident-risk', 'needs-intervention'] as const).map(q => (
              <div key={q}>
                <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.82rem', color: T.text }}>{QUADRANT_LABEL[q]}</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textDim }}>{QUADRANT_DESC[q]}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20, borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
          <div style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Engagement funnel</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[['Started', started], ['Engaged (no rush-flag)', engaged], ['Assessed', completed], ['Confidently correct', confidentCorrect]].map(([label, v]) => (
              <div key={label as string} style={{ ...cardStyle({ padding: '12px 16px' }), flex: 1, minWidth: 130, textAlign: 'center' }}>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.2rem', color: T.text }}>{fmt(v as number)}</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.66rem', color: T.textDim, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </PlatformCard>

      <div style={sectionH}>Learning Gap Intelligence</div>
      <p style={sectionP}>Level 1: what needs attention. Level 2: where. Level 3: which institution, which lens, and the behavioral signature behind it.</p>
      <PlatformCard>
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.6rem', color: TONE.red.fg }}>{needsPct}%</span>
          <span style={{ fontFamily: T.sans, fontSize: '0.84rem', color: T.textSec, marginLeft: 10 }}>of learners are in the &quot;Needs Intervention&quot; quadrant, driven primarily by {LENS_LABEL[weakest]}.</span>
        </div>

        <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim, marginBottom: 8 }}>LEVEL 2 — BY DISTRICT (click to drill in)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: drillDistrict ? 20 : 0 }}>
          {byDistrict.map(row => (
            <button key={row.district} type="button" onClick={() => { setDrillDistrict(row.district === drillDistrict ? null : row.district); setDrillInstitute(null); }}
              style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', gap: 10, alignItems: 'center', padding: '6px 8px', border: 'none', background: row.district === drillDistrict ? T.card2 : 'transparent', borderRadius: 8, cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>
              <span style={{ fontFamily: T.sans, fontSize: '0.8rem', color: row.district === drillDistrict ? T.gold : T.textSec }}>{row.district}</span>
              <span style={{ position: 'relative', height: 10, background: T.card, borderRadius: 5 }}>
                <span style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${row.pct}%`, background: TONE.red.fg, opacity: 0.7, borderRadius: 5 }} />
              </span>
              <span style={{ fontFamily: T.mono, fontSize: '0.72rem', color: T.text, textAlign: 'right' }}>{row.pct}%</span>
            </button>
          ))}
        </div>

        {drillDistrict && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim, marginBottom: 8 }}>LEVEL 3 — INSTITUTIONS IN {drillDistrict.toUpperCase()} (click one)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: drillInstitute ? 20 : 0 }}>
              {districtInstitutes.map(d => (
                <button key={d.id} type="button" onClick={() => setDrillInstitute(d.id === drillInstitute?.id ? null : d)}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', border: 'none', background: d.id === drillInstitute?.id ? T.card2 : 'transparent', borderRadius: 8, cursor: 'pointer', textAlign: 'left', font: 'inherit' }}>
                  <span style={{ fontFamily: T.sans, fontSize: '0.8rem', color: d.id === drillInstitute?.id ? T.gold : T.text }}>{d.name}</span>
                  <span style={{ fontFamily: T.mono, fontSize: '0.72rem', color: T.textDim }}>LDI {d.current} · weakest: {LENS_LABEL[instituteWeakestLens(d)!]}</span>
                </button>
              ))}
            </div>

            {drillInstitute && (
              <div style={{ background: T.felt2, borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.86rem', color: T.text, marginBottom: 8 }}>Behavioral signature — {drillInstitute.name}</div>
                <p style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec, lineHeight: 1.6, margin: 0 }}>
                  {LENS_LABEL[instituteWeakestLens(drillInstitute)!]} is the weakest lens ({drillInstitute.lenses![instituteWeakestLens(drillInstitute)!]}).
                  Missed Attempts sit at {drillInstitute.missedAttempts}% and Rushed Decisions at {drillInstitute.rushedDecisions}%
                  {(drillInstitute.missedAttempts ?? 0) >= 15 && (drillInstitute.rushedDecisions ?? 0) >= 12
                    ? ' — learners are disengaging on harder problems, not failing them carefully.'
                    : ' — a modest signal, worth a routine check rather than urgent escalation.'}
                </p>
              </div>
            )}
          </div>
        )}
      </PlatformCard>
    </div>
  );
}

// ============================================================= PROGRAMMES ===

export function ProgrammesPanel({ rows }: { rows: Institute[] }) {
  return (
    <div>
      <h2 style={pageH}>Programmes</h2>
      <p style={pageP}>Education Programmes group the institutions you fund by what they&apos;re trying to achieve — foundational literacy in schools, trade readiness in ITIs.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PROGRAMMES.map(p => {
          const members = rows.filter(d => d.programme === p.name);
          const live = members.filter(d => d.status !== 'onboarding');
          const allocated = sum(live, 'allocated');
          const needsPct = needsInterventionShare(live);
          const projects = [
            { name: `${p.name} — Year 1 Cohort`, share: 0.62 },
            { name: `${p.name} — Expansion Cohort`, share: 0.38 },
          ];
          return (
            <PlatformCard key={p.key}>
              <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.15rem', color: T.text }}>{p.name}</div>
              <div style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec, marginTop: 4, marginBottom: 16 }}>{p.blurb}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                <Kpi label="Institutions" value={members.length} />
                <Kpi label="Avg LDI (current)" value={avg(live, 'current')} />
                <Kpi label="Allocated" value={fmtCr(allocated)} />
                <Kpi label="Needs Intervention" value={`${needsPct}%`} warn={needsPct > 20} />
              </div>
              <div style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Projects</div>
              {projects.map(proj => (
                <div key={proj.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${T.line}`, fontSize: '0.8rem' }}>
                  <span style={{ color: T.text }}>{proj.name}</span>
                  <span style={{ fontFamily: T.mono, color: T.textDim }}>{fmtCr(Math.round(allocated * proj.share))}</span>
                </div>
              ))}
            </PlatformCard>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================ PARTNERS ===

export function PartnersPanel({ rows }: { rows: Institute[] }) {
  const portfolioLdi = avg(rows.filter(d => d.status !== 'onboarding'), 'current');
  return (
    <div>
      <h2 style={pageH}>Partners</h2>
      <p style={pageP}>Where an NGO operationally runs institutions on your behalf — scorecards here include a Learning Evidence Score sourced directly from assessment data, not partner self-reporting.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PARTNERS.map(p => {
          const learningEvidence = Math.max(50, Math.min(99, portfolioLdi + (p.delivery % 15) - 5));
          const overall = Math.round((p.delivery + p.finance + p.reporting + p.compliance + learningEvidence) / 5);
          const risk = overall >= 85 ? 'green' : overall >= 70 ? 'amber' : 'red';
          return (
            <PlatformCard key={p.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.1rem', color: T.text }}>{p.name}</div>
                <ToneTag tone={risk}>{risk === 'green' ? 'LOW RISK' : risk === 'amber' ? 'MEDIUM RISK' : 'HIGH RISK'}</ToneTag>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                {[['Project Delivery', p.delivery], ['Financial Utilisation', p.finance], ['Reporting Timeliness', p.reporting], ['Learning Evidence Score', learningEvidence], ['Compliance', p.compliance], ['Overall', overall]].map(([label, v]) => (
                  <div key={label as string}>
                    <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.2rem', color: T.text }}>{v}%</div>
                    <div style={{ fontFamily: T.sans, fontSize: '0.66rem', color: T.textDim, marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </PlatformCard>
          );
        })}
      </div>
    </div>
  );
}

// ================================================================= FINANCE ===

export function FinancePanel({ rows }: { rows: Institute[] }) {
  const allocated = sum(rows, 'allocated');
  const disbursed = sum(rows, 'utilised'); // placeholder replaced below
  const utilised = sum(rows, 'utilised');
  const totalDisbursed = rows.reduce((s, d) => s + (d.disbursed || 0), 0);
  const obligation = Math.round(allocated * 1.08);
  const utilPct = allocated ? Math.round((utilised / allocated) * 100) : 0;
  const unspent = allocated - utilised;

  const medianAllocated = [...rows].map(d => d.allocated || 0).sort((a, b) => a - b)[Math.floor(rows.length / 2)] || 0;
  const medianGain = [...rows].map(d => (d.growth || 0)).sort((a, b) => a - b)[Math.floor(rows.length / 2)] || 0;
  const highSpendLowGain = rows.filter(d => (d.allocated || 0) > medianAllocated && (d.growth || 0) < medianGain);

  const byState = useMemo(() => {
    const map = new Map<string, { state: string; n: number; allocated: number; utilised: number }>();
    rows.forEach(d => {
      if (!map.has(d.state)) map.set(d.state, { state: d.state, n: 0, allocated: 0, utilised: 0 });
      const g = map.get(d.state)!;
      g.n++; g.allocated += d.allocated || 0; g.utilised += d.utilised || 0;
    });
    return [...map.values()].sort((a, b) => (a.utilised / a.allocated) - (b.utilised / b.allocated));
  }, [rows]);

  const costPerLearnerAvg = sum(rows, 'enrolled') ? Math.round(allocated / sum(rows, 'enrolled')) : 0;
  const totalGain = rows.reduce((s, d) => s + Math.max(0, d.growth || 0), 0);
  const costPerLdiPointAvg = totalGain ? Math.round(allocated / totalGain) : 0;

  return (
    <div>
      <h2 style={pageH}>Finance</h2>
      <p style={pageP}>How much was committed, how much reached institutions, and how much converted into learning — not just spend.</p>
      <div style={kpiRowStyle}>
        <Kpi label="CSR obligation" value={fmtCr(obligation)} />
        <Kpi label="Allocated" value={fmtCr(allocated)} />
        <Kpi label="Disbursed" value={fmtCr(totalDisbursed)} />
        <Kpi label="Utilised" value={fmtCr(utilised)} />
        <Kpi label="Utilisation" value={`${utilPct}%`} />
        <Kpi label="Unspent" value={fmtL(unspent)} warn={utilPct < 60} />
      </div>

      <div style={sectionH}>Cost per learning gain</div>
      <p style={sectionP}>Compare institutions not just by spend, but by return on learning.</p>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <PlatformCard style={{ flex: 1 }}>
          <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{fmtRs(costPerLearnerAvg)}</div>
          <div style={{ fontFamily: T.sans, fontSize: '0.76rem', color: T.textDim, marginTop: 4 }}>Cost per learner assessed</div>
        </PlatformCard>
        <PlatformCard style={{ flex: 1 }}>
          <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{fmtRs(costPerLdiPointAvg)}</div>
          <div style={{ fontFamily: T.sans, fontSize: '0.76rem', color: T.textDim, marginTop: 4 }}>Cost per LDI point gained</div>
        </PlatformCard>
      </div>

      {highSpendLowGain.length > 0 && (
        <>
          <div style={sectionH}>High spend, low learning gain</div>
          <p style={sectionP}>Money isn&apos;t converting to outcomes at these institutions — worth a closer look before next cycle&apos;s allocation.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {highSpendLowGain.slice(0, 5).map(d => (
              <div key={d.id} style={{ ...cardStyle({ padding: '10px 16px' }), borderLeft: `4px solid ${TONE.amber.fg}`, borderRadius: '0 10px 10px 0', fontSize: '0.8rem', color: T.textSec }}>
                <b style={{ color: T.text }}>{d.name}</b> — {fmtL(d.allocated || 0)} allocated, only {d.growth! > 0 ? `+${d.growth}` : d.growth} LDI points gained
              </div>
            ))}
          </div>
        </>
      )}

      <div style={sectionH}>Utilisation by state</div>
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead><tr>{['State', 'Institutions', 'Allocated', 'Utilised', 'Utilisation'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {byState.map(g => {
              const pct = Math.round((g.utilised / g.allocated) * 100);
              return (
                <tr key={g.state}>
                  <td style={{ ...tdStyle, color: T.text, fontWeight: 600 }}>{g.state}</td>
                  <td style={tdStyle}>{g.n}</td>
                  <td style={tdStyle}>{fmtL(g.allocated)}</td>
                  <td style={tdStyle}>{fmtL(g.utilised)}</td>
                  <td style={tdStyle}>{pct}% {pct < 60 && <ToneTag tone="red">Low</ToneTag>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================== GEOGRAPHY ===

export function GeographyPanel({ rows }: { rows: Institute[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const byState = useMemo(() => GEO.map(g => {
    const members = rows.filter(d => d.state === g.state);
    const live = members.filter(d => d.status !== 'onboarding');
    return {
      state: g.state, live,
      count: live.length,
      students: sum(live, 'enrolled'),
      ldiCurrent: avg(live, 'current'),
      ldiBaseline: avg(live, 'baseline'),
      needsPct: needsInterventionShare(live),
    };
  }), [rows]);

  const values = useMemo(() => {
    const out: Record<string, { value: number; fill: string }> = {};
    byState.forEach(s => {
      const tone = s.needsPct > 25 ? TONE.red : s.needsPct > 12 ? TONE.amber : TONE.green;
      out[s.state] = { value: s.count, fill: tone.fg };
    });
    return out;
  }, [byState]);

  const activeState = byState.find(s => s.state === selected) ?? null;

  return (
    <div>
      <h2 style={pageH}>Geography</h2>
      <p style={pageP}>India → State → District → Institution. Every funded state is shaded by learning-gap density, not spend — the more actionable lens for where to direct next year&apos;s budget. Click a shaded state for its numbers.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px,440px) 1fr', gap: 28, alignItems: 'start' }}>
        <PlatformCard style={{ padding: 20 }}>
          <IndiaChoropleth values={values} selected={selected} onSelect={s => setSelected(s === selected ? null : s)} />
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 16, justifyContent: 'center', marginTop: 14, fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: TONE.green.fg, marginRight: 6 }} />Low gap</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: TONE.amber.fg, marginRight: 6 }} />Watch</span>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: TONE.red.fg, marginRight: 6 }} />High gap</span>
          </div>
        </PlatformCard>

        {activeState ? (
          <PlatformCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.2rem', color: T.text }}>{activeState.state}</div>
              <button
                type="button" onClick={() => setSelected(null)}
                style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 100, padding: '6px 12px', cursor: 'pointer' }}
              >
                ✕ close
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14 }}>
              <div>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{activeState.count}</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textSec, marginTop: 4 }}>Institutions live</div>
              </div>
              <div>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{fmt(activeState.students)}</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textSec, marginTop: 4 }}>Learners assessed</div>
              </div>
              <div>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.5rem', color: T.text }}>
                  {activeState.ldiCurrent} <DeltaBadge diff={activeState.ldiCurrent - activeState.ldiBaseline} up={activeState.ldiCurrent >= activeState.ldiBaseline} />
                </div>
                <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textSec, marginTop: 4 }}>Avg LDI (baseline → now)</div>
              </div>
              <div>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.5rem', color: activeState.needsPct > 20 ? TONE.red.fg : T.text }}>{activeState.needsPct}%</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textSec, marginTop: 4 }}>Needs Intervention</div>
              </div>
            </div>
            {activeState.live.length > 0 && (
              <div style={{ marginTop: 20, borderTop: `1px solid ${T.line}`, paddingTop: 16 }}>
                <div style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>Institutions</div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                  {activeState.live.map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0' }}>
                      <span style={{ color: T.text }}>{d.name}</span>
                      <span style={{ fontFamily: T.mono, fontSize: '0.72rem', color: T.textDim }}>{d.district}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PlatformCard>
        ) : (
          <PlatformCard>
            <p style={{ fontFamily: T.sans, fontSize: '0.84rem', color: T.textDim, margin: 0 }}>Click a state on the map to see its institutions, students, and learning gap.</p>
          </PlatformCard>
        )}
      </div>
    </div>
  );
}

// ============================================================= COMPLIANCE ===

export function CompliancePanel({ rows }: { rows: Institute[] }) {
  const live = rows.filter(d => d.status !== 'onboarding');
  const pending = live.filter(d => d.ucPending);
  const rate = live.length ? Math.round(((live.length - pending.length) / live.length) * 100) : 0;

  return (
    <div>
      <h2 style={pageH}>Compliance</h2>
      <p style={pageP}>Assessment data doubles as compliance evidence — statutory impact-assessment requirements can be satisfied directly from platform-generated data, not a separately commissioned evaluation.</p>
      <div style={kpiRowStyle}>
        <Kpi label="Institutions live" value={live.length} />
        <Kpi label="UC pending" value={pending.length} warn={pending.length > 0} />
        <Kpi label="Compliance rate" value={`${rate}%`} />
      </div>
      <div style={sectionH}>Utilisation certificates pending</div>
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead><tr>{['Institution', 'State', 'District', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {pending.map(d => (
              <tr key={d.id}>
                <td style={{ ...tdStyle, color: T.text, fontWeight: 600 }}>{d.name}</td>
                <td style={tdStyle}>{d.state}</td>
                <td style={tdStyle}>{d.district}</td>
                <td style={tdStyle}><StatusPill status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ================================================================= ALERTS ===

export function AlertsPanel({ allInstitutes }: { allInstitutes: Institute[] }) {
  const live = allInstitutes.filter(d => d.status !== 'onboarding');
  const financial = live.filter(d => (d.utilised || 0) / (d.allocated || 1) < 0.5).map(d => ({ d, text: `Low utilisation — only ${Math.round((d.utilised! / d.allocated!) * 100)}% of allocated funds spent.` }));
  const institution = allInstitutes.filter(d => d.status === 'onboarding' && (d.daysInStage || 0) > 30).map(d => ({ d, text: `Stuck at "${d.stage}" for ${d.daysInStage} days — onboarding may be stalling.` }));
  const learning = live.filter(d => (d.growth ?? 100) < 5 && (d.missedAttempts ?? 0) >= 14).map(d => ({
    d, text: `${instituteWeakestLens(d) ? LENS_LABEL[instituteWeakestLens(d)!] : 'Learning'} has stalled, with a parallel rise in Missed Attempts (${d.missedAttempts}%). This pattern typically indicates learner disengagement, not a content gap.`,
  }));
  const partnerAlerts = PARTNERS.filter(p => p.reporting < 90).map(p => ({ name: p.name, text: `Reporting timeliness at ${p.reporting}% — below the 90% threshold.` }));

  const categories = [
    { title: 'Financial', items: financial },
    { title: 'Institution', items: institution },
    { title: 'Learning', items: learning },
  ];

  return (
    <div>
      <h2 style={pageH}>Alerts &amp; Action Centre</h2>
      <p style={pageP}>Every alert pairs a number with the one-line reason behind it — the &quot;why,&quot; not just the &quot;what.&quot;</p>
      {categories.map(cat => (
        <div key={cat.title}>
          <div style={sectionH}>{cat.title} ({cat.items.length})</div>
          {cat.items.length === 0 ? (
            <p style={{ fontFamily: T.sans, fontSize: '0.82rem', color: T.textDim, marginBottom: 16 }}>Nothing flagged.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {cat.items.slice(0, 6).map((a, i) => (
                <div key={i} style={{ ...cardStyle({ padding: '12px 16px' }), borderLeft: `4px solid ${TONE.red.fg}`, borderRadius: '0 12px 12px 0' }}>
                  <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.84rem', color: T.text }}>{a.d.name}</div>
                  <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim, margin: '2px 0 4px' }}>{a.d.district}, {a.d.state}</div>
                  <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec }}>{a.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <div style={sectionH}>Partner ({partnerAlerts.length})</div>
      {partnerAlerts.length === 0 ? (
        <p style={{ fontFamily: T.sans, fontSize: '0.82rem', color: T.textDim }}>Nothing flagged.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {partnerAlerts.map((a, i) => (
            <div key={i} style={{ ...cardStyle({ padding: '12px 16px' }), borderLeft: `4px solid ${TONE.amber.fg}`, borderRadius: '0 12px 12px 0' }}>
              <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.84rem', color: T.text }}>{a.name}</div>
              <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec }}>{a.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ================================================================ REPORTS ===

function ReportDoc({ snap, prevSnap, pdf }: { snap: Snapshot; prevSnap: Snapshot | null; pdf: string }) {
  const health = computeHealth(snap);
  const top5 = useMemo(() => computeTopAlerts(), []);
  const recovered = snap.isCurrent ? [] : computeRecovered(top5);
  const district = top5.length ? topFlaggedDistrict(top5) : null;

  const kpiDefs: [string, string, { diff: number; up: boolean; isMoney?: boolean } | null][] = [
    ['CSR obligation', fmtCr(snap.obligation), null],
    ['Allocated', fmtCr(snap.allocated), prevSnap ? { ...deltaValue(snap.allocated, prevSnap.allocated, true)!, isMoney: true } : null],
    ['Disbursed', fmtCr(snap.disbursed), prevSnap ? { ...deltaValue(snap.disbursed, prevSnap.disbursed, true)!, isMoney: true } : null],
    ['Utilised', fmtCr(snap.utilised), prevSnap ? { ...deltaValue(snap.utilised, prevSnap.utilised, true)!, isMoney: true } : null],
    ['Utilisation', `${snap.utilPct}%`, prevSnap ? deltaValue(snap.utilPct, prevSnap.utilPct, true) : null],
    ['Avg LDI', String(snap.ldiCurrent), prevSnap ? deltaValue(snap.ldiCurrent, prevSnap.ldiCurrent, true) : null],
    ['Institutions live', String(snap.live), prevSnap ? deltaValue(snap.live, prevSnap.live, true) : null],
    ['At risk', String(snap.atrisk), prevSnap ? deltaValue(snap.atrisk, prevSnap.atrisk, false) : null],
  ];

  return (
    <PlatformCard style={{ padding: 'clamp(22px,4vw,32px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, borderBottom: `2px solid ${T.line}`, paddingBottom: 18, marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: '0.66rem', letterSpacing: '0.12em', color: T.textDim, textTransform: 'uppercase' }}>Drona CSR Education &amp; Skilling Programme</div>
          <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.4rem', color: T.text, margin: '4px 0' }}>Monthly Learning Impact Report</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <div style={{ textAlign: 'right', fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim, lineHeight: 1.8 }}>{snap.label}<br />FY 2024–25<br />{snap.isCurrent ? 'Updated live' : 'Closed report'}</div>
          <a
            href={withBase(pdf)} download
            style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.82rem', color: T.felt0, background: T.gold, border: 'none', borderRadius: 100, padding: '11px 22px', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' }}
          >Download Report</a>
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.86rem', color: T.text, margin: '0 0 4px' }}>At a glance</h3>
        <div style={kpiRowStyle}>
          {kpiDefs.map(([label, value, d]) => (
            <div key={label} style={{ ...cardStyle({ padding: '12px 14px' }), minWidth: 118 }}>
              <div style={{ fontFamily: T.sans, fontSize: '0.66rem', color: T.textDim, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.15rem', color: T.text }}>{value}{d && <DeltaBadge diff={d.diff} up={d.up} isMoney={d.isMoney} />}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.86rem', color: T.text, margin: '0 0 4px' }}>Portfolio health — {health.overall} / 100</h3>
        {[['Financial', health.financial], ['Execution', health.execution], ['Learning Impact', health.impact], ['Compliance', health.compliance], ['Risk', health.risk]].map(([l, v]) => (
          <HealthRow key={l as string} label={l as string} value={v as number} />
        ))}
      </div>

      <div style={{ marginBottom: 30 }}>
        <h3 style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.86rem', color: T.text, margin: '0 0 4px' }}>Needs attention</h3>
        {top5.map(a => (
          <div key={a.d.id} style={{ background: T.felt2, borderRadius: 8, padding: '11px 16px', marginBottom: 8, fontSize: '0.78rem', color: T.textSec }}>
            <b style={{ color: T.text }}>{a.d.name}</b> — {a.d.district}, {a.d.state}<br />{a.reasons.join(' · ')}
          </div>
        ))}
        {recovered.map(d => (
          <div key={d.id} style={{ background: TONE.green.bg, color: TONE.green.fg, borderRadius: 8, padding: '11px 16px', marginBottom: 8, fontSize: '0.78rem' }}>
            ✓ <b>{d.name}</b> — {d.district}, {d.state} — recovered since last month, now on track.
          </div>
        ))}
      </div>

      <details style={{ borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
        <summary style={{ cursor: 'pointer', fontFamily: T.sans, fontSize: '0.8rem', color: T.textDim }}>Full executive summary</summary>
        <p style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec, lineHeight: 1.7, marginTop: 12 }}>
          {snap.live} institutions are live across {STATES.length} states, with {fmt(snap.students)} students reached this quarter.
          The portfolio&apos;s average Learning Depth Index has moved from a baseline of {snap.ldiBaseline} to {snap.ldiCurrent}
          {' '}— a gain of {snap.ldiCurrent - snap.ldiBaseline} points. {snap.weakestLensLabel} remains the weakest lens portfolio-wide,
          and is the primary driver behind the {snap.needsInterventionPct}% of learners currently in the &quot;Needs Intervention&quot; quadrant.
          {district && ` ${district} district shows the steepest gap this month, with a behavioral signature of rising Missed Attempts and Rushed Decisions — indicating disengagement rather than pure content gaps.`}
          {' '}Fund utilisation stands at {snap.utilPct}%, with {snap.ucPending} utilisation certificates still pending.
          {snap.isCurrent && ' Recommended: prioritise teacher coaching and re-engagement intervention in the district above, and reallocate next-quarter budget toward institutions with the strongest cost-per-learning-gain ratio.'}
        </p>
      </details>
    </PlatformCard>
  );
}

export function ReportsPanel({ allInstitutes }: { allInstitutes: Institute[] }) {
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  if (!openMonth) {
    return (
      <div>
        <h2 style={pageH}>Reports &amp; Board MIS</h2>
        <p style={pageP}>Auto-generated, board-ready, pulled directly from primary assessment data — every statement here traces back to underlying institution data.</p>
        {REPORT_MONTHS.map(m => {
          const snap = computeSnapshot(m.key, allInstitutes);
          const health = computeHealth(snap);
          return (
            <div key={m.key} style={{ ...cardStyle({ padding: '20px 24px' }), display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.15rem', color: T.text }}>{m.label}</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 4 }}>
                  Portfolio health {health.overall}/100 · Avg LDI {snap.ldiBaseline}→{snap.ldiCurrent} · {snap.needsInterventionPct}% needs intervention
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                <a
                  href={withBase(m.pdf)} download
                  style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.78rem', color: T.gold, background: 'transparent', border: `1px solid ${T.gold}`, borderRadius: 100, padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none', display: 'inline-block' }}
                >Download PDF</a>
                <button type="button" onClick={() => setOpenMonth(m.key)} style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.78rem', color: T.felt0, background: T.gold, border: 'none', borderRadius: 100, padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap' }}>View report</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const snap = computeSnapshot(openMonth, allInstitutes);
  const prevSnap = snap.isCurrent ? computeSnapshot('2024-08', allInstitutes) : null;
  const activeMonth = REPORT_MONTHS.find(m => m.key === openMonth);

  return (
    <div>
      <span onClick={() => setOpenMonth(null)} style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.gold, cursor: 'pointer', display: 'inline-block', marginBottom: 16 }}>← Back to reports</span>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {REPORT_MONTHS.map(m => (
          <button key={m.key} type="button" onClick={() => setOpenMonth(m.key)} style={{ fontFamily: T.sans, fontSize: '0.78rem', padding: '6px 16px', borderRadius: 100, cursor: 'pointer', border: `1px solid ${m.key === openMonth ? T.gold : T.line}`, background: m.key === openMonth ? T.gold : 'transparent', color: m.key === openMonth ? T.felt0 : T.textSec, fontWeight: m.key === openMonth ? 600 : 400 }}>{m.label}</button>
        ))}
      </div>
      <ReportDoc snap={snap} prevSnap={prevSnap} pdf={activeMonth!.pdf} />
    </div>
  );
}

// ========================================================= ADMINISTRATION ===

const ROLES = [
  { role: 'Foundation / CSR Head', focus: 'Portfolio-level view — spend, learning outcomes, gaps, budget reallocation, compliance risk.' },
  { role: 'Programme Manager', focus: 'Institution-level operational visibility — assessment cycles, declining cohorts, teacher support, milestones.' },
  { role: 'Institution Admin / Principal / Trade Head', focus: 'Institution performance vs. peers, subjects/topics needing remedial focus, learners needing intervention.' },
  { role: 'Finance / CFO Team', focus: 'Budget vs. actual, cost per learner assessed, cost per learning-gain-point.' },
  { role: 'Monitoring & Evaluation Team', focus: 'LDI trend pre/post intervention, primary evidence trail, cross-check against partner self-reports.' },
  { role: 'Compliance / Governance Team', focus: 'Documents, approvals, reporting deadlines, audit trail.' },
  { role: 'Teacher / Field Facilitator', focus: 'Assessment scheduling, learner rosters, class-level Learning Depth Radar.' },
  { role: 'System Administrator', focus: 'Users, roles, permissions, domain configuration, notifications, integrations.' },
] as const;

export function AdministrationPanel() {
  return (
    <div>
      <h2 style={pageH}>Administration</h2>
      <p style={pageP}>Users, roles, and domain configuration for the platform.</p>
      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead><tr>{['Role', 'Primary focus'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
          <tbody>
            {ROLES.map(r => (
              <tr key={r.role}>
                <td style={{ ...tdStyle, color: T.text, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.role}</td>
                <td style={tdStyle}>{r.focus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
