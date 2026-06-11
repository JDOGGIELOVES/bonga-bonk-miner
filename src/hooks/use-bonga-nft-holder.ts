"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const CACHE_KEY = "bonga-nft-holder-cache";
const CACHE_MS = 10 * 60 * 1000;

interface HolderCache {
  wallet: string;
  isHolder: boolean;
  checkedAt: number;
}

export interface BongaNftHolderStatus {
  isHolder: boolean;
  count: number;
  checking: boolean;
}

/** NFT holder status for Vibes Garden bonuses + count of held NFTs (cached API check). */
export function useBongaNftHolder(): BongaNftHolderStatus {
  const { publicKey, connected } = useWallet();
  const [isHolder, setIsHolder] = useState(false);
  const [count, setCount] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setIsHolder(false);
      setCount(0);
      return;
    }

    const wallet = publicKey.toBase58();

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache = JSON.parse(raw) as HolderCache & { count?: number };
        if (cache.wallet === wallet && Date.now() - cache.checkedAt < CACHE_MS) {
          setIsHolder(cache.isHolder);
          setCount(cache.count ?? 0);
          return;
        }
      }
    } catch {
      /* refresh */
    }

    let cancelled = false;
    setChecking(true);

    fetch(`/api/nft/holder?wallet=${encodeURIComponent(wallet)}`)
      .then((res) => res.json())
      .then((data: { isHolder?: boolean; count?: number }) => {
        if (cancelled) return;
        const holder = Boolean(data.isHolder);
        const nftCount = Number(data.count) || 0;
        setIsHolder(holder);
        setCount(nftCount);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            wallet,
            isHolder: holder,
            count: nftCount,
            checkedAt: Date.now(),
          })
        );
      })
      .catch(() => {
        if (!cancelled) {
          setIsHolder(false);
          setCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  return { isHolder, count, checking };
}