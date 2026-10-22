"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, PawPrint, Shield } from "lucide-react";
import { BongaMarketingShell } from "@/components/layout/bonga-marketing-shell";
import { PetLoveModule } from "@/components/peace/pet-love-module";
import { PET_LOVE_REWARD } from "@/lib/pet-love";

const TOKEN_LOGO = "/bonga-token-logo.png";

export function PetLoveLanding() {
  return (
    <BongaMarketingShell>
      <section className="relative overflow-hidden border-b border-[#E8D4A0] py-14 md:py-16 dark:border-[#3D3220]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(255,107,157,0.12),transparent),radial-gradient(ellipse_40%_30%_at_90%_20%,rgba(45,184,168,0.08),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <div className="relative mx-auto h-28 w-28 md:h-36 md:w-36">
            <Image
              src={TOKEN_LOGO}
              alt="Bonga — official $BONGA token logo"
              fill
              unoptimized
              priority
              className="rounded-full object-cover shadow-[0_12px_36px_rgba(239,180,0,0.3)]"
            />
          </div>
          <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6B5A3E] dark:text-[#A89068]">
            Daily care · Community gallery
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
            Pet <span className="text-[#ff6a00]">Love</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#6B5A3E] dark:text-[#A89068] md:text-lg">
            Share a hand-petting moment with any pet — stay anonymous, build the
            gallery, earn {PET_LOVE_REWARD} $BONGA once per wallet per day.
          </p>

          <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-2 text-xs text-[#6B5A3E] dark:text-[#A89068]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D4A0] bg-[#FFFBEA] px-3 py-1.5 dark:border-[#3D3220] dark:bg-[#2A2114]">
              <Shield className="h-3.5 w-3.5 text-bonga-teal" />
              Verified on your device
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D4A0] bg-[#FFFBEA] px-3 py-1.5 dark:border-[#3D3220] dark:bg-[#2A2114]">
              <PawPrint className="h-3.5 w-3.5 text-[#ff6a00]" />
              One photo / wallet / day
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8D4A0] bg-[#FFFBEA] px-3 py-1.5 dark:border-[#3D3220] dark:bg-[#2A2114]">
              <Heart className="h-3.5 w-3.5 text-bonga-purple" />
              Gallery stays anonymous
            </span>
          </div>
        </div>
      </section>

      <section className="bg-[#FFFBEA]/50 py-12 md:py-16 dark:bg-[#2A2114]/30">
        <div className="mx-auto max-w-4xl px-6">
          <PetLoveModule />
        </div>
      </section>

      <section className="border-t border-[#E8D4A0] px-6 py-10 text-center dark:border-[#3D3220]">
        <div className="relative mx-auto h-14 w-14">
          <Image
            src={TOKEN_LOGO}
            alt="Bonga"
            fill
            unoptimized
            className="rounded-full object-cover"
          />
        </div>
        <p className="mt-3 text-sm text-[#6B5A3E] dark:text-[#A89068]">
          Bonga Pet Love · Raise the Frequency
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs">
          <Link href="/peace" className="font-medium text-bonga-teal hover:underline">
            Bonga Peace
          </Link>
          <Link href="/?mode=miner" className="font-medium text-[#ff6a00] hover:underline">
            Bonk Miner
          </Link>
          <Link href="/nft" className="font-medium text-bonga-teal hover:underline">
            NFT Collection
          </Link>
          <Link href="/about" className="font-medium text-bonga-purple hover:underline">
            About Bonga
          </Link>
        </div>
      </section>
    </BongaMarketingShell>
  );
}
