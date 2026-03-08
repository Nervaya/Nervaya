import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import './globals.css';
import Providers from '@/components/Providers';
import { EngagementTracker } from '@/components/EngagementTracker';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Nervaya',
  description: 'Nervaya - Your Mental Health Companion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <EngagementTracker />
          {children}
        </Providers>
        {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
        {gaId && !gtmId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
