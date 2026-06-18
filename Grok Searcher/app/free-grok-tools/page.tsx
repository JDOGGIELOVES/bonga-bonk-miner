import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import PromptCard from '@/components/PromptCard';

export const metadata: Metadata = {
  title: "Free Grok Tools 2026",
  description: "The best free Grok tools for 2026. Copy-paste prompts, image generators, search tools, meme makers, story tools, roasts and more. All completely free.",
  openGraph: {
    title: "Free Grok Tools 2026 | Grok Searcher",
    description: "Best free Grok AI tools: prompts, image generators, real-time search, meme tools, storytelling and more. 100% free to use.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        width: 1200,
        height: 630,
        alt: "Free Grok Tools",
      },
    ],
    url: "https://www.groksearcher.com/free-grok-tools",
    siteName: "Grok Searcher",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Grok Tools 2026 | Grok Searcher",
    description: "The best free Grok tools: prompts, generators, search tools, meme makers and creative resources.",
    images: [
      {
        url: "/images/grok-50-best-prompts.jpg",
        width: 1200,
        height: 630,
        alt: "Free Grok Tools",
      },
    ],
  },
};

const freeTools = [
  {
    title: "50 Best Grok Prompts",
    href: "/best-grok-prompts",
    desc: "Battle-tested, copy-paste ready prompts for productivity, coding, writing, research and daily tasks.",
    category: "Prompt Libraries",
  },
  {
    title: "Best Grok Image Prompts",
    href: "/best-grok-image-prompts",
    desc: "30+ high-quality image generation prompts for marketing visuals, concepts, products and creative work, with examples.",
    category: "Creative Tools",
  },
  {
    title: "How to Search with Grok",
    href: "/grok-search",
    desc: "Powerful real-time X search tools and prompts for research, trends, SEO and traffic insights.",
    category: "Research Tools",
  },
  {
    title: "Ultimate Meme Machine",
    href: "/grok-for/ultimate-meme-machine",
    desc: "Generate viral memes, perfect captions and new formats. Turn anything into shareable humor.",
    category: "Fun & Humor Tools",
  },
  {
    title: "Savage Roasts",
    href: "/grok-for/savage-roasts",
    desc: "Craft clever, brutal and hilarious roasts and comebacks with Grok's signature wit.",
    category: "Fun & Humor Tools",
  },
  {
    title: "Story Mode Activated",
    href: "/grok-for/story-mode-activated",
    desc: "Immersive storytelling tools for wild narratives, branching adventures and genre-bending tales.",
    category: "Creative Tools",
  },
  {
    title: "Wild Image Ideas",
    href: "/grok-for/wild-image-ideas",
    desc: "Unleash absurd, hilarious and completely unhinged image generation prompts.",
    category: "Creative Tools",
  },
  {
    title: "Grok Memes",
    href: "/memes",
    desc: "The legendary 'I'm Tired Boss' series and Grok humor. Plus prompts to generate your own.",
    category: "Fun & Humor Tools",
  },
  {
    title: "Grok vs ChatGPT vs Claude",
    href: "/comparisons",
    desc: "Honest comparisons to help you choose the right AI tool for research, coding and writing.",
    category: "Decision Tools",
  },
];

const categories = Array.from(new Set(freeTools.map(t => t.category)));

