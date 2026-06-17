import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Grok vs Gemini 2026 Comparison",
  description: "Grok vs Google Gemini comparison: real-time X access and research capabilities vs Google's latest model features in 2026.",
  openGraph: {
    title: "Grok vs Gemini 2026 | Grok Searcher",
    description: "Grok vs Google Gemini comparison focusing on real-time capabilities and research use cases.",
    images: [{ url: "/images/grok-vs-chatgpt-vs-claude-2026.jpg", alt: "Grok vs Gemini" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grok vs Gemini 2026 | Grok Searcher",
    description: "Real-time X access vs Google's model for research and current events.",
    images: ["/images/grok-vs-chatgpt-vs-claude-2026.jpg"],
  },
};

export default function GrokVsGemini() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Grok vs Gemini</h1>
      <p className="text-gray-600">Grok&apos;s native X access gives it a significant edge for current events and social research compared to Gemini. Full detailed comparison coming soon.</p>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Grok vs Gemini 2026",
        "description": "Grok vs Google Gemini comparison focusing on real-time capabilities and research use cases.",
        "url": "https://groksearcher.com/comparisons/grok-vs-gemini"
      }} />
    </div>
  );
}
