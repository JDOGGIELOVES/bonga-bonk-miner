import { PublicKey } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { BONGA_TOKEN_CA } from "@/lib/bonga-token";
import { withRpcRetry } from "@/lib/treasury/rpc";

function decimals(): number {
  const n = Number(process.env.BONGA_TOKEN_DECIMALS || "9");
  return Number.isFinite(n) && n >= 0 ? n : 9;
}

/** On-chain $BONGA balance (UI amount) for a wallet. */
export async function getWalletBongaBalance(wallet: string): Promise<number> {
  const owner = new PublicKey(wallet.trim());
  const mint = new PublicKey(BONGA_TOKEN_CA);
  const ata = getAssociatedTokenAddressSync(mint, owner, false);
  try {
    return await withRpcRetry(async (connection) => {
      const account = await getAccount(connection, ata, "confirmed");
      return Number(account.amount) / 10 ** decimals();
    });
  } catch (err) {
    if (err instanceof TokenAccountNotFoundError) return 0;
    // Some RPC wrappers wrap TokenAccountNotFoundError
    const msg = err instanceof Error ? err.message : String(err);
    if (/could not find account|TokenAccountNotFound|Invalid param/i.test(msg)) {
      return 0;
    }
    throw err;
  }
}