const top10FreePrompts = [
  {
    title: "Explain It Simply",
    text: "Explain [topic] like I'm a smart 15-year-old. Give 3 real-world examples and one common mistake people make.",
    why: "Perfect for breaking down complex ideas quickly and clearly."
  },
  {
    title: "Step-by-Step Problem Solver",
    text: "Break down [complex problem] into the smallest possible logical steps, then solve it step by step. Show your reasoning.",
    why: "Forces structured thinking and dramatically reduces errors on hard problems."
  },
  {
    title: "Expert Review Mode",
    text: "Act as an expert [profession]. Review this [thing] and tell me what's good, what's weak, and give specific improvements.",
    why: "Get professional-level feedback on code, writing, plans, or any deliverable."
  },
  {
    title: "Decision Comparison",
    text: "Compare the pros and cons of [option A] vs [option B] for someone who [specific situation]. Give a clear recommendation.",
    why: "Helps you make better decisions by weighing trade-offs with your real constraints."
  },
  {
    title: "Meeting Action Plan",
    text: "Turn this meeting note into a clear action plan with owners, deadlines and next steps.",
    why: "Never lose track of decisions again. Turns vague discussions into trackable tasks."
  },
  {
    title: "30-Day Goal Plan",
    text: "Create a 30-day plan to achieve [goal]. Include daily/weekly habits and milestones.",
    why: "Turns big goals into realistic daily systems you can actually follow."
  },
  {
    title: "Code Review Assistant",
    text: "Review this code for bugs, performance issues and readability. Suggest concrete refactors.",
    why: "Catch issues early and get practical improvement suggestions instead of just criticism."
  },
  {
    title: "Concept Explainer",
    text: "Explain how [concept] works in [language/framework] with a minimal working example.",
    why: "Learn or teach new tech fast with real, runnable code instead of abstract theory."
  },
  {
    title: "Idea Brainstormer",
    text: "Brainstorm 10 fresh, actionable ideas for [topic or goal] that most people haven't thought of.",
    why: "Great for content, products, strategies, or solving creative blocks."
  },
  {
    title: "Clear Communicator",
    text: "Rewrite this [email / message / summary] to be much clearer, more professional, and concise while keeping the original meaning.",
    why: "Instantly improve your writing for emails, posts, or reports."
  }
];

