'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { T } from '@/lib/theme';
import DronaMark from '@/components/DronaMark';
import BookingModal from '@/components/BookingModal';
import { ew } from './_ui';
import {
  STATES, TOTAL_STATES, TOTAL_DISTRICTS, INSTITUTES, TOTAL_STUDENTS, fmt, type Institute,
} from './_platform-data';
import {
  DashboardPanel, InstitutionsPanel, AssessmentsPanel, LearningAnalyticsPanel, ProgrammesPanel, PartnersPanel,
  FinancePanel, GeographyPanel, CompliancePanel, AlertsPanel, ReportsPanel, AdministrationPanel,
} from './_platform-panels';

const NAV_ITEMS = [
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
type PanelKey = (typeof NAV_ITEMS)[number]['key'];

// These two dashboard panels are fronted by a real standalone experience
// (the assessment track picker / the metric picker), so their sidebar entry
// jumps straight there instead of the internal panel — the internal panel's
// stats are then reachable from a "View statistics" toggle on that page.
const EXTERNAL_PANEL_ROUTES: Record<string, string> = {
  assessments: '/use-cases/csr/assessments',
  'learning-analytics': '/use-cases/csr/analytics',
};

const EXTERNAL_LINKS = [
  { label: 'Insights', href: '/use-cases/csr/insights' },
] as const;

function AssessmentsAnalyticsCTA() {
  return (
    <Link
      href="/use-cases/csr/assessments-analytics"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: T.sans, fontWeight: 600, fontSize: '0.8rem',
        padding: '10px 18px', borderRadius: 100, border: `1px solid ${T.gold}`, background: T.gold, color: T.felt0,
        textDecoration: 'none', whiteSpace: 'nowrap',
      }}
    >
      Assessments &amp; Analytics →
    </Link>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section data-screen-label="hero" style={{ padding: '140px clamp(20px,4vw,48px) 80px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '10%', right: '-8%', width: 'min(520px,60vw)', opacity: 0.05, pointerEvents: 'none' }}>
        <DronaMark fill={T.gold} width="100%" />
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        <Link href="/" style={{ fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.18em', color: T.textDim, textDecoration: 'none' }}>
          ← DRONA
        </Link>
        <div style={{ margin: '24px 0 18px' }}>
          <span style={ew()}>CSR · Education</span>
        </div>
        <h1 style={{ fontFamily: T.serif, fontWeight: 700, fontSize: 'clamp(40px,6.5vw,80px)', color: T.text, lineHeight: 1.02, maxWidth: 900 }}>
          Improving learning outcomes
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 'clamp(20px,2.8vw,30px)', color: T.goldBright, marginTop: 12 }}>
          Beyond participation. Measure capability.
        </div>
        <p style={{ fontFamily: T.sans, fontSize: '1.02rem', lineHeight: 1.7, color: T.textSec, maxWidth: 660, marginTop: 20 }}>
          See what your education and skilling programmes are actually building — across learners, institutions and partners.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 30, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <button
            onClick={onBook}
            style={{
              minHeight: '48px', fontFamily: T.sans, fontWeight: 600, fontSize: '0.88rem', lineHeight: 1, padding: '14px 28px',
              borderRadius: '100px', border: `1px solid ${T.gold}`, background: T.gold, color: T.felt0, cursor: 'pointer',
              letterSpacing: '0.02em', transition: `all .2s ${T.ease}`, whiteSpace: 'nowrap' as const, display: 'inline-flex', alignItems: 'center',
            }}
          >
            Request a pilot
          </button>
        </div>
      </div>
    </section>
  );
}

function LandingView({ onSignIn }: { onSignIn: () => void }) {
  const stats = [
    { v: TOTAL_STATES, l: 'States covered' },
    { v: TOTAL_DISTRICTS, l: 'Districts covered' },
    { v: INSTITUTES.length, l: 'Institutes onboarded' },
    { v: fmt(TOTAL_STUDENTS), l: 'Students enrolled' },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, borderTop: `1px solid ${T.line}` }}>
      <div style={{ flex: '1.25 1 420px', background: `linear-gradient(180deg, ${T.felt2} 0%, ${T.felt0} 55%, ${T.felt2} 100%)`, padding: 'clamp(32px,6vw,64px)', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' }}>
        <div style={{ marginBottom: 22 }}>
          <span style={ew()}>Drona · CSR Portfolio Platform</span>
        </div>
        <h1 style={{ fontFamily: T.serif, fontWeight: 500, fontSize: 'clamp(26px,3.4vw,36px)', lineHeight: 1.3, color: T.text, maxWidth: 520, margin: '0 0 14px' }}>
          One place to onboard, track, and prove impact across every institute you fund.
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: '0.88rem', color: T.textSec, maxWidth: 480, lineHeight: 1.6, marginBottom: 26 }}>
          CSR Portfolio Platform — onboarding, enrollment, attendance, funding, and learning impact, live across every district in your programme.
        </p>
        <ul style={{ margin: '0 0 30px', padding: 0, listStyle: 'none', maxWidth: 480 }}>
          {[
            'Know whether funding is actually improving learning, without a field visit',
            'Bring a new institute onto the programme and track it from day one',
            'See funding, enrollment, and attendance in the same place — always up to date',
          ].map(item => (
            <li key={item} style={{ fontSize: '0.8rem', lineHeight: 1.6, color: T.textSec, paddingLeft: 20, position: 'relative' as const, marginBottom: 9 }}>
              <span style={{ position: 'absolute' as const, left: 0, color: T.gold }}>✓</span>{item}
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 14 }}>
          {stats.map(s => (
            <div key={s.l} style={{ background: T.card, border: `1px solid ${T.lineGold}`, borderRadius: 8, padding: '14px 18px', minWidth: 104 }}>
              <div style={{ fontFamily: T.serif, fontSize: '1.5rem', color: T.goldBright }}>{s.v}</div>
              <div style={{ fontFamily: T.sans, fontSize: '0.66rem', color: T.textSec, marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: '1 1 340px', background: T.felt0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(32px,6vw,56px)' }}>
        <div style={{ width: '100%', maxWidth: 340 }}>
          {/* <div style={{ textAlign: 'center' as const, marginBottom: 22 }}>
            <p style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec, lineHeight: 1.6, margin: '0 0 14px' }}>
              Access the assessments, analytics, and insights on all subjects
            </p>
            <AssessmentsAnalyticsCTA />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 0' }}>
              <span style={{ flex: 1, height: 1, background: T.line }} />
              <span style={{ fontFamily: T.mono, fontSize: '0.68rem', color: T.textDim, textTransform: 'uppercase' as const }}>Or</span>
              <span style={{ flex: 1, height: 1, background: T.line }} />
            </div>
          </div> */}
          <h2 style={{ fontFamily: T.serif, fontWeight: 500, fontSize: '1.5rem', color: T.text, margin: '0 0 6px' }}>Explore the portal</h2>
          <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textDim, lineHeight: 1.6, marginBottom: 26 }}>
            No login needed — step straight into the CSR portfolio dashboard and try it with sample data.
          </div>
          <button
            type="button" onClick={onSignIn}
            style={{ width: '100%', background: T.gold, color: T.felt0, border: 'none', borderRadius: 8, padding: '13px 0', fontSize: '0.86rem', fontWeight: 600, fontFamily: T.sans, cursor: 'pointer', marginTop: 6 }}
          >
            Explore the Portal →
          </button>
          <div style={{ fontFamily: T.sans, fontSize: '0.74rem', color: T.textDim, textAlign: 'center' as const, marginTop: 18 }}>
            New foundation? <span style={{ color: T.gold, cursor: 'pointer' }}>Request access</span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: '0.68rem', color: T.textDim, textAlign: 'center' as const, marginTop: 20 }}>
            Illustrative preview · figures shown are sample data, FY 2024–25
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CSRPage() {
  const [signedIn, setSignedIn] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [panel, setPanel] = useState<PanelKey>('dashboard');
  const [stateFilter, setStateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [extraInstitutes, setExtraInstitutes] = useState<Institute[]>([]);

  // Landing here from the Insights/Assessments/Analytics sidebar (e.g.
  // /use-cases/csr?panel=finance) drops straight into the Portfolio Platform
  // on that panel, instead of showing the sign-in screen again.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('panel');
    if (requested && NAV_ITEMS.some(item => item.key === requested)) {
      setSignedIn(true);
      setPanel(requested as PanelKey);
    }
  }, []);

  const allInstitutes = useMemo(() => [...INSTITUTES, ...extraInstitutes], [extraInstitutes]);

  const filtered = useMemo(
    () => allInstitutes.filter(d => (stateFilter === 'all' || d.state === stateFilter) && (statusFilter === 'all' || d.status === statusFilter)),
    [allInstitutes, stateFilter, statusFilter]
  );

  const nonOnboarding = useMemo(() => filtered.filter(d => d.status !== 'onboarding'), [filtered]);
  const onboardingRows = useMemo(() => filtered.filter(d => d.status === 'onboarding'), [filtered]);
  const liveThisYear = useMemo(() => allInstitutes.filter(d => d.status === 'active' || d.status === 'atrisk').length, [allInstitutes]);

  if (!signedIn) {
    return (
      <div>
        <Hero onBook={() => setBookingOpen(true)} />
        <LandingView onSignIn={() => setSignedIn(true)} />
        <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      </div>
    );
  }

  const selectStyle = {
    fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, border: `1px solid ${T.line}`, borderRadius: 8,
    padding: '7px 12px', background: T.card2,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', paddingTop: 88, flexWrap: 'wrap' as const }}>
      {/* Sidebar */}
      <div style={{ width: 198, flexShrink: 0, background: T.felt2, borderRight: `1px solid ${T.line}`, padding: '22px 0' }}>
        <div style={{ padding: '0 20px 20px', borderBottom: `1px solid ${T.line}`, marginBottom: 12 }}>
          <div style={{ fontFamily: T.serif, fontSize: '1rem', color: T.text }}>Drona</div>
          <div style={{ fontFamily: T.sans, fontSize: '0.66rem', color: T.textDim, marginTop: 2 }}>CSR Portfolio Platform</div>
        </div>
        {NAV_ITEMS.map(item => (
          item.key in EXTERNAL_PANEL_ROUTES ? (
            <Link
              key={item.key} href={EXTERNAL_PANEL_ROUTES[item.key]}
              style={{
                display: 'block', width: '100%', textAlign: 'left' as const, background: 'transparent',
                borderLeft: '3px solid transparent', fontFamily: T.sans, fontSize: '0.8rem',
                color: T.textSec, fontWeight: 400, padding: '11px 20px', textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.key} type="button" onClick={() => setPanel(item.key)}
              style={{
                display: 'block', width: '100%', textAlign: 'left' as const, background: panel === item.key ? T.card2 : 'transparent',
                border: 'none', borderLeft: `3px solid ${panel === item.key ? T.gold : 'transparent'}`, fontFamily: T.sans,
                fontSize: '0.8rem', color: panel === item.key ? T.text : T.textSec, fontWeight: panel === item.key ? 600 : 400,
                padding: '11px 20px', cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          )
        ))}
        <div style={{ padding: '16px 20px 8px', marginTop: 16, borderTop: `1px solid ${T.line}` }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.62rem', letterSpacing: '0.1em', color: T.textDim, textTransform: 'uppercase' as const }}>More</span>
        </div>
        {EXTERNAL_LINKS.map(item => (
          <Link
            key={item.href} href={item.href}
            style={{
              display: 'block', width: '100%', textAlign: 'left' as const, fontFamily: T.sans, fontSize: '0.8rem',
              color: T.textSec, padding: '9px 20px', textDecoration: 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ padding: '16px 20px 0', marginTop: 8, borderTop: `1px solid ${T.line}` }}>
          <span onClick={() => setSignedIn(false)} style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim, cursor: 'pointer', textDecoration: 'underline' }}>
            Exit portal
          </span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: T.felt2, borderBottom: `1px solid ${T.line}`, padding: '14px 28px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 12,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 10 }}>
            <button
              type="button" onClick={() => setSignedIn(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: '0.7rem',
                letterSpacing: '0.06em', color: T.textDim, background: 'transparent', border: `1px solid ${T.line}`,
                borderRadius: 100, padding: '7px 14px', cursor: 'pointer', marginRight: 6,
              }}
            >
              ← Back
            </button>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={selectStyle}>
              <option value="all">All states</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="atrisk">At risk</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim }}>FY 2024–25 · Sample data</span>
       
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '26px 28px 60px' }}>
          {panel === 'dashboard' && <DashboardPanel allInstitutes={allInstitutes} />}
          {panel === 'programmes' && <ProgrammesPanel rows={filtered} />}
          {panel === 'institutions' && (
            <InstitutionsPanel
              rows={filtered} total={allInstitutes.length} onboardingRows={onboardingRows} liveThisYear={liveThisYear}
              onAdd={inst => setExtraInstitutes(prev => [...prev, inst])}
            />
          )}
          {panel === 'assessments' && <AssessmentsPanel rows={filtered} />}
          {panel === 'learning-analytics' && <LearningAnalyticsPanel rows={filtered} />}
          {panel === 'partners' && <PartnersPanel rows={filtered} />}
          {panel === 'finance' && <FinancePanel rows={nonOnboarding} />}
          {panel === 'geography' && <GeographyPanel rows={filtered} />}
          {panel === 'compliance' && <CompliancePanel rows={filtered} />}
          {panel === 'alerts' && <AlertsPanel allInstitutes={allInstitutes} />}
          {panel === 'reports' && <ReportsPanel allInstitutes={allInstitutes} />}
          {panel === 'administration' && <AdministrationPanel />}
        </div>
      </div>
    </div>
  );
}

