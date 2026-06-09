"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const NAV = [
  { href: "#breathe", label: "Breathe" },
  { href: "#bonk-break", label: "Bonk Break" },
  { href: "#stretch", label: "Stretch" },
  { href: "#tai-chi", label: "Tai Chi" },
  { href: "#affirmations", label: "Affirmations" },
  { href: "#checkin", label: "Check-in" },
];

export function PeaceHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/peace" className="min-w-0 font-display text-lg font-bold">
          Bonga <span className="text-gradient">Peace</span>
        </Link>

        <nav className="hidden gap-4 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
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
        </nav>

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
      </div>
    </header>
  );
}