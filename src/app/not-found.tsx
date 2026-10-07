'use client';

import Link from 'next/link';
import { T } from '@/lib/theme';
import DronaMark from '@/components/DronaMark';

export default function NotFound() {
  return (
    <section style={{ padding: '160px clamp(20px,4vw,48px) 120px', position: 'relative', overflow: 'hidden', minHeight: '70vh' }}>
      <div style={{ position: 'absolute', top: '15%', right: '-8%', width: 'min(420px,50vw)', opacity: 0.05, pointerEvents: 'none' }}>
        <DronaMark fill={T.gold} width="100%" />
      </div>
      <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' as const, position: 'relative' }}>
        <span style={{
          fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.32em', color: T.gold,
          textTransform: 'uppercase' as const, display: 'block',
        }}>
          404
        </span>
        <h1 style={{ fontFamily: T.serif, fontWeight: 700, fontSize: 'clamp(32px,5vw,52px)', color: T.text, marginTop: 16, lineHeight: 1.15 }}>
          That page isn&apos;t here.
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '1rem', lineHeight: 1.7, color: T.textSec, marginTop: 18 }}>
          The link may be out of date, or the assessment, metric, or view it points to doesn&apos;t exist in this demo yet.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 30, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <Link href="/use-cases/csr" style={{
            fontFamily: T.sans, fontWeight: 600, fontSize: '0.88rem', padding: '14px 28px', borderRadius: '100px',
            border: `1px solid ${T.gold}`, background: T.gold, color: T.felt0, textDecoration: 'none',
          }}>
            ← Back to CSR
          </Link>
        </div>
      </div>
    </section>
  );
}
