'use client';

import { useState } from 'react';
import { T, cardStyle } from '@/lib/theme';
import { SCHOOL_PROGRAMME, SCHOOLS, TIERS, type School } from '../../_school-data';
import { PillarHeader, TierNote, TONE } from '../../_ui';
import { CSRSidebarShell } from '../../_shell';

const statusTone = { ontrack: 'green', monitor: 'amber', atrisk: 'red' } as const;
const statusLabel = { ontrack: 'On track', monitor: 'Needs a look', atrisk: 'At risk' } as const;

export default function PulseInsightsPage() {
  const [activeTier, setActiveTier] = useState<string>('All towns');
  const [selected, setSelected] = useState<School | null>(null);

  const shown = activeTier === 'All towns' ? SCHOOLS : SCHOOLS.filter(s => s.tier === activeTier);

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader
        downloadHref="/reports/csr-pulse-report.pdf" backHref="/use-cases/csr/insights" backLabel="← Insights"
        subtitle={`CSR-funded schools · ${SCHOOL_PROGRAMME.schools} schools · ${SCHOOL_PROGRAMME.towns} towns`}
        officer={null}
      />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(28px,4vw,44px)', color: T.text, lineHeight: 1.2, maxWidth: 780 }}>
          What&apos;s the status of every school we fund, right now?
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '1rem', lineHeight: 1.7, color: T.textSec, maxWidth: 720, marginTop: 16 }}>
          See every school we fund as a simple map instead of a spreadsheet — colour tells the story first, then click any school for its details. No travel required to know where things stand.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 22, marginTop: 28 }}>
          {(['ontrack', 'monitor', 'atrisk'] as const).map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: TONE[statusTone[s]].fg, display: 'inline-block' }} />
              <span style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec }}>{statusLabel[s]}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginTop: 24 }}>
          {['All towns', ...TIERS].map(tier => (
            <button
              key={tier}
              type="button"
              onClick={() => setActiveTier(tier)}
              style={{
                fontFamily: T.sans, fontWeight: 600, fontSize: '0.76rem', padding: '8px 14px', borderRadius: 100,
                border: `1px solid ${activeTier === tier ? T.gold : T.line}`,
                background: activeTier === tier ? T.gold : 'transparent',
                color: activeTier === tier ? T.felt0 : T.textSec, cursor: 'pointer',
              }}
            >
              {tier}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 26 }}>
          {shown.map(s => {
            const t = TONE[statusTone[s.status]];
            const isSelected = selected?.name === s.name;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => setSelected(isSelected ? null : s)}
                style={{
                  ...cardStyle({ padding: 18, background: t.bg, borderColor: isSelected ? T.gold : t.border }),
                  textAlign: 'left' as const, cursor: 'pointer', font: 'inherit', width: '100%',
                }}
              >
                <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.86rem', color: T.text }}>{s.name}</div>
                <div style={{ fontFamily: T.sans, fontSize: '0.7rem', color: T.textSec, marginTop: 3 }}>{s.tier} · {s.level}</div>
                <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '2rem', color: t.fg, marginTop: 10 }}>{s.current}</div>
                <div style={{ fontFamily: T.mono, fontSize: '0.68rem', letterSpacing: '0.04em', color: t.fg, marginTop: 6 }}>
                  {statusLabel[s.status]} · {s.students} students
                </div>
              </button>
            );
          })}
        </div>

        {selected && (() => {
          const t = TONE[statusTone[selected.status]];
          return (
            <div style={{ ...cardStyle({ padding: 22, borderColor: t.border }), marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' as const }}>
                <div>
                  <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.15rem', color: T.text }}>{selected.name}</div>
                  <div style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec, marginTop: 4 }}>{selected.tier} · {selected.level}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim, background: 'transparent', border: `1px solid ${T.line}`, borderRadius: 100, padding: '6px 12px', cursor: 'pointer' }}
                >
                  ✕ close
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 14, marginTop: 20 }}>
                {[
                  ['Students', String(selected.students)],
                  ['Progress score', String(selected.current)],
                  ['Status', statusLabel[selected.status]],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.5rem', color: T.text }}>{value}</div>
                    <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textSec, marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <p style={{ fontFamily: T.sans, fontStyle: 'italic', fontSize: '0.8rem', color: T.textDim, marginTop: 28 }}>
          This is a sample view — once connected, it would update automatically as new assessments come in.
        </p>

        <TierNote
          items={[
            { tag: 'REAL', text: 'Every stat shown (student count, progress score, status) is something Drona already measures once real data is connected.' },
            { tag: 'DERIVABLE', text: "The tier filter — reuses the school's existing location tag, just exposed as a client-side filter." },
            { tag: 'NEEDS NEW DATA SOURCE', text: "A genuinely 'live' view needs a real-time sync from each school, which doesn't exist yet — today this would refresh on whatever cadence assessments are submitted and graded." },
          ]}
        />
      </div>
    </div>
    </CSRSidebarShell>
  );
}
