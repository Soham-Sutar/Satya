import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Satya — Trustworthy AI for Indian Consumer Rights & Protection",
  description:
    "Know your consumer rights. Understand the law. Find the right steps. Source-grounded AI for Indian Consumer Rights & Protection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-canvas text-ink font-sans antialiased selection:bg-accent/15 selection:text-accent">
        {children}
      </body>
    </html>
  );
}
