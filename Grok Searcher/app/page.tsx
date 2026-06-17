import type { Metadata } from 'next';
import Link from 'next/link';
import HomeSearch from '@/components/HomeSearch';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Grok Searcher - Best Grok Prompts, Guides & Comparisons",
  description: "Free copy-paste Grok prompts, in-depth guides, comparisons and tools for Grok by xAI. Explore 50+ categories with practical, battle-tested prompts.",
  openGraph: {
    images: [{ url: "/images/grok-50-best-prompts.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grok Searcher - Best Grok Prompts, Guides & Comparisons",
    description: "Free copy-paste Grok prompts, in-depth guides, comparisons and tools for Grok by xAI.",
    images: ["/images/grok-50-best-prompts.jpg"],
  },
};

export default function Home() {
  return (
    <div>
      <HomeSearch />

      {/* Value prop */}
      <div className="bg-white border-y py-12">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h3 className="font-semibold text-lg mb-3">Built for real results with Grok</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            Every prompt and guide is tested for clarity and effectiveness. 
            We focus on what actually moves the needle: speed, real-time X insights, and practical copy-paste value.
          </p>
        </div>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "name": "Grok Searcher",
            "url": "https://groksearcher.com",
            "description": "Free copy-paste Grok prompts, guides and comparisons for every use case.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://groksearcher.com/categories?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@type": "Organization",
            "name": "Grok Searcher",
            "url": "https://groksearcher.com",
            "sameAs": ["https://x.com/grok"]
          }
        ]
      }} />
    </div>
  );
}
