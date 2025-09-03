import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import MobileOptimizations from "../components/MobileOptimizations";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ScoreMax Tutoring | Unlock Your Test Score Potential",
  description: "Expert 1-on-1 test prep tutoring for SAT, ACT, GMAT, GRE & academic subjects. Get matched with certified tutors and boost your scores with personalized study plans.",
  openGraph: {
    type: 'website',
    url: 'https://scoremax.com',
    siteName: 'ScoreMax',
    title: 'ScoreMax Tutoring | Unlock Your Test Score Potential',
    description: 'Expert 1-on-1 test prep tutoring for SAT, ACT, GMAT, GRE & academic subjects.',
    images: ['/logo.avif']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScoreMax Tutoring | Unlock Your Test Score Potential',
    description: 'Expert 1-on-1 test prep tutoring for SAT, ACT, GMAT, GRE & academic subjects.',
    images: ['/logo.avif']
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: '#517cad',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ScoreMax',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} antialiased`}>
        <MobileOptimizations />
        {/* WebSite JSON-LD with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'ScoreMax Tutoring',
              url: 'https://scoremax.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://scoremax.com/search?q={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
