'use client';

import Link from 'next/link';
import { T, cardStyle } from '@/lib/theme';
import { withBase } from '@/lib/base-path';
import { NETWORK } from './_data';

export const ew = (color: string = T.gold) => ({
  fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.32em',
  color, textTransform: 'uppercase' as const, display: 'block',
});

export const TONE = {
  green: { fg: T.greenLt, bg: 'rgba(82,196,135,0.12)', border: 'rgba(82,196,135,0.3)' },
  amber: { fg: '#D9A441', bg: 'rgba(217,164,65,0.12)', border: 'rgba(217,164,65,0.32)' },
  red: { fg: '#D9705C', bg: 'rgba(217,112,92,0.12)', border: 'rgba(217,112,92,0.32)' },
} as const;

export type Tone = keyof typeof TONE;

export function PillarHeader({
  downloadHref, backHref = '/use-cases/csr', backLabel = '← CSR', minimal = false,
  subtitle, officer,
}: {
  downloadHref?: string; backHref?: string; backLabel?: string; minimal?: boolean;
  /** Overrides the default "{NETWORK.name} · network skilling view · …" line. */
  subtitle?: string;
  /** Overrides the default NETWORK-based officer chip. Pass null to hide the chip entirely. */
  officer?: { initials: string; name: string; title: string } | null;
}) {
  if (minimal) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }}>
        <Link href={backHref} style={{ fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.18em', color: T.textDim, textDecoration: 'none' }}>
          {backLabel}
        </Link>
        <div style={{ marginTop: 20 }}>
          <span style={ew()}>Dronalytics</span>
        </div>
      </div>
    );
  }

  const subtitleText = subtitle ?? `${NETWORK.name} · network skilling view · ${NETWORK.centres} centres, ${NETWORK.trades} trades`;
  const officerInfo = officer === null
    ? null
    : officer ?? { initials: NETWORK.officerInitials, name: NETWORK.officerName, title: NETWORK.officerTitle };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)' }}>
      <Link href={backHref} style={{ fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.18em', color: T.textDim, textDecoration: 'none' }}>
        {backLabel}
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' as const, marginTop: 20 }}>
        <div>
          <span style={ew()}>Dronalytics</span>
          <p style={{ fontFamily: T.sans, fontSize: '0.88rem', color: T.textSec, marginTop: 8 }}>
            {subtitleText}
          </p>
        </div>

        {officerInfo && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: `1px solid ${T.line}`, borderRadius: 100, padding: '8px 16px 8px 8px',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: T.gold, color: T.felt0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: T.mono, fontWeight: 700, fontSize: '0.7rem', flexShrink: 0,
            }}>
              {officerInfo.initials}
            </div>
            <div>
              <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.82rem', color: T.text }}>{officerInfo.name}</div>
              <div style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textSec }}>{officerInfo.title}</div>
            </div>
          </div>
        )}
      </div>

      {downloadHref && (
        <a
          href={withBase(downloadHref)}
          download
          style={{
            display: 'inline-block', marginTop: 20, fontFamily: T.sans, fontWeight: 600, fontSize: '0.85rem',
            padding: '12px 24px', borderRadius: '100px', border: `1px solid ${T.gold}`,
            background: T.gold, color: T.felt0, cursor: 'pointer', letterSpacing: '0.02em', textDecoration: 'none',
          }}
        >
          Download full report
        </a>
      )}
    </div>
  );
}

export function StatTile({ value, label, tone }: { value: string; label: string; tone?: Tone }) {
  const t = tone ? TONE[tone] : null;
  return (
    <div style={{
      ...cardStyle({ padding: '20px 22px' }),
      ...(t ? { background: t.bg, borderColor: t.border } : {}),
    }}>
      <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '1.9rem', color: t ? t.fg : T.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 8 }}>{label}</div>
    </div>
  );
}

export function ToneTag({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const t = TONE[tone];
  return (
    <span style={{
      display: 'inline-block', fontFamily: T.mono, fontSize: '0.68rem', letterSpacing: '0.06em',
      color: t.fg, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 100, padding: '4px 10px',
    }}>
      {children}
    </span>
  );
}

// ── "What's real here" tier notes — shared across all four CSR insights pages ──

export type TierLabel = 'REAL' | 'DERIVABLE' | 'NEEDS NEW DATA SOURCE' | 'EXTERNAL CONTEXT' | 'INVENTED';

const TIER_COLOR: Record<TierLabel, string> = {
  REAL: T.greenLt,
  DERIVABLE: T.gold,
  'NEEDS NEW DATA SOURCE': '#D9A441',
  'EXTERNAL CONTEXT': T.assist,
  INVENTED: T.textDim,
};

export function TierTag({ label }: { label: TierLabel }) {
  const c = TIER_COLOR[label];
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0, fontFamily: T.mono, fontSize: '0.64rem', fontWeight: 700, letterSpacing: '0.07em',
      color: c, background: `${c}1F`, border: `1px solid ${c}55`, borderRadius: 100, padding: '4px 10px', whiteSpace: 'nowrap' as const,
    }}>
      {label}
    </span>
  );
}

export function TierNote({ title = "What's real here, and what isn't", items }: { title?: string; items: { tag: TierLabel; text: string }[] }) {
  return (
    <details style={{ ...cardStyle({ padding: 22 }), marginTop: 40 }}>
      <summary style={{ cursor: 'pointer', fontFamily: T.serif, fontWeight: 600, fontSize: '1.05rem', color: T.text }}>
        {title}
      </summary>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14, marginTop: 18 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
            <TierTag label={it.tag} />
            <span style={{ fontFamily: T.sans, fontSize: '0.84rem', color: T.textSec, lineHeight: 1.6, flex: '1 1 260px' }}>{it.text}</span>
          </div>
        ))}
      </div>
    </details>
  );
}
