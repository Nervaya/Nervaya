import type { Metadata } from 'next';
import { Geist_Mono, Merriweather, Source_Sans_3 } from 'next/font/google';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="en" className={`${sourceSans.variable} ${merriweather.variable} ${geistMono.variable}`}>
      <head>
        {gtmId && (
          <>
            {}
            {}
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');`,
              }}
            />
          </>
        )}
      </head>
      <body className={`${sourceSans.variable} ${merriweather.variable} ${geistMono.variable}`}>
        {gtmId && (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
              height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
            }}
          />
        )}
        <Providers>
          <BodyRouteClass />
          <EngagementTracker />
          {children}
        </Providers>
        {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
        {gaId && !gtmId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
