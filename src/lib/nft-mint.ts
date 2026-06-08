import { BONGA_NFTS, type BongaNFT } from "@/lib/nft-collection";
import { getWhitelistStatus } from "@/lib/bonga-whitelist";

export const MINT_STORAGE_KEY = "bonga-nft-mints";

export const MINT_CONFIG = {
  priceSol: parseFloat(process.env.NEXT_PUBLIC_MINT_PRICE_SOL || "0.08"),
  candyMachineAddress:
    process.env.NEXT_PUBLIC_CANDY_MACHINE_ADDRESS || "",
  collectionAddress:
    process.env.NEXT_PUBLIC_COLLECTION_ADDRESS || "",
  simulated: process.env.NEXT_PUBLIC_MINT_SIMULATED !== "false",
};

export interface MintedNFT {
  mint: string;
  nft: BongaNFT;
  wallet: string;
  timestamp: number;
  txSignature: string;
  pricePaid: number;
}

export interface MintResult {
  success: boolean;
  minted?: MintedNFT;
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

export function getMintPrice(walletAddress?: string): number {
  const wl = getWhitelistStatus(walletAddress);
  if (wl.tier === "free") return 0;
  if (wl.tier === "discount") {
    return MINT_CONFIG.priceSol * (1 - wl.discountPercent / 100);
  }
  return MINT_CONFIG.priceSol;
}

export function loadWalletMints(wallet: string): MintedNFT[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(MINT_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as MintedNFT[];
    return all.filter((m) => m.wallet === wallet);
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

export function getTotalMinted(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(MINT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MintedNFT[]).length : 0;
  } catch {
    return 0;
  }
}

/**
 * Simulated mint — replace with Metaplex Candy Machine v3 / UMI when contract is live.
 *
 * Real mint pseudocode:
 * ```
 * import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
 * import { mplCandyMachine } from '@metaplex-foundation/mpl-candy-machine'
 * const umi = createUmi(rpc).use(mplCandyMachine())
 * await mintV2(umi, { candyMachine, minter: wallet }).sendAndConfirm(umi)
 * ```
 */
export async function mintBongaNFT(
  walletAddress: string
): Promise<MintResult> {
  const existing = loadWalletMints(walletAddress);
  if (existing.length >= 3) {
    return { success: false, error: "Max 3 mints per wallet reached" };
  }

  const price = getMintPrice(walletAddress);

  if (MINT_CONFIG.simulated) {
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 1000));

    const nft = rollRarity();
    const minted: MintedNFT = {
      mint: `Bonga${nft.id}-${Date.now().toString(36)}`,
      nft,
      wallet: walletAddress,
      timestamp: Date.now(),
      txSignature: `sim_${Math.random().toString(36).slice(2, 14)}`,
      pricePaid: price,
    };

    saveMint(minted);
    return { success: true, minted };
  }

  if (!MINT_CONFIG.candyMachineAddress) {
    return {
      success: false,
      error: "Candy Machine not configured. Set NEXT_PUBLIC_CANDY_MACHINE_ADDRESS",
    };
  }

  return {
    success: false,
    error: "On-chain minting not yet enabled. Set NEXT_PUBLIC_MINT_SIMULATED=true",
  };
}