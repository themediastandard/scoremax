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
        {children}
      </body>
    </html>
  );
}
