import type { Metadata } from "next";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import { BongaCaBanner } from "@/components/about/bonga-ca-banner";
import { buildPageMetadata } from "@/lib/site-seo";
import { getPublicTreasuryInfo } from "@/lib/treasury/config";
import { getRecentTreasuryPayouts } from "@/lib/treasury/daily-claims";

export const metadata: Metadata = buildPageMetadata({
  title: "Bonga Community Treasury | Transparent Solana Treasury for Bonga Bonk's Sister",
  description:
    "Fully transparent Bonga Community Treasury on Solana. View current SOL and $BONGA balances, see where 7% NFT royalties and community claims go. Nothing to hide — public treasury for the Bonk & Bonga fam.",
  path: "/treasury",
  keywords: [
    "Bonga treasury",
    "Bonga Community Treasury",
    "Bonk treasury",
    "Bonga Bonk's Sister treasury",
    "Bonga NFT royalties",
    "Solana treasury",
    "transparent treasury",
    "Bonga Bonk treasury",
    "bongabonks treasury",
    "$BONGA treasury",
    "Bonga treasury balance",
  ],
  imageAlt: "Bonga Community Treasury — transparent on Solana",
});

async function getTreasuryData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://bongabonks.com"}/api/claim`, {
      next: { revalidate: 60 }, // refresh every minute
    });
    if (!res.ok) throw new Error("Failed to fetch treasury status");
    return await res.json();
  } catch (e) {
    return { enabled: false, error: "Treasury data temporarily unavailable" };
  }
}

