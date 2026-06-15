"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "#breathe", label: "Breathe" },
  { href: "#meditate", label: "Meditate" },
  { href: "#stretch", label: "Stretch" },
  { href: "#tai-chi", label: "Tai Chi" },
  { href: "#affirmations", label: "Affirmations" },
  { href: "#checkin", label: "Check-in" },
];

export function PeaceHeader() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/?mode=")) return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

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
          {/* Consistent site-wide nav */}
          <Link href="/" className={`text-sm font-medium transition-colors hover:underline ${isActive("/") ? "text-bonga-orange font-semibold" : "text-bonga-orange"}`}>
            Home
          </Link>
          <Link href="/?mode=miner" className={`text-sm font-medium transition-colors hover:underline ${isActive("/?mode=miner") ? "text-bonga-orange font-semibold" : "text-bonga-orange"}`}>
            Bonk Miner
          </Link>
          <Link href="/?mode=garden" className={`text-sm font-medium transition-colors hover:underline ${isActive("/?mode=garden") ? "text-bonga-teal font-semibold" : "text-bonga-teal"}`}>
            Vibes Garden
          </Link>
          <Link href="/peace" className={`text-sm font-medium transition-colors hover:underline ${isActive("/peace") ? "text-bonga-teal font-semibold" : "text-bonga-teal"}`}>
            Peace
          </Link>
          <Link href="/nft" className={`text-sm font-medium transition-colors hover:underline ${isActive("/nft") ? "text-bonga-orange font-semibold" : "text-bonga-orange"}`}>
            NFTs
          </Link>
          <Link href="/community" className={`text-sm font-medium transition-colors hover:underline ${isActive("/community") ? "text-bonga-purple font-semibold" : "text-bonga-purple"}`}>
            Community
          </Link>
          <Link href="/treasury" className={`text-sm font-medium transition-colors hover:underline ${isActive("/treasury") ? "text-bonga-teal font-semibold" : "text-bonga-teal"}`}>
            Treasury
          </Link>
          <Link
            href="/bonga-bank"
            className="text-sm font-medium text-bonga-orange hover:underline"
          >
            Bonga Bank
          </Link>
          <Link
            href="/pet-love"
            className="text-sm font-medium text-bonga-orange hover:underline"
          >
            Pet Love
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