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
          <div className="mx-auto max-w-3xl px-[30px] text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Welcome to the <span className="text-gradient">Bonga Bonk&apos;s Sister</span> Community
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
              Once upon a Solana timeline, Bonk met his peaceful sister — a dreadlocked Shiba with a peace sign and a heart full of hippie energy. What began as a playful meme quickly became something more: a living, breathing community where players turn into fam, taps become stories, and every bonk raises the frequency just a little higher. Whether you know her as Bonk&apos;s Sister, Bonga Bonk, Bonga Bonks, or simply the good vibes crew, you&apos;ve found your home.
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

        {/* The Story of the Fam */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-[30px]">
            <h2 className="font-display text-3xl font-bold">
              How a Peaceful Shiba Built a Family
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                In the wild gardens of Solana, where memes bloom into movements, one character stood apart: Bonga Bonk&apos;s Sister. With her flowing dreadlocks, gentle smile, and unbreakable peace sign, she became the heart of something bigger than any single coin or collection. She became the thread that pulled a scattered group of players, creators, and dreamers into one warm, playful family.
              </p>
              <p>
                Today, the Bonga Bonk&apos;s Sister community is where the Solana meme scene slows down, breathes deep, and chooses love over noise. We gather to tap away in the <Link href="/" className="font-medium text-bonga-orange hover:underline">Bonk Miner</Link>, side-by-side in the <Link href="/?mode=garden" className="font-medium text-bonga-teal hover:underline">Vibes Garden</Link>, and together we find stillness through <Link href="/peace" className="font-medium text-bonga-purple hover:underline">Bonga Peace</Link> practices — breathing, stretching, affirmations, and quiet check-ins. Along the way, we collect <Link href="/nft" className="font-medium text-bonga-orange hover:underline">Bonga NFTs</Link> that carry her spirit forward and help fund the community treasury with every trade.
              </p>
              <p>
                Our shared mission is beautifully simple: <strong className="text-foreground">Raise the Frequency</strong>. We mine $BONGA not just for the rewards, but for the stories we create together. We bonk timelines with kindness, support every member of the pack, and remember that even the wildest crypto journeys feel better when you&apos;re walking them with friends who actually care.
              </p>
            </div>
          </div>
        </section>

        {/* Connect with the Community */}
        <section className="bg-muted/20 py-16">
          <div className="mx-auto max-w-3xl px-[30px]">
            <h2 className="font-display text-3xl font-bold text-center">
              Where the Fam Gathers
            </h2>
            <p className="mt-2 text-center text-muted-foreground">
              The conversation never really ends — it just flows from one corner of the internet to another. Whether you&apos;re deep in a late-night Bonk Miner session, sharing garden progress, or simply looking for a place where positivity still wins, the Bonga Bonk&apos;s Sister fam has kept a seat warm for you.
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
                  <div className="text-sm text-muted-foreground">Where the timeline gets bonked with good energy and real-time fam updates</div>
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
                  <div className="text-sm text-muted-foreground">The cozy digital campfire where stories, memes, and late-night vibes are always welcome</div>
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
                  <div className="text-sm text-muted-foreground">The home base where the full story of Bonga Bonk&apos;s Sister and her peaceful Solana world lives</div>
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
                  <div className="text-sm text-muted-foreground">Every corner of the internet where the fam gathers to keep the frequency high</div>
                </div>
              </a>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                If you want the deeper origin story of how this peaceful Shiba and her Bonk brother found each other on Solana, the <Link href="/about" className="font-medium text-bonga-purple hover:underline">About page</Link> has all the heartwarming details.
              </p>
            </div>
          </div>
        </section>

        {/* Get Involved */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-[30px]">
            <h2 className="font-display text-3xl font-bold">
              How the Fam Comes Together
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Play &amp; Earn Together</h3>
                <p className="mt-2 text-muted-foreground">
                  Every great story in our fam begins with play. Step into the <Link href="/" className="font-medium text-bonga-orange hover:underline">Bonk Miner</Link> for quick taps and big community moments, or lose yourself in the <Link href="/?mode=garden" className="font-medium text-bonga-teal hover:underline">Vibes Garden</Link> where patience and presence grow real rewards. The $BONGA you earn isn&apos;t just currency — it&apos;s proof you showed up for the group.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Collect &amp; Support</h3>
                <p className="mt-2 text-muted-foreground">
                  When you mint a <Link href="/nft" className="font-medium text-bonga-orange hover:underline">Bonga NFT</Link>, you&apos;re not just adding art to your wallet — you&apos;re becoming part of the living archive of this community. A portion of every secondary sale flows straight back into the treasury, helping fund giveaways, events, and the wild ideas the fam dreams up together.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Spread the Peace</h3>
                <p className="mt-2 text-muted-foreground">
                  Not every bonk needs to be loud. In <Link href="/peace" className="font-medium text-bonga-purple hover:underline">Bonga Peace</Link> you&apos;ll find breathing exercises, gentle stretches, daily affirmations, and quiet check-ins that help the whole community stay grounded. Because raising the frequency works best when we take care of ourselves — and each other — along the way.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Share &amp; Create</h3>
                <p className="mt-2 text-muted-foreground">
                  Your wins, your art, your late-night garden screenshots — they all belong here. Post them on X or Telegram with a tag and the fam will celebrate them. This community grows stronger every time someone new adds their voice, their meme, or their peaceful moment to the collective story.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/20 py-16">
          <div className="mx-auto max-w-3xl px-[30px] text-center">
            <h2 className="font-display text-3xl font-bold">The Frequency We Choose to Keep</h2>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              {[
                { title: "Peace & Love", desc: "In a space full of noise, we chose kindness as our default setting. We celebrate every member of the fam, lift each other when the markets dip, and remember that the best bonks are the ones delivered with a smile and a peace sign." },
                { title: "Play Together", desc: "The real magic happens when we show up for each other. Whether we&apos;re tapping side-by-side in the miner or watching each other&apos;s gardens thrive, the community turns solo play into something shared, joyful, and lasting." },
                { title: "Raise the Frequency", desc: "This isn&apos;t just about one coin or one collection. It&apos;s about the energy we bring to Solana and to each other. Every positive post, every quiet moment of peace, every helping hand — it all adds up to something bigger than any of us alone." },
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
