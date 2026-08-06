import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import MobileOptimizations from "../components/MobileOptimizations";
import { HeaderFooterWrapper } from "../components/HeaderFooterWrapper";
import Analytics from "../components/Analytics";
import { CrispChat } from "../components/CrispChat";
import { JsonLd } from "../components/JsonLd";
import { webSite } from "@/lib/structured-data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});


// Next 15 requires viewport and themeColor in their own export; declaring them
// inside `metadata` makes it silently drop them, which it warns about on every
// build. Splitting them out restores the tags and clears the warning.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#b08a30',
};

export const metadata: Metadata = {
  // Without this, Next resolves the relative image paths below against
  // http://localhost:3000 at build time, so every link shared to Facebook,
  // LinkedIn, iMessage or WhatsApp carried a preview image nobody could load.
  metadataBase: new URL('https://www.scoremaxtutoring.com'),
  title: "ScoreMax Tutoring | Unlock Your Test Score Potential",
  description: "Expert 1-on-1 test prep tutoring for SAT, ACT, GMAT, GRE & academic subjects. Get matched with certified tutors and boost your scores with personalized study plans.",
  openGraph: {
    type: 'website',
    url: 'https://www.scoremaxtutoring.com',
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
      <body className={`${inter.variable} ${playfair.variable} ${dmSans.variable} antialiased`}>
        <MobileOptimizations />
        <Analytics />
        <CrispChat />
        {/* Site-wide. Page-level nodes live on the pages themselves and point
            back at the organisation by @id — see src/lib/structured-data.js. */}
        <JsonLd data={webSite()} />
        <HeaderFooterWrapper>
          {children}
        </HeaderFooterWrapper>
      </body>
    </html>
  );
}
