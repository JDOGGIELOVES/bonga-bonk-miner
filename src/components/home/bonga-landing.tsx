import Image from "next/image";
import Link from "next/link";
import { LandingWallet } from "@/components/home/landing-wallet";
import { BONGA_TOKEN_CA } from "@/lib/bonga-token";

const TOKEN_LOGO = "/bonga-token-logo.png";

const JUP_BUY = `https://jup.ag/swap/SOL-${BONGA_TOKEN_CA}`;

const GATEWAY = [
  {
    title: "Miner",
    body: "Tap game on Solana. Earn a light daily $BONGA allotment — free to play.",
    href: "/?mode=miner",
  },
  {
    title: "Coin Stake",
    body: "Soft-lock $BONGA. Tiered APR settles monthly into Bonga Bank if you stay staked.",
    href: "/coin-staking",
  },
  {
    title: "NFT Stake",
    body: "Stake Bonga NFTs for daily $BONGA rates by rarity — Common through Cosmic.",
    href: "/staking",
  },
  {
    title: "Bonga Bank",
    body: "Vault for settled APR. Withdraw $BONGA to your wallet when you're ready.",
    href: "/bonga-bank",
  },
] as const;

const PILLARS = [
  {
    title: "Play",
    body: "Miner loops for daily earn — light caps, high frequency.",
  },
  {
    title: "Stake",
    body: "Coins and NFTs with clear APR / daily rate rules — no mystery yield.",
  },
  {
    title: "Bank",
    body: "Month-end settlement into vault, then withdraw on your schedule.",
  },
] as const;

const PRODUCTS = [
  {
    title: "Bonga Miner",
    body: "Play, tap, and earn $BONGA daily on Solana.",
    href: "/?mode=miner",
    cta: "PLAY NOW",
    art: "⛏️",
  },
  {
    title: "Coin Stake",
    body: "Soft-lock $BONGA with published APR tiers. Settles into Bank.",
    href: "/coin-staking",
    cta: "STAKE TODAY",
    art: "🔒",
  },
  {
    title: "Bonga Bank",
    body: "See vault balance and withdraw settled rewards to your wallet.",
    href: "/bonga-bank",
    cta: "OPEN BANK",
    art: "🏦",
  },
] as const;

const MARQUEE = [
  "Solana",
  "Jupiter",
  "Phantom",
  "Raydium",
  "Bonk Fam",
  "NFT Stake",
  "Coin Stake",
  "Bonga Bank",
];

/**
 * Option C homepage — bonkcoin.com-inspired structure, Bonga voice.
 * Soft honey cream backgrounds match the official $BONGA token logo.
 */
