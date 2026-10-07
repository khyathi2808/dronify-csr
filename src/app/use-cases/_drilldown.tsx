'use client';

import { useState } from 'react';
import { T, cardStyle } from '@/lib/theme';
import { studentNameFor } from './_drilldown-shared';

interface MetricLike {
  key: string;
  name: string;
  legend: { label: string; color: string }[];
}

interface DrillDownProps {
  metric: MetricLike;
  rowKey: string;
  colKey: string;
  vals: number[];
  prevVals: number[] | null;
  drillLabelIndex: number | null;
  onSelectLabel: (i: number) => void;
}

const LEVEL_TAG: React.CSSProperties = {
  fontFamily: T.mono, fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
};

function levelCardStyle(accent: string): React.CSSProperties {
  return cardStyle({ padding: '16px 18px', marginTop: 14, borderLeft: `3px solid ${accent}` });
}

export function DrillDown({ metric, rowKey, colKey, vals, prevVals, drillLabelIndex, onSelectLabel }: DrillDownProps) {
  const total = vals.reduce((a, b) => a + b, 0);
  if (!total) return null;

  return (
    <div>
      {/* Level 1 — label distribution */}
      <div style={levelCardStyle(T.gold)}>
        <div style={{ ...LEVEL_TAG, color: T.gold }}>Level 1 — Label distribution</div>
        <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '0.95rem', color: T.text, marginTop: 6 }}>
          {rowKey} · {colKey}
        </div>
        <div style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textSec, marginTop: 4, marginBottom: 12 }}>
          Click a segment to see counts and change from the previous assessment
        </div>
        <div style={{ display: 'flex', height: 28, borderRadius: 6, overflow: 'hidden' }}>
          {vals.map((v, i) => {
            const pct = Math.round((v / total) * 100);
            if (pct < 1) return null;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelectLabel(i)}
                title={`${metric.legend[i]?.label}: ${pct}%`}
                style={{
                  width: `${pct}%`, background: metric.legend[i]?.color, border: 'none', cursor: 'pointer',
                  outline: drillLabelIndex === i ? `2px solid ${T.text}` : 'none', outlineOffset: -2,
                }}
              />
            );
          })}
        </div>
      </div>

      {drillLabelIndex !== null && (
        <Level2
          metric={metric}
          rowKey={rowKey}
          colKey={colKey}
          vals={vals}
          prevVals={prevVals}
          drillLabelIndex={drillLabelIndex}
          onSelectLabel={onSelectLabel}
        />
      )}

      {drillLabelIndex !== null && (
        <Level3
          key={`${metric.key}::${rowKey}::${colKey}::${drillLabelIndex}`}
          metric={metric}
          rowKey={rowKey}
          colKey={colKey}
          count={vals[drillLabelIndex] ?? 0}
          drillLabelIndex={drillLabelIndex}
        />
      )}
    </div>
  );
}

