import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { ABOUT_FAQ, ECOSYSTEM_LINKS } from "@/lib/about-content";
import { SOCIAL_LINKS } from "@/lib/site-seo";

export function AboutContent() {
  return (
    <div className="min-h-screen bg-bonga-page">
      <section className="relative overflow-hidden bg-hero-gradient py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="relative mx-auto h-32 w-32 md:h-40 md:w-40">
            <Image
              src="/bonga-token-logo.png"
              alt="Bonga — official $BONGA token logo"
              fill
              unoptimized
              className="rounded-full object-cover drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Meet <span className="text-gradient">Bonga Bonk&apos;s Sister</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Bonga is Bonk&apos;s Sister — the peaceful bonk on Solana. Peace,
            love, good bonks, and raising the frequency for the whole fam.
          </p>

          <BongaCaBanner prominent />

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="peace" size="lg" asChild>
              <Link href="/">Play Bonk Miner</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/nft">Mint Bonga NFTs</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/peace">Bonga Peace</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="story" className="section-anchor py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-3xl font-bold">
            Who is <span className="text-gradient">Bonga Bonk&apos;s Sister</span>?
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Bonga Bonk&apos;s Sister</strong> is
              the mascot and soul of bongabonks.com — an orange Shiba warrior with
              dreadlocks, a striped headband, and an oversized wooden bonk club. She
              smokes peace, not stress. Where Bonk brings the bonk, Bonga brings the
              balance.
            </p>
            <p>
              Born from the same Solana meme energy as Bonk, Bonga Bonk&apos;s Sister
              carved her own lane: a community built around play, mindfulness, and
              showing up for each other. Tap to bonk in the{" "}
              <Link href="/" className="font-medium text-bonga-orange hover:underline">
                Bonga Bonk Miner
              </Link>
              , collect{" "}
              <Link href="/nft" className="font-medium text-bonga-teal hover:underline">
                Bonga NFTs
              </Link>
              , and unwind with{" "}
              <Link href="/peace" className="font-medium text-bonga-purple hover:underline">
                Bonga Peace
              </Link>
              .
            </p>
            <p>
              The mission is simple: <strong className="text-foreground">Raise the Frequency</strong>.
              Mine $BONGA, spread positive energy, and bonk the timeline with love
              instead of noise.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-3xl font-bold">
            Bonga &amp; <span className="text-gradient">Bonk</span>
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              If you searched for <strong className="text-foreground">Bonga</strong>,{" "}
              <strong className="text-foreground">Bonk</strong>, or{" "}
              <strong className="text-foreground">Bonga Bonk&apos;s Sister</strong>,
              you&apos;re in the right place. Bonk is the iconic Solana dog coin
              energy. Bonga is the sister brand — same playful bonk spirit, with a
              hippie heart and a whole ecosystem behind her.
            </p>
            <p>
              Bonga Bonk&apos;s Sister isn&apos;t trying to replace Bonk. She&apos;s
              the chill counterpart: bonk when you need release, breathe when you
              need calm, mint when you want to rep the fam, and mine $BONGA when
              you want to play.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="bonga-card p-5">
              <p className="text-2xl">🔨</p>
              <h3 className="mt-2 font-display font-bold text-bonga-orange">Bonk energy</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Fast taps, meme coins, leaderboard climbs, and that satisfying bonk
                sound when the chart gets loud.
              </p>
            </div>
            <div className="bonga-card p-5">
              <p className="text-2xl">✌️</p>
              <h3 className="mt-2 font-display font-bold text-bonga-teal">Bonga peace</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Stretching, Tai Chi, affirmations, and check-ins — mindfulness
                that doesn&apos;t take itself too seriously.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="section-anchor py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="font-display text-3xl font-bold">
            The <span className="text-gradient">Bonga</span> ecosystem
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything Bonga Bonk&apos;s Sister built for the fam on Solana — free to
            explore at bongabonks.com.
          </p>
          <div className="mt-8 space-y-4">
            {ECOSYSTEM_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bonga-card group flex gap-4 p-5 transition-colors hover:border-bonga-teal/40"
              >
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <h3 className={`font-display font-bold ${item.accent}`}>
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        id="faq"
        className="section-anchor border-y border-[#E8D4A0]/70 bg-[#FFFBEA]/60 py-16 dark:border-[#3D3220] dark:bg-[#2A2114]/40"
      >
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B5A3E] dark:text-[#A89068]">
            Straight answers
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            Bonga Bonk&apos;s Sister <span className="text-gradient">FAQ</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#6B5A3E] dark:text-[#A89068]">
            Short, current facts about the token, Miner, Coin Stake, Bank, and
            how Bonga relates to BONK.
          </p>
          <dl className="mt-8 space-y-4">
            {ABOUT_FAQ.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-[#E8D4A0] bg-[#FFFBEA] p-5 shadow-sm dark:border-[#3D3220] dark:bg-[#2A2114]"
              >
                <dt className="font-display text-base font-bold text-[#1A1408] dark:text-[#FFF6D8]">
                  {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#6B5A3E] dark:text-[#A89068]">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-2xl font-bold">Join the Bonga Bonk&apos;s Sister Community</h2>
          <p className="mt-1 text-sm">
            <Link href="/community" className="font-medium text-bonga-purple hover:underline">Visit the full Community page →</Link>
          </p>
          <p className="mt-3 text-muted-foreground">
            Bonga Bonk&apos;s Sister is building in public — vibes, alpha, memes,
            and peaceful bonks welcome.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <a
              href={SOCIAL_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bonga-orange hover:underline"
            >
              @BongaSolana on X
            </a>
            <a
              href={SOCIAL_LINKS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bonga-teal hover:underline"
            >
              Telegram community
            </a>
            <a
              href={SOCIAL_LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-bonga-purple hover:underline"
            >
              bonga.uno
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-10 text-center">
        <p className="font-display text-sm font-bold text-bonga-orange">BONGA</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Bonga Bonk&apos;s Sister · Raise the Frequency
        </p>
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <Link href="/" className="text-bonga-orange hover:underline">
            Bonk Miner
          </Link>
          <Link href="/nft" className="text-bonga-teal hover:underline">
            NFTs
          </Link>
          <Link href="/peace" className="text-bonga-purple hover:underline">
            Peace
          </Link>
        </div>
      </footer>
    </div>
  );
}