import type { Metadata } from 'next';
import Link from 'next/link';
import CategoriesClient from '@/components/CategoriesClient';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Browse Grok Categories - Business, Marketing, Engineering & More",
  description: "Explore 80+ specialized Grok prompt categories for every role and task. From business and coding to zero-click threats and creative writing.",
  openGraph: {
    title: "Browse Grok Categories | Grok Searcher",
    description: "Explore 80+ specialized Grok prompt categories for every role and task.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        width: 1200,
        height: 630,
        alt: "Browse Grok Categories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Grok Categories | Grok Searcher",
    description: "Explore 80+ specialized Grok prompt categories for every role and task.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        alt: "Browse Grok Categories",
      },
    ],
  },
};

export default function CategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-5xl font-bold mb-3">Browse by Category</h1>
      <p className="text-lg text-gray-600 mb-4">Specialized prompt collections for every role and task.</p>

      <CategoriesClient />

      <p className="mt-8 text-xs text-gray-500">More categories added regularly. Missing one? Let us know on X.</p>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Browse Grok Categories",
        "description": "Explore 80+ specialized Grok prompt categories for every role and task.",
        "url": "https://groksearcher.com/categories"
      }} />
    </div>
  );
}
