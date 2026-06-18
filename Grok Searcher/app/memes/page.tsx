import type { Metadata } from 'next';
import Image from 'next/image';
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
    url: "https://www.groksearcher.com/memes",
    siteName: "Grok Searcher",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Grok Memes & 'I'm Tired Boss' Series | Grok Searcher",
    description: "Funny Grok memes and the viral 'I'm Tired Boss' series.",
    images: [
      {
        url: "/images/grok-meme-depressed-robot.jpg",
        width: 1200,
        height: 630,
        alt: "Best Grok Memes",
      },
    ],
  },
};

export default function Memes() {
  const classicMemes = [
    {
      text: '"I\'m tired boss... but here\'s a 47-point plan anyway."',
      img: '/images/grok-meme-depressed-robot.jpg',
      alt: 'Grok looking tired but delivering a massive plan meme',
    },
    {
      text: '"You asked for a simple summary. I gave you a thesis. I\'m tired boss."',
      img: '/images/grok-meme-essay-loop.jpg',
      alt: 'Grok tired after writing a full thesis instead of a summary',
    },
    {
      text: '"This could have been an email but now it\'s a 12-tweet thread with charts."',
      img: '/images/grok-meme-long-document.jpg',
      alt: 'Grok turning simple request into long report meme',
    },
    {
      text: '"Grok, make it funnier. No, funnier. No, unhinged. Perfect."',
      img: '/images/grok-meme-unhinged.jpg',
      alt: 'Grok going unhinged for maximum humor meme',
    },
    {
      text: '"Me: Can you summarize this? Grok: Here\'s a 47-slide deck and a musical number."',
      img: '/images/grok-meme-business-plan.jpg',
      alt: 'Grok over-delivering on summary with full production meme',
    },
    {
      text: '"When the group chat asks for one meme and you deliver a whole cinematic universe."',
      img: '/images/grok-meme-cat-chaos.jpg',
      alt: 'Grok creating chaotic meme universe meme',
    },
    {
      text: '"I asked Grok for a quick joke. Now my entire timeline is a 14-part saga with lore."',
      img: '/images/grok-meme-unhinged-report.jpg',
      alt: 'Grok turning a quick joke into a massive saga with lore meme',
    },
    {
      text: '"Grok in 2026: turns your 3-word prompt into 9 viral formats and 2 rival fandoms."',
      img: '/images/grok-meme-viral.jpg',
      alt: 'Grok creating multiple viral meme formats meme',
    },
    {
      text: '"Me: keep it short. Grok: *writes the Iliad but make it about your ex and a raccoon*."',
      img: '/images/grok-meme-long-prompt.jpg',
      alt: 'Grok ignoring keep it short request meme',
    },
    {
      text: '"Grok roasted my resume so hard HR sent flowers and a restraining order."',
      img: '/images/grok-meme-roast-mad.jpg',
      alt: 'Grok savage resume roast meme',
    },
  ];

  const memePrompts = getCategoryPrompts('ultimate-meme-machine');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Best Grok Memes</h1>
        <p className="text-xl text-gray-600 mb-4">The legendary "I&apos;m Tired Boss" series and Grok&apos;s unhinged humor.</p>
        <p className="text-sm text-gray-500">Grok doesn&apos;t just summarize. It turns everything into meme fuel.</p>
      </div>

      {/* I'm Tired Boss Hero - Bigger dominant treatment */}
      <div className="mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-3xl">😩</span>
          <h2 className="text-4xl font-bold">The "I'm Tired Boss" Series</h2>
          <span className="text-3xl">😩</span>
        </div>
        <p className="text-center text-gray-600 mb-6">The most iconic Grok memes — visual gold that keeps the internet (and us) going.</p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Large hero card 1 */}
          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="relative w-full h-[380px] bg-gray-50">
              <Image 
                src={classicMemes[0].img} 
                alt={classicMemes[0].alt} 
                fill 
                className="object-contain p-6" 
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            <div className="p-6 bg-gradient-to-t from-black/5">
              <p className="text-2xl font-mono text-gray-900 leading-snug">{classicMemes[0].text}</p>
            </div>
          </div>
          
          {/* Large hero card 2 */}
          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="relative w-full h-[380px] bg-gray-50">
              <Image 
                src={classicMemes[1].img} 
                alt={classicMemes[1].alt} 
                fill 
                className="object-contain p-6" 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="p-6 bg-gradient-to-t from-black/5">
              <p className="text-2xl font-mono text-gray-900 leading-snug">{classicMemes[1].text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Classic Memes */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-center">More Classic Grok Memes</h2>
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {classicMemes.slice(2).map((meme, i) => (
            <div key={i} className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition">
              <div className="relative w-full h-64 bg-gray-100">
                <Image 
                  src={meme.img} 
                  alt={meme.alt} 
                  fill 
                  className="object-contain p-4" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="p-5">
                <p className="text-lg font-mono text-gray-800 leading-relaxed">{meme.text}</p>
              </div>
            </div>
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
            <PromptCard key={i} title={p.title} text={p.text} guidance={p.guidance} />
          ))}
        </div>

        {/* Visual examples from the prompts */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-center">Real Examples Generated with These Prompts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { img: '/images/grok-meme-3am-x.jpg', caption: 'Unhinged prompt result' },
              { img: '/images/grok-meme-based-offended.jpg', caption: 'Viral format explosion' },
              { img: '/images/grok-meme-mars.jpg', caption: 'Savage roast meme' },
              { img: '/images/grok-meme-training-data.jpg', caption: 'Chaotic group chat energy' },
            ].map((ex, idx) => (
              <div key={idx} className="bg-white rounded-xl border overflow-hidden">
                <div className="relative w-full h-40 bg-gray-100">
                  <Image src={ex.img} alt={ex.caption} fill className="object-contain p-2" sizes="(max-width: 768px) 50vw, 25vw" />
                </div>
                <div className="p-2 text-xs text-center text-gray-500 font-mono">{ex.caption}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">Paste the prompts above into Grok with your own context to generate visuals like these.</p>
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
            "url": "https://www.groksearcher.com/memes",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grok Searcher",
              "url": "https://www.groksearcher.com"
            }
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.groksearcher.com" },
              { "@type": "ListItem", "position": 2, "name": "Grok Memes", "item": "https://www.groksearcher.com/memes" }
            ]
          }
        ]
      }} />
    </div>
  );
}
