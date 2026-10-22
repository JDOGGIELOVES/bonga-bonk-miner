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
  currentMode?: "miner" | "garden";
  onModeChange?: (mode: "miner" | "garden") => void;
}

export function BongaHeader({
  onWalletConnect,
  soundSlot,
  onModeChange,
}: BongaHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const getLinkClass = (href: string, baseClass: string) => {
    let active = false;
    if (href === "/") {
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
      <div className="flex w-full items-center justify-between gap-4 px-[30px] py-4">
        <Link href="/" className="group min-w-[140px] flex-shrink-0">
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

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
          <Link
            href="/"
            className={getLinkClass(
              "/",
              "rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            Home
          </Link>
          {onModeChange ? (
            <button
              onClick={() => onModeChange("miner")}
              className={getLinkClass(
                "/?mode=miner",
                "rounded-full border border-bonga-orange/40 bg-bonga-orange/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:px-2.5 sm:py-1 sm:text-xs"
              )}
            >
              Bonk Miner
            </button>
          ) : (
            <Link
              href="/?mode=miner"
              className={getLinkClass(
                "/?mode=miner",
                "rounded-full border border-bonga-orange/40 bg-bonga-orange/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:px-2.5 sm:py-1 sm:text-xs"
              )}
            >
              Bonk Miner
            </Link>
          )}
          <Link
            href="/peace"
            className={getLinkClass(
              "/peace",
              "rounded-full border border-bonga-teal/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            Peace
          </Link>
          <Link
            href="/pet-love"
            className={getLinkClass(
              "/pet-love",
              "rounded-full border border-bonga-purple/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-purple transition hover:bg-bonga-purple/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            Pet Love
          </Link>
          <Link
            href="/nft"
            className={getLinkClass(
              "/nft",
              "rounded-full border border-bonga-orange/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            NFTs
          </Link>
          <Link
            href="/staking"
            className={getLinkClass(
              "/staking",
              "rounded-full border border-bonga-orange/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            NFT Stake
          </Link>
          <Link
            href="/coin-staking"
            className={getLinkClass(
              "/coin-staking",
              "rounded-full border border-bonga-teal/40 bg-bonga-teal/5 px-2 py-0.5 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            Coin Stake
          </Link>
          <Link
            href="/bonga-bank"
            className={getLinkClass(
              "/bonga-bank",
              "rounded-full border border-bonga-orange/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-orange transition hover:bg-bonga-orange/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            Bonga Bank
          </Link>
          <Link
            href="/community"
            className={getLinkClass(
              "/community",
              "rounded-full border border-bonga-purple/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-purple transition hover:bg-bonga-purple/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            Community
          </Link>
          <Link
            href="/treasury"
            className={getLinkClass(
              "/treasury",
              "rounded-full border border-bonga-teal/30 px-2 py-0.5 text-[10px] font-semibold text-bonga-teal transition hover:bg-bonga-teal/10 sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            Treasury
          </Link>
          <Link
            href="/how-to-connect"
            className={getLinkClass(
              "/how-to-connect",
              "rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-semibold text-foreground/80 transition hover:border-foreground/40 hover:text-foreground sm:px-2.5 sm:py-1 sm:text-xs"
            )}
          >
            How to Connect
          </Link>
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
