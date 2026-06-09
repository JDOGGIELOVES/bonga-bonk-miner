"use client";

import Image from "next/image";
import Link from "next/link";
import { PeaceHeader } from "@/components/peace/peace-header";
import { PeaceHero } from "@/components/peace/peace-hero";
import { BreathingModule } from "@/components/peace/breathing-module";
import { BonkBreakModule } from "@/components/peace/bonk-break-module";
import { TaiChiModule } from "@/components/peace/tai-chi-module";
import { StretchingModule } from "@/components/peace/stretching-module";
import { PeaceAudioToggle } from "@/components/peace/peace-audio-toggle";
import { DailyCheckIn } from "@/components/peace/daily-checkin";

export function PeaceLanding() {
  return (
    <div className="min-h-screen bg-bonga-page">
      <PeaceHeader />
      <PeaceHero />

      <section id="breathe" className="section-anchor py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center font-display text-3xl font-bold">
            Guided <span className="text-gradient">Breathing</span>
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Box breath, 4-7-8 calm, or a quick bonk-and-breathe reset
          </p>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <span>Voice cues guide each breath phase</span>
            <PeaceAudioToggle showMusic={false} />
          </p>
          <div className="mt-10">
            <BreathingModule />
          </div>
        </div>
      </section>

      <section id="bonk-break" className="section-anchor bg-muted/20 py-16">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-center font-display text-3xl font-bold">
            Bonk <span className="text-gradient">Break</span>
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            One minute to tap the stress away — playful release when the timeline
            gets loud
          </p>
          <div className="mt-10">
            <BonkBreakModule />
          </div>
        </div>
      </section>

      <section id="stretch" className="section-anchor bg-muted/20 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center font-display text-3xl font-bold">
            Daily <span className="text-gradient">Stretching</span>
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Gentle mobility routines — a new pick every day plus desk relief, hip
            openers, and evening wind-down
          </p>
          <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted-foreground">
            Stretch within your comfort. Not medical advice — skip anything that
            doesn&apos;t feel right.
          </p>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <span>Voice guide, begin chime, step ticks, and ambient lo-fi</span>
            <PeaceAudioToggle />
          </p>
          <div className="mt-10">
            <StretchingModule />
          </div>
        </div>
      </section>

      <section id="tai-chi" className="section-anchor py-16">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-center font-display text-3xl font-bold">
            Bonga <span className="text-gradient">Tai Chi</span>
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            Slow flows guided by trait art — cloud hands, cosmic balance, meadow
            wind-down
          </p>
          <p className="mx-auto mt-2 max-w-xl text-center text-xs text-muted-foreground">
            Gentle movement for relaxation and focus. Each step shows start and
            end body positions. Listen to your body.
          </p>
          <div className="mt-10">
            <TaiChiModule />
          </div>
        </div>
      </section>

      <section id="checkin" className="section-anchor bg-muted/20 py-16">
        <div className="mx-auto max-w-lg px-4">
          <h2 className="text-center font-display text-3xl font-bold">
            Daily <span className="text-gradient">Check-in</span>
          </h2>
          <p className="mt-2 text-center text-muted-foreground">
            A quick vibe check — stored locally, no wallet required
          </p>
          <div className="mt-10">
            <DailyCheckIn />
          </div>
        </div>
      </section>

      <section className="border-t border-border/50 py-12">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="font-display text-sm font-bold text-bonga-orange">
            NFT holder perks coming soon
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Staking, exclusive sessions, and lo-fi peace vibes for the fam —
            mint now to be ready.
          </p>
          <Link
            href="/nft#mint"
            className="mt-4 inline-block text-sm font-semibold text-bonga-teal hover:underline"
          >
            Mint on /nft →
          </Link>
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
          Bonga Peace · Raise the Frequency
        </p>
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <Link href="/" className="text-bonga-orange hover:underline">
            Bonk Miner
          </Link>
          <Link href="/nft" className="text-bonga-teal hover:underline">
            NFT Collection
          </Link>
          <Link href="/nft#mint" className="text-bonga-purple hover:underline">
            Mint
          </Link>
        </div>
      </footer>
    </div>
  );
}