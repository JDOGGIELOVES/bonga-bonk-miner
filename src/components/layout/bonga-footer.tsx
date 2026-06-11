"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Bonk Miner", href: "/?mode=miner" },
  { label: "Vibes Garden", href: "/?mode=garden" },
  { label: "Bonga Peace", href: "/peace" },
  { label: "NFTs", href: "/nft" },
  { label: "Staking", href: "/staking" },
  { label: "Community", href: "/community" },
  { label: "Treasury", href: "/treasury" },
  { label: "About Bonga", href: "/about" },
  { label: "bonga.uno", href: "https://bonga.uno" },
  { label: "@BongaSolana", href: "https://x.com/BongaSolana" },
  { label: "Telegram", href: "https://t.me/bonga_sol_community" },
];

export function BongaFooter() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/?mode=")) return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <footer className="mt-auto border-t border-border/40 bg-card/50">
      <div className="mx-auto max-w-2xl px-4 py-8 text-center sm:px-6">
        <p className="font-display text-sm font-bold text-bonga-orange">BONGA</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Bonk&apos;s Sister · Raise the Frequency
        </p>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Spread the love. Support the pack. Built on Solana.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {LINKS.map((link) => {
            const external = link.href.startsWith("http");
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`text-xs font-medium transition-colors hover:text-bonga-orange ${
                  active
                    ? "text-bonga-orange font-semibold underline"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <p className="mt-6 text-[10px] text-muted-foreground/70">
          © {new Date().getFullYear()} BONGA. Not financial advice. Art is the real currency.
        </p>
      </div>
    </footer>
  );
}