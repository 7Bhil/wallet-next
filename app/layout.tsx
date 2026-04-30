import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import { HelpCircle } from "lucide-react";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wallet | Premium Concierge",
  description: "Votre concierge financier premium. Gérez vos actifs avec élégance.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-mesh font-sans text-slate-900 border-t-[6px] border-slate-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