async function getTallyData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "https://bongabonks.com"}/api/claim/tally`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch tally");
    return await res.json();
  } catch (e) {
    return { totalBonga: 0, claimCount: 0, miner: { bonga: 0, claims: 0 }, garden: { bonga: 0, claims: 0 }, pet: { bonga: 0, claims: 0 }, stake: { bonga: 0, claims: 0 } };
  }
}

export default async function TreasuryPage() {
  const [status, tally] = await Promise.all([getTreasuryData(), getTallyData()]);
  const publicInfo = getPublicTreasuryInfo();

  const treasuryAddress = status.treasury || publicInfo.treasuryPublicKey || null;
  const solBalance = status.balances?.sol ?? null;
  const bongaBalance = status.balances?.bonga ?? null;

  const totalPaid = tally.totalBonga || 0;
  const totalClaims = tally.claimCount || 0;
  const stakePaid = (tally as any).stake?.bonga || 0;

  let recentPayouts: Array<{
    signature: string;
    blockTime: number | null;
    amount: number;
    recipient: string;
  }> = [];

  if (status.treasury && status.mint) {
    try {
      const treasuryPk = new PublicKey(status.treasury);
      const mintPk = new PublicKey(status.mint);
      recentPayouts = await getRecentTreasuryPayouts({
        treasury: treasuryPk,
        mint: mintPk,
        limit: 25,
      });
    } catch (e) {
      // ignore errors, table will be empty
    }
  }

  return (
    <>
      <BongaHeader />
      <div className="min-h-screen bg-bonga-page">
        <div className="mx-auto max-w-4xl px-[30px] py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              Bonga Community <span className="text-gradient">Treasury</span>
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              100% transparent. We have nothing to hide. This is the public treasury for the entire Bonga Bonk&apos;s Sister ecosystem.
            </p>
            <div className="mt-6">
              <BongaCaBanner />
            </div>
          </div>

          {/* Current Balances */}
          <div className="bonga-card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="bonga-section-label">Current Treasury Holdings</p>
                <h2 className="font-display text-3xl font-bold">Live Balances</h2>
              </div>
              {treasuryAddress && (
                <a
                  href={`https://solscan.io/account/${treasuryAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-bonga-teal hover:underline flex items-center gap-1"
                >
                  View on Solscan →
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-xl p-6">
                <div className="text-sm text-muted-foreground">SOL Balance</div>
                <div className="font-display text-4xl font-bold mt-2">
                  {solBalance !== null ? solBalance.toFixed(4) : "—"} SOL
                </div>
              </div>
              <div className="bg-muted/30 rounded-xl p-6">
                <div className="text-sm text-muted-foreground">$BONGA Balance</div>
                <div className="font-display text-4xl font-bold mt-2">
                  {bongaBalance !== null ? bongaBalance.toLocaleString() : "—"} $BONGA
                </div>
              </div>
            </div>

            {status.error && (
              <p className="mt-4 text-sm text-red-500">{status.error}</p>
            )}
            {!status.enabled && (
              <p className="mt-4 text-sm text-muted-foreground">
                On-chain treasury data is currently disabled in this environment.
              </p>
            )}
          </div>

          {/* Where the money comes from */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-3xl font-bold mb-4">Where the Money Comes From</h2>
            
            <div className="space-y-6 text-base leading-relaxed">
              <div>
                <h3 className="font-semibold text-lg mb-2">Primary NFT Mint Proceeds</h3>
                <p className="text-muted-foreground">
                  100% of the proceeds from the initial mint of <Link href="/nft" className="text-bonga-orange hover:underline">Bonga NFTs</Link> go directly into this treasury wallet.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">7% NFT Royalties</h3>
                <p className="text-muted-foreground">
                  Every secondary market sale of a <Link href="/nft" className="text-bonga-orange hover:underline">Bonga NFT</Link> sends 7% of the sale price directly to this treasury. This is the primary ongoing funding source for the ecosystem.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Community & Ecosystem Growth</h3>
                <p className="text-muted-foreground">
                  The treasury exists to support the Bonga Bonk&apos;s Sister community — funding development, events, giveaways, and long-term sustainability of the project. All on-chain activity is public and verifiable.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Transparency note:</strong> Every $BONGA paid out from this treasury (miner, garden, Pet Love, NFT staking rewards, etc.) is recorded on Solana and reflected in our public claim tally (now includes a dedicated staking category).
                </p>
              </div>
            </div>
          </div>

          {/* Total Paid Out */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">Total Paid Out to the Community</h2>
            <p className="text-muted-foreground mb-6">
              Cumulative $BONGA distributed from the treasury to players and community members.
            </p>

            <div className="text-center">
              <div className="font-display text-6xl font-extrabold text-bonga-orange">
                {(totalPaid || 0).toLocaleString()}
              </div>
              <div className="text-xl text-muted-foreground mt-1">$BONGA paid out</div>
              <div className="text-sm text-muted-foreground mt-2">
                Across {(totalClaims || 0).toLocaleString()} claims (miner, garden, pet love, and NFT staking)
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link 
                href="/community" 
                className="text-sm text-bonga-teal hover:underline"
              >
                View full community breakdown and flagged activity →
              </Link>
            </div>
          </div>

          {/* Recent Payouts */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-3xl font-bold mb-2">Recent Payouts</h2>
            <p className="text-muted-foreground mb-6">
              The most recent $BONGA transfers from the treasury to community members (last 25 on-chain payouts).
            </p>

            {recentPayouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="py-2 pr-4">Time (UTC)</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Recipient</th>
                      <th className="py-2">Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayouts.map((p, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                        <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                          {p.blockTime ? new Date(p.blockTime * 1000).toLocaleString() : "—"}
                        </td>
                        <td className="py-2 pr-4 font-semibold text-bonga-orange">
                          {p.amount.toLocaleString()} $BONGA
                        </td>
                        <td className="py-2 pr-4 font-mono text-xs">
                          <a
                            href={`https://solscan.io/account/${p.recipient}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {p.recipient.slice(0, 6)}...{p.recipient.slice(-4)}
                          </a>
                        </td>
                        <td className="py-2">
                          <a
                            href={`https://solscan.io/tx/${p.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-bonga-teal hover:underline text-xs"
                          >
                            View on Solscan ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No recent on-chain payouts found, or treasury data is not available in this environment.</p>
            )}
          </div>

          {/* On-chain verification */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              All treasury activity is permanently recorded on Solana.
            </p>
            {treasuryAddress && (
              <a
                href={`https://solscan.io/account/${treasuryAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-bonga-teal hover:underline font-medium"
              >
                View full treasury wallet on Solscan
                <span>↗</span>
              </a>
            )}
          </div>

          <div className="mt-12">
            <BongaCaBanner />
          </div>

          {/* Sustainability note + link to clear personal mined savings view */}
          <div className="mt-10 text-center text-sm text-muted-foreground max-w-prose mx-auto">
            <p className="mb-2">
              <strong className="text-foreground">Sustainable economics:</strong> Players accumulate mined $BONGA in a personal off-chain <strong>Bonga Bank</strong>. 
              Earnings auto-deposit there. On-chain withdrawals up to 20,001 $BONGA daily (no vault minimum). 
              This keeps Solana fees paid by the treasury much lower than the value of $BONGA distributed to the community.
            </p>
            <Link href="/bonga-bank" className="inline-flex items-center gap-1 text-bonga-teal hover:underline font-medium">
              View your personal mined savings (connect wallet) →
            </Link>
          </div>
        </div>
      </div>
      <BongaFooter />
    </>
  );
}
