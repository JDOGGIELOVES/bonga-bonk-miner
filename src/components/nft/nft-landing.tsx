"use client";

import Image from "next/image";
import Link from "next/link";
import { BongaHeader } from "@/components/layout/bonga-header";
import { NFTHero } from "@/components/nft/nft-hero";
import { NFTGallery } from "@/components/nft/nft-gallery";
import { NFTMintPanel } from "@/components/nft/nft-mint-panel";
import { RoadmapSection } from "@/components/nft/roadmap-section";
import { TeamSection } from "@/components/nft/team-section";
import { UtilitySection } from "@/components/nft/utility-section";
import { CommunitySection } from "@/components/nft/community-section";
import { TaiChiSection } from "@/components/nft/tai-chi-section";
import { STAKE_RATES, RARITY_COLORS, type RarityTier } from "@/lib/nft-collection";

export function NFTLanding() {
  return (
    <div className="min-h-screen bg-bonga-page">
      <BongaHeader />
      <NFTHero />
      <NFTGallery />

      {/* Prominent Staking Earnings — to entice NFT purchases. 
          Moved before the mint panel (which contains "Your Bongas" owned NFTs) 
          so the "Stake Your Bonga NFT — Earn Every Day" heading appears above 
          the area showing NFTs you currently hold, avoiding overlap. */}
      <section className="py-14 bg-muted/20 border-y border-border/40">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-8">
            <div className="inline-block rounded-full bg-bonga-orange/10 px-3 py-1 text-xs font-semibold tracking-[0.5px] text-bonga-orange mb-3">
              PASSIVE INCOME FOR HOLDERS
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Stake Your Bonga NFT — Earn Every Day
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Lock your NFT on the staking page and earn tiered $BONGA daily. 
              All rewards auto-deposit into your Bonga Bank Vault. Higher rarity = bigger yield.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["Common", "Rare", "Legendary", "Cosmic Bonga"] as RarityTier[]).map((rarity) => {
              const daily = STAKE_RATES[rarity];
              const color = RARITY_COLORS[rarity];
              const monthly = daily * 30;
              return (
                <div 
                  key={rarity}
                  className="bonga-card p-6 text-center border-2 transition hover:scale-[1.01]"
                  style={{ borderColor: color }}
                >
                  <div className="text-[10px] uppercase tracking-[1px] font-semibold mb-1" style={{ color }}>
                    {rarity}
                  </div>
                  <div className="font-display text-5xl font-extrabold tabular-nums tracking-tighter" style={{ color }}>
                    {daily.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground -mt-1 mb-3">$BONGA per day per NFT</div>

                  <div className="text-xs text-muted-foreground">
                    ≈ <span className="font-semibold text-foreground">{monthly.toLocaleString()}</span> / month
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 text-[10px] text-muted-foreground leading-snug">
                    Auto-deposited to your Bonga Bank Vault.<br />
                    On-chain once you hit the 10,000 $BONGA threshold.
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/staking" 
              className="inline-flex items-center gap-2 rounded-full border border-bonga-teal/60 bg-bonga-teal/5 px-5 py-2 text-sm font-semibold text-bonga-teal hover:bg-bonga-teal/10 transition"
            >
              Go to Staking Page → Lock & Earn
            </Link>
            <p className="mt-2 text-[10px] text-muted-foreground">Prorated • You keep full custody of your NFT</p>
          </div>
        </div>
      </section>

      <NFTMintPanel />

      <UtilitySection />
      <TaiChiSection />
      <RoadmapSection />
      <TeamSection />
      <CommunitySection />

      <footer className="border-t border-border/50 py-10 text-center">
        <div className="relative mx-auto h-16 w-16">
          <Image
            src="/bonga-character.png"
            alt="Bonga"
            fill
            className="object-contain"
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Bonga NFT Collection · Peace & Love on Solana
        </p>
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <Link href="/community" className="text-bonga-purple hover:underline">
            About Bonga
          </Link>
          <Link href="/" className="text-bonga-orange hover:underline">
            Bonk Miner
          </Link>
          <Link href="/nft#mint" className="text-bonga-teal hover:underline">
            Mint NFT
          </Link>
          <Link href="/peace" className="text-bonga-teal hover:underline">
            Bonga Peace
          </Link>
          <Link href="/nft#peace" className="text-bonga-purple hover:underline">
            Tai Chi
          </Link>
        </div>
      </footer>
    </div>
  );
}