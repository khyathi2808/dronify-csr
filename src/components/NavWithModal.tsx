'use client';

import { useState } from 'react';
import Nav from './Nav';
import BookingModal from './BookingModal';

export default function NavWithModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Nav onBook={() => setOpen(true)} />
      <BookingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
