import type { CSSProperties } from 'react';

export const T = {
  felt0: '#0A2316',
  felt2: '#091F14',
  text: '#ECE8DC',
  textSec: '#7A9E8B',
  textDim: '#496258',
  gold: '#C9A84C',
  goldBright: '#E2C86E',
  card: 'rgba(21,67,46,0.3)',
  card2: 'rgba(21,67,46,0.5)',
  line: 'rgba(255,255,255,0.08)',
  lineGold: 'rgba(201,168,76,0.32)',
  greenLt: '#52C487',
  assist: '#5E9E94',
  pass: '#7890B0',
  ease: 'cubic-bezier(0.25,0,0,1)',
  serif: "'IBM Plex Serif', Georgia, serif",
  sans: "'IBM Plex Sans', system-ui, sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export function cardStyle(extra: CSSProperties = {}): CSSProperties {
  return {
    background: T.card2,
    border: `1px solid ${T.line}`,
    borderRadius: 16,
    transition: `all .25s ${T.ease}`,
    ...extra,
  };
}
