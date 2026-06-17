import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PromptCard from '@/components/PromptCard';
import JsonLd from '@/components/JsonLd';
import { getCategoryBySlug, categories } from '@/lib/categories';
import { getCategoryPrompts } from '@/lib/prompts';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return categories.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return { title: 'Category Not Found' };

  return {
    title: `${cat.title} Prompts & Guides`,
    description: cat.description,
    openGraph: {
      images: cat.image ? [{ url: cat.image }] : undefined,
    },
  };
}

export default function GrokForCategory({ params }: Props) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const content = getCategoryPrompts(params.slug);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="max-w-3xl mb-8">
        <h1 className="text-5xl font-bold mb-4">{cat.title}</h1>
        <p className="text-xl text-gray-600">{cat.description}</p>
        <p className="mt-4 text-gray-700">{content.intro}</p>
      </div>

      {content.useCases && content.useCases.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">High-Impact Use Cases</h2>
          <ul className="grid md:grid-cols-2 gap-2 text-sm">
            {content.useCases.map((uc, i) => (
              <li key={i} className="bg-white p-3 rounded-xl border">• {uc}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Ready-to-Use Prompts</h2>
        {content.sections.map((section, si) => (
          <div key={si} className="mb-8">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">{section.title}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {section.prompts.map((p, i) => (
                <PromptCard key={i} text={p.text} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {content.faqs && content.faqs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked</h2>
          <div className="space-y-4">
            {content.faqs.map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border">
                <div className="font-medium mb-1">{faq.q}</div>
                <div className="text-sm text-gray-700">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Tip: Replace [brackets] with your specific details. Combine these with prompts from the Best Grok Prompts collection.
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": cat.title,
        "description": cat.description,
        "author": { "@type": "Organization", "name": "Grok Searcher" }
      }} />
    </div>
  );
}
