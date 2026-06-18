import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.groksearcher.com'),
  title: {
    default: "Grok Searcher - Best Grok Prompts, Guides & Comparisons",
    template: "%s | Grok Searcher",
  },
  description: "Free copy-paste Grok prompts, in-depth guides, comparisons and tools for Grok by xAI. Best prompts for business, marketing, engineering, research and 50+ categories.",
  icons: {
    icon: [
      { url: "/images/grok-50-best-prompts.jpg", sizes: "any" },
    ],
    shortcut: "/images/grok-50-best-prompts.jpg",
    apple: "/images/grok-50-best-prompts.jpg",
  },
  openGraph: {
    title: "Grok Searcher - Best Grok Prompts, Guides & Comparisons",
    description: "Free copy-paste Grok prompts, guides and comparisons for every use case by xAI.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        width: 1200,
        height: 630,
        alt: "Grok Searcher - Best Grok Prompts, Guides & Comparisons",
      },
    ],
    url: "https://www.groksearcher.com",
    siteName: "Grok Searcher",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grok Searcher - Best Grok Prompts, Guides & Comparisons",
    description: "Free copy-paste Grok prompts, guides and comparisons for every use case by xAI.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        alt: "Grok Searcher - Best Grok Prompts, Guides & Comparisons",
      },
    ],
    creator: "@groksearcher",
    site: "@groksearcher",
  },
  alternates: {
    canonical: "https://www.groksearcher.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Nav />
        <main className="min-h-[calc(100vh-200px)]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
