"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BongaWalletButton } from "@/components/miner/wallet-button";
import { useTheme } from "@/components/theme-provider";

interface BongaHeaderProps {
  onWalletConnect?: () => void;
  onToggleMute?: () => void;
  muted?: boolean;
  soundSlot?: React.ReactNode;
}

export function BongaHeader({
  onWalletConnect,
  soundSlot,
}: BongaHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-card/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group min-w-0 flex-1">
          <p className="font-display text-xl font-extrabold tracking-tight text-bonga-orange sm:text-2xl">
            BONGA
          </p>
          <p className="truncate text-xs font-medium text-foreground/80 sm:text-sm">
            Bonk&apos;s Sister
          </p>
          <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Raise the Frequency
          </p>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/about"
            className="hidden rounded-full border border-bonga-purple/30 px-3 py-1.5 text-xs font-semibold text-bonga-purple transition-colors hover:bg-bonga-purple/10 sm:inline-block"
          >
            About
          </Link>
          <Link
            href="/peace"
            className="hidden rounded-full border border-bonga-teal/30 px-3 py-1.5 text-xs font-semibold text-bonga-teal transition-colors hover:bg-bonga-teal/10 sm:inline-block"
          >
            Peace
          </Link>
          <Link
            href="/pet-love"
            className="hidden rounded-full border border-bonga-orange/30 px-3 py-1.5 text-xs font-semibold text-bonga-orange transition-colors hover:bg-bonga-orange/10 sm:inline-block"
          >
            Pet Love
          </Link>
          <Link
            href="/nft"
            className="hidden rounded-full border border-bonga-orange/30 px-3 py-1.5 text-xs font-semibold text-bonga-orange transition-colors hover:bg-bonga-orange/10 sm:inline-block"
          >
            NFTs
          </Link>
          {soundSlot}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <BongaWalletButton onConnect={onWalletConnect} />
        </div>
      </div>
    </header>
  );
}