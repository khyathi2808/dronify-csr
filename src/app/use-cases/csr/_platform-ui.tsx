'use client';

import type { CSSProperties, ReactNode } from 'react';
import { T, cardStyle } from '@/lib/theme';
import { TONE, ToneTag, type Tone } from './_ui';
import { fmtL, type InstituteStatus } from './_platform-data';

export function StatusPill({ status }: { status: InstituteStatus }) {
  const tone: Tone = status === 'active' ? 'green' : status === 'atrisk' ? 'red' : 'amber';
  const label = status === 'active' ? 'Active' : status === 'atrisk' ? 'At risk' : 'Onboarding';
  return <ToneTag tone={tone}>{label}</ToneTag>;
}

export function Kpi({ label, value, warn }: { label: string; value: ReactNode; warn?: boolean }) {
  return (
    <div style={{ ...cardStyle({ padding: '15px 18px' }), minWidth: 150, flex: 1 }}>
      <div style={{ fontFamily: T.sans, fontSize: '0.68rem', color: T.textDim, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.4rem', color: warn ? TONE.red.fg : T.text }}>{value}</div>
    </div>
  );
}

export const kpiRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 };

export const tableWrapStyle: CSSProperties = { maxHeight: 520, overflowY: 'auto', borderRadius: 12, border: `1px solid ${T.line}` };
export const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', fontFamily: T.sans };
export const thStyle: CSSProperties = {
  textAlign: 'left', fontSize: '0.66rem', color: T.textDim, fontWeight: 600, padding: '9px 12px',
  borderBottom: `1px solid ${T.line}`, background: T.felt2, position: 'sticky', top: 0,
};
export const tdStyle: CSSProperties = { padding: '9px 12px', borderBottom: `1px solid ${T.line}`, color: T.textSec };

export function DeltaBadge({ diff, up, isMoney }: { diff: number; up: boolean; isMoney?: boolean }) {
  const t = up ? TONE.green : TONE.red;
  const text = isMoney
    ? `${diff > 0 ? '+' : '−'}${fmtL(Math.abs(diff))}`
    : `${diff > 0 ? '+' : ''}${diff}`;
  return (
    <span style={{
      display: 'inline-block', fontFamily: T.mono, fontSize: '0.62rem', fontWeight: 700,
      color: t.fg, background: t.bg, borderRadius: 100, padding: '1px 7px', marginLeft: 6,
    }}>
      {text}
    </span>
  );
}

export function HealthRow({ label, value }: { label: string; value: number }) {
  const band = value >= 80 ? TONE.green : value >= 60 ? TONE.amber : TONE.red;
  const healthLabel = value >= 80 ? 'Healthy' : value >= 60 ? 'Watch' : 'At risk';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 70px', alignItems: 'center', gap: 10, padding: '7px 0', fontSize: '0.78rem' }}>
      <div style={{ color: T.textSec }}>{label}</div>
      <div style={{ position: 'relative', height: 12, background: T.card, borderRadius: 6 }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${value}%`, background: band.fg, borderRadius: 6 }} />
      </div>
      <div style={{ textAlign: 'right', color: band.fg, fontFamily: T.mono, fontSize: '0.7rem' }}>{healthLabel}</div>
    </div>
  );
}

export function PlatformCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...cardStyle({ padding: 22 }), ...style }}>{children}</div>;
}
