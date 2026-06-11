import type { Metadata } from "next";
import Link from "next/link";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { Button } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/lib/site-seo";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga Bonk's Sister Community | Bonk Fam, Bonga Bonk, Bonk's Sister on Solana",
  description:
    "Join the official Bonga Bonk's Sister community — home of Bonk, Bonga, Bonk's Sister, Bonga Bonk, Bonga Bonks and the peaceful Solana fam. Connect on X, Telegram, Discord, play Bonk Miner, grow Vibes Garden, and raise the frequency together.",
  path: "/community",
  keywords: [
    "Bonk",
    "Bonga",
    "Bonga Bonk",
    "Bonk's Sister",
    "Bonga Bonk's Sister",
    "Bonga Bonks",
    "Bonk Sister",
    "Bonga Bonk's Sister",
    "Bonga Bonk community",
    "Bonk community",
    "Bonga fam",
    "Bonk fam",
    "Bonga Bonk's Sister Solana",
    "Bonk's Sister Solana",
    "Bonga Bonk Miner community",
    "Bonga NFT community",
    "Bonga Peace community",
    "Solana community",
    "Bonga Bonk's Sister community",
    "Bonk meme coin community",
    "Bonga community",
    "Raise the Frequency",
    "bongabonks community",
    "Bonga Bonk's Sister fam",
  ],
  imageAlt: "Bonga Bonk's Sister Community — the Bonk Fam on Solana",
});

