import type { Metadata } from 'next';
import PromptCard from '@/components/PromptCard';
import JsonLd from '@/components/JsonLd';
import { bestPrompts } from '@/lib/prompts';

export const metadata: Metadata = {
  title: "50 Best Grok Prompts (Copy-Paste)",
  description: "Copy-paste ready Grok prompts for productivity, creative writing, coding, research, image generation and everyday tasks. Tested and refined.",
  openGraph: {
    title: "50 Best Grok Prompts (Copy-Paste) | Grok Searcher",
    images: [{ url: "/images/grok-50-best-prompts.jpg" }],
  },
};

export default function BestGrokPrompts() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are the best general purpose Grok prompts?",
        "acceptedAnswer": { "@type": "Answer", "text": "The general section includes versatile prompts for explanations, reviews, step-by-step problem solving and comparisons." }
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">50 Best Grok Prompts</h1>
        <p className="text-xl text-gray-600">Copy-paste ready prompts that actually work with Grok by xAI. Categorized for easy browsing.</p>
        <p className="mt-2 text-sm text-gray-500">Updated 2026 • All prompts tested and refined</p>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "50 Best Grok Prompts You Can Copy and Paste",
        "author": { "@type": "Organization", "name": "Grok Searcher" }
      }} />

      {/* General */}
      <section id="general" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 border-b pb-3">General / Everyday Use</h2>
        <p className="text-gray-600 mb-4">These everyday prompts are perfect for quick wins.</p>
        <div className="grid gap-6 md:grid-cols-2">
          {bestPrompts.general.map((p, idx) => (
            <PromptCard key={idx} text={p.text} guidance={p.guidance} />
          ))}
        </div>
      </section>

      <section id="productivity" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 border-b pb-3">Productivity</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {bestPrompts.productivity.map((p, idx) => (
            <PromptCard key={idx} text={p.text} guidance={p.guidance} />
          ))}
        </div>
      </section>

      <section id="coding" className="mb-16">
        <h2 className="text-3xl font-bold mb-6 border-b pb-3">Coding &amp; Technical</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {bestPrompts.coding.map((p, idx) => (
            <PromptCard key={idx} text={p.text} guidance={p.guidance} />
          ))}
        </div>
      </section>

      <div className="text-sm text-gray-500 mt-8">
        Pro tip: Replace the brackets [like this] with your actual topic or content.
      </div>

      <section className="mt-8">
        <h3 className="font-semibold mb-2">Pro Tips for Better Results</h3>
        <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
          <li>Be extremely specific about context, constraints, and desired format.</li>
          <li>Ask for step-by-step reasoning on hard problems.</li>
          <li>Iterate: “Improve your previous answer and make it more actionable.”</li>
        </ul>
      </section>

      <JsonLd data={faqData} />
    </div>
  );
}
