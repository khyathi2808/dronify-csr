'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { T } from '@/lib/theme';
import DronaMark from './DronaMark';

interface NavProps {
  onBook: () => void;
}

export default function Nav({ onBook }: NavProps) {
  const pathname = usePathname();
  // CSR-only site: highlight the deepest CSR section the current path is under.
  const activeHref = (pathname ?? '').replace(/\/$/, '');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const links = [
    { label: 'Platform', href: '/use-cases/csr', key: 'platform' },
    { label: 'Assessments', href: '/use-cases/csr/assessments', key: 'assessments' },
    { label: 'Analytics', href: '/use-cases/csr/analytics', key: 'analytics' },
    { label: 'Insights', href: '/use-cases/csr/insights', key: 'insights' },
  ];
  const isActive = (href: string) =>
    href === '/use-cases/csr' ? activeHref === href : activeHref.startsWith(href);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(20px,4vw,48px)',
        height: 66,
        background: 'rgba(10,35,22,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${T.line}`,
      }}>
        {/* Logo */}
        <Link href="/use-cases/csr" style={{ textDecoration: 'none', flexShrink: 0 }} onClick={() => setMenuOpen(false)}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <DronaMark fill={T.gold} width={26} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{
                fontFamily: T.serif,
                fontWeight: 700,
                fontSize: '1.55rem',
                color: T.text,
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}>
                Drona<span style={{ color: T.gold }}>.</span>
              </span>
              <span style={{
                fontFamily: T.mono,
                fontSize: '0.65rem',
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase' as const,
                lineHeight: 1,
                color: '#9ca3af',
              }}>
                An Altumind Venture
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop: centre nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {links.map(link => (
              <Link
                key={link.key}
                href={link.href}
                style={{
                  fontFamily: T.sans,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive(link.href) ? T.gold : T.textSec,
                  textDecoration: 'none',
                  letterSpacing: '0.01em',
                  paddingBottom: 2,
                  transition: `color .2s ${T.ease}`,
                }}
              >
                {link.label}
              </Link>
            ))}

          </div>
        )}

        {/* Desktop: CTA button  |  Mobile: hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {!isMobile ? (
            <button
              onClick={onBook}
              style={{
                fontFamily: T.sans,
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '10px 22px',
                borderRadius: '100px',
                border: `1px solid ${T.gold}`,
                background: T.gold,
                color: T.felt0,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: `all .2s ${T.ease}`,
                whiteSpace: 'nowrap' as const,
              }}
            >
              Request a pilot
            </button>
          ) : (
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                flexDirection: 'column' as const,
                gap: 5,
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                minHeight: 40,
              }}
            >
              <span style={{
                display: 'block',
                width: 22,
                height: 2,
                background: T.text,
                borderRadius: 2,
                transition: 'transform .25s, opacity .25s',
                transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none',
              }} />
              <span style={{
                display: 'block',
                width: 22,
                height: 2,
                background: T.text,
                borderRadius: 2,
                transition: 'opacity .25s',
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block',
                width: 22,
                height: 2,
                background: T.text,
                borderRadius: 2,
                transition: 'transform .25s, opacity .25s',
                transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
              }} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed',
          top: 66,
          left: 0,
          right: 0,
          zIndex: 99,
          background: 'rgba(10,35,22,0.97)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${T.line}`,
          padding: '16px 24px 28px',
          animation: 'fadeUp .2s',
        }}>
          {links.map(link => (
            <Link
              key={link.key}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                fontFamily: T.sans,
                fontSize: '1.1rem',
                fontWeight: 500,
                color: isActive(link.href) ? T.gold : T.text,
                textDecoration: 'none',
                padding: '14px 0',
                borderBottom: `1px solid ${T.line}`,
                letterSpacing: '0.01em',
              }}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => { onBook(); setMenuOpen(false); }}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 20,
              padding: '14px 28px',
              borderRadius: '100px',
              fontFamily: T.sans,
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              letterSpacing: '0.03em',
              border: `1px solid ${T.gold}`,
              background: T.gold,
              color: T.felt0,
            }}
          >
            Request a pilot
          </button>
        </div>
      )}
    </>
  );
}
