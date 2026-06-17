import { MetadataRoute } from 'next';
import { categories } from '@/lib/categories';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://groksearcher.com';

  const staticRoutes = [
    '',
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

  const categoryRoutes = categories.map((cat) => ({
    url: `${base}/grok-for/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes];
}
