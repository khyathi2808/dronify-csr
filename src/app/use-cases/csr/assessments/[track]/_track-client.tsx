'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { T, cardStyle } from '@/lib/theme';
import { getTrack, type Decl, type Hand } from '../../_assessment-data';
import { PillarHeader } from '../../_ui';
import { CSRSidebarShell } from '../../_shell';

const ew = (color: string = T.gold) => ({
  fontFamily: T.mono, fontSize: '0.7rem', letterSpacing: '0.32em',
  color, textTransform: 'uppercase' as const, display: 'block',
});

const QUESTION_SECONDS = 60;

type Phase = 'declare' | 'question' | 'handDone' | 'allDone';

interface HandSummary {
  attempted: number;
  skipped: number;
  mcqCorrect: number;
  mcqTotal: number;
}

function summarize(log: { decl: Decl; correct?: boolean }[]): HandSummary {
  const attempted = log.filter(l => l.decl !== 'PASS').length;
  const skipped = log.filter(l => l.decl === 'PASS').length;
  const graded = log.filter(l => l.correct !== undefined);
  return { attempted, skipped, mcqCorrect: graded.filter(l => l.correct).length, mcqTotal: graded.length };
}

type QStatus = 'correct' | 'incorrect' | 'skipped' | 'submitted';

function questionStatuses(hand: Hand, log: { decl: Decl; correct?: boolean }[]): QStatus[] {
  return hand.questions.map((q, i) => {
    const entry = log[i];
    if (!entry) return 'skipped';
    if (entry.decl === 'PASS') return 'skipped';
    if (q.type === 'mcq') return entry.correct ? 'correct' : 'incorrect';
    return 'submitted';
  });
}

function handVerdict(summary: HandSummary): { title: string; sub: string } {
  if (summary.skipped === 0 && (summary.mcqTotal === 0 || summary.mcqCorrect === summary.mcqTotal)) {
    return { title: 'This was a solid hand.', sub: 'You performed well — the material at this level is within your range.' };
  }
  if (summary.mcqTotal > 0 && summary.mcqCorrect === 0) {
    return { title: 'This hand was a stretch.', sub: 'This material pushed you — that’s exactly the signal a diagnostic is meant to surface.' };
  }
  if (summary.skipped >= summary.attempted) {
    return { title: 'This hand had a few strategic passes.', sub: 'Skipping when unsure is useful signal too — it shows where the gaps are.' };
  }
  return { title: 'A mixed result on this hand.', sub: 'Some of this landed, some didn’t — a clear read on what to revisit.' };
}

type CalZone = 'Over' | 'Calibrated' | 'Under';

function handCalibration(hand: Hand, log: { decl: Decl; correct?: boolean }[]): { zone: CalZone; angle: number; title: string; sub: string } {
  let over = 0;
  let under = 0;
  hand.questions.forEach((q, i) => {
    if (q.type !== 'mcq') return;
    const entry = log[i];
    if (!entry) return;
    if (entry.decl === 'READY' && entry.correct === false) over++;
    if (entry.decl === 'ASSIST' && entry.correct === true) under++;
  });

  if (over > under) {
    return {
      zone: 'Over', angle: -52,
      title: 'Your confidence outpaced your performance.',
      sub: 'Declaring READY on a few of these didn’t quite land — worth flagging before the next hand.',
    };
  }
  if (under > over) {
    return {
      zone: 'Under', angle: 52,
      title: 'You undersold yourself here.',
      sub: 'You reached for ASSIST more than you needed to — this material is more within range than you gave it credit for.',
    };
  }
  return {
    zone: 'Calibrated', angle: 0,
    title: 'Your estimate matched your performance well.',
    sub: 'You read the material accurately. This is a sign of strong metacognitive awareness.',
  };
}

