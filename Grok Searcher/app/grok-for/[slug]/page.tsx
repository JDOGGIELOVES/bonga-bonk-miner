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
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">{cat.title}</h1>
        <p className="text-xl text-gray-600">{cat.description}</p>
      </div>

      {(content.whyTitle || content.whyItems) && (
        <div className="bg-white p-8 rounded-3xl border mb-12">
          <h2 className="text-2xl font-semibold mb-4">{content.whyTitle || `Why ${cat.title.replace('Grok for ', '')} Are Using Grok in 2026`}</h2>
          {content.useCasesIntro && <p className="mb-4 text-sm text-gray-600">{content.useCasesIntro}</p>}
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {(content.whyItems || []).length > 0 ? content.whyItems.map((item, i) => (
              <div key={i}>
                <strong>{item.title}</strong><br />
                {item.desc}
              </div>
            )) : content.useCases.slice(0, 3).map((uc, i) => (
              <div key={i}>
                <strong>{uc}</strong><br />
                Real-time insights and fast execution with Grok.
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-600">Grok’s real-time X access + strong reasoning makes it especially useful for fast-moving {cat.title.toLowerCase().replace('grok for ', '')} work where traditional search or other AIs lag behind.</p>
        </div>
      )}

      {content.useCases && content.useCases.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">High-Impact Use Cases</h2>
          {content.useCasesIntro && <p className="text-gray-600 mb-4">{content.useCasesIntro}</p>}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {content.useCases.map((uc, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border">
                <h3 className="font-semibold mb-3">{uc}</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Real-time signals and fast drafting</li>
                  <li>Actionable outputs you can use immediately</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Top Copy-Paste Prompts</h2>
        {content.promptsGuidance && <p className="text-gray-600 mb-4">{content.promptsGuidance}</p>}
        {content.sections.map((section, si) => (
          <div key={si} className="mb-8">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">{section.title}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {section.prompts.map((p, i) => (
                <PromptCard key={i} text={p.text} guidance={p.guidance} />
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
