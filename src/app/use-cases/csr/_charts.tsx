'use client';

import { useEffect, useState } from 'react';
import { T } from '@/lib/theme';
import type { MetricDef } from './_analytics-data';
import { DrillDown } from '../_drilldown';
import { COHORT_TOTAL, synthesizeVals, type Selection } from '../_drilldown-shared';

function sameSelection(a: Selection | null, b: { rowKey: string; colKey: string } | null) {
  return !!a && !!b && a.rowKey === b.rowKey && a.colKey === b.colKey;
}

function Legend({ legend }: { legend: { label: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 18, marginTop: 20 }}>
      {legend.map(l => (
        <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: l.color, display: 'inline-block' }} />
          <span style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec }}>{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function ChartFrame({ metric, children }: { metric: MetricDef; children: React.ReactNode }) {
  return (
    <div>
      <span style={{ fontFamily: T.mono, fontSize: '0.66rem', letterSpacing: '0.1em', color: T.textDim }}>{metric.eyebrow}</span>
      <h2 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '1.3rem', color: T.text, marginTop: 8 }}>{metric.title}</h2>
      <p style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.textSec, marginTop: 6 }}>{metric.formula}</p>
      <div style={{ marginTop: 24, overflowX: 'auto' as const }}>{children}</div>
      <Legend legend={metric.legend} />
    </div>
  );
}

