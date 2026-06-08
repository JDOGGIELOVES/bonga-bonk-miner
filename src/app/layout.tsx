import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bonga Bonk Miner | Raise the Frequency",
  description:
    "Tap to mine $BONGA with Bonk's Sister. Peace, love, and positive energy — the official Bonga experience.",
  keywords: ["Bonga", "Bonk Miner", "Solana", "$BONGA", "Raise the Frequency"],
  openGraph: {
    title: "Bonga Bonk Miner",
    description: "Raise the Frequency. Mine $BONGA. Spread the love.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1F" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jakarta.variable} font-body`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}