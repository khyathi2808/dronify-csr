'use client';

import { useState } from 'react';
import { T, cardStyle } from '@/lib/theme';
import { NET_AVG_GROWTH, SCHOOL_PROGRAMME, SCHOOLS, STRONG_COUNT, TOTAL_STUDENTS } from '../../_school-data';
import { ew, PillarHeader, StatTile, TierNote, TONE } from '../../_ui';
import { CSRSidebarShell } from '../../_shell';

function bandFor(growth: number): 'green' | 'amber' | 'red' {
  if (growth >= 15) return 'green';
  if (growth >= 0) return 'amber';
  return 'red';
}

export default function MoneyInsightsPage() {
  const [openName, setOpenName] = useState<string | null>(null);

  const rows = [...SCHOOLS].sort((a, b) => b.growth - a.growth);
  const minG = Math.min(...rows.map(r => r.growth), -10);
  const maxG = Math.max(...rows.map(r => r.growth), 25);
  const lo = Math.floor(minG / 10) * 10;
  const hi = Math.ceil(maxG / 10) * 10;
  const span = hi - lo;
  const zeroPct = ((0 - lo) / span) * 100;

  const ticks: number[] = [];
  for (let t = lo; t <= hi; t += 10) ticks.push(t);

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader
        downloadHref="/reports/csr-money-report.pdf" backHref="/use-cases/csr/insights" backLabel="← Insights"
        subtitle={`CSR-funded schools · ${SCHOOL_PROGRAMME.schools} schools · ${SCHOOL_PROGRAMME.towns} towns`}
        officer={null}
      />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(28px,4vw,44px)', color: T.text, lineHeight: 1.2, maxWidth: 780 }}>
          Is our funding actually improving how children learn?
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '1rem', lineHeight: 1.7, color: T.textSec, maxWidth: 720, marginTop: 16 }}>
          Every school gets a Progress Score — the share of students now reading and doing basic maths at the level expected for their grade. What matters most isn&apos;t where a school stands today, but how much it&apos;s improved since we started funding it. This ranks every school by that improvement. Cost per student isn&apos;t tracked yet — shown as pending until it&apos;s connected.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginTop: 36 }}>
          <StatTile value={TOTAL_STUDENTS.toLocaleString()} label="Students reached" />
          <StatTile value={`${NET_AVG_GROWTH >= 0 ? '+' : ''}${NET_AVG_GROWTH} pts`} label="Average improvement" />
          <StatTile value={`${STRONG_COUNT} of ${SCHOOLS.length}`} label="Schools improving well" />
          <div style={cardStyle({ padding: '20px 22px', borderStyle: 'dashed' as const })}>
            <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.9rem', color: T.textDim, lineHeight: 1, fontStyle: 'italic' }}>pending</div>
            <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 8 }}>Cost per student</div>
          </div>
        </div>

        <div style={{ marginTop: 44 }}>
          <span style={ew(T.textDim)}>Ranked by improvement since funding started — click a row for the breakdown</span>

          <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', marginTop: 20, marginBottom: 6 }}>
            <div />
            <div style={{ position: 'relative' as const, height: 16 }}>
              {ticks.map(t => (
                <span key={t} style={{
                  position: 'absolute' as const, top: 0, left: `${((t - lo) / span) * 100}%`,
                  transform: t === lo ? 'none' : t === hi ? 'translateX(-100%)' : 'translateX(-50%)',
                  fontFamily: T.mono, fontSize: '0.62rem', color: T.textDim,
                }}>
                  {t > 0 ? `+${t}` : t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
            {rows.map(s => {
              const t = TONE[bandFor(s.growth)];
              const open = openName === s.name;
              const pct = ((s.growth - lo) / span) * 100;
              const left = s.growth >= 0 ? zeroPct : pct;
              const width = s.growth >= 0 ? pct - zeroPct : zeroPct - pct;
              return (
                <div key={s.name}>
                  <button
                    type="button"
                    onClick={() => setOpenName(open ? null : s.name)}
                    style={{
                      display: 'block', width: '100%', padding: '9px 4px', border: 'none', background: 'transparent',
                      cursor: 'pointer', borderBottom: `1px solid ${T.line}`, textAlign: 'left' as const, font: 'inherit',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', gap: 14, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.8rem', color: open ? T.gold : T.text, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                        <div style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim, marginTop: 2 }}>{s.tier} · {s.level}</div>
                      </div>
                      <span style={{ position: 'relative' as const, height: 22 }}>
                        <span style={{ position: 'absolute' as const, left: `${zeroPct}%`, top: 0, bottom: 0, width: 2, background: T.line }} />
                        <span style={{
                          position: 'absolute' as const, top: 3, bottom: 3, left: `${left}%`, width: `${width}%`,
                          background: t.fg, borderRadius: 3,
                        }} />
                        <span style={{
                          position: 'absolute' as const, top: 0, bottom: 0, display: 'flex', alignItems: 'center',
                          fontFamily: T.mono, fontWeight: 700, fontSize: '0.72rem', color: t.fg,
                          ...(s.growth >= 0 ? { left: `calc(${pct}% + 8px)` } : { right: `calc(${100 - pct}% + 8px)` }),
                        }}>
                          {s.growth > 0 ? `+${s.growth}` : s.growth}
                        </span>
                      </span>
                    </div>
                  </button>
                  {open && (
                    <div style={{ padding: '10px 4px 16px 4px', display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                      <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textSec, background: T.card2, border: `1px solid ${T.line}`, borderRadius: 100, padding: '5px 12px' }}>
                        {s.students} students
                      </span>
                      <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textSec, background: T.card2, border: `1px solid ${T.line}`, borderRadius: 100, padding: '5px 12px' }}>
                        learning level {s.baseline} when funding started → {s.current} now
                      </span>
                      <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim, fontStyle: 'italic', background: T.card, border: `1px dashed ${T.line}`, borderRadius: 100, padding: '5px 12px' }}>
                        cost/student: pending
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <TierNote
          items={[
            { tag: 'REAL', text: 'The Progress Score per student — this is Drona\'s core measurement, already built and proven.' },
            { tag: 'DERIVABLE', text: 'Comparing a school\'s score now against its score when funding started (the improvement figure) is a simple next step once two rounds of real assessment data exist.' },
            { tag: 'NEEDS NEW DATA SOURCE', text: 'Cost per student — Drona measures learning, not spend; this needs your own finance data joined in before it\'s real.' },
            { tag: 'INVENTED', text: 'All numbers on this screen are illustrative — no live feed exists yet.' },
          ]}
        />
      </div>
    </div>
    </CSRSidebarShell>
  );
}
