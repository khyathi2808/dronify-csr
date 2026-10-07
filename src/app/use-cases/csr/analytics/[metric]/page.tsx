import { METRICS } from '../../_analytics-data';
import MetricDetailPage from './_metric-client';

// Static export (GitHub Pages): pre-render one page per metric.
export function generateStaticParams() {
  return METRICS.map(m => ({ metric: m.key }));
}

export const dynamicParams = false;

export default function Page() {
  return <MetricDetailPage />;
}
