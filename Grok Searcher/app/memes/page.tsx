import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import PromptCard from '@/components/PromptCard';
import { getCategoryPrompts } from '@/lib/prompts';

export const metadata: Metadata = {
  title: "Best Grok Memes & 'I'm Tired Boss' Series",
  description: "Funny Grok memes and the viral 'I'm Tired Boss' series. Copy and share the best ones.",
  openGraph: {
    title: "Best Grok Memes & 'I'm Tired Boss' Series | Grok Searcher",
    description: "Funny Grok memes and the viral 'I'm Tired Boss' series. Copy and share the best ones.",
    images: [
      {
        url: "/images/grok-meme-depressed-robot.jpg",
        width: 1200,
        height: 630,
        alt: "Best Grok Memes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Grok Memes & 'I'm Tired Boss' Series | Grok Searcher",
    description: "Funny Grok memes and the viral 'I'm Tired Boss' series.",
    images: [
      {
        url: "/images/grok-meme-depressed-robot.jpg",
        alt: "Best Grok Memes",
      },
    ],
  },
};

export default function Memes() {
  const memes = [
    '"I\'m tired boss... but here\'s a 47-point plan anyway."',
    '"You asked for a simple summary. I gave you a thesis. I\'m tired boss."',
    '"This could have been an email but now it\'s a 12-tweet thread with charts."',
    '"Grok, make it funnier. No, funnier. No, unhinged. Perfect."',
    '"Me: Can you summarize this? Grok: Here\'s a 47-slide deck and a musical number."',
    '"When the group chat asks for one meme and you deliver a whole cinematic universe."',
    '"I asked Grok for a quick joke. Now my entire timeline is a 14-part saga with lore."',
    '"Grok in 2026: turns your 3-word prompt into 9 viral formats and 2 rival fandoms."',
    '"Me: keep it short. Grok: *writes the Iliad but make it about your ex and a raccoon*."',
    '"The algorithm fears me. Grok fears nothing. We are not the same."',
    '"Grok roasted my resume so hard HR sent flowers and a restraining order."',
    '"Told Grok to explain quantum physics with memes. Now I understand everything and nothing."',
  ];

  const memePrompts = getCategoryPrompts('ultimate-meme-machine');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Best Grok Memes</h1>
        <p className="text-xl text-gray-600 mb-4">The legendary "I&apos;m Tired Boss" series and Grok&apos;s unhinged humor.</p>
        <p className="text-sm text-gray-500">Grok doesn&apos;t just summarize. It turns everything into meme fuel.</p>
      </div>

      {/* Classic Memes */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">Classic Grok Memes</h2>
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          {memes.map((m, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl border text-lg font-mono">{m}</div>
          ))}
        </div>
      </div>

      {/* Prompts to Generate Your Own */}
      <div className="mb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Prompts to Create Your Own Memes</h2>
            <p className="text-gray-600">Use these with Grok to become the ultimate meme machine.</p>
          </div>
          <a href="/grok-for/ultimate-meme-machine" className="text-sm text-blue-600 hover:underline">Full collection →</a>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {memePrompts.sections.flatMap((s) => s.prompts).slice(0, 8).map((p, i) => (
            <PromptCard key={i} text={p.text} guidance={p.guidance} />
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mb-8">
        Want more chaos? Check out <a href="/grok-for/savage-roasts" className="underline">Savage Roasts</a>, <a href="/grok-for/story-mode-activated" className="underline">Story Mode</a>, and <a href="/grok-for/wild-image-ideas" className="underline">Wild Image Ideas</a>.
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Best Grok Memes & 'I'm Tired Boss' Series",
            "description": "Funny Grok memes and the viral 'I'm Tired Boss' series. Plus prompts to generate your own.",
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
