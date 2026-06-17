import type { Metadata } from 'next';
import PromptCard from '@/components/PromptCard';

export const metadata: Metadata = {
  title: "How to Search with Grok: Complete 2026 Guide",
  description: "Master real-time X searches, research prompts, and using Grok for traffic & SEO insights. Includes ready-to-copy prompts.",
  openGraph: { images: [{ url: "/images/grok-search-research-guide-2026.jpg" }] }
};

export default function GrokSearchGuide() {
  const prompts = [
    "Find the most interesting conversations on X right now about [topic]. Summarize the top 5 unique angles.",
    "What are emerging trends in [industry] based on recent posts from influential accounts?",
    "Give me 8 fresh content ideas for [niche] pulled from the last 48 hours of X discussion."
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">How to Search with Grok</h1>
      <p className="text-xl text-gray-600">Unlock Grok&apos;s real-time X search power for research, trends, SEO keyword ideas, and traffic insights.</p>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Powerful Search Prompts</h2>
        <div className="space-y-4">
          {prompts.map((p, i) => <PromptCard key={i} text={p} />)}
        </div>
      </div>
    </div>
  );
}
