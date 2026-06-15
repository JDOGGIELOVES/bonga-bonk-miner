"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BongaNFTArt } from "@/components/nft/bonga-nft-art";
import {
  fetchMintStatus,
  getMintPrice,
  getMintWalletMinimumSol,
  loadWalletMints,
  mintBongaNFT,
  MINT_CONFIG,
  type MintedNFT,
  type MintStatus,
} from "@/lib/nft-mint";
import { COLLECTION_STATS } from "@/lib/nft-collection";
import { Wallet, Loader2 } from "lucide-react";

export function NFTMintPanel() {
  const walletAdapter = useWallet();
  const { connected, publicKey } = walletAdapter;
  const { setVisible } = useWalletModal();
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState("");
  const [lastMint, setLastMint] = useState<MintedNFT | null>(null);
  const [myMints, setMyMints] = useState<MintedNFT[]>([]);
  const [mintStatus, setMintStatus] = useState<MintStatus | null>(null);

  const walletRef = useRef<string | undefined>(undefined);
  const adapterRef = useRef<any>(null);

  const wallet = publicKey?.toBase58();
  const isLive = mintStatus?.live === true;
  const isPreview =
    mintStatus === null ? MINT_CONFIG.simulated : !isLive;
  // Only enable the primary mint action when we have a fully resolved connection + pubkey.
  // This prevents showing "Mint" while wallet reports transient connected=true without address.
  const hasConnectedWallet = connected && !!publicKey;
  const onChainPrice = mintStatus?.priceSol ?? MINT_CONFIG.priceSol;
  const price = getMintPrice(wallet, onChainPrice);
  const walletMinimum = getMintWalletMinimumSol(onChainPrice);
  const supplyTotal =
    mintStatus?.itemsAvailable ?? COLLECTION_STATS.totalSupply;
  const totalMinted = mintStatus?.itemsRedeemed ?? COLLECTION_STATS.minted;
  const mintedPct = Math.min(100, (totalMinted / supplyTotal) * 100);

  const refreshMints = useCallback(async () => {
    const status = await fetchMintStatus();
    setMintStatus(status);
    if (wallet) setMyMints(loadWalletMints(wallet));
  }, [wallet]);

  useEffect(() => {
    void refreshMints();
  }, [refreshMints]);

  useEffect(() => {
    walletRef.current = wallet;
    adapterRef.current = walletAdapter;
  }, [wallet, walletAdapter, connected]);

  const handleMint = async () => {
    // Prefer the values from the current render scope (fresh handler created when button rendered).
    // Fall back to refs (kept in sync via effect) for extra safety against any edge timing.
    const liveWallet = publicKey?.toBase58() ?? null;
    const liveAdapter = walletAdapter;

    let currentWallet = liveWallet ?? walletRef.current;
    let currentAdapter: any = liveAdapter ?? adapterRef.current;

    // Final guard using the adapter's own publicKey (most authoritative)
    if (!currentWallet || !currentAdapter || !currentAdapter.publicKey) {
      // Re-pull from refs as last chance
      currentWallet = walletRef.current;
      currentAdapter = adapterRef.current;
    }

    if (!currentWallet || !currentAdapter?.publicKey) {
      setVisible(true);
      return;
    }

    // Ensure refs are up to date for this click
    walletRef.current = currentWallet;
    adapterRef.current = currentAdapter;

    setMinting(true);
    setError("");
    setLastMint(null);

    const result = await mintBongaNFT(currentWallet, currentAdapter, mintStatus);

    if (result.success && result.minted) {
      setLastMint(result.minted);
      await refreshMints();
    } else {
      setError(result.error || "Mint failed");
    }
    setMinting(false);
  };

  return (
    <section id="mint" className="section-anchor py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
          Mint Your <span className="text-gradient">Bonga</span>
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          {isLive
            ? "Live on Solana via Candy Machine v3"
            : "Try the collection now — real Solana mints coming soon"}
        </p>

        {isLive && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-bonga-green/40 bg-bonga-green/10 p-4 text-center">
            <p className="text-sm font-semibold text-bonga-green">
              Live on Solana — mints appear in Phantom & Solflare
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {mintStatus.itemsRedeemed ?? 0} / {mintStatus.itemsAvailable ?? COLLECTION_STATS.totalSupply} minted on-chain
            </p>
          </div>
        )}

        {isPreview && (
          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-400/40 bg-amber-50/80 p-4 text-center dark:bg-amber-950/30">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Preview mint only — not a real on-chain NFT yet
            </p>
            <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-100/80">
              Your mint is saved on this website only. It will{" "}
              <strong>not</strong> appear in Solflare, Phantom, or Magic Eden
              until we deploy the on-chain Candy Machine. No SOL is charged in
              preview mode.
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="bonga-card border-bonga-orange/30 bg-gradient-to-br from-bonga-orange/5 to-bonga-purple/5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Collection progress
              </span>
              <span className="font-bold text-bonga-orange">
                {totalMinted.toLocaleString()} / {supplyTotal.toLocaleString()}
              </span>
            </div>
            <Progress value={mintedPct} className="mt-2" />

            <div className="mt-6 rounded-2xl bg-card/80 p-4">
              <p className="text-sm text-muted-foreground">Mint price</p>
              <p className="font-display text-3xl font-bold">
                <span>
                  {price.toFixed(isLive ? 2 : 3)}{" "}
                  <span className="text-lg text-muted-foreground">SOL</span>
                </span>
              </p>
              {isLive && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Keep ~{walletMinimum.toFixed(2)} SOL in your wallet (mint + network
                  fees)
                </p>
              )}
            </div>

            {hasConnectedWallet ? (
              <Button
                variant="peace"
                size="lg"
                className="mt-6 w-full"
                onClick={() => void handleMint()}
                disabled={
                  minting || myMints.length >= COLLECTION_STATS.maxPerWallet
                }
              >
                {minting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Minting...
                  </>
                ) : myMints.length >= COLLECTION_STATS.maxPerWallet ? (
                  "Max Mints Reached"
                ) : isPreview ? (
                  `Preview Mint (${price.toFixed(3)} SOL)`
                ) : (
                  `Mint Bonga NFT (${onChainPrice.toFixed(2)} SOL)`
                )}
              </Button>
            ) : (
              <Button
                variant="peace"
                size="lg"
                className="mt-6 w-full"
                onClick={() => setVisible(true)}
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet to Mint
              </Button>
            )}

            {error && (
              <p className="mt-3 text-center text-sm text-red-500">{error}</p>
            )}

            <p className="mt-3 text-center text-[10px] text-muted-foreground">
              Max {COLLECTION_STATS.maxPerWallet} per wallet
              {isPreview
                ? " · Preview saves to this browser only"
                : " · Phantom & Solflare supported"}
            </p>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {lastMint ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bonga-card border-bonga-green/40 bg-bonga-green/5 p-6 text-center"
                >
                  <p className="text-4xl">🎉</p>
                  <h3 className="mt-2 font-display text-xl font-bold">
                    {lastMint.simulated !== false
                      ? "Preview Bonga Saved!"
                      : "Bonga Minted!"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {lastMint.simulated !== false
                      ? "Visible here on bongabonks.com — on-chain mint coming soon"
                      : "Welcome to the fam — check your wallet"}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <div className="mb-1">
                      <BongaNFTArt nft={lastMint.nft} size="sm" />
                    </div>
                  </div>
                  <p className="mt-2 font-bold">{lastMint.nft.name}</p>
                  <Badge variant="purple" className="mt-1">
                    {lastMint.nft.rarity}
                  </Badge>
                  {lastMint.simulated !== false && (
                    <Badge variant="default" className="mt-2">
                      Website preview
                    </Badge>
                  )}
                  {lastMint.simulated === false && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Phantom can take a few minutes to show new NFTs. Pull down
                      to refresh Collectibles, or view on{" "}
                      <a
                        href={`https://solscan.io/token/${lastMint.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-bonga-teal underline"
                      >
                        Solscan
                      </a>
                      .
                    </p>
                  )}
                  <p className="mt-2 font-mono text-[10px] text-muted-foreground break-all">
                    Mint: {lastMint.mint}
                  </p>
                  {lastMint.simulated === false && (
                    <a
                      href={`https://solscan.io/tx/${lastMint.txSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block font-mono text-[10px] text-bonga-teal underline break-all"
                    >
                      Tx: {lastMint.txSignature}
                    </a>
                  )}
                  {lastMint.simulated !== false && (
                    <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                      {lastMint.txSignature}
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full min-h-[280px] items-center justify-center rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 p-6 text-center"
                >
                  <div>
                    <p className="text-5xl">✌️</p>
                    <p className="mt-3 font-medium text-muted-foreground">
                      Your minted Bonga appears here
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {myMints.length > 0 && (
              <div className="bonga-card p-4">
                <h4 className="font-semibold">Your Bongas ({myMints.length})</h4>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {myMints.map((m) => (
                    <div key={m.mint} className="text-center">
                      <div className="mb-2">
                        <BongaNFTArt
                          nft={m.nft}
                          size="xs"
                          fillContainer
                          className="rounded-xl shadow-none"
                        />
                      </div>
                      <p className="truncate text-[10px] font-medium">
                        {m.nft.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}