"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { BongaWalletButton } from "@/components/miner/wallet-button";

export function PetLoveHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/pet-love" className="min-w-0 font-display text-lg font-bold">
          Bonga <span className="text-gradient">Pet Love</span>
        </Link>

        <nav className="hidden gap-4 md:flex">
          <Link
            href="/peace"
            className="text-sm font-medium text-bonga-teal hover:underline"
          >
            Peace
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-bonga-orange hover:underline"
          >
            Bonk Miner
          </Link>
          <Link
            href="/nft"
            className="text-sm font-medium text-bonga-teal hover:underline"
          >
            NFTs
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-bonga-purple hover:underline"
          >
            About
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <BongaWalletButton />
        </div>
      </div>
    </header>
  );
}