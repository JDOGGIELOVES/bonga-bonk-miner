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

  return {
    title: post.title,
    description: post.description,
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
        "@type": "Article",
        "headline": post.title,
        "description": post.description,
        "author": { "@type": "Organization", "name": "Grok Searcher" }
      }} />
    </div>
  );
}
