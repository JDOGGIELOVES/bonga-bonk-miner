import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return { title: 'Post Not Found' };

  const ogTitle = `${post.title} | Grok Searcher`;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: ogTitle,
      description: post.description,
      images: [
        {
          url: "/images/grok-search-research-guide-2026.jpg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      url: `https://groksearcher.com/blog/${params.slug}`,
      siteName: "Grok Searcher",
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: post.description,
      images: [
        {
          url: "/images/grok-search-research-guide-2026.jpg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default function BlogPost({ params }: Props) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-500">{post.date}</p>
      </div>

      <div className="prose max-w-none text-gray-800">
        {post.content}
      </div>

      <div className="mt-12 pt-6 border-t text-sm text-gray-500">
        <Link href="/blog" className="hover:underline">← Back to all guides</Link>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": post.title,
            "description": post.description,
            "url": `https://groksearcher.com/blog/${params.slug}`,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grok Searcher",
              "url": "https://groksearcher.com"
            }
          },
          {
            "@type": "Article",
            "headline": post.title,
            "description": post.description,
            "author": { "@type": "Organization", "name": "Grok Searcher" },
            "publisher": { "@type": "Organization", "name": "Grok Searcher" },
            "url": `https://groksearcher.com/blog/${params.slug}`
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://groksearcher.com/blog" },
              { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://groksearcher.com/blog/${params.slug}` }
            ]
          }
        ]
      }} />
    </div>
  );
}
