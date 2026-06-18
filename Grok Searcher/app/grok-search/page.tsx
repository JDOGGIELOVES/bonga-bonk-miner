import type { Metadata } from 'next';
import PromptCard from '@/components/PromptCard';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "How to Search with Grok: Complete 2026 Guide",
  description: "Master real-time X searches, research prompts, and using Grok for traffic & SEO insights. Includes ready-to-copy prompts.",
  openGraph: {
    title: "How to Search with Grok: Complete 2026 Guide | Grok Searcher",
    description: "Master real-time X searches, research prompts, and using Grok for traffic & SEO insights. Includes ready-to-copy prompts.",
    images: [
      {
        url: "/images/grok-search-research-guide-2026.jpg",
        width: 1200,
        height: 630,
        alt: "How to Search with Grok",
      },
    ],
    url: "https://groksearcher.com/grok-search",
    siteName: "Grok Searcher",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Search with Grok: Complete 2026 Guide | Grok Searcher",
    description: "Master real-time X searches, research prompts, and using Grok for traffic & SEO insights.",
    images: [
      {
        url: "/images/grok-search-research-guide-2026.jpg",
        width: 1200,
        height: 630,
        alt: "How to Search with Grok",
      },
    ],
  },
};

export default function GrokSearchGuide() {
  const prompts = [
    { text: "Find the most interesting conversations on X right now about [topic]. Summarize the top 5 unique angles.", guidance: "One of the best grok search prompts for real-time research. Surfaces what people are actually talking about right now instead of outdated search results." },
    { text: "What are emerging trends in [industry] based on recent posts from influential accounts?", guidance: "Use this grok prompt for market research and trend spotting. Pulls fresh signals from X that traditional tools miss." },
    { text: "Give me 8 fresh content ideas for [niche] pulled from the last 48 hours of X discussion.", guidance: "Excellent grok prompt for content creators and social media managers. Generates timely ideas tied to current conversations." }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">How to Search with Grok</h1>
      <p className="text-xl text-gray-600">Unlock Grok&apos;s real-time X search power for research, trends, SEO keyword ideas, and traffic insights.</p>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Powerful Search Prompts</h2>
        <div className="space-y-4">
          {prompts.map((p, i) => <PromptCard key={i} text={p.text} guidance={p.guidance} />)}
        </div>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "How to Search with Grok: Complete 2026 Guide",
            "description": "Master real-time X searches, research prompts, and using Grok for traffic & SEO insights.",
            "url": "https://groksearcher.com/grok-search",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grok Searcher",
              "url": "https://groksearcher.com"
            }
          },
          {
            "@type": "Article",
            "headline": "How to Search with Grok",
            "description": "Unlock Grok's real-time X search power for research, trends, SEO keyword ideas, and traffic insights.",
            "author": { "@type": "Organization", "name": "Grok Searcher" },
            "url": "https://groksearcher.com/grok-search"
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "How to Search with Grok", "item": "https://groksearcher.com/grok-search" }
            ]
          }
        ]
      }} />
    </div>
  );
}
