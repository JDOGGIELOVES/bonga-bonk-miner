import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Grok vs ChatGPT vs Claude & More Comparisons",
  description: "Honest comparisons of Grok against ChatGPT, Claude and Gemini. Find out which AI is best for research, coding, writing and real-time insights in 2026.",
};

const comparisons = [
  { title: "Grok vs ChatGPT vs Claude", href: "/comparisons/grok-vs-chatgpt", desc: "Feature-by-feature breakdown of speed, search, reasoning and pricing." },
  { title: "Grok vs Claude", href: "/comparisons/grok-vs-claude", desc: "Real-time X insights vs superior long-form reasoning and writing quality." },
  { title: "Grok vs Gemini", href: "/comparisons/grok-vs-gemini", desc: "How Grok's real-time X access stacks up against Google's latest model." },
];

export default function ComparisonsHub() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">AI Model Comparisons</h1>
      <p className="text-xl text-gray-600 mb-8">Which model should you actually use in 2026?</p>

      <div className="grid gap-4 md:grid-cols-2">
        {comparisons.map((c, i) => (
          <Link key={i} href={c.href} className="block p-6 bg-white rounded-2xl border hover:border-blue-500 transition">
            <div className="font-semibold text-xl mb-2">{c.title}</div>
            <p className="text-gray-600">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
