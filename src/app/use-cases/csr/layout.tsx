import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSR Portfolio Platform — Onboarding, Funding & Impact',
  description:
    'One place to onboard, track, and prove impact across every institute a CSR programme funds — funding, enrollment, attendance, and learning impact, live across every district.',
  keywords: [
    'CSR',
    'CSR portfolio',
    'corporate social responsibility',
    'institute onboarding',
    'CSR reporting',
    'education CSR',
    'fund utilisation',
  ],
  openGraph: {
    title: 'CSR Portfolio Platform — Onboarding, Funding & Impact',
    description:
      'One place to onboard, track, and prove impact across every institute a CSR programme funds, always up to date.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CSR Portfolio Platform — Onboarding, Funding & Impact',
    description:
      'One place to onboard, track, and prove impact across every institute a CSR programme funds, always up to date.',
  },
};

export default function CSRLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
