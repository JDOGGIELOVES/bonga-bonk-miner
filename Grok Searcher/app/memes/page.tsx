import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: "Best Grok Memes & 'I'm Tired Boss' Series",
  description: "Funny Grok memes and the viral 'I'm Tired Boss' series. Copy and share the best ones.",
  openGraph: {
    title: "Best Grok Memes & 'I'm Tired Boss' Series | Grok Searcher",
    description: "Funny Grok memes and the viral 'I'm Tired Boss' series. Copy and share the best ones.",
    images: [{ url: "/images/grok-meme-depressed-robot.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Grok Memes & 'I'm Tired Boss' Series | Grok Searcher",
    description: "Funny Grok memes and the viral 'I'm Tired Boss' series.",
    images: ["/images/grok-meme-depressed-robot.jpg"],
  },
};

export default function Memes() {
  const memes = [
    '"I\'m tired boss... but here\'s a 47-point plan anyway."',
    '"You asked for a simple summary. I gave you a thesis. I\'m tired boss."',
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-center">
      <h1 className="text-5xl font-bold mb-4">Best Grok Memes</h1>
      <p className="text-xl text-gray-600 mb-10">The legendary "I&apos;m Tired Boss" series and other Grok humor.</p>

      <div className="space-y-4 text-left max-w-xl mx-auto">
        {memes.map((m, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border text-lg font-mono">{m}</div>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-500">Share responsibly. Grok has feelings (sometimes).</p>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Best Grok Memes & 'I'm Tired Boss' Series",
            "description": "Funny Grok memes and the viral 'I'm Tired Boss' series.",
            "url": "https://groksearcher.com/memes"
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Grok Memes", "item": "https://groksearcher.com/memes" }
            ]
          }
        ]
      }} />
    </div>
  );
}
