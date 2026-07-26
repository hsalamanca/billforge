import type { Metadata } from "next";
import { IBM_Plex_Mono, Syne, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Billforge — Invoices & quotes that get paid",
  description:
    "Create professional freelancer invoices and contractor quotes in under 60 seconds. Free to start. Pro removes the watermark and unlocks unlimited documents.",
  openGraph: {
    title: "Billforge",
    description: "Professional invoices & quotes in 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
