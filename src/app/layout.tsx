import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { AppToaster } from "@/components/providers/app-toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { buildMetadata } from "@/config/metadata";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = buildMetadata();

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="bg-background text-foreground min-h-full font-sans antialiased">
        <ThemeProvider>
          {children}
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
