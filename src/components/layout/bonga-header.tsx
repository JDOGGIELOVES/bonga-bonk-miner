"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BongaWalletButton } from "@/components/miner/wallet-button";
import { useTheme } from "@/components/theme-provider";
import { usePathname } from "next/navigation";

interface BongaHeaderProps {
  onWalletConnect?: () => void;
  onToggleMute?: () => void;
  muted?: boolean;
  soundSlot?: React.ReactNode;
  currentMode?: 'miner' | 'garden';
  onModeChange?: (mode: 'miner' | 'garden') => void;
}

export function BongaHeader({
  onWalletConnect,
  soundSlot,
  currentMode,
  onModeChange,
}: BongaHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const getLinkClass = (href: string, baseClass: string, isGameLink = false) => {
    let active = false;
    if (isGameLink && currentMode) {
      active = (href.includes('miner') && currentMode === 'miner') || (href.includes('garden') && currentMode === 'garden');
    } else if (href === "/") {
      active = pathname === "/";
    } else if (href.startsWith("/?mode=")) {
      active = pathname === "/";
    } else {
      active = pathname === href || pathname.startsWith(href + "/");
    }
    return `${baseClass} ${active ? "ring-1 ring-offset-2 ring-offset-background ring-current" : ""}`;
  };

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

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Updated nav per upgrade plan: Home / Bonk Miner | Vibes Garden | Peace | NFTs | Community */}
          <Link
            href="/"
            className={getLinkClass(
              "/",
              "rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-[10px] font-semibold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground sm:text-xs sm:px-3 sm:py-1.5"
            )}
          >
            Home
          </Link>
          {onModeChange ? (
            <button
              onClick={() => onModeChange('miner')}
              className={getLinkClass(
                "/?mode=miner",
                "rounded-full border border-bonga-orange/40 bg-bonga-orange/5 px-2.5 py-1 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-3 sm:py-1.5",
                true
              )}
            >
              Bonk Miner
            </button>
          ) : (
            <Link
              href="/?mode=miner"
              className={getLinkClass(
                "/?mode=miner",
                "rounded-full border border-bonga-orange/40 bg-bonga-orange/5 px-2.5 py-1 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-3 sm:py-1.5"
              )}
            >
              Bonk Miner
            </Link>
          )}
          {onModeChange ? (
            <button
              onClick={() => onModeChange('garden')}
              className={getLinkClass(
                "/?mode=garden",
                "rounded-full border border-bonga-teal/40 bg-bonga-teal/5 px-2.5 py-1 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-3 sm:py-1.5",
                true
              )}
            >
              Vibes Garden
            </button>
          ) : (
            <Link
              href="/?mode=garden"
              className={getLinkClass(
                "/?mode=garden",
                "rounded-full border border-bonga-teal/40 bg-bonga-teal/5 px-2.5 py-1 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-3 sm:py-1.5"
              )}
            >
              Vibes Garden
            </Link>
          )}
          <Link
            href="/peace"
            className={getLinkClass(
              "/peace",
              "rounded-full border border-bonga-teal/30 px-2.5 py-1 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-3 sm:py-1.5"
            )}
          >
            Peace
          </Link>
          <Link
            href="/nft"
            className={getLinkClass(
              "/nft",
              "rounded-full border border-bonga-orange/30 px-2.5 py-1 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-3 sm:py-1.5"
            )}
          >
            NFTs
          </Link>
          <Link
            href="/community"
            className={getLinkClass(
              "/community",
              "rounded-full border border-bonga-purple/30 px-2.5 py-1 text-[10px] font-semibold text-bonga-purple transition hover:bg-bonga-purple/10 sm:text-xs sm:px-3 sm:py-1.5"
            )}
          >
            Community
          </Link>
          <Link
            href="/treasury"
            className={getLinkClass(
              "/treasury",
              "rounded-full border border-bonga-teal/30 px-2.5 py-1 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-3 sm:py-1.5"
            )}
          >
            Treasury
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