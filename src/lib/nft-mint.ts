import { BONGA_NFTS, type BongaNFT } from "@/lib/nft-collection";
import { getWhitelistStatus } from "@/lib/bonga-whitelist";
import { isMintSimulatedBuildHint } from "@/lib/mint-config";
import type { WalletContextState } from "@solana/wallet-adapter-react";

export const MINT_STORAGE_KEY = "bonga-nft-mints";

export const MINT_CONFIG = {
  priceSol: parseFloat(process.env.NEXT_PUBLIC_MINT_PRICE_SOL || "0.08"),
  candyMachineAddress:
    process.env.NEXT_PUBLIC_CANDY_MACHINE_ADDRESS || "",
  collectionAddress:
    process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || "",
  /** Build-time hint — use fetchMintStatus() / mintStatus.live in UI. */
  simulated: isMintSimulatedBuildHint(),
};

export interface MintedNFT {
  mint: string;
  nft: BongaNFT;
  wallet: string;
  timestamp: number;
  txSignature: string;
  pricePaid: number;
  simulated: boolean;
}

export interface MintResult {
  success: boolean;
  minted?: MintedNFT;
  error?: string;
}

export interface MintStatus {
  simulated: boolean;
  live: boolean;
  candyMachineAddress: string | null;
  collectionAddress: string | null;
  priceSol: number;
  supply: number;
  itemsRedeemed: number | null;
  itemsAvailable: number | null;
  error?: string;
}

function rollRarity(): BongaNFT {
  const totalWeight = BONGA_NFTS.reduce((s, n) => s + n.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const nft of BONGA_NFTS) {
    roll -= nft.weight;
    if (roll <= 0) return nft;
  }
  return BONGA_NFTS[0];
}

/**
 * Display mint price. Bonk Miner whitelist only applies to preview mints —
 * live Candy Guard always charges the on-chain solPayment (0.08 SOL).
 */
export function getMintPrice(
  walletAddress?: string,
  priceSol = MINT_CONFIG.priceSol,
  options?: { live?: boolean }
): number {
  if (options?.live) {
    return priceSol;
  }

  const wl = getWhitelistStatus(walletAddress);
  if (wl.tier === "free") return 0;
  if (wl.tier === "discount") {
    return priceSol * (1 - wl.discountPercent / 100);
  }
  return priceSol;
}

/** Rough wallet balance needed for mint + rent/fees */
export function getMintWalletMinimumSol(priceSol: number): number {
  return Math.ceil((priceSol + 0.02) * 100) / 100;
}

function normalizeMint(entry: MintedNFT): MintedNFT {
  const simulated =
    entry.simulated ??
    (entry.txSignature.startsWith("sim_") ||
      entry.txSignature.startsWith("preview_") ||
      entry.mint.startsWith("Bonga") ||
      entry.mint.startsWith("preview-"));

  return { ...entry, simulated };
}

export function loadWalletMints(wallet: string): MintedNFT[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MINT_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as MintedNFT[];
    return all.filter((m) => m.wallet === wallet).map(normalizeMint);
  } catch {
    return [];
  }
}

export function saveMint(minted: MintedNFT) {
  if (typeof window === "undefined") return;
  const existing = (() => {
    try {
      const raw = localStorage.getItem(MINT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as MintedNFT[]) : [];
    } catch {
      return [];
    }
  })();
  existing.push(minted);
  localStorage.setItem(MINT_STORAGE_KEY, JSON.stringify(existing));
}

function normalizeMintStatus(data: MintStatus): MintStatus {
  const hasMachine = Boolean(data.candyMachineAddress);
  if (hasMachine && !data.simulated) {
    return { ...data, live: true };
  }
  return data;
}

export async function fetchMintStatus(): Promise<MintStatus | null> {
  const endpoints = ["/api/mint", "/api/claim?mint=status"];
  for (const path of endpoints) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;
      return normalizeMintStatus((await res.json()) as MintStatus);
    } catch {
      continue;
    }
  }
  return null;
}

export async function mintBongaNFT(
  walletAddress: string,
  wallet?: WalletContextState,
  status?: MintStatus | null
): Promise<MintResult> {
  const mintStatus = status ?? (await fetchMintStatus());
  const isLive = mintStatus?.live === true;

  const existing = loadWalletMints(walletAddress);
  if (existing.length >= 3) {
    return { success: false, error: "Max 3 mints per wallet reached" };
  }

  const onChainPrice = mintStatus?.priceSol ?? MINT_CONFIG.priceSol;
  const price = getMintPrice(walletAddress, onChainPrice, { live: isLive });

  if (!isLive) {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));

    const nft = rollRarity();
    const minted: MintedNFT = {
      mint: `preview-${nft.id}-${Date.now().toString(36)}`,
      nft,
      wallet: walletAddress,
      timestamp: Date.now(),
      txSignature: `preview_${Math.random().toString(36).slice(2, 14)}`,
      pricePaid: price,
      simulated: true,
    };

    saveMint(minted);
    return { success: true, minted };
  }

  if (!wallet) {
    return { success: false, error: "Connect your wallet to mint on-chain" };
  }

  const { mintBongaNFTOnChain } = await import("@/lib/nft-mint-onchain");
  const onChain = await mintBongaNFTOnChain(wallet, walletAddress, mintStatus);
  if (!onChain.success) {
    return onChain;
  }

  saveMint(onChain.minted);
  return onChain;
}