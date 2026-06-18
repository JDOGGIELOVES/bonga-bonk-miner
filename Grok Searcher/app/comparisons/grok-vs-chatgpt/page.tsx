import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Grok vs ChatGPT vs Claude 2026",
  description: "Detailed comparison of Grok, ChatGPT and Claude across real-time search, coding, writing, pricing and when to choose each model.",
  openGraph: {
    title: "Grok vs ChatGPT vs Claude 2026 | Grok Searcher",
    description: "Detailed comparison of Grok, ChatGPT and Claude across real-time search, coding, writing, pricing and when to choose each model.",
    images: [
      {
        url: "/images/grok-vs-chatgpt-vs-claude-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Grok vs ChatGPT vs Claude",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grok vs ChatGPT vs Claude 2026 | Grok Searcher",
    description: "Detailed comparison of Grok, ChatGPT and Claude.",
    images: [
      {
        url: "/images/grok-vs-chatgpt-vs-claude-2026.jpg",
        alt: "Grok vs ChatGPT vs Claude",
      },
    ],
  },
};

export default function GrokVsChatGPT() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Grok vs ChatGPT vs Claude 2026</h1>
      <p className="text-xl text-gray-600">A no-hype comparison of the top three AI models right now.</p>

      <div className="mt-8 bg-white p-8 rounded-3xl border">
        <h2 className="font-semibold text-2xl mb-4">Quick Verdict</h2>
        <ul className="space-y-3 text-sm">
          <li><strong>Grok wins</strong> for real-time X (Twitter) data, current events, humor, and fast research.</li>
          <li><strong>ChatGPT</strong> remains the most well-rounded for general use and plugins/ecosystem.</li>
          <li><strong>Claude</strong> often leads at long-form writing, careful reasoning and large context windows.</li>
        </ul>
      </div>

      <div className="mt-10">
        <h3 className="font-semibold text-lg mb-3">When to use Grok</h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
          <li>You need fresh social conversation and trends from X</li>
          <li>You're doing competitive or cultural research</li>
          <li>You want more personality and less corporate filter</li>
        </ul>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Grok vs ChatGPT vs Claude 2026",
            "description": "Detailed comparison of Grok, ChatGPT and Claude across real-time search, coding, writing, pricing.",
            "url": "https://groksearcher.com/comparisons/grok-vs-chatgpt"
          },
          {
            "@type": "Article",
            "headline": "Grok vs ChatGPT vs Claude 2026",
            "description": "Detailed comparison of Grok, ChatGPT and Claude across real-time search, coding, writing, pricing and when to choose each model.",
            "author": { "@type": "Organization", "name": "Grok Searcher" },
            "url": "https://groksearcher.com/comparisons/grok-vs-chatgpt"
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Comparisons", "item": "https://groksearcher.com/comparisons" },
              { "@type": "ListItem", "position": 3, "name": "Grok vs ChatGPT vs Claude", "item": "https://groksearcher.com/comparisons/grok-vs-chatgpt" }
            ]
          }
        ]
      }} />
    </div>
  );
}
