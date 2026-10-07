'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Static export = client-side navigations; capture a $pageview on every route change.
      capture_pageview: 'history_change',
      capture_pageleave: true,
      autocapture: true,
      person_profiles: 'identified_only',
    });
    posthog.register({ site: 'csr' });

    // Report downloads are plain <a download> links spread across the CSR pages;
    // track them here so the copied CSR components stay untouched.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a[download]') as HTMLAnchorElement | null;
      if (link) posthog.capture('csr_report_downloaded', { href: link.getAttribute('href') });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return <>{children}</>;
}