export default function CommunityPage() {
  return (
    <>
      <BongaHeader />
      <div className="min-h-screen bg-bonga-page">
        {/* Hero */}
        <section className="relative overflow-hidden bg-hero-gradient py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Welcome to the <span className="text-gradient">Bonga Bonk&apos;s Sister</span> Community
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
              The official home of <strong>Bonk</strong>, <strong>Bonga</strong>, <strong>Bonk&apos;s Sister</strong>, <strong>Bonga Bonk</strong>, <strong>Bonga Bonk&apos;s Sister</strong>, and the peaceful Solana fam. Whether you call it Bonk, Bonga Bonks, or Bonga Bonk&apos;s Sister — you&apos;re in the right place.
            </p>

            <BongaCaBanner prominent />

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button variant="peace" size="lg" asChild>
                <Link href="/">Play Bonk Miner</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/?mode=garden">Vibes Garden</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/nft">Mint Bonga NFTs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What is the Bonga Bonk Community */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-3xl font-bold">
              The <span className="text-gradient">Bonga Bonk&apos;s Sister</span> Fam
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                If you&apos;re searching for <strong>Bonk</strong>, <strong>Bonga</strong>, <strong>Bonk&apos;s Sister</strong>, <strong>Bonga Bonk</strong>, <strong>Bonga Bonk&apos;s Sister</strong>, <strong>Bonga Bonks</strong>, or <strong>Bonk Sister</strong> — welcome home. This is the peaceful, playful community built around Bonga Bonk&apos;s Sister on Solana.
              </p>
              <p>
                Bonga Bonk&apos;s Sister (often called Bonga, Bonk&apos;s Sister, or the Bonga Bonk&apos;s Sister fam) brings the hippie heart to the Solana meme scene. We tap in the <Link href="/" className="font-medium text-bonga-orange hover:underline">Bonk Miner</Link>, grow together in the <Link href="/?mode=garden" className="font-medium text-bonga-teal hover:underline">Vibes Garden</Link>, unwind with <Link href="/peace" className="font-medium text-bonga-purple hover:underline">Bonga Peace</Link>, and collect <Link href="/nft" className="font-medium text-bonga-orange hover:underline">Bonga NFTs</Link>.
              </p>
              <p>
                The mission is simple: <strong className="text-foreground">Raise the Frequency</strong>. Mine $BONGA, spread positive energy, support the pack, and bonk the timeline with love.
              </p>
            </div>
          </div>
        </section>

        {/* Connect with the Community */}
        <section className="bg-muted/20 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-3xl font-bold text-center">
              Connect with the <span className="text-gradient">Bonga Bonk&apos;s Sister Community</span>
            </h2>
            <p className="mt-2 text-center text-muted-foreground">
              Join the conversation across all platforms. Whether you&apos;re into Bonk, Bonga Bonk&apos;s Sister, or just the good vibes — there&apos;s a spot for you.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card p-6 flex items-center gap-4 hover:border-bonga-orange/50 transition-colors group"
              >
                <span className="text-3xl">𝕏</span>
                <div>
                  <div className="font-semibold group-hover:text-bonga-orange transition-colors">@BongaSolana on X</div>
                  <div className="text-sm text-muted-foreground">Join the Bonga Bonk&apos;s Sister community on X</div>
                </div>
              </a>
              <a
                href={SOCIAL_LINKS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card p-6 flex items-center gap-4 hover:border-bonga-orange/50 transition-colors group"
              >
                <span className="text-3xl">✈️</span>
                <div>
                  <div className="font-semibold group-hover:text-bonga-orange transition-colors">Telegram</div>
                  <div className="text-sm text-muted-foreground">Bonga Bonk&apos;s Sister Telegram community</div>
                </div>
              </a>
              <a
                href={SOCIAL_LINKS.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card p-6 flex items-center gap-4 hover:border-bonga-orange/50 transition-colors group"
              >
                <span className="text-3xl">🌐</span>
                <div>
                  <div className="font-semibold group-hover:text-bonga-orange transition-colors">bonga.uno</div>
                  <div className="text-sm text-muted-foreground">Official Bonga Bonk&apos;s Sister website</div>
                </div>
              </a>
              <a
                href="https://t.me/bonga_sol_community"
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card p-6 flex items-center gap-4 hover:border-bonga-orange/50 transition-colors group"
              >
                <span className="text-3xl">👥</span>
                <div>
                  <div className="font-semibold group-hover:text-bonga-orange transition-colors">More Socials &amp; Chat</div>
                  <div className="text-sm text-muted-foreground">Find all Bonga Bonk&apos;s Sister communities</div>
                </div>
              </a>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Looking for the official story? Visit the <Link href="/about" className="font-medium text-bonga-purple hover:underline">About Bonga Bonk&apos;s Sister</Link> page.
              </p>
            </div>
          </div>
        </section>

        {/* Get Involved */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-3xl font-bold">
              How to Get Involved with <span className="text-gradient">Bonk &amp; Bonga Bonk&apos;s Sister</span>
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Play &amp; Earn Together</h3>
                <p className="mt-2 text-muted-foreground">
                  Jump into the <Link href="/" className="font-medium text-bonga-orange hover:underline">Bonk Miner</Link> or <Link href="/?mode=garden" className="font-medium text-bonga-teal hover:underline">Vibes Garden</Link>. Mine $BONGA, grow plants, claim rewards, and climb the community ranks.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Collect &amp; Support</h3>
                <p className="mt-2 text-muted-foreground">
                  Mint <Link href="/nft" className="font-medium text-bonga-orange hover:underline">Bonga NFTs</Link> to unlock boosts across the ecosystem. 7% of secondary sales support the community treasury.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Spread the Peace</h3>
                <p className="mt-2 text-muted-foreground">
                  Explore <Link href="/peace" className="font-medium text-bonga-purple hover:underline">Bonga Peace</Link> tools — breathing, stretching, affirmations, and Bonk Breaks. Mindfulness meets the bonk.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Share &amp; Create</h3>
                <p className="mt-2 text-muted-foreground">
                  Post your bonks, garden progress, or Bonga art on X or Telegram. Tag us and we&apos;ll share the best with the whole Bonga Bonk&apos;s Sister fam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/20 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="font-display text-3xl font-bold">Our Values as the Bonga Bonk&apos;s Sister Community</h2>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              {[
                { title: "Peace & Love", desc: "We bonk with kindness. No drama, just good energy and support for every member of the Bonga Bonk&apos;s Sister fam." },
                { title: "Play Together", desc: "From Bonk Miner taps to Vibes Garden growth — every activity is better when the whole community joins in." },
                { title: "Raise the Frequency", desc: "Whether you call it Bonk, Bonga Bonk&apos;s Sister, or just the Solana good vibes — we&apos;re here to lift each other up." },
              ].map((v, i) => (
                <div key={i} className="bonga-card p-5">
                  <h3 className="font-display font-bold text-lg">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="pb-16">
          <BongaCaBanner />
        </div>
      </div>
    </>
  );
}
