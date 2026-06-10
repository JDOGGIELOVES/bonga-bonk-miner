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

/** NFT holder status for Vibes Garden bonuses (cached API check). */
export function useBongaNftHolder(): {
  isHolder: boolean;
  checking: boolean;
} {
  const { publicKey, connected } = useWallet();
  const [isHolder, setIsHolder] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setIsHolder(false);
      return;
    }

    const wallet = publicKey.toBase58();

    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cache = JSON.parse(raw) as HolderCache;
        if (cache.wallet === wallet && Date.now() - cache.checkedAt < CACHE_MS) {
          setIsHolder(cache.isHolder);
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
      .then((data: { isHolder?: boolean }) => {
        if (cancelled) return;
        const holder = Boolean(data.isHolder);
        setIsHolder(holder);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            wallet,
            isHolder: holder,
            checkedAt: Date.now(),
          } satisfies HolderCache)
        );
      })
      .catch(() => {
        if (!cancelled) setIsHolder(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey]);

  return { isHolder, checking };
}