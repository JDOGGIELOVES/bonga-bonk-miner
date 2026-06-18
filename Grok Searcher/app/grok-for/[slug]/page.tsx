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

  const base = cat.title.replace('Grok for ', '');
  const pageTitle = `${cat.title} Prompts & Guides`;
  const ogTitle = `${cat.title} | Grok Searcher`;
  const desc = cat.description || `Expert Grok prompts and guides for ${base}. Copy-paste ready use cases and examples.`;
  const imageUrl = cat.image || '/images/grok-50-best-prompts.jpg';

  return {
    title: pageTitle,
    description: desc,
    openGraph: {
      title: ogTitle,
      description: desc,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${cat.title} - Grok Prompts`,
        },
      ],
      url: `https://groksearcher.com/grok-for/${params.slug}`,
      siteName: "Grok Searcher",
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${cat.title} - Grok Prompts`,
        },
      ],
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

      {( (content.whyItems && content.whyItems.length > 0) || content.whyTitle ) && (
        <div className="bg-white p-8 rounded-3xl border mb-12">
          <h2 className="text-2xl font-semibold mb-4">{content.whyTitle || `Why ${cat.title.replace('Grok for ', '')} Pros Use Grok`}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            {(() => {
              const whyItems = content.whyItems || [];
              return whyItems.length > 0 
                ? whyItems.map((item, i) => (
                    <div key={i}>
                      <strong>{item.title}</strong><br />
                      {item.desc}
                    </div>
                  ))
                : content.useCases.slice(0, 3).map((uc, i) => {
                    const whyPhrases = [
                      `Leverage Grok for targeted results in ${uc.title}.`,
                      `Get expert assistance with ${uc.title} using Grok.`,
                      `Enhance your approach to ${uc.title} with Grok's help.`
                    ];
                    return (
                      <div key={i}>
                        <strong>{uc.title}</strong><br />
                        {whyPhrases[i % whyPhrases.length]}
                      </div>
                    );
                  });
            })()}
          </div>
        </div>
      )}

      {content.useCases && content.useCases.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">High-Impact Use Cases</h2>
          {content.useCasesIntro && <p className="text-gray-600 mb-4">{content.useCasesIntro}</p>}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {content.useCases.map((uc, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border">
                <h3 className="font-semibold mb-3">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-snug">{uc.description}</p>
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

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": cat.title,
            "description": cat.description,
            "url": `https://groksearcher.com/grok-for/${params.slug}`,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grok Searcher",
              "url": "https://groksearcher.com"
            }
          },
          {
            "@type": "Article",
            "headline": cat.title,
            "description": cat.description,
            "author": { "@type": "Organization", "name": "Grok Searcher" },
            "publisher": { "@type": "Organization", "name": "Grok Searcher", "url": "https://groksearcher.com" },
            "url": `https://groksearcher.com/grok-for/${params.slug}`
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Categories", "item": "https://groksearcher.com/categories" },
              { "@type": "ListItem", "position": 3, "name": cat.title, "item": `https://groksearcher.com/grok-for/${params.slug}` }
            ]
          },
          ...(content.faqs && content.faqs.length > 0 ? [{
            "@type": "FAQPage",
            "mainEntity": content.faqs.map((faq: {q: string, a: string}) => ({
              "@type": "Question",
              "name": faq.q,
              "acceptedAnswer": { "@type": "Answer", "text": faq.a }
            }))
          }] : [])
        ]
      }} />
    </div>
  );
}
