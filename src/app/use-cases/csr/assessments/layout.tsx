import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSR · Assessments — Dronalytics',
  description: 'Live trade assessments for Tata STRIVE trainees — declare before you answer, then work through Bloom-calibrated questions.',
};

export default function AssessmentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
