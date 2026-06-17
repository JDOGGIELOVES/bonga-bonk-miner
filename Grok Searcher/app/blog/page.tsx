import Link from 'next/link';
import type { Metadata } from 'next';
import { blogPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: "Blog & Guides - Grok Tips, Research & Prompting",
  description: "In-depth articles and guides about using Grok effectively for research, prompting, real-time search, and AI workflows. Practical 2026 tutorials.",
  openGraph: {
    title: "Blog & Guides | Grok Searcher",
    description: "In-depth articles and guides about using Grok effectively for research, prompting, and workflows.",
    images: [{ url: "/images/grok-search-research-guide-2026.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Guides | Grok Searcher",
    description: "In-depth articles and guides about using Grok effectively for research, prompting, and workflows.",
    images: ["/images/grok-search-research-guide-2026.jpg"],
  },
};

export default function BlogIndex() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-8">Blog &amp; Guides</h1>

      <div className="space-y-6">
        {blogPosts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`} 
            className="block p-6 bg-white rounded-2xl border hover:border-blue-500 transition"
          >
            <div className="font-semibold text-xl">{post.title}</div>
            <p className="text-sm text-gray-600 mt-1">{post.description}</p>
            <div className="text-xs text-gray-500 mt-2">{post.date}</div>
          </Link>
        ))}

        <Link href="/grok-search" className="block p-6 bg-white rounded-2xl border hover:border-blue-500">
          <div className="font-semibold text-xl">How to Search with Grok (2026 Guide)</div>
          <p className="text-sm text-gray-600 mt-1">Real-time research, SEO, and traffic tactics using Grok&apos;s X integration.</p>
        </Link>
      </div>
    </div>
  );
}
