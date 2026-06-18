import { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';
import { blogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.groksearcher.com';

  const staticRoutes = [
    '',
    '/free-grok-tools',
    '/upload-prompt',
    '/best-grok-prompts',
    '/best-grok-image-prompts',
    '/comparisons',
    '/grok-search',
    '/memes',
    '/categories',
    '/blog',
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const categoryRoutes = categories.map((cat) => ({
    url: `${base}/grok-for/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes];
}
