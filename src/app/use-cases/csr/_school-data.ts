// School Impact Monitor — CSR-funded schools dataset. Town names are real
// tier-2/tier-3 Indian towns; specific school names, scores, and counts are
// illustrative sample data standing in for a live assessment feed.

export const SCHOOL_PROGRAMME = {
  name: 'School Impact Monitor',
  schools: 14,
  towns: 'Tier 2 & Tier 3',
};

export type SchoolStatus = 'ontrack' | 'monitor' | 'atrisk';

export const SCHOOLS = [
  { name: 'Govt Primary School, Nashik', tier: 'Tier 2', level: 'Primary', students: 180, baseline: 38, current: 61, growth: 23, enrollChange: 4, status: 'ontrack' },
  { name: 'Govt Upper Primary School, Nashik', tier: 'Tier 2', level: 'Upper Primary', students: 165, baseline: 41, current: 60, growth: 19, enrollChange: 2, status: 'ontrack' },
  { name: 'Municipal School, Jamshedpur', tier: 'Tier 2', level: 'Primary', students: 210, baseline: 35, current: 57, growth: 22, enrollChange: 5, status: 'ontrack' },
  { name: 'Govt Primary School, Warangal', tier: 'Tier 2', level: 'Primary', students: 140, baseline: 44, current: 60, growth: 16, enrollChange: 3, status: 'ontrack' },
  { name: 'Govt Primary School, Siliguri', tier: 'Tier 2', level: 'Primary', students: 155, baseline: 40, current: 55, growth: 15, enrollChange: 1, status: 'ontrack' },
  { name: 'Municipal School, Warangal', tier: 'Tier 2', level: 'Upper Primary', students: 190, baseline: 39, current: 56, growth: 17, enrollChange: 6, status: 'ontrack' },
  { name: 'Govt Primary School, Hosur', tier: 'Tier 3', level: 'Primary', students: 112, baseline: 36, current: 58, growth: 22, enrollChange: 3, status: 'ontrack' },
  { name: 'Govt Primary School, Bhagalpur', tier: 'Tier 3', level: 'Primary', students: 120, baseline: 30, current: 42, growth: 12, enrollChange: 1, status: 'monitor' },
  { name: 'Govt Upper Primary School, Bhagalpur', tier: 'Tier 3', level: 'Upper Primary', students: 98, baseline: 33, current: 44, growth: 11, enrollChange: 0, status: 'monitor' },
  { name: 'Govt Primary School, Ujjain', tier: 'Tier 3', level: 'Primary', students: 132, baseline: 37, current: 47, growth: 10, enrollChange: -2, status: 'monitor' },
  { name: 'Municipal School, Kota', tier: 'Tier 3', level: 'Primary', students: 175, baseline: 42, current: 50, growth: 8, enrollChange: -1, status: 'monitor' },
  { name: 'Govt Primary School, Rewari', tier: 'Tier 3', level: 'Primary', students: 88, baseline: 28, current: 34, growth: 6, enrollChange: -3, status: 'monitor' },
  { name: 'Govt Primary School, Bilaspur', tier: 'Tier 3', level: 'Primary', students: 101, baseline: 31, current: 27, growth: -4, enrollChange: -18, status: 'atrisk' },
  { name: 'Govt Upper Primary School, Hosur', tier: 'Tier 3', level: 'Upper Primary', students: 143, baseline: 45, current: 40, growth: -5, enrollChange: -12, status: 'atrisk' },
] as const satisfies readonly {
  name: string; tier: string; level: string; students: number;
  baseline: number; current: number; growth: number; enrollChange: number; status: SchoolStatus;
}[];

export type School = (typeof SCHOOLS)[number];

export const TOTAL_STUDENTS = SCHOOLS.reduce((sum, s) => sum + s.students, 0);
export const NET_AVG_GROWTH = Math.round(SCHOOLS.reduce((sum, s) => sum + s.growth, 0) / SCHOOLS.length);
export const STRONG_COUNT = SCHOOLS.filter(s => s.growth >= 15).length;
export const OUTLIERS = SCHOOLS.filter(s => s.growth < 0);
export const ATRISK_SCHOOLS = SCHOOLS.filter(s => s.status === 'atrisk');
export const MONITOR_SCHOOLS = SCHOOLS.filter(s => s.status === 'monitor');
export const ONTRACK_SCHOOLS = SCHOOLS.filter(s => s.status === 'ontrack');
export const TIERS = Array.from(new Set(SCHOOLS.map(s => s.tier)));
