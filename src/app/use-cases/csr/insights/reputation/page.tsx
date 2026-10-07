'use client';

import { T } from '@/lib/theme';
import { OUTLIERS, SCHOOL_PROGRAMME, SCHOOLS } from '../../_school-data';
import { PillarHeader, TierNote, TONE, ToneTag } from '../../_ui';
import { CSRSidebarShell } from '../../_shell';

export default function ReputationInsightsPage() {
  const strongCount = SCHOOLS.length - OUTLIERS.length;
  const pct = Math.round((strongCount / SCHOOLS.length) * 100);
  const pctColor = pct < 70 ? TONE.red.fg : TONE.green.fg;

  const sorted = [...SCHOOLS].sort((a, b) => b.growth - a.growth);

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader
        downloadHref="/reports/csr-reputation-report.pdf" backHref="/use-cases/csr/insights" backLabel="← Insights"
        subtitle={`CSR-funded schools · ${SCHOOL_PROGRAMME.schools} schools · ${SCHOOL_PROGRAMME.towns} towns`}
        officer={null}
      />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(28px,4vw,44px)', color: T.text, lineHeight: 1.2, maxWidth: 780 }}>
          Is that improvement happening everywhere we fund, or just a few schools?
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '1rem', lineHeight: 1.7, color: T.textSec, maxWidth: 720, marginTop: 16 }}>
          It&apos;s not enough for a handful of flagship schools to show great results. For this to be a credible impact story, real improvement needs to show up everywhere we put money in — not just the schools that happen to get visited. This checks every school and calls out, in plain terms, the ones where that hasn&apos;t happened yet.
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 36, background: T.card2, border: `1px solid ${T.line}`, borderRadius: 16, padding: 'clamp(20px,4vw,28px) clamp(24px,4vw,32px)', flexWrap: 'wrap' as const }}>
          <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: 'clamp(40px,6vw,60px)', color: pctColor, lineHeight: 1 }}>{pct}%</div>
          <p style={{ fontFamily: T.sans, fontSize: '0.92rem', color: T.textSec, maxWidth: 460, lineHeight: 1.6 }}>
            <b style={{ color: T.text }}>{strongCount} of {SCHOOLS.length} schools</b> are showing real, meaningful improvement in how children read and do basic maths. The other <b style={{ color: T.text }}>{OUTLIERS.length}</b> are explained below.
          </p>
        </div>

        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.9rem', color: T.text, marginBottom: 14 }}>
            {OUTLIERS.length === 0
              ? 'Every school is showing real improvement'
              : `${OUTLIERS.length} school${OUTLIERS.length === 1 ? '' : 's'} need${OUTLIERS.length === 1 ? 's' : ''} a closer look`}
          </div>

          {OUTLIERS.length === 0 ? (
            <div style={{ background: TONE.green.bg, border: `1px solid ${TONE.green.border}`, borderRadius: 12, padding: '16px 20px' }}>
              <span style={{ fontFamily: T.sans, fontSize: '0.86rem', color: TONE.green.fg }}>No schools need a closer look on this measure right now.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {OUTLIERS.map(s => {
                const enrollNote = s.enrollChange <= -10
                  ? ' Enrolment here has also dropped noticeably, which may be part of the story.'
                  : '';
                return (
                  <div key={s.name} style={{ background: T.card2, border: `1px solid ${T.line}`, borderLeft: `4px solid ${TONE.red.fg}`, borderRadius: '0 12px 12px 0', padding: '14px 18px' }}>
                    <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.92rem', color: T.text }}>{s.name}</div>
                    <div style={{ fontFamily: T.mono, fontSize: '0.68rem', color: T.textDim, marginTop: 3, marginBottom: 8 }}>{s.tier} · {s.level}</div>
                    <p style={{ fontFamily: T.sans, fontSize: '0.84rem', color: T.textSec, lineHeight: 1.6, margin: 0 }}>
                      Learning levels here have barely moved, or slipped, since we started funding — worth understanding why before assuming the programme is having the same impact as it is elsewhere.{enrollNote}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <details style={{ marginTop: 36, background: T.card2, border: `1px solid ${T.line}`, borderRadius: 16, padding: 22 }}>
          <summary style={{ cursor: 'pointer', fontFamily: T.serif, fontWeight: 600, fontSize: '1.02rem', color: T.text }}>
            See how all schools compare
          </summary>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' as const }}>
            {sorted.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 2px', borderBottom: `1px solid ${T.line}`, gap: 12, flexWrap: 'wrap' as const }}>
                <div>
                  <span style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.84rem', color: T.text }}>{s.name}</span>
                  <span style={{ fontFamily: T.mono, fontSize: '0.66rem', color: T.textDim, marginLeft: 10 }}>{s.tier} · {s.level}</span>
                </div>
                <ToneTag tone={s.status === 'atrisk' ? 'red' : s.status === 'monitor' ? 'amber' : 'green'}>
                  {s.status === 'atrisk' ? 'At risk' : s.status === 'monitor' ? 'Needs a look' : 'On track'}
                </ToneTag>
              </div>
            ))}
          </div>
        </details>

        <TierNote
          items={[
            { tag: 'DERIVABLE', text: 'Checking how many schools show real improvement is a simple next step once real data exists — no new measurement, just a different way of looking at the same scores.' },
            { tag: 'EXTERNAL CONTEXT', text: 'Town names shown are real tier-2/tier-3 towns; specific school names are illustrative labels, not real schools.' },
            { tag: 'INVENTED', text: 'The specific scores and which schools need a closer look are illustrative until real school-level data exists.' },
          ]}
        />
      </div>
    </div>
    </CSRSidebarShell>
  );
}