function CalibrationGauge({ angle }: { angle: number }) {
  const cx = 80;
  const cy = 78;
  const r = 62;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const point = (deg: number) => ({ x: cx + r * Math.cos(rad(180 - deg)), y: cy - r * Math.sin(rad(180 - deg)) });
  const arc = (a1: number, a2: number) => {
    const p1 = point(a1);
    const p2 = point(a2);
    return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  };
  const needleDeg = 90 + angle;
  const tip = point(needleDeg);

  return (
    <svg width="160" height="92" viewBox="0 0 160 92">
      <path d={arc(0, 60)} stroke="#D9705C" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d={arc(60, 120)} stroke={T.greenLt} strokeWidth="12" fill="none" strokeLinecap="round" />
      <path d={arc(120, 180)} stroke="#5E9E94" strokeWidth="12" fill="none" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke={T.gold} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="4" fill={T.gold} />
      <text x="4" y="90" fontFamily={T.mono} fontSize="9" fill="#D9705C">Over</text>
      <text x="80" y="18" fontFamily={T.mono} fontSize="9" fill={T.greenLt} textAnchor="middle">Cal.</text>
      <text x="122" y="90" fontFamily={T.mono} fontSize="9" fill="#5E9E94" textAnchor="end">Under</text>
    </svg>
  );
}

