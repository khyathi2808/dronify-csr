'use client';

import Link from 'next/link';
import { T, cardStyle } from '@/lib/theme';
import { ATRISK_SCHOOLS, MONITOR_SCHOOLS, OUTLIERS, SCHOOL_PROGRAMME, SCHOOLS } from '../_school-data';
import { ew, PillarHeader, TONE } from '../_ui';
import { CSRSidebarShell } from '../_shell';

function statusColor(status: (typeof SCHOOLS)[number]['status']) {
  return status === 'atrisk' ? TONE.red.fg : status === 'monitor' ? TONE.amber.fg : TONE.green.fg;
}

const CARDS = [
  { key: 'money', eyebrow: 'Money', q: 'Is our funding actually improving how children learn?', href: '/use-cases/csr/insights/money' },
  { key: 'reputation', eyebrow: 'Reputation', q: 'Is that improvement happening everywhere we fund, or just a few schools?', href: '/use-cases/csr/insights/reputation' },
  { key: 'attention', eyebrow: 'Attention', q: 'Which schools need a closer look this month?', href: '/use-cases/csr/insights/attention' },
  { key: 'pulse', eyebrow: 'Pulse', q: "What's the status of every school we fund, right now?", href: '/use-cases/csr/insights/pulse' },
] as const;

export default function CSRInsightsOverviewPage() {
  const top7 = [...SCHOOLS].sort((a, b) => b.growth - a.growth).slice(0, 7);
  const minG = Math.min(...SCHOOLS.map(s => s.growth));
  const maxG = Math.max(...SCHOOLS.map(s => s.growth));

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader
        backHref="/use-cases/csr" backLabel="← CSR"
        subtitle={`CSR-funded schools · ${SCHOOL_PROGRAMME.schools} schools · ${SCHOOL_PROGRAMME.towns} towns`}
        officer={null}
      />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <span style={ew()}>School Impact Monitor</span>
        <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(28px,4vw,44px)', color: T.text, lineHeight: 1.2, maxWidth: 780, marginTop: 18 }}>
          Know how every school is doing — without sending someone to check.
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '1rem', lineHeight: 1.7, color: T.textSec, maxWidth: 720, marginTop: 16 }}>
          Four simple views, all built from the same student learning data — enough to see whether your funding is actually changing children&apos;s lives, in schools you may only ever see in a report.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, marginTop: 40 }}>
          {CARDS.map(card => (
            <Link key={card.key} href={card.href} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={cardStyle({ padding: 24, height: '100%' })}>
                <span style={ew()}>{card.eyebrow}</span>
                <h3 style={{ fontFamily: T.serif, fontWeight: 500, fontSize: '1.15rem', color: T.text, lineHeight: 1.35, margin: '10px 0 16px' }}>
                  {card.q}
                </h3>

                {card.key === 'money' && (
                  <div style={{ height: 40, display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 10 }}>
                    {top7.map(s => (
                      <div key={s.name} title={s.name} style={{
                        flex: 1, minWidth: 6, borderRadius: '2px 2px 0 0',
                        background: statusColor(s.status), opacity: 0.75,
                        height: `${Math.max(8, (s.growth + 6) * 1.3)}px`,
                      }} />
                    ))}
                  </div>
                )}

                {card.key === 'reputation' && (
                  <div style={{ position: 'relative' as const, height: 20, background: T.card, borderRadius: 4, marginBottom: 10 }}>
                    {SCHOOLS.map(s => {
                      const pct = ((s.growth - minG) / (maxG - minG)) * 100;
                      return (
                        <span key={s.name} title={s.name} style={{
                          position: 'absolute' as const, top: 6, left: `calc(${pct}% - 4px)`,
                          width: 8, height: 8, borderRadius: '50%',
                          background: s.growth < 0 ? TONE.red.fg : TONE.green.fg,
                        }} />
                      );
                    })}
                  </div>
                )}

                {card.key === 'attention' && (
                  <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: T.serif, fontSize: '1.3rem', color: TONE.red.fg }}>{ATRISK_SCHOOLS.length}</div>
                      <div style={{ fontFamily: T.sans, fontSize: '0.68rem', color: T.textDim }}>at risk</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: T.serif, fontSize: '1.3rem', color: TONE.amber.fg }}>{MONITOR_SCHOOLS.length}</div>
                      <div style={{ fontFamily: T.sans, fontSize: '0.68rem', color: T.textDim }}>need a look</div>
                    </div>
                  </div>
                )}

                {card.key === 'pulse' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3, marginBottom: 10, maxWidth: 130 }}>
                    {SCHOOLS.map(s => (
                      <span key={s.name} title={s.name} style={{
                        width: 14, height: 14, borderRadius: 3, background: statusColor(s.status), opacity: 0.75,
                      }} />
                    ))}
                  </div>
                )}

                <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textDim }}>
                  {card.key === 'money' && `${SCHOOLS.length} schools ranked by improvement`}
                  {card.key === 'reputation' && `${OUTLIERS.length} school${OUTLIERS.length === 1 ? '' : 's'} need${OUTLIERS.length === 1 ? 's' : ''} a closer look`}
                  {card.key === 'attention' && 'Simple alerts, plain reasons'}
                  {card.key === 'pulse' && `${SCHOOLS.length} schools live on the map`}
                </div>

                <div style={{ marginTop: 16, fontFamily: T.sans, fontWeight: 600, fontSize: '0.82rem', color: T.gold }}>
                  View insights →
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p style={{ fontFamily: T.sans, fontSize: '0.76rem', color: T.textDim, lineHeight: 1.6, maxWidth: 700, marginTop: 32 }}>
          All figures on every screen are sample data standing in for what you&apos;d see once this is connected to real assessment results — see the note at the bottom of each screen for what&apos;s live today versus what&apos;s still to come.
        </p>
      </div>
    </div>
    </CSRSidebarShell>
  );
}
