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

/** Associated token account address for $BONGA owned by `wallet`. */
export function getWalletBongaAta(wallet: string): PublicKey {
  const owner = new PublicKey(wallet.trim());
  const mint = new PublicKey(BONGA_TOKEN_CA);
  return getAssociatedTokenAddressSync(mint, owner, false);
}

/**
 * True if the wallet already has a $BONGA ATA.
 * Treasury withdrawals require this — the treasury never creates ATAs for recipients.
 */
export async function walletHasBongaAta(wallet: string): Promise<boolean> {
  const ata = getWalletBongaAta(wallet);
  try {
    await withRpcRetry(async (connection) => {
      await getAccount(connection, ata, "confirmed");
    });
    return true;
  } catch (err) {
    if (err instanceof TokenAccountNotFoundError) return false;
    const msg = err instanceof Error ? err.message : String(err);
    if (/could not find account|TokenAccountNotFound|Invalid param/i.test(msg)) {
      return false;
    }
    // Unknown RPC errors: don't block UI — treat as unknown/false-safe for preflight warnings only
    console.warn("[bonga-balance] ATA check failed", wallet, msg);
    return false;
  }
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

export const MISSING_BONGA_ATA_MESSAGE =
  "Your wallet has no $BONGA token account yet. Open Phantom → receive a tiny bit of $BONGA (or swap any amount to $BONGA on Jupiter) once — that creates the account (~0.002 SOL rent). Then withdraw again. The treasury will never create this account for you.";
