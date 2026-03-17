import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOTA Chemworks",
  description: "AI-Powered Virtual Chemistry Lab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-white min-h-screen`}
      >
        {children}
        <Script 
          src="https://cdn.jsdelivr.net/npm/page-agent@1.5.8/dist/iife/page-agent.demo.js" 
          crossOrigin="anonymous" 
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
