"use client";

import Image from "next/image";
import Link from "next/link";
import { PetLoveHeader } from "@/components/pet-love/pet-love-header";
import { PetLoveModule } from "@/components/peace/pet-love-module";
import { PET_LOVE_REWARD } from "@/lib/pet-love";

export function PetLoveLanding() {
  return (
    <div className="min-h-screen bg-bonga-page">
      <PetLoveHeader />

      <section className="relative overflow-hidden bg-hero-gradient py-14 md:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="relative mx-auto h-24 w-24 md:h-28 md:w-28">
            <Image
              src="/bonga-character.png"
              alt="Bonga"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Pet <span className="text-gradient">Love</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Share a hand-petting moment with any pet — stay anonymous, build
            community, earn {PET_LOVE_REWARD} $BONGA once per wallet per day (claiming requires holding a Bonga NFT).
          </p>
          <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground">
            Verified on your device before upload. One photo per connected wallet
            per UTC day. Gallery shows pets, not wallets. NFT holders only for rewards.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <PetLoveModule />
        </div>
      </section>

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
          Bonga Pet Love · Raise the Frequency
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
          <Link href="/peace" className="text-bonga-teal hover:underline">
            Bonga Peace
          </Link>
          <Link href="/" className="text-bonga-orange hover:underline">
            Bonk Miner
          </Link>
          <Link href="/nft" className="text-bonga-teal hover:underline">
            NFT Collection
          </Link>
          <Link href="/about" className="text-bonga-purple hover:underline">
            About Bonga
          </Link>
        </div>
      </footer>
    </div>
  );
}