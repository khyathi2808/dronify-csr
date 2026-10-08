'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { T } from '@/lib/theme';

// Mirrors the signed-in Portfolio Platform's sidebar (src/app/use-cases/csr/page.tsx)
// so Insights, Assessments, and Analytics — which sit outside that sign-in gate —
// still feel like the same app. The dashboard-panel links jump into the Portfolio
// Platform pre-selected on that panel (see the `?panel=` handling in page.tsx).

const DASHBOARD_PANELS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'programmes', label: 'Programmes' },
  { key: 'institutions', label: 'Institutions' },
  { key: 'assessments', label: 'Assessments' },
  { key: 'learning-analytics', label: 'Analytics' },
  { key: 'partners', label: 'Partners' },
  { key: 'finance', label: 'Finance' },
  { key: 'geography', label: 'Geography' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'reports', label: 'Reports' },
  { key: 'administration', label: 'Administration' },
] as const;

const EXTERNAL_PANEL_ROUTES: Record<string, string> = {
  assessments: '/use-cases/csr/assessments',
  'learning-analytics': '/use-cases/csr/analytics',
};

const MORE_LINKS = [
  { label: 'Insights', href: '/use-cases/csr/insights' },
] as const;

export function CSRSidebarShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', paddingTop: 88, flexWrap: 'wrap' as const }}>
      <div style={{ width: 198, flexShrink: 0, background: T.felt2, borderRight: `1px solid ${T.line}`, padding: '22px 0' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: `1px solid ${T.line}`, marginBottom: 12 }}>
          <div style={{ fontFamily: T.serif, fontSize: '1rem', color: T.text }}>Drona</div>
          <div style={{ fontFamily: T.sans, fontSize: '0.66rem', color: T.textDim, marginTop: 2 }}>CSR Portfolio Platform</div>
        </div>

        {DASHBOARD_PANELS.map(item => {
          const externalRoute = EXTERNAL_PANEL_ROUTES[item.key];
          const href = externalRoute ?? `/use-cases/csr?panel=${item.key}`;
          const active = externalRoute ? pathname?.startsWith(externalRoute) : false;
          return (
            <Link
              key={item.key} href={href}
              style={{
                display: 'block', width: '100%', textAlign: 'left' as const, background: active ? T.card2 : 'transparent',
                borderLeft: `3px solid ${active ? T.gold : 'transparent'}`, fontFamily: T.sans, fontSize: '0.8rem',
                color: active ? T.text : T.textSec, fontWeight: active ? 600 : 400, padding: '11px 20px', textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <div style={{ padding: '16px 20px 8px', marginTop: 16, borderTop: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.1em', color: T.textDim, textTransform: 'uppercase' as const }}>More</span>
        </div>
        {MORE_LINKS.map(item => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href} href={item.href}
              style={{
                display: 'block', width: '100%', textAlign: 'left' as const,
                background: active ? T.card2 : 'transparent',
                borderLeft: `3px solid ${active ? T.gold : 'transparent'}`,
                fontFamily: T.sans, fontSize: '0.8rem',
                color: active ? T.text : T.textSec, fontWeight: active ? 600 : 400,
                padding: '9px 20px', textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}

        <div style={{ padding: '16px 20px 0', marginTop: 8, borderTop: `1px solid ${T.line}` }}>
          <Link href="/use-cases/csr" style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim, textDecoration: 'underline' }}>
            Exit portal
          </Link>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