function Level2({ metric, rowKey, colKey, vals, prevVals, drillLabelIndex, onSelectLabel }: DrillDownProps) {
  const total = vals.reduce((a, b) => a + b, 0);
  const prevTotal = prevVals ? prevVals.reduce((a, b) => a + b, 0) : null;

  return (
    <div style={levelCardStyle(T.greenLt)}>
      <div style={{ ...LEVEL_TAG, color: T.greenLt }}>Level 2 — Counts &amp; change from previous assessment</div>
      <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '0.95rem', color: T.text, marginTop: 6, marginBottom: 4 }}>
        {rowKey} · {colKey} · {total} students
      </div>
      <div style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textSec, marginBottom: 12 }}>
        Click any card to see the students in that category
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(vals.length, 4)},1fr)`, gap: 10 }}>
        {vals.map((v, i) => {
          const pct = total ? Math.round((v / total) * 100) : 0;
          const pp = prevVals && prevTotal ? Math.round(((prevVals[i] ?? 0) / prevTotal) * 100) : null;
          const delta = pp !== null ? pct - pp : null;
          const deltaText = delta === null ? 'no previous assessment' : delta > 0 ? `+${delta}% from prev` : delta < 0 ? `${delta}% from prev` : 'no change';
          const deltaColor = delta === null || delta === 0 ? T.textDim : delta > 0 ? T.greenLt : '#d85a30';
          const color = metric.legend[i]?.color ?? T.textDim;
          const isSel = i === drillLabelIndex;
          return (
            <div
              key={i}
              onClick={() => onSelectLabel(i)}
              style={{
                background: `${color}18`, borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                outline: isSel ? `2px solid ${T.gold}` : 'none',
              }}
            >
              <div style={{ fontFamily: T.mono, fontSize: '1.15rem', fontWeight: 700, color }}>{v}</div>
              <div style={{ fontFamily: T.sans, fontSize: '0.68rem', color, marginTop: 2 }}>{metric.legend[i]?.label}</div>
              <div style={{ height: 4, borderRadius: 100, marginTop: 8, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ height: '100%', borderRadius: 100, width: `${pct}%`, background: color }} />
              </div>
              <div style={{ fontFamily: T.mono, fontSize: '0.62rem', color: deltaColor, marginTop: 6, fontWeight: 600 }}>{deltaText}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PAGE_SIZE = 6;

function Level3({ metric, rowKey, colKey, count, drillLabelIndex }: { metric: MetricLike; rowKey: string; colKey: string; count: number; drillLabelIndex: number }) {
  const [page, setPage] = useState(1);
  const label = metric.legend[drillLabelIndex]?.label ?? '';
  const color = metric.legend[drillLabelIndex]?.color ?? T.textDim;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const seed = `${metric.key}::${rowKey}::${colKey}::${drillLabelIndex}`;
  const start = (page - 1) * PAGE_SIZE;
  const rows = Array.from({ length: Math.min(PAGE_SIZE, count - start) }, (_, j) => studentNameFor(seed, start + j));

  return (
    <div style={{ ...cardStyle({ padding: '16px 18px', marginTop: 14 }) }}>
      <div style={{ ...LEVEL_TAG, color: T.textDim }}>Level 3 — Students · {label}</div>
      <div style={{ fontFamily: T.serif, fontWeight: 600, fontSize: '0.95rem', color: T.text, marginTop: 6, marginBottom: 12 }}>
        {rowKey} · {colKey} · {count} student{count !== 1 ? 's' : ''} in this category
      </div>
      {count === 0 ? (
        <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textDim, fontStyle: 'italic' }}>No students in this category</div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: T.textDim, paddingBottom: 6, borderBottom: `1px solid ${T.line}` }}>Name</th>
                <th style={{ textAlign: 'left', fontFamily: T.mono, fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: T.textDim, paddingBottom: 6, borderBottom: `1px solid ${T.line}` }}>{metric.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((name, i) => (
                <tr key={i}>
                  <td style={{ padding: '7px 0', fontFamily: T.sans, fontSize: '0.8rem', color: T.text, borderBottom: `1px solid ${T.line}` }}>{name}</td>
                  <td style={{ padding: '7px 0', borderBottom: `1px solid ${T.line}` }}>
                    <span style={{ fontFamily: T.sans, fontSize: '0.68rem', fontWeight: 600, padding: '2px 10px', borderRadius: 100, background: `${color}25`, color }}>
                      {label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button
                type="button" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                style={{ fontFamily: T.sans, fontSize: '0.7rem', padding: '5px 12px', borderRadius: 100, border: `1px solid ${T.line}`, background: 'transparent', color: T.text, cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textSec }}>Page {page} of {totalPages}</span>
              <button
                type="button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                style={{ fontFamily: T.sans, fontSize: '0.7rem', padding: '5px 12px', borderRadius: 100, border: `1px solid ${T.line}`, background: 'transparent', color: T.text, cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
