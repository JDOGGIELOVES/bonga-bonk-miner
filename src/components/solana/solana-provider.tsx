"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletError } from "@solana/wallet-adapter-base";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { getSolanaRpcEndpoint } from "@/lib/solana";

import "@solana/wallet-adapter-react-ui/styles.css";

const WALLET_STORAGE_KEY = "bonga-wallet";

function clearStaleWalletSelection() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("walletName");
    localStorage.removeItem(WALLET_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function SolanaProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => getSolanaRpcEndpoint(), []);

  // Phantom, Backpack, Coinbase, etc. auto-register via Wallet Standard (built into
  // @solana/wallet-adapter-react). Legacy PhantomWalletAdapter conflicts with that
  // and breaks connect on modern Phantom builds — do not add it here.
  const wallets = useMemo(() => [new SolflareWalletAdapter()], []);

  const onError = useCallback((error: WalletError) => {
    console.warn("[Bonga] Wallet error:", error.message);
    if (
      error.message?.includes("User rejected") ||
      error.message?.includes("rejected")
    ) {
      return;
    }
    clearStaleWalletSelection();
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect
        onError={onError}
        localStorageKey={WALLET_STORAGE_KEY}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}