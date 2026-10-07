'use client';

import { T } from '@/lib/theme';
import { TONE } from './_ui';
import { LENSES, LENS_LABEL, type Lens } from './_platform-data';
import { lensBand, quadrantFor, type Quadrant } from './_platform-ldi';

// ===================================================== LEARNING DEPTH RADAR ===
// 4-axis radar: Thinking Depth (top), Applied Learning (right),
// Problem-Solving (bottom), Learning Agility (left) — matches blueprint Section 2.

export function LearningDepthRadar({
  values, benchmark, size = 220,
}: { values: Record<Lens, number>; benchmark?: Record<Lens, number>; size?: number }) {
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 34;

  function pointFor(i: number, v: number) {
    const a = (i * Math.PI) / 2; // 0=top(0), 1=right(90deg), 2=bottom(180deg), 3=left(270deg), measured clockwise from top
    const r = (Math.max(0, Math.min(100, v)) / 100) * maxR;
    return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
  }

  const currentPts = LENSES.map((l, i) => pointFor(i, values[l] ?? 0));
  const currentPath = currentPts.map(p => `${p.x},${p.y}`).join(' ');
  const benchPts = benchmark ? LENSES.map((l, i) => pointFor(i, benchmark[l] ?? 0)) : null;
  const benchPath = benchPts ? benchPts.map(p => `${p.x},${p.y}`).join(' ') : null;

  const labelPts = LENSES.map((l, i) => pointFor(i, 116));

  return (
    <div style={{ width: size + 90, flexShrink: 0 }}>
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <circle key={f} cx={cx} cy={cy} r={maxR * f} fill="none" stroke={T.line} strokeWidth={1} />
      ))}
      {LENSES.map((_, i) => {
        const p = pointFor(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={T.line} strokeWidth={1} />;
      })}
      {benchPath && <polygon points={benchPath} fill="none" stroke={T.textDim} strokeWidth={1.4} strokeDasharray="3 4" />}
      <polygon points={currentPath} fill={T.gold} fillOpacity={0.22} stroke={T.gold} strokeWidth={2} />
      {currentPts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={T.goldBright} />)}
      {LENSES.map((l, i) => {
        const p = labelPts[i];
        const anchor = i === 1 ? 'start' : i === 3 ? 'end' : 'middle';
        return (
          <text key={l} x={p.x} y={p.y} fontFamily={T.mono} fontSize={9.5} fill={T.textSec} textAnchor={anchor} dominantBaseline="middle">
            {LENS_LABEL[l]}
          </text>
        );
      })}
    </svg>
    </div>
  );
}

// ============================================ CONFIDENCE vs COMPETENCY QUADRANT ===
// Blueprint Section 3 — plots each point on confidence (x) vs competency (y).

const QUADRANT_TONE: Record<Quadrant, string> = {
  'confident-capable': TONE.green.fg,
  'quiet-achievers': T.assist,
  'overconfident-risk': TONE.amber.fg,
  'needs-intervention': TONE.red.fg,
};

export function ConfidenceCompetencyQuadrant({
  points, size = 320,
}: { points: { x: number; y: number; label: string }[]; size?: number }) {
  const pad = 20;
  const plot = size - pad * 2;
  const toPx = (v: number) => pad + (v / 100) * plot;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <rect x={pad} y={pad} width={plot / 2} height={plot / 2} fill={T.assist} fillOpacity={0.07} />
      <rect x={pad + plot / 2} y={pad} width={plot / 2} height={plot / 2} fill={TONE.green.fg} fillOpacity={0.07} />
      <rect x={pad} y={pad + plot / 2} width={plot / 2} height={plot / 2} fill={TONE.red.fg} fillOpacity={0.07} />
      <rect x={pad + plot / 2} y={pad + plot / 2} width={plot / 2} height={plot / 2} fill={TONE.amber.fg} fillOpacity={0.07} />

      <line x1={pad} y1={pad + plot / 2} x2={pad + plot} y2={pad + plot / 2} stroke={T.line} strokeWidth={1} />
      <line x1={pad + plot / 2} y1={pad} x2={pad + plot / 2} y2={pad + plot} stroke={T.line} strokeWidth={1} />
      <rect x={pad} y={pad} width={plot} height={plot} fill="none" stroke={T.line} strokeWidth={1} />

      {points.map((p, i) => {
        const q = quadrantFor(p.x, p.y);
        return (
          <circle key={i} cx={toPx(p.x)} cy={size - toPx(p.y)} r={4.5} fill={QUADRANT_TONE[q]} fillOpacity={0.85}>
            <title>{p.label}</title>
          </circle>
        );
      })}

      <text x={pad + plot / 4} y={pad + plot / 4} fontFamily={T.mono} fontSize={9} fill={T.textDim} textAnchor="middle">QUIET ACHIEVERS</text>
      <text x={pad + plot * 0.75} y={pad + plot / 4} fontFamily={T.mono} fontSize={9} fill={T.textDim} textAnchor="middle">CONFIDENT &amp; CAPABLE</text>
      <text x={pad + plot / 4} y={pad + plot * 0.75} fontFamily={T.mono} fontSize={9} fill={T.textDim} textAnchor="middle">NEEDS INTERVENTION</text>
      <text x={pad + plot * 0.75} y={pad + plot * 0.75} fontFamily={T.mono} fontSize={9} fill={T.textDim} textAnchor="middle">OVERCONFIDENT RISK</text>

      <text x={pad + plot / 2} y={size - 4} fontFamily={T.mono} fontSize={9} fill={T.textSec} textAnchor="middle">CONFIDENCE →</text>
      <text x={10} y={pad + plot / 2} fontFamily={T.mono} fontSize={9} fill={T.textSec} textAnchor="middle" transform={`rotate(-90 10 ${pad + plot / 2})`}>COMPETENCY →</text>
    </svg>
  );
}

// ==================================================================== SPARKLINE ===

export function Sparkline({ values, width = 80, height = 24, color = T.gold }: { values: number[]; width?: number; height?: number; color?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / span) * height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ================================================================= GAP HEAT GRID ===

export function LensHeatGrid({ rows }: { rows: { name: string; lenses: Record<Lens, number> }[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 10px', color: T.textDim, fontSize: '0.66rem', fontWeight: 600 }}>Institution</th>
            {LENSES.map(l => (
              <th key={l} style={{ textAlign: 'center', padding: '6px 10px', color: T.textDim, fontSize: '0.64rem', fontWeight: 600, minWidth: 90 }}>{LENS_LABEL[l]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name}>
              <td style={{ padding: '6px 10px', color: T.text, fontWeight: 600, borderTop: `1px solid ${T.line}` }}>{r.name}</td>
              {LENSES.map(l => {
                const v = r.lenses[l];
                const band = lensBand(v);
                const tone = band === 'green' ? TONE.green : band === 'amber' ? TONE.amber : TONE.red;
                return (
                  <td key={l} style={{ padding: '6px 10px', borderTop: `1px solid ${T.line}`, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', minWidth: 34, fontFamily: T.mono, fontSize: '0.7rem', fontWeight: 700,
                      color: tone.fg, background: tone.bg, borderRadius: 6, padding: '3px 6px',
                    }}>
                      {v}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

