// Shared network-skilling demo data for the Tata STRIVE Dronalytics views.
// Sourced from a Tata STRIVE "Network Readiness" operations dashboard mockup —
// the 14 delivery-point rows below (name/type/trade/n/avg/ready/ccg/tdr/status)
// are copied verbatim from that mockup. Trade names are Tata STRIVE's real
// published courses; centre/partner names are illustrative labels, as the
// source dashboard itself discloses.

export const NETWORK = {
  name: 'Tata STRIVE',
  officerName: 'Shiladitya',
  officerTitle: 'Operations, Skill Development & Entrepreneurship',
  officerInitials: 'S',
  centres: 14,
  trades: 7,
};

export const DELIVERY_POINTS = [
  { name: "Owned Centre – A", type: "Owned centre", trade: "EV Service Technician", n: 210, avg: 71, ready: 62, ccg: 14, tdr: 0.24, status: "ontrack" },
  { name: "Owned Centre – B", type: "Owned centre", trade: "Assistant Electrician", n: 186, avg: 68, ready: 57, ccg: 16, tdr: 0.28, status: "ontrack" },
  { name: "Owned Centre – C", type: "Owned centre", trade: "Full Stack Java Developer", n: 150, avg: 64, ready: 49, ccg: 19, tdr: 0.33, status: "ontrack" },
  { name: "Extension Centre – D", type: "Extension centre", trade: "Automotive Service Technician", n: 98, avg: 52, ready: 31, ccg: 21, tdr: 0.39, status: "monitor" },
  { name: "Extension Centre – E", type: "Extension centre", trade: "Assistant Electrician", n: 112, avg: 55, ready: 34, ccg: 18, tdr: 0.35, status: "monitor" },
  { name: "Implementation Partner – F", type: "Implementation partner", trade: "EV Service Technician", n: 240, avg: 61, ready: 44, ccg: 17, tdr: 0.31, status: "ontrack" },
  { name: "Implementation Partner – G", type: "Implementation partner", trade: "Solar PV Installer", n: 134, avg: 47, ready: 22, ccg: 24, tdr: 0.44, status: "monitor" },
  { name: "Implementation Partner – H", type: "Implementation partner", trade: "Automotive Service Technician", n: 176, avg: 38, ready: 14, ccg: 29, tdr: 0.53, status: "atrisk" },
  { name: "Implementation Partner – I", type: "Implementation partner", trade: "Full Stack Java Developer", n: 205, avg: 60, ready: 42, ccg: 15, tdr: 0.27, status: "ontrack" },
  { name: "Implementation Partner – J", type: "Implementation partner", trade: "Assistant Electrician", n: 88, avg: 33, ready: 9, ccg: 31, tdr: 0.58, status: "atrisk" },
  { name: "Owned Centre – K", type: "Owned centre", trade: "Commis Chef", n: 121, avg: 66, ready: 53, ccg: 15, tdr: 0.26, status: "ontrack" },
  { name: "Extension Centre – L", type: "Extension centre", trade: "Housekeeping", n: 76, avg: 59, ready: 40, ccg: 20, tdr: 0.36, status: "monitor" },
  { name: "Implementation Partner – M", type: "Implementation partner", trade: "Automotive Service Technician", n: 163, avg: 57, ready: 38, ccg: 18, tdr: 0.34, status: "ontrack" },
  { name: "Implementation Partner – N", type: "Implementation partner", trade: "Full Stack Java Developer", n: 141, avg: 54, ready: 35, ccg: 20, tdr: 0.37, status: "monitor" },
] as const;

export type DeliveryPoint = (typeof DELIVERY_POINTS)[number];
export type DeliveryStatus = DeliveryPoint['status'];

// ── Derived, network-wide numbers — computed once here so every page imports
// the same figures instead of recomputing them (and risking drift) locally. ──

export const TOTAL_N = DELIVERY_POINTS.reduce((sum, d) => sum + d.n, 0);

export const NET_AVG = Math.round(
  DELIVERY_POINTS.reduce((sum, d) => sum + d.avg, 0) / DELIVERY_POINTS.length
);

export const READY_PCT = Math.round(
  DELIVERY_POINTS.reduce((sum, d) => sum + d.n * d.ready, 0) / TOTAL_N
);

export const ATRISK = DELIVERY_POINTS.filter(d => d.status === 'atrisk');
export const MONITOR = DELIVERY_POINTS.filter(d => d.status === 'monitor');
export const ONTRACK = DELIVERY_POINTS.filter(d => d.status === 'ontrack');

export const TRADES = Array.from(new Set(DELIVERY_POINTS.map(d => d.trade)));

export function scoreBand(score: number): 'green' | 'amber' | 'red' {
  if (score >= 65) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}