export function HeatmapChart({ metric, selection, onSelect }: { metric: MetricDef; selection: Selection | null; onSelect: (s: Selection | null) => void }) {
  if (metric.chart.type !== 'heatmap') return null;
  const { columns, rows } = metric.chart;
  const labelFor = (color: string) => metric.legend.find(l => l.color.toLowerCase() === color.toLowerCase())?.label ?? 'No data';
  const domIndexFor = (color: string) => metric.legend.findIndex(l => l.color.toLowerCase() === color.toLowerCase());

  const handleClick = (row: typeof rows[number], i: number, color: string) => {
    if (sameSelection(selection, { rowKey: row.centre, colKey: columns[i] })) { onSelect(null); return; }
    const vals = synthesizeVals(domIndexFor(color), metric.legend.length, `${metric.key}:${row.centre}:${columns[i]}`);
    let prevVals: number[] | null = null;
    if (i > 0 && row.cells[i - 1]) {
      const pdi = domIndexFor(row.cells[i - 1]!);
      if (pdi >= 0) prevVals = synthesizeVals(pdi, metric.legend.length, `${metric.key}:${row.centre}:${columns[i - 1]}`);
    }
    onSelect({ rowKey: row.centre, colKey: columns[i], vals, prevVals });
  };

  return (
    <ChartFrame metric={metric}>
      <table style={{ borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontFamily: T.mono, fontSize: '0.6rem', color: T.textDim, padding: '0 12px 10px 0' }} />
            {columns.map(c => (
              <th key={c} title={c} style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.textDim, padding: '0 4px 10px', minWidth: 48, maxWidth: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                {c.startsWith('A') ? c : c.split(' ').map(w => w[0]).join('')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.centre}>
              <td style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.text, padding: '4px 12px 4px 0', whiteSpace: 'nowrap' as const }}>{row.centre}</td>
              {row.cells.map((c, i) => {
                const isSelected = sameSelection(selection, { rowKey: row.centre, colKey: columns[i] });
                return (
                  <td key={i} style={{ padding: 3 }}>
                    {c ? (
                      <button
                        type="button"
                        onClick={() => handleClick(row, i, c)}
                        title={`${row.centre} · ${columns[i]}: ${labelFor(c)} · click for drill-down`}
                        style={{
                          width: 40, height: 30, borderRadius: 5, background: c, border: isSelected ? `2px solid ${T.text}` : 'none',
                          padding: 0, cursor: 'pointer', boxShadow: isSelected ? `0 0 0 2px ${T.gold}` : 'none',
                        }}
                      />
                    ) : (
                      <div style={{ width: 40, height: 30, borderRadius: 5, border: `1px dashed ${T.line}` }} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </ChartFrame>
  );
}

export function TrailChart({ metric, selection, onSelect }: { metric: MetricDef; selection: Selection | null; onSelect: (s: Selection | null) => void }) {
  if (metric.chart.type !== 'trail') return null;
  const { columns, rows } = metric.chart;
  const bandColor = (b: string) => metric.legend.find(l => l.label.toLowerCase().startsWith(b))?.color ?? T.textDim;
  const domIndexFor = (b: string) => metric.legend.findIndex(l => l.label.toLowerCase().startsWith(b));

  const handleClick = (row: typeof rows[number], i: number, band: string) => {
    if (sameSelection(selection, { rowKey: row.centre, colKey: columns[i] })) { onSelect(null); return; }
    const vals = synthesizeVals(domIndexFor(band), metric.legend.length, `${metric.key}:${row.centre}:${columns[i]}`);
    let prevVals: number[] | null = null;
    if (i > 0) {
      const pdi = domIndexFor(row.bands[i - 1]);
      if (pdi >= 0) prevVals = synthesizeVals(pdi, metric.legend.length, `${metric.key}:${row.centre}:${columns[i - 1]}`);
    }
    onSelect({ rowKey: row.centre, colKey: columns[i], vals, prevVals });
  };

  return (
    <ChartFrame metric={metric}>
      <table style={{ borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontFamily: T.mono, fontSize: '0.6rem', color: T.textDim, padding: '0 12px 10px 0' }} />
            {columns.map(c => (
              <th key={c} title={c} style={{ fontFamily: T.mono, fontSize: '0.58rem', color: T.textDim, padding: '0 4px 10px', minWidth: 44 }}>
                {c.startsWith('A') ? c : c.split(' ').map(w => w[0]).join('')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.centre}>
              <td style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.text, padding: '5px 12px 5px 0', whiteSpace: 'nowrap' as const }}>{row.centre}</td>
              {row.bands.map((b, i) => {
                const isSelected = sameSelection(selection, { rowKey: row.centre, colKey: columns[i] });
                return (
                  <td key={i} style={{ padding: 3, textAlign: 'center' as const }}>
                    <button
                      type="button"
                      onClick={() => handleClick(row, i, b)}
                      title={`${row.centre} · ${columns[i]} · click for drill-down`}
                      style={{
                        display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: bandColor(b),
                        border: isSelected ? `2px solid ${T.text}` : 'none', boxShadow: isSelected ? `0 0 0 2px ${T.gold}` : 'none',
                        padding: 0, cursor: 'pointer',
                      }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </ChartFrame>
  );
}

export function BarChart({ metric, selection, onSelect }: { metric: MetricDef; selection: Selection | null; onSelect: (s: Selection | null) => void }) {
  if (metric.chart.type !== 'bar') return null;
  const { rows } = metric.chart;

  const valsFromSegments = (segments: { color: string; pct: number }[]) => {
    const vals = new Array(metric.legend.length).fill(0);
    segments.forEach(s => {
      const li = metric.legend.findIndex(l => l.color.toLowerCase() === s.color.toLowerCase());
      if (li >= 0) vals[li] = Math.round((s.pct / 100) * COHORT_TOTAL);
    });
    return vals;
  };

  const handleClick = (row: typeof rows[number]) => {
    if (sameSelection(selection, { rowKey: row.centre, colKey: 'Latest' })) { onSelect(null); return; }
    onSelect({ rowKey: row.centre, colKey: 'Latest', vals: valsFromSegments(row.segments), prevVals: null });
  };

  return (
    <ChartFrame metric={metric}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, minWidth: 480 }}>
        {rows.map(row => {
          const isSelected = sameSelection(selection, { rowKey: row.centre, colKey: 'Latest' });
          return (
            <div key={row.centre} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, alignItems: 'center' }}>
              <span style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.text, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.centre}</span>
              <div
                onClick={() => handleClick(row)}
                title="Click for drill-down"
                style={{
                  display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                  outline: isSelected ? `2px solid ${T.gold}` : 'none', outlineOffset: 1,
                }}
              >
                {row.segments.map((s, i) => (
                  <div key={i} style={{ width: `${s.pct}%`, background: s.color }} title={`${s.pct}%`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}

export function WaffleChart({ metric, selection, onSelect }: { metric: MetricDef; selection: Selection | null; onSelect: (s: Selection | null) => void }) {
  if (metric.chart.type !== 'waffle') return null;
  const { rows } = metric.chart;

  const valsFromSquares = (squares: string[]) => {
    const vals = new Array(metric.legend.length).fill(0);
    squares.forEach(sq => {
      const li = metric.legend.findIndex(l => l.color.toLowerCase() === sq.toLowerCase());
      if (li >= 0) vals[li]++;
    });
    return vals;
  };

  const handleClick = (row: typeof rows[number]) => {
    if (sameSelection(selection, { rowKey: row.centre, colKey: 'Latest' })) { onSelect(null); return; }
    onSelect({ rowKey: row.centre, colKey: 'Latest', vals: valsFromSquares(row.squares), prevVals: null });
  };

  return (
    <ChartFrame metric={metric}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
        {rows.map(row => {
          const isSelected = sameSelection(selection, { rowKey: row.centre, colKey: 'Latest' });
          return (
            <div
              key={row.centre}
              onClick={() => handleClick(row)}
              title="Click for drill-down"
              style={{ border: `1px solid ${isSelected ? T.gold : T.line}`, borderRadius: 10, padding: 14, cursor: 'pointer' }}
            >
              <div style={{ fontFamily: T.sans, fontWeight: 600, fontSize: '0.82rem', color: T.text, marginBottom: 10 }}>{row.centre}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 3 }}>
                {row.squares.map((c, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}

export function StemChart({ metric, selection, onSelect }: { metric: MetricDef; selection: Selection | null; onSelect: (s: Selection | null) => void }) {
  if (metric.chart.type !== 'stem') return null;
  const { rows } = metric.chart;
  const maxPct = Math.max(...rows.map(r => r.pct), 20);
  const domIndexFor = (color: string) => metric.legend.findIndex(l => l.color.toLowerCase() === color.toLowerCase());

  const handleClick = (row: typeof rows[number]) => {
    if (sameSelection(selection, { rowKey: row.centre, colKey: 'Latest' })) { onSelect(null); return; }
    const vals = synthesizeVals(domIndexFor(row.color), metric.legend.length, `${metric.key}:${row.centre}`, COHORT_TOTAL, row.pct / 100);
    onSelect({ rowKey: row.centre, colKey: 'Latest', vals, prevVals: null });
  };

  return (
    <ChartFrame metric={metric}>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12, minWidth: 420 }}>
        {rows.map(row => {
          const isSelected = sameSelection(selection, { rowKey: row.centre, colKey: 'Latest' });
          return (
            <div key={row.centre} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, alignItems: 'center' }}>
              <span style={{ fontFamily: T.sans, fontSize: '0.8rem', color: T.text, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.centre}</span>
              <div
                onClick={() => handleClick(row)}
                title="Click for drill-down"
                style={{ position: 'relative' as const, height: 14, cursor: 'pointer' }}
              >
                <div style={{ position: 'absolute', left: 0, top: 6, right: 0, height: 2, background: T.line }} />
                <div style={{ position: 'absolute', left: 0, top: 6, width: `${(row.pct / maxPct) * 90}%`, height: 2, background: row.color }} />
                <div style={{
                  position: 'absolute', left: `calc(${(row.pct / maxPct) * 90}% - 6px)`, top: 1, width: 12, height: 12, borderRadius: '50%', background: row.color,
                  border: `2px solid ${T.felt0}`, boxShadow: isSelected ? `0 0 0 2px ${T.gold}` : 'none',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </ChartFrame>
  );
}

export function MetricChart({ metric }: { metric: MetricDef }) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [drillLabelIndex, setDrillLabelIndex] = useState<number | null>(null);

  useEffect(() => {
    setSelection(null);
    setDrillLabelIndex(null);
  }, [metric.key]);

  const handleSelect = (s: Selection | null) => {
    setSelection(s);
    setDrillLabelIndex(null);
  };

  let chart: React.ReactNode = null;
  switch (metric.chart.type) {
    case 'heatmap': chart = <HeatmapChart metric={metric} selection={selection} onSelect={handleSelect} />; break;
    case 'bar': chart = <BarChart metric={metric} selection={selection} onSelect={handleSelect} />; break;
    case 'waffle': chart = <WaffleChart metric={metric} selection={selection} onSelect={handleSelect} />; break;
    case 'stem': chart = <StemChart metric={metric} selection={selection} onSelect={handleSelect} />; break;
    case 'trail': chart = <TrailChart metric={metric} selection={selection} onSelect={handleSelect} />; break;
    default: chart = null;
  }

  return (
    <div>
      {chart}
      {selection && (
        <DrillDown
          metric={metric}
          rowKey={selection.rowKey}
          colKey={selection.colKey}
          vals={selection.vals}
          prevVals={selection.prevVals}
          drillLabelIndex={drillLabelIndex}
          onSelectLabel={setDrillLabelIndex}
        />
      )}
    </div>
  );
}
