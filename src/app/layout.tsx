import type { Metadata } from 'next';
import { Geist_Mono, Merriweather, Source_Sans_3 } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import Providers from '@/components/Providers';
import { EngagementTracker } from '@/components/EngagementTracker';
import BodyRouteClass from '@/components/BodyRouteClass';

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

const merriweather = Merriweather({
  variable: '--font-merriweather',
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
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
  return (
    <html lang="en" className={`${sourceSans.variable} ${merriweather.variable} ${geistMono.variable}`}>
      <body className={`${sourceSans.variable} ${merriweather.variable} ${geistMono.variable}`}>
        <Providers>
          <BodyRouteClass />
          <EngagementTracker />
          {children}
        </Providers>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID as string} />
      </body>
    </html>
  );
}