export default function TrackAssessmentPage() {
  const params = useParams<{ track: string }>();
  const track = getTrack(params.track);

  const [handIdx, setHandIdx] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('declare');
  const [decl, setDecl] = useState<Decl | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [essay, setEssay] = useState('');
  const [handLog, setHandLog] = useState<{ decl: Decl; correct?: boolean }[]>([]);
  const [handSummaries, setHandSummaries] = useState<HandSummary[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [confidence, setConfidence] = useState(50);
  const [confidenceSubmitted, setConfidenceSubmitted] = useState(false);
  const finishAnswerRef = useRef<(entry: { decl: Decl; correct?: boolean }) => void>(() => {});

  const hand = track?.hands[handIdx];
  const question = hand?.questions[qIndex];

  useEffect(() => {
    if (phase !== 'declare' && phase !== 'question') return;
    setSecondsLeft(QUESTION_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id);
          finishAnswerRef.current({ decl: decl ?? 'PASS' });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, handIdx, qIndex]);

  const currentSummary = useMemo(() => summarize(handLog), [handLog]);
  const overallSummary = useMemo(() => {
    return handSummaries.reduce(
      (acc, s) => ({
        attempted: acc.attempted + s.attempted,
        skipped: acc.skipped + s.skipped,
        mcqCorrect: acc.mcqCorrect + s.mcqCorrect,
        mcqTotal: acc.mcqTotal + s.mcqTotal,
      }),
      { attempted: 0, skipped: 0, mcqCorrect: 0, mcqTotal: 0 }
    );
  }, [handSummaries]);

  if (!track) return notFound();

  function resetQuestionState() {
    setDecl(null);
    setSelected(null);
    setEssay('');
  }

  function declareAs(d: Decl) {
    setDecl(d);
    if (d === 'PASS') {
      finishAnswer({ decl: d });
    } else {
      setPhase('question');
    }
  }

  function submit() {
    const isMCQ = question!.type === 'mcq';
    const correct = isMCQ ? selected === (question as { correctKey: string }).correctKey : undefined;
    finishAnswer({ decl: decl!, correct });
  }

  function finishAnswer(entry: { decl: Decl; correct?: boolean }) {
    const newLog = [...handLog, entry];
    setHandLog(newLog);

    const isLastQuestion = qIndex >= hand!.questions.length - 1;
    if (!isLastQuestion) {
      setQIndex(i => i + 1);
      setPhase('declare');
      resetQuestionState();
      return;
    }

    setHandSummaries(s => [...s, summarize(newLog)]);
    const isLastHand = handIdx >= track!.hands.length - 1;
    setPhase(isLastHand ? 'allDone' : 'handDone');
  }

  finishAnswerRef.current = finishAnswer;

  function beginNextHand() {
    setHandIdx(i => i + 1);
    setQIndex(0);
    setHandLog([]);
    setPhase('declare');
    resetQuestionState();
  }

  const stepLabel = phase === 'allDone'
    ? 'Complete'
    : phase === 'handDone'
    ? `Hand ${handIdx + 1} of ${track.hands.length} complete`
    : `Hand ${handIdx + 1}/${track.hands.length} · Q${Math.min(qIndex + 1, hand!.questions.length)}/${hand!.questions.length}`;

  return (
    <CSRSidebarShell>
    <div style={{ paddingTop: 24, paddingBottom: 100 }}>
      <PillarHeader backHref="/use-cases/csr/assessments" backLabel="← Assessments" minimal />

      <div style={{ maxWidth: 900, margin: '40px auto 0', padding: '0 clamp(20px,4vw,48px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' as const, gap: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim }}>
            {track.label} · {stepLabel}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(phase === 'declare' || phase === 'question') && question && (
              <span style={{
                fontFamily: T.mono, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.04em',
                color: secondsLeft <= 10 ? '#D9705C' : T.gold,
                background: secondsLeft <= 10 ? 'rgba(217,112,92,0.12)' : 'rgba(201,168,76,0.12)',
                border: `1px solid ${secondsLeft <= 10 ? 'rgba(217,112,92,0.32)' : T.lineGold}`,
                borderRadius: 100, padding: '5px 12px', minWidth: 46, textAlign: 'center' as const,
              }}>
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </span>
            )}
            {question && phase === 'question' && (
              <span style={{
                fontFamily: T.mono, fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.08em',
                color: T.assist, background: 'rgba(94,158,148,0.12)', border: '1px solid rgba(94,158,148,0.3)',
                borderRadius: 100, padding: '5px 12px',
              }}>
                {question.bloom}
              </span>
            )}
          </div>
        </div>

        <div style={{ ...cardStyle({ padding: 'clamp(24px,4vw,36px)' }) }}>
          {phase === 'declare' && question && (
            <div style={{ animation: 'fadeUp .3s' }}>
              {qIndex === 0 && (
                <p style={{ fontFamily: T.sans, fontStyle: 'italic', fontSize: '0.82rem', color: T.textDim, marginBottom: 16 }}>
                  {hand!.coverageNote}
                </p>
              )}
              <span style={ew(T.textDim)}>Decision window — read the question before committing</span>
              <p style={{ fontFamily: T.serif, fontSize: 'clamp(19px,2.4vw,25px)', color: T.text, lineHeight: 1.5, marginTop: 16 }}>
                {question.question}
              </p>
              {question.type === 'essay' && question.wordCountMin && (
                <p style={{ fontFamily: T.sans, fontStyle: 'italic', fontSize: '0.8rem', color: T.textDim, marginTop: 10 }}>
                  Expected length: {question.wordCountMin}–{question.wordCountMax} words.
                </p>
              )}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const, marginTop: 28 }}>
                {([
                  { key: 'READY' as Decl, title: 'READY', desc: 'I know this well', sub: 'Answer independently — no hints', color: T.gold },
                  { key: 'ASSIST' as Decl, title: 'ASSIST', desc: 'Show me the full question', sub: 'A nudge, without the answer', color: T.assist },
                  { key: 'PASS' as Decl, title: 'PASS', desc: 'Not now — move on', sub: 'Strategic skip — recorded', color: T.pass },
                ]).map(o => (
                  <button
                    key={o.key}
                    onClick={() => declareAs(o.key)}
                    style={{
                      flex: '1 1 180px', textAlign: 'left' as const, cursor: 'pointer', padding: 20, borderRadius: 12,
                      border: `1px solid ${o.color}`, background: 'transparent', transition: `all .2s ${T.ease}`,
                    }}
                  >
                    <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em', color: o.color }}>{o.title}</div>
                    <div style={{ fontFamily: T.serif, fontSize: '1rem', color: T.text, marginTop: 8 }}>{o.desc}</div>
                    <div style={{ fontFamily: T.sans, fontSize: '0.76rem', color: T.textSec, marginTop: 6 }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'question' && question && (
            <div style={{ animation: 'fadeUp .3s' }}>
              <p style={{ fontFamily: T.serif, fontSize: 'clamp(19px,2.4vw,25px)', color: T.text, lineHeight: 1.5 }}>
                {question.question}
              </p>
              {decl === 'ASSIST' && (
                <div style={{ background: 'rgba(94,158,148,0.08)', border: '1px solid rgba(94,158,148,0.25)', borderRadius: 10, padding: '14px 18px', marginTop: 18 }}>
                  <p style={{ fontFamily: T.sans, fontStyle: 'italic', fontSize: '0.85rem', color: T.textSec }}>
                    Assist mode — take your time and reason through it step by step.
                  </p>
                </div>
              )}

              {question.type === 'mcq' ? (
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, marginTop: 24 }}>
                  {question.options.map(o => (
                    <div
                      key={o.key}
                      onClick={() => setSelected(o.key)}
                      style={{
                        cursor: 'pointer', display: 'flex', gap: 13, padding: '15px 18px', borderRadius: 10,
                        background: selected === o.key ? 'rgba(201,168,76,0.1)' : T.card2,
                        border: `1px solid ${selected === o.key ? T.gold : T.line}`,
                        fontFamily: T.sans, fontSize: '0.92rem', color: T.text, lineHeight: 1.5,
                      }}
                    >
                      <span style={{ color: T.gold, fontWeight: 600, fontFamily: T.mono, flexShrink: 0 }}>{o.key}</span>
                      {o.text}
                    </div>
                  ))}
                  <button
                    onClick={submit}
                    disabled={!selected}
                    style={{
                      marginTop: 10, fontFamily: T.sans, fontWeight: 600, fontSize: '0.9rem', padding: '15px 28px',
                      borderRadius: 10, border: 'none', cursor: selected ? 'pointer' : 'not-allowed',
                      background: selected ? T.gold : T.card2, color: selected ? T.felt0 : T.textDim,
                    }}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 24 }}>
                  <textarea
                    value={essay}
                    onChange={e => setEssay(e.target.value)}
                    placeholder="Type your response…"
                    rows={6}
                    style={{
                      width: '100%', fontFamily: T.sans, fontSize: '0.92rem', color: T.text, background: T.card2,
                      border: `1px solid ${T.line}`, borderRadius: 10, padding: 16, resize: 'vertical' as const,
                    }}
                  />
                  <div style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.textDim, marginTop: 8 }}>
                    {essay.trim() ? essay.trim().split(/\s+/).length : 0} words
                    {question.wordCountMin ? ` · expected ${question.wordCountMin}–${question.wordCountMax}` : ''}
                  </div>
                  <button
                    onClick={submit}
                    disabled={essay.trim().length === 0}
                    style={{
                      marginTop: 12, fontFamily: T.sans, fontWeight: 600, fontSize: '0.9rem', padding: '15px 28px',
                      borderRadius: 10, border: 'none', cursor: essay.trim() ? 'pointer' : 'not-allowed',
                      background: essay.trim() ? T.gold : T.card2, color: essay.trim() ? T.felt0 : T.textDim,
                    }}
                  >
                    Submit Response
                  </button>
                </div>
              )}
            </div>
          )}

          {phase === 'handDone' && (() => {
            const verdict = handVerdict(currentSummary);
            const calibration = handCalibration(hand!, handLog);
            const statuses = questionStatuses(hand!, handLog);
            const hasEssay = statuses.includes('submitted');
            const statusStyle: Record<QStatus, { bg: string; fg: string; glyph: string }> = {
              correct: { bg: 'rgba(82,196,135,0.15)', fg: T.greenLt, glyph: '✓' },
              incorrect: { bg: 'rgba(217,112,92,0.15)', fg: '#D9705C', glyph: '×' },
              skipped: { bg: T.card2, fg: T.textDim, glyph: '—' },
              submitted: { bg: 'rgba(94,158,148,0.15)', fg: T.assist, glyph: '✓' },
            };

            return (
              <div style={{ animation: 'fadeUp .3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10 }}>
                  <span style={ew(T.textDim)}>Hand {handIdx + 1} of {track.hands.length}</span>
                  <span style={ew()}>Hand Review</span>
                  <span style={{
                    fontFamily: T.mono, fontWeight: 600, fontSize: '0.68rem', color: T.gold,
                    background: 'rgba(201,168,76,0.12)', border: `1px solid ${T.lineGold}`, borderRadius: 100, padding: '5px 12px',
                  }}>
                    Q{hand!.questions.length} of {hand!.questions.length}
                  </span>
                </div>

                <div style={{ marginTop: 22, padding: 22, borderRadius: 12, background: 'rgba(201,168,76,0.06)', border: `1px solid ${T.lineGold}` }}>
                  <h2 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(21px,2.6vw,28px)', color: T.text }}>{verdict.title}</h2>
                  <p style={{ fontFamily: T.sans, fontSize: '0.9rem', color: T.textSec, marginTop: 8, lineHeight: 1.6 }}>{verdict.sub}</p>
                </div>

                <div style={{ marginTop: 18, ...cardStyle({ padding: 22 }) }}>
                  <span style={ew(T.textDim)}>This hand</span>
                  <div style={{ display: 'flex', gap: 32, marginTop: 14, flexWrap: 'wrap' as const }}>
                    <div>
                      <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '2rem', color: T.greenLt }}>{currentSummary.attempted}</div>
                      <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 4 }}>Attempted</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '2rem', color: T.textDim }}>{currentSummary.skipped}</div>
                      <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 4 }}>Skipped</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' as const }}>
                    {statuses.map((s, i) => (
                      <div key={i} style={{
                        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: statusStyle[s].bg, color: statusStyle[s].fg, fontFamily: T.sans, fontWeight: 700, fontSize: '0.9rem',
                      }}>
                        {statusStyle[s].glyph}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 18, marginTop: 16, flexWrap: 'wrap' as const, borderTop: `1px solid ${T.line}`, paddingTop: 14 }}>
                    {([
                      ['correct', 'Correct'], ['incorrect', 'Incorrect'], ['skipped', 'Skipped'],
                      ...(hasEssay ? [['submitted', 'Submitted']] as const : []),
                    ] as [QStatus, string][]).map(([key, label]) => (
                      <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: '0.66rem', letterSpacing: '0.06em', color: T.textDim }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusStyle[key].fg, display: 'inline-block' }} />
                        {label.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 18, ...cardStyle({ padding: 22 }) }}>
                  <span style={ew(T.textDim)}>Calibration</span>
                  <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' as const, alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' as const }}>
                      <CalibrationGauge angle={calibration.angle} />
                      <span style={{
                        display: 'inline-block', marginTop: 4, fontFamily: T.mono, fontWeight: 700, fontSize: '0.64rem', letterSpacing: '0.08em',
                        color: calibration.zone === 'Calibrated' ? T.greenLt : T.gold,
                        background: calibration.zone === 'Calibrated' ? 'rgba(82,196,135,0.12)' : 'rgba(201,168,76,0.12)',
                        border: `1px solid ${calibration.zone === 'Calibrated' ? 'rgba(82,196,135,0.3)' : T.lineGold}`,
                        borderRadius: 100, padding: '4px 12px',
                      }}>
                        {calibration.zone.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ flex: '1 1 220px', textAlign: 'left' as const }}>
                      <div style={{ fontFamily: T.serif, fontSize: '1.05rem', color: T.text }}>{calibration.title}</div>
                      <p style={{ fontFamily: T.sans, fontStyle: 'italic', fontSize: '0.84rem', color: T.textSec, marginTop: 8, lineHeight: 1.6 }}>{calibration.sub}</p>
                    </div>
                  </div>
                </div>

                {handIdx + 1 < track.hands.length && (
                  <div style={{ marginTop: 18, padding: 20, background: T.felt0, border: `1px solid ${T.lineGold}`, borderRadius: 12, textAlign: 'left' as const }}>
                    <span style={{ fontFamily: T.mono, fontSize: '0.64rem', letterSpacing: '0.1em', color: T.gold }}>UP NEXT · HAND {handIdx + 2}</span>
                    <p style={{ fontFamily: T.sans, fontSize: '0.86rem', color: T.textSec, marginTop: 8, lineHeight: 1.6 }}>
                      {track.hands[handIdx + 1].coverageNote}
                    </p>
                  </div>
                )}

                <button
                  onClick={beginNextHand}
                  style={{
                    marginTop: 22, width: '100%', fontFamily: T.sans, fontWeight: 700, fontSize: '0.92rem', padding: '16px 30px',
                    borderRadius: 100, border: `1px solid ${T.gold}`, background: T.gold, color: T.felt0, cursor: 'pointer',
                  }}
                >
                  Begin Hand {handIdx + 2} of {track.hands.length} →
                </button>
              </div>
            );
          })()}

          {phase === 'allDone' && (
            <div style={{ animation: 'fadeUp .3s', textAlign: 'center' as const }}>
              <span style={ew()}>Assessment complete</span>
              <h2 style={{ fontFamily: T.serif, fontWeight: 600, fontSize: 'clamp(24px,3vw,34px)', color: T.text, marginTop: 12 }}>
                Both hands done.
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginTop: 30, textAlign: 'left' as const }}>
                <div style={cardStyle({ padding: 20 })}>
                  <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '2rem', color: T.gold }}>{overallSummary.attempted}</div>
                  <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 6 }}>Attempted</div>
                </div>
                <div style={cardStyle({ padding: 20 })}>
                  <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '2rem', color: T.text }}>{overallSummary.skipped}</div>
                  <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 6 }}>Skipped</div>
                </div>
                {overallSummary.mcqTotal > 0 && (
                  <div style={cardStyle({ padding: 20 })}>
                    <div style={{ fontFamily: T.serif, fontWeight: 700, fontSize: '2rem', color: T.greenLt }}>{overallSummary.mcqCorrect}/{overallSummary.mcqTotal}</div>
                    <div style={{ fontFamily: T.sans, fontSize: '0.78rem', color: T.textSec, marginTop: 6 }}>Multiple-choice correct</div>
                  </div>
                )}
              </div>

              <p style={{ fontFamily: T.sans, fontSize: '0.86rem', color: T.textSec, marginTop: 26, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                Your Analyse, Evaluate and Create responses feed the capability signal a multiple-choice score alone can&apos;t hold — that layer is what a full Dronalytics deployment scores and reports back to the network.
              </p>

              <div style={{ ...cardStyle({ padding: 'clamp(22px,3vw,30px)' }), marginTop: 26, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' as const }}>
                <span style={ew(T.textDim)}>Before you go</span>
                <p style={{ fontFamily: T.serif, fontSize: '1.05rem', color: T.text, marginTop: 10 }}>
                  How confident are you in your overall performance today?
                </p>
                {confidenceSubmitted ? (
                  <p style={{ fontFamily: T.sans, fontSize: '0.86rem', color: T.greenLt, marginTop: 16 }}>
                    ✓ Recorded at {confidence}% — this is compared against your actual score to track your calibration over time.
                  </p>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={confidence}
                        onChange={e => setConfidence(Number(e.target.value))}
                        style={{ flex: 1, accentColor: T.gold }}
                      />
                      <span style={{ fontFamily: T.mono, fontWeight: 700, fontSize: '1rem', color: T.gold, minWidth: 48, textAlign: 'right' as const }}>
                        {confidence}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim }}>Not confident</span>
                      <span style={{ fontFamily: T.sans, fontSize: '0.72rem', color: T.textDim }}>Very confident</span>
                    </div>
                    <button
                      onClick={() => setConfidenceSubmitted(true)}
                      style={{
                        marginTop: 18, width: '100%', fontFamily: T.sans, fontWeight: 600, fontSize: '0.86rem', padding: '13px 24px',
                        borderRadius: 100, border: `1px solid ${T.gold}`, background: 'transparent', color: T.gold, cursor: 'pointer',
                      }}
                    >
                      Submit confidence rating
                    </button>
                  </>
                )}
              </div>

              <Link
                href="/use-cases/csr/assessments"
                style={{
                  display: 'inline-block', marginTop: 24, fontFamily: T.sans, fontWeight: 600, fontSize: '0.9rem', padding: '14px 30px',
                  borderRadius: 100, border: `1px solid ${T.gold}`, background: T.gold, color: T.felt0, textDecoration: 'none',
                }}
              >
                ← Back to Assessments
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
    </CSRSidebarShell>
  );
}
