'use client';

import { useState } from 'react';
import Link from 'next/link';
import { T, cardStyle } from '@/lib/theme';
import { TRACKS } from '../_assessment-data';
import { PillarHeader } from '../_ui';
import { CSRSidebarShell } from '../_shell';
import { INSTITUTES } from '../_platform-data';
import { AssessmentsPanel } from '../_platform-panels';

export default function AssessmentsPickerPage() {
  const [showStats, setShowStats] = useState(false);

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader backHref="/use-cases/csr" backLabel="← CSR" minimal />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <span style={{ fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.32em', color: T.gold, textTransform: 'uppercase' as const, display: 'block' }}>
          Assessment Tracks
        </span>
        <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(28px,4vw,44px)', color: T.text, lineHeight: 1.2, marginTop: 14 }}>
          Choose your assessment
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginTop: 32 }}>
          {TRACKS.map(t => (
            <div key={t.key} style={cardStyle({ padding: 28 })}>
              <span style={{ fontFamily: T.mono, fontSize: '0.66rem', letterSpacing: '0.1em', color: T.textDim }}>{t.tradeCode} · NSQF {t.nsqfLevel}</span>
              <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.4rem', color: T.text, marginTop: 8 }}>{t.label}</div>
              <div style={{
                display: 'inline-block', marginTop: 10, fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec,
                background: T.felt0, border: `1px solid ${T.line}`, borderRadius: 100, padding: '5px 14px',
              }}>
                {t.sector}
              </div>
              <p style={{ fontFamily: T.sans, fontSize: '0.86rem', color: T.textSec, marginTop: 16, lineHeight: 1.6 }}>
                Two hands, six Bloom-aligned questions each — declare where you stand before each one.
              </p>
              <Link
                href={`/use-cases/csr/assessments/${t.key}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, textDecoration: 'none',
                  fontFamily: T.sans, fontWeight: 600, fontSize: '0.85rem', padding: '12px 22px', borderRadius: 100,
                  border: `1px solid ${T.gold}`, background: T.gold, color: T.felt0,
                }}
              >
                Select →
              </Link>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle({ padding: 'clamp(22px,4vw,30px)' }), marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const }}>
          <div>
            <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.3rem', color: T.text }}>Assessment Statistics</div>
            <p style={{ fontFamily: T.sans, fontSize: '0.82rem', color: T.textSec, marginTop: 6, maxWidth: 560 }}>
              How the network is doing across every scheduled and completed assessment — by subject and trade domain.
            </p>
          </div>
          <button
            type="button" onClick={() => setShowStats(s => !s)}
            style={{
              fontFamily: T.sans, fontWeight: 600, fontSize: '0.85rem', padding: '12px 22px', borderRadius: 100,
              border: `1px solid ${T.gold}`, background: showStats ? 'transparent' : T.gold, color: showStats ? T.gold : T.felt0,
              cursor: 'pointer', whiteSpace: 'nowrap' as const,
            }}
          >
            {showStats ? 'Hide statistics' : 'View statistics →'}
          </button>
        </div>

        {showStats && (
          <div style={{ marginTop: 32 }}>
            <AssessmentsPanel rows={INSTITUTES} showCTA={false} />
          </div>
        )}
      </div>
    </div>
    </CSRSidebarShell>
  );
}
