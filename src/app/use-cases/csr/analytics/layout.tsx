import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSR · Analytics — Dronalytics',
  description: 'Cognitive and behavioral analytics across every Tata STRIVE delivery point.',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
