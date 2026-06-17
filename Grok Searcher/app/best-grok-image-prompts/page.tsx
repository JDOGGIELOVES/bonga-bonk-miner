import type { Metadata } from 'next';
import PromptCard from '@/components/PromptCard';
import { imagePrompts } from '@/lib/prompts';

export const metadata: Metadata = {
  title: "Best Grok Image Prompts 2026",
  description: "Tested Grok image generation prompts for marketing, concepts, products and creative work.",
  openGraph: { images: [{ url: "/images/grok-prompt-engineering-masterclass-2026.jpg" }] }
};

export default function ImagePrompts() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Best Grok Image Prompts</h1>
      <p className="text-xl text-gray-600 mb-8">High-quality, copy-paste prompts for Grok&apos;s image generation.</p>

      <div className="grid gap-4 md:grid-cols-2">
        {imagePrompts.map((p, i) => (
          <PromptCard key={i} text={p.text} />
        ))}
      </div>
    </div>
  );
}
