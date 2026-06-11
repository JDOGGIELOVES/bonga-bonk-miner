"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BongaWalletButton } from "@/components/miner/wallet-button";
import { useTheme } from "@/components/theme-provider";

const NAV = [
  { href: "#gallery", label: "Gallery" },
  { href: "#mint", label: "Mint" },
  { href: "#utility", label: "Utility" },
  { href: "#peace", label: "Tai Chi" },
  { href: "/peace", label: "Peace App", isRoute: true },
  { href: "/pet-love", label: "Pet Love", isRoute: true },
  { href: "#roadmap", label: "Roadmap" },
];

export function NFTHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/nft" className="min-w-0 font-display text-lg font-bold">
          <span className="text-gradient">Bonga</span> NFTs
        </Link>

        <nav className="hidden gap-4 md:flex">
          {NAV.map((item) =>
            "isRoute" in item && item.isRoute ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-bonga-teal transition-colors hover:text-bonga-teal/80"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            )
          )}
          <Link
            href="/community"
            className="text-sm font-medium text-bonga-purple hover:underline"
          >
            Community
          </Link>
          <Link
            href="/treasury"
            className="text-sm font-medium text-bonga-teal hover:underline"
          >
            Treasury
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-bonga-purple hover:underline"
          >
            About
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-bonga-orange hover:underline"
          >
            Bonk Miner
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
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