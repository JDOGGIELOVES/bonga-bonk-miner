import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Free Grok Tools 2026 | Best Free Prompts, Generators & Guides",
  description: "The best free Grok tools for 2026. Copy-paste prompts, image generators, search tools, meme makers, story tools, roasts and more. All completely free.",
  openGraph: {
    title: "Free Grok Tools 2026 | Grok Searcher",
    description: "Best free Grok AI tools: prompts, image generators, real-time search, meme tools, storytelling and more. 100% free to use.",
    images: [{ url: "/images/grok-50-best-prompts.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Grok Tools 2026 | Grok Searcher",
    description: "The best free Grok tools: prompts, generators, search tools, meme makers and creative resources.",
    images: ["/images/grok-50-best-prompts.jpg"],
  },
};

const freeTools = [
  {
    title: "50 Best Grok Prompts",
    href: "/best-grok-prompts",
    desc: "Battle-tested, copy-paste ready prompts for productivity, coding, writing, research and daily tasks.",
    category: "Prompt Libraries",
  },
  {
    title: "Best Grok Image Prompts",
    href: "/best-grok-image-prompts",
    desc: "High-quality image generation prompts for marketing visuals, concepts, products and creative work.",
    category: "Creative Tools",
  },
  {
    title: "How to Search with Grok",
    href: "/grok-search",
    desc: "Powerful real-time X search tools and prompts for research, trends, SEO and traffic insights.",
    category: "Research Tools",
  },
  {
    title: "Ultimate Meme Machine",
    href: "/grok-for/ultimate-meme-machine",
    desc: "Generate viral memes, perfect captions and new formats. Turn anything into shareable humor.",
    category: "Fun & Humor Tools",
  },
  {
    title: "Savage Roasts",
    href: "/grok-for/savage-roasts",
    desc: "Craft clever, brutal and hilarious roasts and comebacks with Grok's signature wit.",
    category: "Fun & Humor Tools",
  },
  {
    title: "Story Mode Activated",
    href: "/grok-for/story-mode-activated",
    desc: "Immersive storytelling tools for wild narratives, branching adventures and genre-bending tales.",
    category: "Creative Tools",
  },
  {
    title: "Wild Image Ideas",
    href: "/grok-for/wild-image-ideas",
    desc: "Unleash absurd, hilarious and completely unhinged image generation prompts.",
    category: "Creative Tools",
  },
  {
    title: "Grok Memes",
    href: "/memes",
    desc: "The legendary 'I'm Tired Boss' series and Grok humor. Plus prompts to generate your own.",
    category: "Fun & Humor Tools",
  },
  {
    title: "Grok vs ChatGPT vs Claude",
    href: "/comparisons",
    desc: "Honest comparisons to help you choose the right AI tool for research, coding and writing.",
    category: "Decision Tools",
  },
];

const categories = Array.from(new Set(freeTools.map(t => t.category)));

export default function FreeGrokTools() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">Free Grok Tools</h1>
        <p className="text-xl text-gray-600 mb-6">
          The best completely free tools for Grok by xAI. Copy-paste prompts, generators, 
          search tools, meme makers and creative resources — no sign-up required.
        </p>
        <p className="text-sm text-gray-500">
          Everything here is free to use. Updated for 2026.
        </p>
      </div>

      {/* Tools by Category */}
      {categories.map((cat) => {
        const toolsInCategory = freeTools.filter(t => t.category === cat);
        return (
          <div key={cat} className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-2">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolsInCategory.map((tool, index) => (
                <Link 
                  key={index} 
                  href={tool.href} 
                  className="block p-6 bg-white rounded-2xl border hover:border-blue-500 hover:shadow transition group"
                >
                  <div className="font-semibold text-lg mb-2 group-hover:text-blue-600">{tool.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tool.desc}</p>
                  <div className="mt-4 text-xs text-blue-600 font-medium">Use free →</div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {/* More Resources */}
      <div className="bg-white border rounded-3xl p-8 text-center">
        <h3 className="text-2xl font-semibold mb-3">Want even more specialized tools?</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Browse 80+ categories with targeted Grok prompts for every profession, hobby and use case.
        </p>
        <Link 
          href="/categories" 
          className="inline-block bg-black text-white px-8 py-3 rounded-2xl hover:bg-gray-800 transition"
        >
          Browse All Categories
        </Link>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Free Grok Tools 2026",
        "description": "The best free Grok tools: prompts, image generators, search tools, meme makers and creative resources.",
        "url": "https://groksearcher.com/free-grok-tools",
        "mainEntity": {
          "@type": "ItemList",
          "itemListElement": freeTools.map((tool, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
              "@type": "WebPage",
              "name": tool.title,
              "url": `https://groksearcher.com${tool.href}`
            }
          }))
        }
      }} />
    </div>
  );
}
