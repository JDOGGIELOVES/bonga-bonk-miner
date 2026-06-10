import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getCollectionAddress } from "@/lib/mint-config";

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