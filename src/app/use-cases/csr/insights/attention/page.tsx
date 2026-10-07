'use client';

import { useState } from 'react';
import { T, cardStyle } from '@/lib/theme';
import { ATRISK_SCHOOLS, MONITOR_SCHOOLS, SCHOOL_PROGRAMME, type School } from '../../_school-data';
import { PillarHeader, TierNote, TONE } from '../../_ui';
import { CSRSidebarShell } from '../../_shell';

function evaluateRules(s: School): string[] {
  const rules: string[] = [];
  if (s.growth < 5) rules.push('little to no real improvement in learning since we started funding here');
  else if (s.growth < 15) rules.push('some improvement, but slower than most schools we fund');
  if (s.enrollChange <= -10) rules.push('enrolment has dropped noticeably — worth checking the school is still fully functioning');
  if (rules.length === 0) rules.push('overall progress here is trending below the rest of the schools we fund');
  return rules;
}

const ACTION = {
  atrisk: 'Worth a direct, lightweight check-in — a call with the local partner or a video visit, rather than assuming a full site visit is needed.',
  monitor: 'Keep watching over the next couple of assessment cycles before deciding if this school needs extra support.',
} as const;

export default function AttentionInsightsPage() {
  const [openName, setOpenName] = useState<string | null>(null);

  const flagged = [
    ...[...ATRISK_SCHOOLS].sort((a, b) => a.growth - b.growth),
    ...[...MONITOR_SCHOOLS].sort((a, b) => a.growth - b.growth),
  ];

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader
        downloadHref="/reports/csr-attention-report.pdf" backHref="/use-cases/csr/insights" backLabel="← Insights"
        subtitle={`CSR-funded schools · ${SCHOOL_PROGRAMME.schools} schools · ${SCHOOL_PROGRAMME.towns} towns`}
        officer={null}
      />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(28px,4vw,44px)', color: T.text, lineHeight: 1.2, maxWidth: 780 }}>
          Which schools need a closer look this month?
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '1rem', lineHeight: 1.7, color: T.textSec, maxWidth: 720, marginTop: 16 }}>
          Instead of scanning every number — or visiting every school — this narrows straight to the ones that crossed a real concern this month, and explains why in plain language. Collapsed by default; click a card for the full reason and what to do about it.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <span style={{
            fontFamily: T.mono, fontWeight: 700, fontSize: '0.78rem', color: TONE.red.fg,
            background: TONE.red.bg, border: `1px solid ${TONE.red.border}`, borderRadius: 100, padding: '8px 16px',
          }}>
            {ATRISK_SCHOOLS.length} At risk
          </span>
          <span style={{
            fontFamily: T.mono, fontWeight: 700, fontSize: '0.78rem', color: TONE.amber.fg,
            background: TONE.amber.bg, border: `1px solid ${TONE.amber.border}`, borderRadius: 100, padding: '8px 16px',
          }}>
            {MONITOR_SCHOOLS.length} Needs a look
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, marginTop: 30 }}>
          {flagged.map(s => {
            const rules = evaluateRules(s);
            const severity = s.status === 'atrisk' ? 'atrisk' : 'monitor';
            const t = severity === 'atrisk' ? TONE.red : TONE.amber;
            const open = openName === s.name;
            const summary = `${rules[0]}${rules.length > 1 ? ` (+${rules.length - 1} more)` : ''}`;
            return (
              <div key={s.name} style={cardStyle({ padding: 0, borderLeft: `3px solid ${t.fg}`, overflow: 'hidden' })}>
                <button
                  type="button"
                  onClick={() => setOpenName(open ? null : s.name)}
                  style={{
                    display: 'block', width: '100%', padding: '18px 22px', border: 'none', background: 'transparent',
                    cursor: 'pointer', textAlign: 'left' as const, font: 'inherit',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' as const }}>
                    <div>
                      <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.1rem', color: T.text }}>{s.name}</div>
                      <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 4 }}>{s.tier} · {s.level}</div>
                    </div>
                    <span style={{
                      fontFamily: T.mono, fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.06em', color: t.fg,
                      background: t.bg, border: `1px solid ${t.border}`, borderRadius: 100, padding: '5px 12px', flexShrink: 0,
                    }}>
                      {severity === 'atrisk' ? 'AT RISK' : 'NEEDS A LOOK'}
                    </span>
                  </div>
                  <p style={{ fontFamily: T.sans, fontSize: '0.84rem', color: T.textSec, marginTop: 10, lineHeight: 1.55 }}>{summary}</p>
                </button>
                {open && (
                  <div style={{ padding: '0 22px 22px 22px' }}>
                    <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 16, display: 'grid', gap: 12 }}>
                      <div>
                        <span style={{ fontFamily: T.mono, fontSize: '0.66rem', letterSpacing: '0.14em', color: t.fg }}>FIRED BECAUSE</span>
                        <p style={{ fontFamily: T.sans, fontSize: '0.86rem', color: T.textSec, lineHeight: 1.6, marginTop: 4 }}>
                          Fired because: {rules.join('; ')}.
                        </p>
                      </div>
                      <div>
                        <span style={{ fontFamily: T.mono, fontSize: '0.66rem', letterSpacing: '0.14em', color: t.fg }}>RECOMMENDED ACTION</span>
                        <p style={{ fontFamily: T.sans, fontSize: '0.86rem', color: T.textSec, lineHeight: 1.6, marginTop: 4 }}>
                          {ACTION[severity]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <TierNote
          items={[
            { tag: 'REAL', text: 'Every flag shown here is based on a simple, already-defined rule — ready to run the moment real assessment data comes in.' },
            { tag: 'DERIVABLE', text: 'Sorting flagged schools by how urgent they are is a simple next step on top of those rules.' },
            { tag: 'INVENTED', text: 'Which specific schools are flagged this month, and why, is illustrative — this becomes real the moment live school data exists.' },
          ]}
        />
      </div>
    </div>
    </CSRSidebarShell>
  );
}
