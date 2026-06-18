import type { Metadata } from 'next';
import PromptCard from '@/components/PromptCard';
import JsonLd from '@/components/JsonLd';
import { imagePrompts } from '@/lib/prompts';

export const metadata: Metadata = {
  title: "Best Grok Image Prompts 2026 (Copy-Paste)",
  description: "Tested Grok image generation prompts for marketing visuals, product shots, concepts and creative work. Ready-to-use with examples.",
  openGraph: {
    title: "Best Grok Image Prompts 2026 | Grok Searcher",
    description: "Tested Grok image generation prompts for marketing, concepts, products and creative work.",
    images: [
      {
        url: "/images/sample-cinematic-explorer.jpg",
        width: 1200,
        height: 630,
        alt: "Dynamic artistic image example created with Grok image prompts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Grok Image Prompts 2026 | Grok Searcher",
    description: "Tested Grok image generation prompts for marketing, concepts, products and creative work.",
    images: [
      {
        url: "/images/sample-cinematic-explorer.jpg",
        alt: "Dynamic artistic image example created with Grok image prompts",
      },
    ],
  },
};

export default function ImagePrompts() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Best Grok Image Prompts</h1>
      <p className="text-xl text-gray-600 mb-8">High-quality, copy-paste prompts for Grok&apos;s image generation.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {imagePrompts.map((p, i) => (
          <PromptCard key={i} text={p.text} guidance={p.guidance} />
        ))}
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Best Grok Image Prompts 2026",
            "description": "Tested Grok image generation prompts for marketing, concepts, products and creative work.",
            "url": "https://groksearcher.com/best-grok-image-prompts"
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Best Grok Image Prompts", "item": "https://groksearcher.com/best-grok-image-prompts" }
            ]
          }
        ]
      }} />
    </div>
  );
}
