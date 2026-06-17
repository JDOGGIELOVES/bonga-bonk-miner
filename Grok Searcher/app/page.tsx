'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CategoryCard from '@/components/CategoryCard';
import { categories } from '@/lib/categories';

const featured = [
  { title: "50 Best Grok Prompts", href: "/best-grok-prompts", desc: "Copy-paste ready prompts for productivity, coding, creativity and more.", img: "/images/grok-50-best-prompts.jpg" },
  { title: "Best Grok Image Prompts", href: "/best-grok-image-prompts", desc: "Dozens of tested prompts + tips for high-quality image generation.", img: "/images/grok-prompt-engineering-masterclass-2026.jpg" },
  { title: "Grok vs ChatGPT vs Claude", href: "/comparisons/grok-vs-chatgpt", desc: "Honest 2026 comparison of strengths, weaknesses and best use cases.", img: "/images/grok-vs-chatgpt-vs-claude-2026.jpg" },
  { title: "How to Search with Grok", href: "/grok-search", desc: "Unlock real-time X research, trends and SEO insights with copy-paste prompts.", img: "/images/grok-search-research-guide-2026.jpg" },
  { title: "Grok for Business", href: "/grok-for/business", desc: "Practical workflows for meetings, strategy, research and faster execution.", img: "/images/grok-for-business-2026.jpg" },
  { title: "Grok Memes (I'm Tired Boss)", href: "/memes", desc: "Viral funny series and shareable Grok humor.", img: "/images/grok-meme-depressed-robot.jpg" },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeatured = featured.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const topCategories = categories.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center pt-16 pb-10 px-6">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">Grok Searcher</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Free, high-quality prompts, guides and comparisons for Grok by xAI.
        </p>

        <div className="max-w-[640px] mx-auto">
          <div className="flex items-center bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden focus-within:border-blue-500">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search topics... (e.g. business prompts, image generation, research)"
              className="flex-1 min-w-0 px-6 py-4 text-base bg-transparent focus:outline-none"
            />
            <button
              onClick={() => window.location.href = '/categories'}
              className="shrink-0 bg-black text-white px-6 py-3.5 text-sm font-medium active:bg-gray-800 transition"
            >
              Browse All
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500">Type to filter cards below in real time. Try “business”, “image”, or “research”</p>
        </div>
      </div>

      {/* Featured */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured Resources</h2>
            <p className="text-sm text-gray-500">High-value pages our users come back to most.</p>
          </div>
          <Link href="/categories" className="text-sm text-blue-600 hover:underline">Browse everything →</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(searchTerm ? filteredFeatured : featured).map((item, i) => (
            <Link key={i} href={item.href} className="block bg-white rounded-2xl border hover:border-blue-500 hover:shadow transition featured-card overflow-hidden">
              {item.img && <img src={item.img} alt={item.title} className="w-full h-auto max-h-[210px] object-contain bg-gray-50" />}
              <div className="p-4">
                <div className="font-semibold text-lg mb-1">{item.title}</div>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Popular Categories</h2>
          <Link href="/categories" className="text-sm text-blue-600 hover:underline">See all categories →</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(searchTerm ? filteredCategories : topCategories).map((cat) => (
            <CategoryCard
              key={cat.slug}
              title={cat.title}
              description={cat.description}
              href={`/grok-for/${cat.slug}`}
              image={cat.image}
            />
          ))}
        </div>
      </div>

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
    </div>
  );
}
