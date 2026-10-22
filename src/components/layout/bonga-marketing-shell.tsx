"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LandingWallet } from "@/components/home/landing-wallet";
import { BONGA_TOKEN_CA } from "@/lib/bonga-token";

const TOKEN_LOGO = "/bonga-token-logo.png";

const JUP_BUY = `https://jup.ag/swap/SOL-${BONGA_TOKEN_CA}`;

const NAV = [
  { href: "/?mode=miner", label: "Miner" },
  { href: "/coin-staking", label: "Coin Stake" },
  { href: "/staking", label: "NFT Stake" },
  { href: "/bonga-bank", label: "Bank" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
] as const;

function navActive(pathname: string, href: string) {
  if (href.startsWith("/?")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BongaMarketingHeader({ showPromo = true }: { showPromo?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      {showPromo && (
        <div className="bg-[#1A1408] px-4 py-2.5 text-center text-[13px] text-white dark:bg-black">
          Coin Stake is live — monthly APR settles into Bonga Bank.{" "}
          <Link
            href="/coin-staking"
            className="font-semibold text-[#ff6a00] underline underline-offset-2"
          >
            Learn more
          </Link>
        </div>
      )}
      <header className="border-b border-[#E8D4A0] bg-[#FFF6D8]/90 backdrop-blur dark:border-[#3D3220] dark:bg-[#1A1408]/90">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-sm font-extrabold tracking-[0.12em] text-[#1A1408] dark:text-[#FFF6D8]"
          >
            <Image
              src={TOKEN_LOGO}
              alt="$BONGA token logo"
              width={32}
              height={32}
              unoptimized
              className="h-8 w-8 rounded-full"
            />
            BONGA
          </Link>
          <nav className="hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[13px] text-[#6B5A3E] dark:text-[#A89068] md:flex">
            {NAV.map((item) => {
              const active = navActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "font-semibold text-[#ff6a00]"
                      : "hover:text-[#1A1408] dark:hover:text-white"
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={JUP_BUY}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden bg-[#1A1408] px-3 py-2 text-[11px] font-bold tracking-[0.08em] text-white dark:bg-[#FFF6D8] dark:text-[#1A1408] sm:inline-block"
            >
              ACCESS $BONGA
            </a>
            <LandingWallet />
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 border-t border-[#E8D4A0] px-4 py-2 md:hidden dark:border-[#3D3220]">
          {NAV.map((item) => {
            const active = navActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  active
                    ? "bg-[#ff6a00]/15 text-[#ff6a00]"
                    : "text-[#6B5A3E] dark:text-[#A89068]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}

export function BongaMarketingFooter() {
  return (
    <footer className="border-t border-[#E8D4A0] bg-[#FFF6D8] px-6 py-8 text-center text-[12px] text-[#6B5A3E] dark:border-[#3D3220] dark:bg-[#1A1408] dark:text-[#A89068]">
      <p>
        Bonga — Bonk&apos;s Sister on Solana. Not affiliated with BONK Foundation.
      </p>
      <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/?mode=miner" className="hover:underline">
          Miner
        </Link>
        <Link href="/coin-staking" className="hover:underline">
          Coin Stake
        </Link>
        <Link href="/staking" className="hover:underline">
          NFT Stake
        </Link>
        <Link href="/bonga-bank" className="hover:underline">
          Bank
        </Link>
        <Link href="/community" className="hover:underline">
          Community
        </Link>
        <Link href="/treasury" className="hover:underline">
          Treasury
        </Link>
        <Link href="/how-to-connect" className="hover:underline">
          How to Connect
        </Link>
      </p>
    </footer>
  );
}

/** Option C shell for marketing pages (Miner keeps the game header). */
export function BongaMarketingShell({
  children,
  showPromo = true,
}: {
  children: React.ReactNode;
  showPromo?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFF6D8] text-[#1A1408] dark:bg-[#1A1408] dark:text-[#FFF6D8]">
      <BongaMarketingHeader showPromo={showPromo} />
      <main className="flex-1">{children}</main>
      <BongaMarketingFooter />
    </div>
  );
}
