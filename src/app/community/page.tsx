import type { Metadata } from "next";
import Link from "next/link";
import { BongaMarketingShell } from "@/components/layout/bonga-marketing-shell";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { Button } from "@/components/ui/button";
import { SOCIAL_LINKS } from "@/lib/site-seo";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga Bonk's Sister Community | Bonk Fam, Bonga Bonk, Bonk's Sister on Solana",
  description:
    "Join the official Bonga Bonk's Sister community — home of Bonk, Bonga, Bonk's Sister, Bonga Bonk, Bonga Bonks and the peaceful Solana fam. Connect on X, Telegram, Discord, play Bonk Miner, and raise the frequency together.",
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
    <BongaMarketingShell>
      <div>
        <section className="relative overflow-hidden py-16 md:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B5A3E] dark:text-[#A89068]">
              The pack · Solana
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              Welcome to the Bonga Bonk&apos;s Sister Community
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#6B5A3E] dark:text-[#A89068] md:text-xl">
              Once upon a Solana timeline, Bonk met his peaceful sister — a dreadlocked Shiba with a peace sign and a heart full of hippie energy. What began as a playful meme quickly became something more: a living, breathing community where players turn into fam, taps become stories, and every bonk raises the frequency just a little higher. Whether you know her as Bonk&apos;s Sister, Bonga Bonk, Bonga Bonks, or simply the good vibes crew, you&apos;ve found your home.
            </p>

            <BongaCaBanner prominent />

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="bg-[#ff6a00] font-extrabold tracking-[0.06em] text-white hover:bg-[#ff6a00]/90"
                asChild
              >
                <Link href="/?mode=miner">PLAY MINER</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[#E8D4A0] dark:border-[#3D3220]"
                asChild
              >
                <Link href="/coin-staking">Coin Stake</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/nft">Mint Bonga NFTs</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-[30px]">
            <h2 className="font-display text-3xl font-bold">
              How a Peaceful Shiba Built a Family
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-[#6B5A3E] dark:text-[#A89068]">
              <p>
                In the wild gardens of Solana, where memes bloom into movements, one character stood apart: Bonga Bonk&apos;s Sister. With her flowing dreadlocks, gentle smile, and unbreakable peace sign, she became the heart of something bigger than any single coin or collection. She became the thread that pulled a scattered group of players, creators, and dreamers into one warm, playful family.
              </p>
              <p>
                Today, the Bonga Bonk&apos;s Sister community is where the Solana meme scene slows down, breathes deep, and chooses love over noise. We gather to tap away in the{" "}
                <Link href="/?mode=miner" className="font-medium text-bonga-orange hover:underline">
                  Bonk Miner
                </Link>
                , and together we find stillness through{" "}
                <Link href="/peace" className="font-medium text-bonga-purple hover:underline">
                  Bonga Peace
                </Link>{" "}
                practices — breathing, stretching, affirmations, and quiet check-ins. Along the way, we collect{" "}
                <Link href="/nft" className="font-medium text-bonga-orange hover:underline">
                  Bonga NFTs
                </Link>{" "}
                that carry her spirit forward and help fund the community treasury with every trade.
              </p>
              <p>
                Our shared mission is beautifully simple:{" "}
                <strong className="text-foreground">Raise the Frequency</strong>. We mine $BONGA not just for the rewards, but for the stories we create together. We bonk timelines with kindness, support every member of the pack, and remember that even the wildest crypto journeys feel better when you&apos;re walking them with friends who actually care.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#FFFBEA]/70 py-16 dark:bg-[#2A2114]/40">
          <div className="mx-auto max-w-3xl px-[30px]">
            <h2 className="text-center font-display text-3xl font-bold">
              Where the Fam Gathers
            </h2>
            <p className="mt-2 text-center text-[#6B5A3E] dark:text-[#A89068]">
              The conversation never really ends — it just flows from one corner of the internet to another. Whether you&apos;re deep in a late-night Bonk Miner session or simply looking for a place where positivity still wins, the Bonga Bonk&apos;s Sister fam has kept a seat warm for you.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card group flex items-center gap-4 p-6 transition-colors hover:border-bonga-orange/50"
              >
                <span className="text-3xl">𝕏</span>
                <div>
                  <div className="font-semibold transition-colors group-hover:text-bonga-orange">
                    @BongaSolana on X
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Where the timeline gets bonked with good energy and real-time fam updates
                  </div>
                </div>
              </a>
              <a
                href={SOCIAL_LINKS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card group flex items-center gap-4 p-6 transition-colors hover:border-bonga-orange/50"
              >
                <span className="text-3xl">✈️</span>
                <div>
                  <div className="font-semibold transition-colors group-hover:text-bonga-orange">
                    Telegram
                  </div>
                  <div className="text-sm text-muted-foreground">
                    The cozy digital campfire where stories, memes, and late-night vibes are always welcome
                  </div>
                </div>
              </a>
              <a
                href={SOCIAL_LINKS.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card group flex items-center gap-4 p-6 transition-colors hover:border-bonga-orange/50"
              >
                <span className="text-3xl">🌐</span>
                <div>
                  <div className="font-semibold transition-colors group-hover:text-bonga-orange">
                    bonga.uno
                  </div>
                  <div className="text-sm text-muted-foreground">
                    The home base where the full story of Bonga Bonk&apos;s Sister and her peaceful Solana world lives
                  </div>
                </div>
              </a>
              <a
                href="https://t.me/bonga_sol_community"
                target="_blank"
                rel="noopener noreferrer"
                className="bonga-card group flex items-center gap-4 p-6 transition-colors hover:border-bonga-orange/50"
              >
                <span className="text-3xl">👥</span>
                <div>
                  <div className="font-semibold transition-colors group-hover:text-bonga-orange">
                    More Socials &amp; Chat
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Every corner of the internet where the fam gathers to keep the frequency high
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-[#6B5A3E] dark:text-[#A89068]">
                If you want the deeper origin story of how this peaceful Shiba and her Bonk brother found each other on Solana, the{" "}
                <Link href="/about" className="font-medium text-bonga-purple hover:underline">
                  About page
                </Link>{" "}
                has all the heartwarming details.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-[30px]">
            <h2 className="font-display text-3xl font-bold">
              How the Fam Comes Together
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Play &amp; Earn Together</h3>
                <p className="mt-2 text-muted-foreground">
                  Every great story in our fam begins with play. Step into the{" "}
                  <Link href="/?mode=miner" className="font-medium text-bonga-orange hover:underline">
                    Bonk Miner
                  </Link>{" "}
                  (100 taps = 1 $BONGA, max 10/day) where taps turn into rewards. The $BONGA you earn isn&apos;t just currency — it&apos;s proof you showed up for the group.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Collect &amp; Support</h3>
                <p className="mt-2 text-muted-foreground">
                  When you mint a{" "}
                  <Link href="/nft" className="font-medium text-bonga-orange hover:underline">
                    Bonga NFT
                  </Link>
                  , you&apos;re not just adding art to your wallet — you&apos;re becoming part of the living archive of this community. A portion of every secondary sale flows straight back into the treasury, helping fund giveaways, events, and the wild ideas the fam dreams up together.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Spread the Peace</h3>
                <p className="mt-2 text-muted-foreground">
                  Not every bonk needs to be loud. In{" "}
                  <Link href="/peace" className="font-medium text-bonga-purple hover:underline">
                    Bonga Peace
                  </Link>{" "}
                  you&apos;ll find breathing exercises, gentle stretches, daily affirmations, and quiet check-ins that help the whole community stay grounded.
                </p>
              </div>
              <div className="bonga-card p-6">
                <h3 className="font-display text-xl font-bold">Share &amp; Create</h3>
                <p className="mt-2 text-muted-foreground">
                  Your wins, your art, your late-night miner screenshots — they all belong here. Post them on X or Telegram with a tag and the fam will celebrate them.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#FFFBEA]/70 py-16 dark:bg-[#2A2114]/40">
          <div className="mx-auto max-w-3xl px-[30px] text-center">
            <h2 className="font-display text-3xl font-bold">The Frequency We Choose to Keep</h2>
            <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
              {[
                {
                  title: "Peace & Love",
                  desc: "In a space full of noise, we chose kindness as our default setting. We celebrate every member of the fam, lift each other when the markets dip, and remember that the best bonks are the ones delivered with a smile and a peace sign.",
                },
                {
                  title: "Play Together",
                  desc: "The real magic happens when we show up for each other. Whether we're tapping side-by-side in the miner or cheering wins in chat, the community turns solo play into something shared, joyful, and lasting.",
                },
                {
                  title: "Raise the Frequency",
                  desc: "This isn't just about one coin or one collection. It's about the energy we bring to Solana and to each other. Every positive post, every quiet moment of peace, every helping hand — it all adds up to something bigger than any of us alone.",
                },
              ].map((v, i) => (
                <div key={i} className="bonga-card p-5">
                  <h3 className="font-display text-lg font-bold">{v.title}</h3>
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
    </BongaMarketingShell>
  );
}