export default function FreeGrokTools() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">Free Grok Tools</h1>
        <p className="text-xl text-gray-600 mb-6">
          The best completely free tools for Grok by xAI. Copy-paste prompts, generators, 
          search tools, meme makers and creative resources — no sign-up required.
        </p>
        <p className="text-sm text-gray-500">
          Everything here is free to use. Updated for 2026. No limits, no credit cards.
        </p>
      </div>

      {/* Why Free Grok Tools */}
      <div className="mb-16 bg-white border rounded-3xl p-8">
        <h2 className="text-2xl font-semibold mb-4">Why Free Grok Tools Are a Game-Changer</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <strong className="block mb-1">No paywalls, ever.</strong>
            Every prompt, generator, and guide on this site is 100% free to copy and use with Grok.
          </div>
          <div>
            <strong className="block mb-1">Battle-tested for 2026.</strong>
            These tools leverage Grok’s real-time X data, humor, and reasoning better than generic AI tools.
          </div>
          <div>
            <strong className="block mb-1">Instant results.</strong>
            No apps to install. Just paste into Grok and get professional-grade output in seconds.
          </div>
          <div>
            <strong className="block mb-1">Works with free Grok accounts.</strong>
            You don’t need Grok Premium or xAI API keys for most of these.
          </div>
        </div>
      </div>

      {/* Top 10 Free Grok Prompts */}
      <div className="mb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Top 10 Free Grok Prompts</h2>
            <p className="text-gray-600">Copy-paste these battle-tested prompts right now. These are the ones our users come back to the most.</p>
          </div>
          <Link href="/best-grok-prompts" className="text-sm text-blue-600 hover:underline">See all 50 →</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {top10FreePrompts.map((p, i) => (
            <div key={i}>
              <PromptCard title={p.title} text={p.text} />
              <p className="text-xs text-gray-600 mt-1">{p.why}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-center text-gray-500">Pro tip: Replace the [brackets] with your actual details for much better results.</p>
      </div>

      {/* Tools by Category */}
      {categories.map((cat) => {
        const toolsInCategory = freeTools.filter(t => t.category === cat);
        return (
          <div key={cat} className="mb-16">
            <h2 className="text-2xl font-semibold mb-6 border-b pb-2">{cat}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolsInCategory.map((tool, index) => (
                <Link 
                  key={index} 
                  href={tool.href} 
                  className="block p-6 bg-white rounded-2xl border hover:border-blue-500 hover:shadow transition group"
                >
                  <div className="font-semibold text-lg mb-2 group-hover:text-blue-600">{tool.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{tool.desc}</p>
                  <div className="mt-4 text-xs text-blue-600 font-medium">Use free →</div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {/* How to Get the Most Out of Free Grok Tools */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">How to Get the Most Out of These Tools</h2>
        <div className="prose max-w-none text-gray-700">
          <ol className="list-decimal pl-6 space-y-3">
            <li><strong>Replace brackets</strong> — Most prompts use [like this]. Swap in your real details for best results.</li>
            <li><strong>Iterate</strong> — After Grok answers, reply with “Make this more [specific / funny / detailed]”.</li>
            <li><strong>Combine tools</strong> — Use the Search tool to research, then feed results into a Prompt or Story tool.</li>
            <li><strong>Save your favorites</strong> — Keep a note with the 5-10 tools you use most often.</li>
            <li><strong>Share the love</strong> — These work great in group chats, client work, or content creation.</li>
          </ol>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            ["Are these tools really free?", "Yes. Every single prompt and guide is free to use with any Grok account (free tier works for most)."],
            ["Do I need Grok Premium?", "No. These are optimized for the free version of Grok, though Premium gives you more usage."],
            ["Can I use these for commercial work?", "Yes. The outputs are yours to use however you like."],
            ["How often are these updated?", "New tools and improved prompts are added regularly. Check the date on each page."],
          ].map(([q, a], i) => (
            <div key={i} className="bg-white border rounded-2xl p-5">
              <div className="font-medium mb-1">{q}</div>
              <div className="text-sm text-gray-600">{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* More Resources */}
      <div className="bg-white border rounded-3xl p-8 text-center">
        <h3 className="text-2xl font-semibold mb-3">Want even more specialized tools?</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Browse 80+ categories with targeted Grok prompts for every profession, hobby and use case.
        </p>
        <Link 
          href="/categories" 
          className="inline-block bg-black text-white px-8 py-3 rounded-2xl hover:bg-gray-800 transition"
        >
          Browse All Categories
        </Link>
      </div>

      {/* Contribute / Upload Section */}
      <div className="mt-16 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-3xl p-8 text-center">
        <h3 className="text-2xl font-semibold mb-3">Help Grow the Library</h3>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Have a prompt that works amazingly well with Grok? Upload it and help thousands of others get better results.
          The best submissions will be featured in our public collection.
        </p>
        <Link 
          href="/upload-prompt" 
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl hover:bg-blue-700 transition font-medium"
        >
          Upload Your Favorite Prompt →
        </Link>
        <p className="mt-4 text-xs text-gray-500">It's free and takes less than a minute.</p>
      </div>

      {/* Community Submissions */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">Community Submissions</h2>
        <p className="text-gray-600 mb-6">
          Here are some recent prompts shared by the community. Submit yours and it may be featured here after review!
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Meeting to Action Plan",
              prompt: "Turn these notes into a clear action plan with owners, deadlines and next steps. Prioritize by urgency.",
              category: "Business",
              name: "@productpm",
              date: "2 days ago",
            },
            {
              title: "Viral X Thread from Idea",
              prompt: "Turn this idea into a 6-tweet thread that could go viral. Use hooks, data, and a strong CTA.",
              category: "Marketing",
              name: "Anonymous",
              date: "1 day ago",
            },
            {
              title: "Code Refactor Helper",
              prompt: "Review this code for readability and performance. Suggest concrete refactors with explanations.",
              category: "Coding & Tech",
              name: "@devjane",
              date: "3 days ago",
            },
          ].map((sub, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{sub.title}</div>
                  <div className="text-xs text-gray-500">{sub.category} • {sub.name} • {sub.date}</div>
                </div>
                <Link href="/upload-prompt" className="text-xs text-blue-600 hover:underline">Submit similar</Link>
              </div>
              <p className="font-mono text-sm text-gray-700 bg-gray-50 p-3 rounded mt-2">{sub.prompt}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link href="/upload-prompt" className="text-sm text-blue-600 hover:underline">
            Share your own prompt →
          </Link>
        </div>
      </div>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "Free Grok Tools 2026",
            "description": "The best free Grok tools: prompts, image generators, search tools, meme makers and creative resources.",
            "url": "https://www.groksearcher.com/free-grok-tools",
            "isPartOf": {
              "@type": "WebSite",
              "name": "Grok Searcher",
              "url": "https://www.groksearcher.com"
            }
          },
          {
            "@type": "ItemList",
            "itemListElement": freeTools.map((tool, i) => ({
              "@type": "ListItem",
              "position": i + 1,
              "item": {
                "@type": "WebPage",
                "name": tool.title,
                "url": `https://www.groksearcher.com${tool.href}`
              }
            }))
          }
        ]
      }} />
    </div>
  );
}