export function BongaLanding() {
  return (
    <div className="min-h-screen bg-[#FFF6D8] text-[#1A1408] dark:bg-[#1A1408] dark:text-[#FFF6D8]">
      <div className="bg-[#1A1408] px-4 py-2.5 text-center text-[13px] text-white dark:bg-black">
        Coin Stake is live — monthly APR settles into Bonga Bank.{" "}
        <Link
          href="/coin-staking"
          className="font-semibold text-[#ff6a00] underline underline-offset-2"
        >
          Learn more
        </Link>
      </div>

      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src={TOKEN_LOGO}
            alt="$BONGA token logo"
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 rounded-full"
            priority
          />
          <span className="font-display text-sm font-extrabold tracking-[0.12em]">
            BONGA
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-[13px] text-[#6B5A3E] dark:text-[#A89068] sm:flex">
          <Link href="/about" className="hover:text-[#1A1408] dark:hover:text-white">
            About
          </Link>
          <a href="#gateway" className="hover:text-[#1A1408] dark:hover:text-white">
            Gateway
          </a>
          <a href="#ecosystem" className="hover:text-[#1A1408] dark:hover:text-white">
            Ecosystem
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={JUP_BUY}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden bg-[#1A1408] px-3.5 py-2.5 text-[11px] font-bold tracking-[0.08em] text-white dark:bg-[#FFF6D8] dark:text-[#1A1408] sm:inline-block"
          >
            ACCESS $BONGA
          </a>
          <LandingWallet />
        </div>
      </header>

      <section className="mx-auto max-w-[1000px] px-6 pb-12 pt-12 text-center sm:pt-16">
        <div className="mx-auto mb-8 flex justify-center">
          <Image
            src={TOKEN_LOGO}
            alt="Bonga — official $BONGA token logo"
            width={220}
            height={220}
            unoptimized
            priority
            className="h-[160px] w-[160px] rounded-full shadow-[0_16px_48px_rgba(239,180,0,0.35)] sm:h-[200px] sm:w-[200px] md:h-[220px] md:w-[220px]"
          />
        </div>
        <h1 className="font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-extrabold leading-[1.08] tracking-[-0.03em]">
          The sister asset bridging internet culture and everyday Solana fun
        </h1>
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B5A3E] dark:text-[#A89068]">
          Powered by community · accessible to all
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/?mode=miner"
            className="bg-[#ff6a00] px-5 py-3.5 text-[13px] font-extrabold tracking-[0.08em] text-white"
          >
            JOIN THE PACK
          </Link>
          <Link
            href="/coin-staking"
            className="border border-[#E8D4A0] bg-transparent px-5 py-3.5 text-[13px] font-semibold tracking-[0.04em] dark:border-[#3D3220]"
          >
            Coin Stake
          </Link>
        </div>
      </section>

      <div
        className="overflow-hidden border-y border-[#E8D4A0] bg-[#FFFBEA] dark:border-[#3D3220] dark:bg-[#2A2114]"
        aria-hidden="true"
      >
        <div className="bonga-marquee flex w-max gap-12 py-5 text-[13px] font-bold uppercase tracking-[0.04em] text-[#6B5A3E] dark:text-[#A89068]">
          {[...MARQUEE, ...MARQUEE].map((label, i) => (
            <span key={`${label}-${i}`} className="opacity-80">
              {label}
            </span>
          ))}
        </div>
      </div>

      <section
        id="gateway"
        className="section-anchor mx-auto max-w-[1100px] px-6 py-16 sm:py-20"
      >
        <h2 className="text-center font-display text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-[-0.03em]">
          Your gateway to the Bonga economy
        </h2>
        <p className="mb-9 mt-2 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B5A3E] dark:text-[#A89068]">
          Four doors · one pack
        </p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {GATEWAY.map((card) => (
            <article
              key={card.title}
              className="flex min-h-[180px] flex-col border border-[#E8D4A0] bg-[#FFFBEA] p-7 dark:border-[#3D3220] dark:bg-[#2A2114]"
            >
              <h3 className="font-display text-[22px] font-bold">{card.title}</h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[#6B5A3E] dark:text-[#A89068]">
                {card.body}
              </p>
              <Link
                href={card.href}
                className="mt-4 text-[12px] font-extrabold tracking-[0.1em] text-[#ff6a00]"
              >
                FIND OUT MORE →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-16">
        <h2 className="text-center font-display text-[clamp(1.8rem,4vw,2.5rem)] font-extrabold tracking-[-0.03em]">
          One asset. Endless vibes.
        </h2>
        <p className="mb-9 mt-2 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B5A3E] dark:text-[#A89068]">
          $BONGA is for everyone
        </p>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="px-1">
              <h4 className="font-display text-lg font-bold">{p.title}</h4>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6B5A3E] dark:text-[#A89068]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-6 pb-6 text-center">
        <p className="font-display text-[clamp(1.4rem,3.5vw,2.1rem)] font-extrabold tracking-tight">
          Soft-stake · NFT rates · Bank withdraw
        </p>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6B5A3E] dark:text-[#A89068]">
          Built for the Bonk-adjacent pack on Solana
        </p>
      </div>

      <section
        id="ecosystem"
        className="section-anchor mx-auto flex max-w-[1100px] flex-col gap-4 px-6 py-12"
      >
        {PRODUCTS.map((p) => (
          <article
            key={p.title}
            className="grid min-h-[220px] overflow-hidden border border-[#E8D4A0] bg-[#FFFBEA] dark:border-[#3D3220] dark:bg-[#2A2114] md:grid-cols-[1.1fr_1fr]"
          >
            <div className="grid min-h-[200px] place-items-center bg-gradient-to-br from-[#1A1408] via-[#3D3220] to-[#ff6a00] text-6xl text-white">
              <span aria-hidden="true">{p.art}</span>
            </div>
            <div className="flex flex-col justify-center p-8">
              <h3 className="font-display text-[26px] font-bold">{p.title}</h3>
              <p className="mt-2 text-[14px] text-[#6B5A3E] dark:text-[#A89068]">
                {p.body}
              </p>
              <Link
                href={p.href}
                className="mt-5 inline-flex w-fit bg-[#1A1408] px-4 py-3 text-[12px] font-extrabold tracking-[0.08em] text-white dark:bg-[#FFF6D8] dark:text-[#1A1408]"
              >
                {p.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 bg-gradient-to-b from-[#2A2114] to-[#1A1408] px-6 py-16 text-center text-white">
        <h2 className="font-display text-[clamp(1.5rem,3.5vw,2.1rem)] font-extrabold">
          Stay with the pack
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] text-[#b9b0a4]">
          Jump into Community for updates — or start earning in the Miner.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/community"
            className="bg-[#ff6a00] px-5 py-3 text-[12px] font-extrabold tracking-[0.08em] text-white"
          >
            COMMUNITY
          </Link>
          <Link
            href="/?mode=miner"
            className="border border-white/30 px-5 py-3 text-[12px] font-extrabold tracking-[0.08em]"
          >
            PLAY MINER
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E8D4A0] px-6 py-8 text-center text-[12px] text-[#6B5A3E] dark:border-[#3D3220] dark:text-[#A89068]">
        <p>
          Bonga — Bonk&apos;s Sister on Solana. Not affiliated with BONK
          Foundation.
        </p>
        <p className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/about" className="underline-offset-2 hover:underline">
            About
          </Link>
          <Link href="/treasury" className="underline-offset-2 hover:underline">
            Treasury
          </Link>
          <Link
            href="/how-to-connect"
            className="underline-offset-2 hover:underline"
          >
            How to Connect
          </Link>
        </p>
      </footer>
    </div>
  );
}
