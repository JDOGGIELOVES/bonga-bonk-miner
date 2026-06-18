import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Grok vs Claude 2026 Comparison",
  description: "Full Grok vs Claude 2026 comparison: real-time X insights vs deep reasoning and writing. Includes example prompts and when to use each.",
  openGraph: {
    title: "Grok vs Claude 2026 | Grok Searcher",
    description: "Grok vs Claude 2026: real-time social intelligence vs deep reasoning and writing craft, with example prompts.",
    images: [
      {
        url: "/images/grok-vs-chatgpt-vs-claude-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Grok vs Claude",
      },
    ],
    url: "https://groksearcher.com/comparisons/grok-vs-claude",
    siteName: "Grok Searcher",
    locale: "en_US",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grok vs Claude 2026 | Grok Searcher",
    description: "Grok vs Claude 2026 full comparison with prompts.",
    images: [
      {
        url: "/images/grok-vs-chatgpt-vs-claude-2026.jpg",
        width: 1200,
        height: 630,
        alt: "Grok vs Claude",
      },
    ],
  },
};

export default function GrokVsClaude() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-4">Grok vs Claude 2026</h1>
      <p className="text-xl text-gray-600 mb-8">Real-time social intelligence vs deep reasoning and writing craft.</p>

      <div className="bg-white p-8 rounded-3xl border mb-8">
        <h2 className="font-semibold text-2xl mb-4">Quick Verdict</h2>
        <ul className="space-y-3 text-sm">
          <li><strong>Grok wins</strong> for real-time X data, current events, social sentiment, humor, and fast cultural insights.</li>
          <li><strong>Claude wins</strong> for long-form writing, careful step-by-step reasoning, large document analysis, and polished creative or technical output.</li>
          <li>Many users keep both in their toolkit and switch based on the task.</li>
        </ul>
      </div>

      <div className="bg-white p-8 rounded-3xl border mb-8">
        <h2 className="font-semibold text-2xl mb-4">Key Differences</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <strong>Grok strengths</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Native real-time access to X conversations and trends</li>
              <li>Less filtered, more direct and humorous personality</li>
              <li>Excellent for cultural, news, social research and breaking events</li>
              <li>Fast responses with fresh social signals</li>
            </ul>
          </div>
          <div>
            <strong>Claude strengths</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Superior long-context reasoning and careful writing</li>
              <li>Very thoughtful, structured, and high-quality outputs</li>
              <li>Great at large documents, codebases, and complex analysis</li>
              <li>Excellent for long-form creative writing and editing</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-3">When to use Grok</h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
          <li>You need the latest conversations and sentiment from X</li>
          <li>You're tracking breaking news, trends, or cultural moments in real time</li>
          <li>You want personality, humor, or unfiltered takes</li>
          <li>Speed + social context matters more than perfect polish</li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-semibold text-lg mb-3">When to use Claude</h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
          <li>You're working with long documents, research papers, or codebases</li>
          <li>You need high-quality, careful, and well-structured writing</li>
          <li>Deep reasoning or multi-step analysis is required</li>
          <li>You want thoughtful creative or technical output</li>
        </ul>
      </div>

      <div className="mt-10">
        <h3 className="font-semibold text-lg mb-3">Example Prompts to Test the Differences</h3>
        <p className="text-sm text-gray-600 mb-4">Try these on both models to see where each excels.</p>
        
        <div className="space-y-6">
          {[
            { title: "Real-time Social Pulse", text: "What are people on X saying right now about [topic]? Summarize the main sentiments, influential voices, and any emerging narratives.", note: "Grok pulls live data; Claude relies on training cutoff." },
            { title: "Deep Document Analysis", text: "Read the following long document and provide a detailed, structured summary with key arguments, weaknesses, and implications for [industry].", note: "Claude generally handles very long context better." },
            { title: "Humor & Personality", text: "Write a short, clever, and slightly irreverent take on [current event or trend] in the style of a late-night comedy monologue.", note: "Grok tends to be funnier and less corporate." },
            { title: "Long-form Writing", text: "Write a 1200-word thoughtful essay on [topic] with strong structure, original insights, and careful nuance.", note: "Claude often produces more polished, careful prose." },
            { title: "Cultural & Social Research", text: "Analyze recent X discussions around [controversial topic]. Highlight the range of perspectives and any surprising angles.", note: "Grok's real-time X access is a clear advantage." },
            { title: "Careful Reasoning", text: "Walk through the ethical implications of [technology or policy] step by step, considering multiple stakeholder perspectives.", note: "Claude shines at deliberate, multi-sided analysis." },
          ].map((ex, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border">
              <div className="font-medium mb-1">{ex.title}</div>
              <p className="font-mono text-sm mb-2 text-gray-800 bg-gray-50 p-3 rounded">{ex.text}</p>
              <p className="text-xs text-gray-600"><strong>Best for:</strong> {ex.note}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-gray-700">Power users often use Grok for the “what’s happening right now” layer and Claude for the deep, high-quality synthesis layer.</p>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Grok vs Claude 2026",
            "description": "Grok vs Claude comparison: real-time X insights vs superior long-form reasoning and writing quality.",
            "url": "https://groksearcher.com/comparisons/grok-vs-claude"
          },
          {
            "@type": "Article",
            "headline": "Grok vs Claude 2026",
            "description": "Full comparison of real-time X intelligence vs long-context reasoning and writing quality, with example prompts.",
            "author": { "@type": "Organization", "name": "Grok Searcher" },
            "url": "https://groksearcher.com/comparisons/grok-vs-claude"
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Comparisons", "item": "https://groksearcher.com/comparisons" },
              { "@type": "ListItem", "position": 3, "name": "Grok vs Claude", "item": "https://groksearcher.com/comparisons/grok-vs-claude" }
            ]
          }
        ]
      }} />
    </div>
  );
}
