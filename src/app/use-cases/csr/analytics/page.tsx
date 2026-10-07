'use client';

import { useState } from 'react';
import Link from 'next/link';
import { T, cardStyle } from '@/lib/theme';
import { TOTAL_N } from '../_data';
import { METRICS } from '../_analytics-data';
import { PillarHeader } from '../_ui';
import { CSRSidebarShell } from '../_shell';
import { INSTITUTES } from '../_platform-data';
import { LearningAnalyticsPanel } from '../_platform-panels';

export default function AnalyticsPickerPage() {
  const [tab, setTab] = useState<'Cognitive' | 'Behavioral'>('Cognitive');
  const [showStats, setShowStats] = useState(false);

  const shown = METRICS.filter(m => m.category === tab);

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader backHref="/use-cases/csr" backLabel="← CSR" minimal />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <h1 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(28px,4vw,44px)', color: T.text, lineHeight: 1.2 }}>
          Cognitive & behavioral analytics.
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '1rem', lineHeight: 1.7, color: T.textSec, maxWidth: 640, marginTop: 16 }}>
          Ten metrics, drawn from the same {TOTAL_N}-trainee cohort across 14 Tata STRIVE delivery points — how deeply they understand, and how they decide.
        </p>

        <div style={{ display: 'inline-flex', marginTop: 32, borderRadius: 100, border: `1px solid ${T.line}`, padding: 4 }}>
          {(['Cognitive', 'Behavioral'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontFamily: T.sans, fontWeight: 600, fontSize: '0.85rem', padding: '9px 22px', borderRadius: 100,
                border: 'none', cursor: 'pointer',
                background: tab === t ? T.gold : 'transparent',
                color: tab === t ? T.felt0 : T.textSec,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16, marginTop: 28 }}>
          {shown.map(m => (
            <Link key={m.key} href={`/use-cases/csr/analytics/${m.key}`} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={cardStyle({ padding: 24, height: '100%' })}>
                <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.15rem', color: T.text }}>{m.name}</div>
                <p style={{ fontFamily: T.sans, fontSize: '0.82rem', color: T.textSec, marginTop: 8, lineHeight: 1.55 }}>{m.title}</p>
                <div style={{ marginTop: 16, fontFamily: T.sans, fontWeight: 600, fontSize: '0.8rem', color: T.gold }}>View chart →</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ ...cardStyle({ padding: 'clamp(22px,4vw,30px)' }), marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const }}>
          <div>
            <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.3rem', color: T.text }}>Learning Analytics</div>
            <p style={{ fontFamily: T.sans, fontSize: '0.82rem', color: T.textSec, marginTop: 6, maxWidth: 560 }}>
              The Learning Depth Radar, Confidence vs Competency, and Learning Gap Intelligence — rolled up across the whole portfolio.
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
            <LearningAnalyticsPanel rows={INSTITUTES} showCTA={false} />
          </div>
        )}
      </div>
    </div>
    </CSRSidebarShell>
  );
}
