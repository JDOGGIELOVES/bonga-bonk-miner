"use client";

import Image from "next/image";
import Link from "next/link";
import { NFTHeader } from "@/components/nft/nft-header";
import { NFTHero } from "@/components/nft/nft-hero";
import { NFTGallery } from "@/components/nft/nft-gallery";
import { NFTMintPanel } from "@/components/nft/nft-mint-panel";
import { RoadmapSection } from "@/components/nft/roadmap-section";
import { TeamSection } from "@/components/nft/team-section";
import { UtilitySection } from "@/components/nft/utility-section";
import { CommunitySection } from "@/components/nft/community-section";

export function NFTLanding() {
  return (
    <div className="min-h-screen bg-bonga-page">
      <NFTHeader />
      <NFTHero />
      <NFTGallery />
      <NFTMintPanel />
      <UtilitySection />
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
          <Link href="/" className="text-bonga-orange hover:underline">
            Bonk Miner
          </Link>
          <Link href="/nft#mint" className="text-bonga-teal hover:underline">
            Mint NFT
          </Link>
        </div>
      </footer>
    </div>
  );
}