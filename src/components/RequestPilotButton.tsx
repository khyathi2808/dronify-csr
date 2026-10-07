'use client';

import { useState } from 'react';
import BookingModal from './BookingModal';

export default function RequestPilotButton() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setBookingOpen(true)}
        style={{
          background: 'rgb(201, 168, 76)',
          color: 'rgb(7, 26, 17)',
          border: 'none',
          borderRadius: '100px',
          padding: '14px 28px',
          minHeight: '48px',
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
          fontWeight: 600,
          fontSize: '0.92rem',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: '0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        Request a pilot
      </button>
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
