import type { Metadata } from 'next';
import PromptCard from '@/components/PromptCard';
import JsonLd from '@/components/JsonLd';
import { imagePrompts } from '@/lib/prompts';

export const metadata: Metadata = {
  title: "Best Grok Image Prompts 2026 (Copy-Paste)",
  description: "Tested Grok image generation prompts for marketing visuals, product shots, concepts and creative work. 30+ ready-to-use prompts with guidance and example styles.",
  openGraph: {
    title: "Best Grok Image Prompts 2026 | Grok Searcher",
    description: "Tested Grok image generation prompts for marketing, concepts, products and creative work. 30+ copy-paste ready prompts.",
    images: [
      {
        url: "/images/sample-cinematic-explorer.jpg",
        width: 1200,
        height: 630,
        alt: "Dynamic artistic image example created with Grok image prompts",
      },
    ],
    url: "https://www.groksearcher.com/best-grok-image-prompts",
    siteName: "Grok Searcher",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Grok Image Prompts 2026 | Grok Searcher",
    description: "Tested Grok image generation prompts for marketing, concepts, products and creative work. 30+ copy-paste ready prompts.",
    images: [
      {
        url: "/images/sample-cinematic-explorer.jpg",
        width: 1200,
        height: 630,
        alt: "Dynamic artistic image example created with Grok image prompts",
      },
    ],
  },
};

export default function ImagePrompts() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Best Grok Image Prompts</h1>
      <p className="text-xl text-gray-600 mb-8">30+ high-quality, copy-paste prompts for Grok&apos;s image generation, with guidance and visual examples.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {imagePrompts.map((p, i) => (
          <PromptCard key={i} title={p.title} text={p.text} guidance={p.guidance} />
        ))}
      </div>

      {/* Visual Examples Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Example Images from Grok</h2>
        <p className="text-gray-600 mb-6">These are real examples of the kinds of artistic and creative outputs you can generate with the prompts above (and variations).</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { src: "/images/sample-cinematic-explorer.jpg", prompt: "Cinematic wide shot at golden hour", desc: "Epic explorer scene with dramatic lighting" },
            { src: "/images/sample-epic-temple.jpg", prompt: "Fantasy architecture prompt", desc: "Majestic floating temple in surreal setting" },
            { src: "/images/sample-surreal-islands.jpg", prompt: "Surreal landscape prompt", desc: "Dreamlike floating islands with ethereal vibe" },
            { src: "/images/sample-minimalist-lake.jpg", prompt: "Minimalist nature prompt", desc: "Serene minimalist mountain lake at dawn" },
            { src: "/images/sample-minimalist-woman.jpg", prompt: "Portrait / character prompt", desc: "Elegant minimalist portrait with soft lighting" },
            { src: "/images/sample-wolf-forest.jpg", prompt: "Mystical creature prompt", desc: "Mysterious white wolf in enchanted forest" },
          ].map((ex, i) => (
            <div key={i} className="bg-white rounded-2xl border overflow-hidden">
              <div className="relative w-full h-48 bg-gray-50">
                <img src={ex.src} alt={ex.desc} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">{ex.prompt}</div>
                <div className="text-xs text-gray-600">{ex.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500">Tip: Combine prompts with specific artists, lighting, and camera directions for even better results.</p>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Best Grok Image Prompts 2026",
            "description": "Tested Grok image generation prompts for marketing, concepts, products and creative work.",
            "url": "https://www.groksearcher.com/best-grok-image-prompts",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grok Searcher",
              "url": "https://www.groksearcher.com"
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Best Grok Image Prompts", "item": "https://www.groksearcher.com/best-grok-image-prompts" }
            ]
          }
        ]
      }} />
    </div>
  );
}
