'use client';

import Link from 'next/link';
import { T, cardStyle } from '@/lib/theme';
import { ew, PillarHeader } from '../_ui';

const TILES = [
  {
    key: 'assessments', title: 'Assessments', href: '/use-cases/csr/assessments',
    desc: 'Start a live diagnostic assessment for this cohort.', cta: 'Start Assessments',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="4" width="12" height="17" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 12.5l1.8 1.8L15 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'analytics', title: 'Analytics', href: '/use-cases/csr/analytics', tag: 'Cognitive · Behavioral',
    desc: 'Explore cognitive and behavioural performance patterns across all delivery points.', cta: 'View Analytics',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M5 19V5M5 19h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="8" y="12" width="2.4" height="7" fill="currentColor" />
        <rect x="12.5" y="8" width="2.4" height="11" fill="currentColor" />
        <rect x="17" y="14.5" width="2.4" height="4.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'insights', title: 'Insights', href: '/use-cases/csr/insights', tag: 'Money · Reputation · Attention · Pulse',
    desc: 'See funding, consistency, urgent attention items, and every school at a glance.', cta: 'View Insights',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="13" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="13" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
] as const;

export default function AssessmentsAnalyticsHubPage() {
  return (
    <div style={{ paddingTop: 130, paddingBottom: 100 }}>
      <PillarHeader backHref="/use-cases/csr" backLabel="← CSR" minimal />

      <div style={{ maxWidth: 900, margin: '56px auto 0', padding: '0 clamp(20px,4vw,48px)', textAlign: 'center' as const }}>
        <span style={ew()}>Dronalytics</span>
        <h1 style={{ fontFamily: T.serif, fontWeight: 700, fontSize: 'clamp(32px,4.4vw,48px)', color: T.text, marginTop: 14 }}>
          Assessments &amp; Analytics
        </h1>
        <p style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: '1.02rem', color: T.textSec, marginTop: 10 }}>
          Vocational Skill Diagnostics
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, marginTop: 44, textAlign: 'left' as const }}>
          {TILES.map(tile => (
            <Link key={tile.key} href={tile.href} style={{ textDecoration: 'none', display: 'block' }}>
              <div style={cardStyle({ padding: 28, height: '100%' })}>
                <span style={ew()}>Dronalytics</span>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', border: `1px solid ${T.lineGold}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.gold, margin: '20px 0 18px',
                }}>
                  {tile.icon}
                </div>
                <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.35rem', color: T.text }}>{tile.title}</div>
                {'tag' in tile && <div style={{ fontFamily: T.mono, fontSize: '0.66rem', letterSpacing: '0.06em', color: T.textDim, marginTop: 6 }}>{tile.tag}</div>}
                <p style={{ fontFamily: T.sans, fontSize: '0.84rem', lineHeight: 1.6, color: T.textSec, marginTop: 12, minHeight: 40 }}>{tile.desc}</p>
                <div style={{ marginTop: 16, fontFamily: T.sans, fontWeight: 600, fontSize: '0.82rem', color: T.gold }}>
                  {tile.cta} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
