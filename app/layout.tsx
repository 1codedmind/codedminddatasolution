import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { getCurrentSession } from "@/lib/auth/session";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE = "https://codedmind.co.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Coded Mind — Free Developer Tools & Data Services",
    template: "%s | Coded Mind",
  },
  description:
    "Free online developer tools: JSON formatter, Base64 encoder/decoder, UUID generator, word counter, Unix timestamp converter, timezone converter, and password generator. No login. No data sent.",
  keywords: [
    "free developer tools",
    "JSON formatter online",
    "Base64 encoder decoder",
    "UUID generator",
    "Unix timestamp converter",
    "timezone converter",
    "word counter online",
    "password generator",
    "online developer utilities",
  ],
  authors: [{ name: "Coded Mind", url: BASE }],
  creator: "Coded Mind",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE,
    siteName: "Coded Mind",
    title: "Coded Mind — Free Developer Tools & Data Services",
    description:
      "Free browser-based developer tools. No login, no data sent. JSON formatter, timezone converter, UUID generator, and more.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Coded Mind — Free Developer Tools" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coded Mind — Free Developer Tools & Data Services",
    description: "Free browser-based developer tools. No login, no data sent.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: BASE },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: { google: "84qSQOAP2QMH4TuIWXY0hwgvKUq3CfYwRzewks_hzRo" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar sessionEmail={session?.email} />
        {children}
        <Footer />
        <ChatWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
