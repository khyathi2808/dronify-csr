'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { T } from '@/lib/theme';

// This site only hosts the CSR use case — send the root straight to it.
export default function Home() {
  const router = useRouter();
  useEffect(() => { router.replace('/use-cases/csr'); }, [router]);

  return (
    <section style={{ padding: '160px 24px', textAlign: 'center' as const, minHeight: '70vh' }}>
      <Link href="/use-cases/csr" style={{ fontFamily: T.sans, color: T.gold }}>
        Continue to the CSR Portfolio Platform →
      </Link>
    </section>
  );
}
