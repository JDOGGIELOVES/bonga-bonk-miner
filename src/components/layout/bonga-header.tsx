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
    <header className="sticky top-0 z-[60] w-full border-b border-border/40 bg-card/70 backdrop-blur-xl">
      {/* Full-width header with exactly 30px left/right padding. No max-width constraint on the header bar itself. */}
      <div className="w-full px-[30px] py-4 flex items-center justify-between gap-4">
        {/* Brand / Logo - left side, shrink-protected so text never gets overlapped by nav buttons */}
        <Link href="/" className="group flex-shrink-0 min-w-[140px]">
          <p className="font-display text-2xl font-extrabold tracking-tight text-bonga-orange">
            BONGA
          </p>
          <p className="truncate text-sm font-medium text-foreground/80">
            Bonk&apos;s Sister
          </p>
          <p className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Raise the Frequency
          </p>
        </Link>

        {/* Nav links + controls - right side. flex-wrap allows clean stacking on very narrow screens without overlapping logo text. */}
        <div className="flex flex-wrap items-center gap-1.5 justify-end flex-1 min-w-0">
          {currentMode === 'garden' && onModeChange ? (
            // Per user request (after repeated navigation issues): simplified nav on garden view.
            // Only keep the reliable back-to-miner link. Other links (Peace, NFTs, etc.) are removed from garden to avoid broken experience.
            // Added small link to the how-to-connect info as requested.
            <>
              <button
                onClick={() => onModeChange('miner')}
                className="rounded-full border border-bonga-orange/40 bg-bonga-orange/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-2.5 sm:py-1"
              >
                ← Back to Bonk Miner
              </button>
              <Link
                href="/how-to-connect"
                className="rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground sm:text-xs sm:px-2.5 sm:py-1"
              >
                How to Connect Wallet
              </Link>
            </>
          ) : (
            <>
              {/* Full nav on miner/other views */}
              {/* Updated nav per upgrade plan: Home / Bonk Miner | Vibes Garden | Peace | NFTs | Staking | Community | Treasury */}
              <Link
                href="/"
                className={getLinkClass(
                  "/",
                  "rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground sm:text-xs sm:px-2.5 sm:py-1"
                )}
              >
                Home
              </Link>
              {onModeChange ? (
                <button
                  onClick={() => onModeChange('miner')}
                  className={getLinkClass(
                    "/?mode=miner",
                    "rounded-full border border-bonga-orange/40 bg-bonga-orange/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-2.5 sm:py-1",
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
                    "rounded-full border border-bonga-orange/40 bg-bonga-orange/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-2.5 sm:py-1"
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
                    "rounded-full border border-bonga-teal/40 bg-bonga-teal/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-2.5 sm:py-1",
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
                    "rounded-full border border-bonga-teal/40 bg-bonga-teal/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-2.5 sm:py-1"
                  )}
                >
                  Vibes Garden
                </Link>
              )}
              <Link
                href="/peace"
                className={getLinkClass(
                  "/peace",
                  "rounded-full border border-bonga-teal/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-2.5 sm:py-1"
                )}
              >
                Peace
              </Link>
              <Link
                href="/nft"
                className={getLinkClass(
                  "/nft",
                  "rounded-full border border-bonga-orange/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-2.5 sm:py-1"
                )}
              >
                NFTs
              </Link>
              <Link
                href="/staking"
                className={getLinkClass(
                  "/staking",
                  "rounded-full border border-bonga-orange/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:text-xs sm:px-2.5 sm:py-1"
                )}
              >
                Staking
              </Link>
              <Link
                href="/community"
                className={getLinkClass(
                  "/community",
                  "rounded-full border border-bonga-purple/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-purple transition hover:bg-bonga-purple/10 sm:text-xs sm:px-2.5 sm:py-1"
                )}
              >
                Community
              </Link>
              <Link
                href="/treasury"
                className={getLinkClass(
                  "/treasury",
                  "rounded-full border border-bonga-teal/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:text-xs sm:px-2.5 sm:py-1"
                )}
              >
                Treasury
              </Link>
              <Link
                href="/how-to-connect"
                className={getLinkClass(
                  "/how-to-connect",
                  "rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground sm:text-xs sm:px-2.5 sm:py-1"
                )}
              >
                How to Connect
              </Link>
            </>
          )}
          {soundSlot}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground sm:h-9 sm:w-9"
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