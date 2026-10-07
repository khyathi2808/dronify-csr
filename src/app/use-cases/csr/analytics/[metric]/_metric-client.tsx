'use client';

import { notFound, useParams } from 'next/navigation';
import { T, cardStyle } from '@/lib/theme';
import { NETWORK } from '../../_data';
import { getMetric } from '../../_analytics-data';
import { PillarHeader } from '../../_ui';
import { MetricChart } from '../../_charts';
import { CSRSidebarShell } from '../../_shell';

export default function MetricDetailPage() {
  const params = useParams<{ metric: string }>();
  const metric = getMetric(params.metric);

  if (!metric) return notFound();

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader backHref="/use-cases/csr/analytics" backLabel="← Analytics" minimal />

      <div style={{ maxWidth: 1200, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <span style={{ fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.1em', color: T.gold }}>
          {metric.category} · {NETWORK.name}
        </span>
        <div style={cardStyle({ padding: 'clamp(24px,4vw,36px)', marginTop: 16 })}>
          <MetricChart metric={metric} />
        </div>
      </div>
    </div>
    </CSRSidebarShell>
  );
}
