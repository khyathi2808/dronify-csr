import type { Metadata } from 'next';
import { IBM_Plex_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import NavWithModal from '@/components/NavWithModal';
import Footer from '@/components/Footer';
import PostHogProvider from '@/components/PostHogProvider';

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Drona CSR',
    default: 'Drona CSR Portfolio Platform',
  },
  description:
    'One place to onboard, track, and prove impact across every institute a CSR programme funds — funding, enrollment, attendance, and learning impact, live across every district.',
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <PostHogProvider>
          <NavWithModal />
          {children}
          <Footer />
        </PostHogProvider>
      </body>
    </html>
  );
}
