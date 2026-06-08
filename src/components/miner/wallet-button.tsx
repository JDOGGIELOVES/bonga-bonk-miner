"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { shortenAddress, formatSol } from "@/lib/solana";
import { Wallet, LogOut, ChevronDown, Loader2 } from "lucide-react";

interface WalletButtonProps {
  onConnect?: () => void;
}

export function BongaWalletButton({ onConnect }: WalletButtonProps) {
  const { connection } = useConnection();
  const { publicKey, disconnect, connecting, connected, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [balance, setBalance] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const prevConnected = useRef(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports);
    } catch {
      setBalance(null);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    void fetchBalance();
    const id = setInterval(() => void fetchBalance(), 30_000);
    return () => clearInterval(id);
  }, [fetchBalance]);

  useEffect(() => {
    if (connected && !prevConnected.current) {
      onConnect?.();
    }
    prevConnected.current = connected;
  }, [connected, onConnect]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!connected || !publicKey) {
    return (
      <Button
        variant="peace"
        size="sm"
        className="h-9 gap-1.5 px-3 text-xs font-bold sm:h-10 sm:px-4 sm:text-sm"
        onClick={() => setVisible(true)}
        disabled={connecting}
      >
        {connecting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4" />
        )}
        <span className="hidden xs:inline sm:inline">Connect Wallet</span>
        <span className="xs:hidden sm:hidden">Connect</span>
      </Button>
    );
  }

  const address = shortenAddress(publicKey.toBase58());

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 border-bonga-teal/40 bg-bonga-teal/5 px-2 sm:h-10 sm:px-3"
        onClick={() => setMenuOpen((o) => !o)}
      >
        {wallet?.adapter.icon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wallet.adapter.icon}
            alt=""
            className="h-4 w-4 rounded-full"
          />
        )}
        <span className="font-mono text-xs font-semibold sm:text-sm">
          {address}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </Button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-border/50 bg-card p-3 shadow-xl"
          >
            <div className="mb-2 border-b border-border/50 pb-2">
              <p className="text-[10px] font-medium uppercase text-muted-foreground">
                Connected
              </p>
              <p className="font-mono text-xs font-semibold">{address}</p>
              {balance !== null && (
                <p className="mt-1 text-sm font-bold text-bonga-teal">
                  {formatSol(balance)} SOL
                </p>
              )}
              {wallet?.adapter.name && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  via {wallet.adapter.name}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-red-500 hover:text-red-600"
              onClick={() => {
                void disconnect();
                setMenuOpen(false);
              }}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Disconnect
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}