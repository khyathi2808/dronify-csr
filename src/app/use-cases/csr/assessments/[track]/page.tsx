import { TRACKS } from '../../_assessment-data';
import TrackPage from './_track-client';

// Static export (GitHub Pages): pre-render one page per assessment track.
export function generateStaticParams() {
  return TRACKS.map(t => ({ track: t.key }));
}

export const dynamicParams = false;

export default function Page() {
  return <TrackPage />;
}
