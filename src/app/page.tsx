import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MinerShell } from "@/components/miner/miner-shell";
import { BongaLanding } from "@/components/home/bonga-landing";
import { HomeSeoContent } from "@/components/seo/home-seo-content";
import { HomeJsonLd } from "@/components/seo/site-json-ld";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga Bonks — Bonk's Sister on Solana | Mine, Stake, Bank $BONGA",
  description:
    "Bonga — Bonk's Sister. Mine $BONGA, soft-stake coins, stake NFTs, and withdraw from Bonga Bank on Solana. Raise the frequency at bongabonks.com.",
  path: "/",
  keywords: [
    "Bonga",
    "Bonk",
    "Bonga Bonk",
    "Bonk's Sister",
    "Bonk Miner",
    "Bonga Bonk Miner",
    "Bonga Solana",
    "Bonga Bank",
    "Coin Stake",
    "$BONGA",
    "Solana meme coin",
    "bongabonks",
    "Raise the Frequency",
  ],
  imageAlt: "Bonga Bonks — Bonk's Sister on Solana",
});

type HomeProps = {
  searchParams: Promise<{ mode?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;
  const modeRaw = sp.mode;
  const mode = Array.isArray(modeRaw) ? modeRaw[0] : modeRaw;
  // Vibes Garden retired from UI — old bookmarks land on Miner.
  if (mode === "garden") {
    redirect("/?mode=miner");
  }
  const showGame = mode === "miner";

  return (
    <>
      <HomeJsonLd />
      <HomeSeoContent />
      {showGame ? (
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
              Raising the frequency...
            </div>
          }
        >
          <MinerShell />
        </Suspense>
      ) : (
        <BongaLanding />
      )}
    </>
  );
}
