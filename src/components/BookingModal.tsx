'use client';

import { useState, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { T } from '@/lib/theme';

const EMAILJS_SERVICE_ID  = 'service_02vi06e';
const EMAILJS_TEMPLATE_ID = 'template_61gj2hd';
const EMAILJS_PUBLIC_KEY  = '1kFetlW9nUXl87ybS';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BookingModal({ open, onClose }: BookingModalProps) {
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState('');

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(date);
    }

    return days;
  }, [currentMonth]);

  const isPastDate = (date: Date | null) => {
    if (!date) return true;
    return date < today;
  };

  const handleDateSelect = (date: Date | null) => {
    if (!isPastDate(date)) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleConfirm = async () => {
    if (!selectedDate || !name.trim() || !email.trim()) return;
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    setSendError('');

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    name.trim(),
          from_email:   email.trim(),
          to_name:      name.trim(),
          to_email:     email.trim(),
          booking_date: formatDate(selectedDate),
        },
        EMAILJS_PUBLIC_KEY
      );

      setSubmitted(true);
      setSelectedDate(null);
      setName('');
      setEmail('');
    } catch (err) {
      setSendError('Something went wrong. Please try again.');
      console.error('EmailJS error:', err);
    } finally {
      setSending(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (!open) return null;

  if (submitted) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 120,
        background: 'rgba(5, 18, 11, 0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div style={{
          width: 'min(480px, 100%)', background: 'rgb(16, 54, 38)',
          border: '1px solid rgba(201, 168, 76, 0.22)', borderRadius: '22px',
          padding: '48px 34px', textAlign: 'center',
          boxShadow: 'rgba(0, 0, 0, 0.5) 0px 40px 120px'
        }}>
          <div style={{
            fontFamily: '"IBM Plex Serif", Georgia, serif',
            fontStyle: 'italic', fontWeight: 600, fontSize: '1.9rem',
            color: 'rgb(224, 198, 115)', marginBottom: 16,
          }}>
            We&apos;ll be in touch.
          </div>
          <p style={{
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: '0.92rem', color: 'rgb(166, 188, 174)', lineHeight: 1.6, marginBottom: 28,
          }}>
            Expect a confirmation email shortly. Our team will reach out within one business day.
          </p>
          <button
            onClick={() => { setSubmitted(false); onClose(); }}
            style={{
              background: 'rgb(201, 168, 76)', color: 'rgb(7, 26, 17)',
              border: 'none', borderRadius: '100px', padding: '12px 28px',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    // <div
    //   onClick={onClose}
    //   style={{
    //     position: 'fixed',
    //     inset: 0,
    //     zIndex: 2,
    //     background: 'rgba(7,20,13,0.88)',
    //     backdropFilter: 'blur(8px)',
    //     WebkitBackdropFilter: 'blur(8px)',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     padding: '24px',
    //     animation: 'bloom .3s',
    //   }}
    // >
    //   <div
    //     onClick={e => e.stopPropagation()}
    //     style={{
    //       background: '#0D2B1A',
    //       border: `1px solid ${T.line}`,
    //       borderRadius: 20,
    //       padding: 'clamp(28px,5vw,48px)',
    //       maxWidth: 520,
    //       width: '100%',
    //       position: 'relative',
    //       animation: 'fadeUp .35s',
    //     }}
    //   >
    //     {/* Close */}
    //     <button
    //       onClick={onClose}
    //       style={{
    //         position: 'absolute',
    //         top: 18,
    //         right: 20,
    //         background: 'transparent',
    //         border: 'none',
    //         color: T.textDim,
    //         fontSize: '1.2rem',
    //         cursor: 'pointer',
    //         lineHeight: 1,
    //         fontFamily: T.sans,
    //       }}
    //     >
    //       ×
    //     </button>

    //     {submitted ? (
    //       <div style={{ textAlign: 'center', padding: '20px 0' }}>
    //         <div style={{
    //           fontFamily: T.serif,
    //           fontStyle: 'italic',
    //           fontWeight: 600,
    //           fontSize: '1.8rem',
    //           color: T.goldBright,
    //           marginBottom: 14,
    //         }}>
    //           We&apos;ll be in touch.
    //         </div>
    //         <p style={{ fontFamily: T.sans, fontSize: '0.95rem', color: T.textSec, lineHeight: 1.6 }}>
    //           Expect a calendar invite within one business day. Ninety minutes, no slides.
    //         </p>
    //       </div>
    //     ) : (
    //       <>
    //         <span style={{
    //           fontFamily: T.mono,
    //           fontSize: '0.66rem',
    //           letterSpacing: '0.16em',
    //           color: T.gold,
    //           textTransform: 'uppercase' as const,
    //           display: 'block',
    //           marginBottom: 12,
    //         }}>
    //           REQUEST A PILOT
    //         </span>

    //         <h2 style={{
    //           fontFamily: T.serif,
    //           fontWeight: 600,
    //           fontSize: 'clamp(22px,3vw,28px)',
    //           color: T.text,
    //           lineHeight: 1.2,
    //           marginBottom: 8,
    //         }}>
    //           Ninety minutes,{' '}
    //           <em style={{ color: T.gold, fontStyle: 'italic' }}>no slides.</em>
    //         </h2>

    //         <p style={{
    //           fontFamily: T.sans,
    //           fontSize: '0.88rem',
    //           color: T.textSec,
    //           lineHeight: 1.6,
    //           marginBottom: 28,
    //         }}>
    //           We map your real workflows and show you exactly where the time goes.
    //         </p>

    //         <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    //           <div>
    //             <label style={labelStyle}>Your name</label>
    //             <input
    //               value={name}
    //               onChange={e => setName(e.target.value)}
    //               placeholder="Full name"
    //               style={inputStyle}
    //             />
    //           </div>
    //           <div>
    //             <label style={labelStyle}>Work email</label>
    //             <input
    //               type="email"
    //               value={email}
    //               onChange={e => setEmail(e.target.value)}
    //               placeholder="you@institution.edu"
    //               style={inputStyle}
    //             />
    //           </div>
    //           <div>
    //             <label style={labelStyle}>Institution</label>
    //             <input
    //               value={institution}
    //               onChange={e => setInstitution(e.target.value)}
    //               placeholder="School, college, or organisation"
    //               style={inputStyle}
    //             />
    //           </div>
    //           <div>
    //             <label style={labelStyle}>Your role</label>
    //             <input
    //               value={role}
    //               onChange={e => setRole(e.target.value)}
    //               placeholder="e.g. Principal, HOD, Dean"
    //               style={inputStyle}
    //             />
    //           </div>

    //           <button
    //             onClick={handleSubmit}
    //             style={{
    //               fontFamily: T.sans,
    //               fontWeight: 600,
    //               fontSize: '0.9rem',
    //               padding: '15px 28px',
    //               borderRadius: '100px',
    //               border: `1px solid ${T.gold}`,
    //               background: T.gold,
    //               color: T.felt0,
    //               cursor: 'pointer',
    //               letterSpacing: '0.03em',
    //               marginTop: 4,
    //               transition: `all .2s ${T.ease}`,
    //             }}
    //           >
    //             Book the session →
    //           </button>
    //         </div>
    //       </>
    //     )}
    //   </div>
    // </div>

    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 120,
      background: 'rgba(5, 18, 11, 0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: 'min(480px, 100%)',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgb(16, 54, 38)',
        border: '1px solid rgba(201, 168, 76, 0.22)',
        borderRadius: '22px',
        padding: '34px',
        boxShadow: 'rgba(0, 0, 0, 0.5) 0px 40px 120px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{
            fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
            fontWeight: 500,
            letterSpacing: '0.32em',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            color: 'rgb(201, 168, 76)'
          }}>
            BOOK A PILOT WALKTHROUGH
          </div>
          <span 
            onClick={onClose}
            style={{ cursor: 'pointer', color: 'rgb(166, 188, 174)', fontSize: '22px', lineHeight: 1 }}
          >
            ×
          </span>
        </div>

        <h3 style={{
          fontFamily: '"IBM Plex Serif", Georgia, serif',
          fontWeight: 600,
          fontSize: '1.7rem',
          color: 'rgb(236, 232, 220)',
          margin: '14px 0 4px'
        }}>
          Ninety minutes. <em style={{ fontStyle: 'italic', color: 'rgb(224, 198, 115)', fontWeight: 600 }}>No slides.</em>
        </h3>

        <p style={{
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
          fontSize: '0.86rem',
          color: 'rgb(166, 188, 174)',
          marginBottom: '22px'
        }}>
          We map your real workflows and show you exactly where the time goes.
        </p>

        {/* Calendar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <button onClick={goToPreviousMonth} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '1.2rem', cursor: 'pointer' }}>
            ←
          </button>
          <div style={{ fontWeight: 600, color: 'rgb(236, 232, 220)' }}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
          <button onClick={goToNextMonth} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '1.2rem', cursor: 'pointer' }}>
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '24px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgb(110, 138, 123)', padding: '4px' }}>
              {day}
            </div>
          ))}

          {calendarDays.map((date, index) => (
            <button
              key={index}
              onClick={() => date && handleDateSelect(date)}
              disabled={!date || isPastDate(date)}
              style={{
                height: '42px',
                borderRadius: '8px',
                border: 'none',
                background: selectedDate && date && selectedDate.getTime() === date.getTime() 
                  ? 'rgb(201, 168, 76)' 
                  : isPastDate(date) 
                    ? 'rgba(0,0,0,0.2)' 
                    : 'rgb(21, 67, 48)',
                color: selectedDate && date && selectedDate.getTime() === date.getTime() 
                  ? 'rgb(7, 26, 17)' 
                  : isPastDate(date) 
                    ? '#555' 
                    : 'rgb(236, 232, 220)',
                cursor: isPastDate(date) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: date && date.getDate() === today.getDate() && 
                          date.getMonth() === today.getMonth() ? '700' : '500'
              }}
            >
              {date ? date.getDate() : ''}
            </button>
          ))}
        </div>

        {selectedDate && (
          <p style={{ textAlign: 'center', color: 'rgb(201, 168, 76)', marginBottom: '20px', fontWeight: 500 }}>
            Selected: {formatDate(selectedDate)}
          </p>
        )}

        {/* Form Fields */}
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%', background: 'rgb(21, 67, 48)', border: '1px solid rgba(236, 232, 220, 0.1)',
            borderRadius: '8px', padding: '12px 14px', color: 'rgb(236, 232, 220)',
            fontSize: '0.9rem', outline: 'none', marginBottom: '10px'
          }}
        />

        <input
          type="email"
          placeholder="you@institution.edu"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
          style={{
            width: '100%', background: 'rgb(21, 67, 48)',
            border: emailError ? '1px solid rgb(220, 80, 80)' : '1px solid rgba(236, 232, 220, 0.1)',
            borderRadius: '8px', padding: '12px 14px', color: 'rgb(236, 232, 220)',
            fontSize: '0.9rem', outline: 'none', marginBottom: emailError ? '6px' : '22px'
          }}
        />
        {emailError && (
          <p style={{
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: '0.78rem',
            color: 'rgb(220, 80, 80)',
            marginBottom: '16px',
          }}>
            {emailError}
          </p>
        )}

        <button
          onClick={handleConfirm}
          disabled={sending || !selectedDate || !name.trim() || !email.trim()}
          style={{
            background: (sending || !selectedDate || !name.trim() || !email.trim()) ? '#555' : 'rgb(201, 168, 76)',
            color: (sending || !selectedDate || !name.trim() || !email.trim()) ? '#999' : 'rgb(7, 26, 17)',
            border: 'none',
            borderRadius: '100px',
            padding: '14px 28px',
            minHeight: '48px',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: (sending || !selectedDate || !name.trim() || !email.trim()) ? 'not-allowed' : 'pointer',
            width: '100%',
            opacity: (sending || !selectedDate || !name.trim() || !email.trim()) ? 0.5 : 1,
            transition: '0.3s cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          {sending ? 'Sending…' : 'Confirm the time'}
        </button>
        {sendError && (
          <p style={{
            fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
            fontSize: '0.78rem', color: 'rgb(220, 80, 80)', marginTop: '10px', textAlign: 'center',
          }}>
            {sendError}
          </p>
        )}
      </div>
    </div>
  );
}
