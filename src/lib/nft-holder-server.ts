import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getCollectionAddress } from "@/lib/mint-config";
import type { RarityTier } from "@/lib/nft-collection";

const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const METADATA_PROGRAM = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

function getRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL ||
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://api.mainnet-beta.solana.com"
  );
}

/** Server-side Bonga NFT holder check (used for garden earn multipliers). */
export async function checkWalletIsBongaNftHolder(wallet: string): Promise<boolean> {
  try {
    const owner = new PublicKey(wallet.trim());
    const connection = new Connection(getRpcUrl(), "confirmed");
    const collection = getCollectionAddress();

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM,
    });

    const nftMints: string[] = [];
    for (const { account } of tokenAccounts.value) {
      const info = account.data.parsed?.info;
      const amount = Number(info?.tokenAmount?.amount ?? 0);
      const decimals = Number(info?.tokenAmount?.decimals ?? 0);
      if (amount >= 1 && decimals === 0 && info?.mint) {
        nftMints.push(info.mint as string);
      }
    }

    if (nftMints.length === 0) return false;

    const collectionBytes = bs58.decode(collection);
    for (const mint of nftMints.slice(0, 12)) {
      try {
        const mintKey = new PublicKey(mint);
        const [metadataPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("metadata"), METADATA_PROGRAM.toBuffer(), mintKey.toBuffer()],
          METADATA_PROGRAM
        );
        const accountInfo = await connection.getAccountInfo(metadataPda);
        if (!accountInfo?.data) continue;
        const data = accountInfo.data;
        const hasCollectionKey = data.includes(Buffer.from(collectionBytes));
        const collectionSlice = data.subarray(0, Math.min(data.length, 500)).toString("utf8");
        if (hasCollectionKey || collectionSlice.toLowerCase().includes("bonga")) {
          return true;
        }
      } catch {
        continue;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function findUriInMetadata(data: Buffer): string | null {
  try {
    const text = data.toString("utf8");
    // Common locations for uri in Metaplex metadata accounts
    const match = text.match(/(https?:\/\/[^\x00-\x20"\\]{10,}[^\x00-\x20"\\])|(ar:\/\/[^\x00-\x20"\\]{5,}[^\x00-\x20"\\])/);
    if (match && match[0]) {
      let uri = match[0].split("\u0000")[0].trim();
      // basic cleanup
      if (uri.includes(" ")) uri = uri.split(" ")[0];
      if (uri.length > 15) return uri;
    }
  } catch {}
  return null;
}

/** Returns list of owned Bonga NFTs with their on-chain Rarity tier (from metadata JSON). */
export async function getWalletBongaNftsWithRarity(wallet: string): Promise<Array<{ mint: string; rarity: RarityTier }>> {
  const holdings: Array<{ mint: string; rarity: RarityTier }> = [];
  try {
    const owner = new PublicKey(wallet.trim());
    const connection = new Connection(getRpcUrl(), "confirmed");
    const collection = getCollectionAddress();

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM,
    });

    const nftMints: string[] = [];
    for (const { account } of tokenAccounts.value) {
      const info = account.data.parsed?.info;
      const amount = Number(info?.tokenAmount?.amount ?? 0);
      const decimals = Number(info?.tokenAmount?.decimals ?? 0);
      if (amount >= 1 && decimals === 0 && info?.mint) {
        nftMints.push(info.mint as string);
      }
    }

    if (nftMints.length === 0) return holdings;

    const collectionBytes = bs58.decode(collection);
    for (const mint of nftMints.slice(0, 20)) {
      try {
        const mintKey = new PublicKey(mint);
        const [metadataPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("metadata"), METADATA_PROGRAM.toBuffer(), mintKey.toBuffer()],
          METADATA_PROGRAM
        );
        const accountInfo = await connection.getAccountInfo(metadataPda);
        if (!accountInfo?.data) continue;

        const data = accountInfo.data;
        const hasCollectionKey = data.includes(Buffer.from(collectionBytes));
        const collectionSlice = data.subarray(0, Math.min(data.length, 600)).toString("utf8").toLowerCase();
        if (!(hasCollectionKey || collectionSlice.includes("bonga"))) continue;

        // Try to get off-chain metadata for Rarity attribute
        const uri = findUriInMetadata(data);
        if (uri) {
          try {
            const ctrl = new AbortController();
            const timeout = setTimeout(() => ctrl.abort(), 4500);
            const res = await fetch(uri, { signal: ctrl.signal });
            clearTimeout(timeout);
            if (res.ok) {
              const meta: any = await res.json();
              const attrs: any[] = meta?.attributes || meta?.traits || [];
              const rarityAttr = attrs.find((a: any) => {
                const t = String(a?.trait_type || a?.traitType || a?.name || "").toLowerCase();
                return t === "rarity";
              });
              if (rarityAttr) {
                const val = String(rarityAttr.value || rarityAttr.trait_value || "").trim();
                if (val === "Common" || val === "Rare" || val === "Legendary" || val === "Cosmic Bonga") {
                  holdings.push({ mint, rarity: val as RarityTier });
                  continue;
                }
              }
            }
          } catch {
            // fallback below
          }
        }
        // Fallback: if we couldn't get JSON, we still know it's a Bonga but without tier for now
      } catch {
        continue;
      }
    }
  } catch {
    // return what we have
  }
  return holdings;
}

/** Convenience: total count of verified Bonga NFTs. */
export async function getWalletBongaNftCount(wallet: string): Promise<number> {
  const list = await getWalletBongaNftsWithRarity(wallet);
  return list.length;
}