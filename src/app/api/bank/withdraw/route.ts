import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { treasuryPayoutsBlockedReason } from "@/lib/treasury/payout-guard";
import { verifyBankWithdrawSignature } from "@/lib/treasury/messages";
import { consumeNonceIfFresh } from "@/lib/treasury/daily-claims";
import { transferBongaFromTreasury, getTreasuryBalances } from "@/lib/treasury/transfer";
import { withdrawFromBank, getBankMinWithdraw } from "@/lib/bonga-bank";
import { recordGlobalClaim, isWalletBlocked } from "@/lib/claim-tally-store";
import { withWalletClaimLock } from "@/lib/claim-lock";
import { isRpcRateLimitError } from "@/lib/treasury/rpc";
import { getClientIp } from "@/lib/request-ip";
import { assertIpCanClaim, recordIpClaim, ipStorageKey } from "@/lib/claim-ip-store";
import { walletMaxOnChainBongaPerDay } from "@/lib/wallet-daily-cap";
import { getTodayClaimedFromTreasury } from "@/lib/treasury/daily-claims";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function rpcRateLimitMessage() {
  return "Solana RPC rate limit hit. Add a dedicated RPC (Helius/QuickNode) to SOLANA_RPC_URL.";
}

export async function POST(request: Request) {
  try {
    const config = getTreasuryConfig();
    if (!config) {
      return NextResponse.json({ error: treasuryPayoutsBlockedReason() }, { status: 503 });
    }

    const body = (await request.json()) as {
      wallet?: string;
      amount?: number;
      date?: string;
      nonce?: string;
      expiresAt?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = (body.wallet || "").trim();
    const amount = Number(body.amount);
    const date = (body.date || todayKey()).trim();
    const nonce = (body.nonce || "").trim();
    const expiresAt = (body.expiresAt || "").trim();
    const sigB58 = (body.signature || "").trim();

    if (!wallet || !sigB58 || !Number.isFinite(amount) || !nonce) {
      return NextResponse.json({ error: "Invalid bank withdraw request (wallet, amount, nonce, signature required)." }, { status: 400 });
    }

    const min = getBankMinWithdraw();
    if (amount < min) {
      return NextResponse.json({ error: `Minimum Bonga Bank withdrawal is ${min.toLocaleString()} $BONGA.` }, { status: 400 });
    }

    if (date !== todayKey()) {
      return NextResponse.json({ error: "Bank withdrawals are only valid for today (UTC)." }, { status: 400 });
    }

    // Basic expiration window (if client supplied one)
    if (expiresAt) {
      const exp = Date.parse(expiresAt);
      const now = Date.now();
      if (!isFinite(exp) || exp < now - 5 * 60 * 1000 || exp > now + 48 * 60 * 60 * 1000) {
        return NextResponse.json({ error: "Message expired." }, { status: 400 });
      }
    }

    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      return NextResponse.json(
        { error: `Wallet temporarily blocked. ${blockCheck.reason || ""}` },
        { status: 403 }
      );
    }

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet." }, { status: 400 });
    }

    const signature = bs58.decode(sigB58);
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Bad signedMessage." }, { status: 400 });
      }
    }

    const valid = verifyBankWithdrawSignature({
      wallet,
      amount,
      date,
      nonce,
      expiresAt: expiresAt || undefined,
      signature,
      signedMessage,
    });
    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    const clientIp = getClientIp(request);
    const ipKey = clientIp ? ipStorageKey(clientIp) : undefined;

    const result = await withWalletClaimLock(wallet, `bank-withdraw-${date}`, async () => {
      // Re-check bank balance under lock
      const { getBongaBank } = await import("@/lib/bonga-bank");
      const currentBank = await getBongaBank(wallet);
      if (amount > currentBank.bankedBonga) {
        throw new Error("Requested amount exceeds current Bonga Bank balance.");
      }

      // Replay protection for the bank withdraw action
      const nonceCheck = await consumeNonceIfFresh(wallet, "bank", date, nonce);
      if (!nonceCheck.ok) {
        throw new Error(nonceCheck.reason);
      }

      // Daily on-chain wallet cap still applies (across all sources)
      const alreadyOnChain = await getTodayClaimedFromTreasury({
        treasury: config.treasuryPublicKey,
        recipientWallet: recipient,
        mint: config.mint,
        date,
      });
      const walletCap = walletMaxOnChainBongaPerDay();
      const remainingDaily = Math.max(0, walletCap - alreadyOnChain);
      if (remainingDaily <= 0) {
        throw new Error(
          `Daily on-chain limit reached (${walletCap.toLocaleString()} $BONGA/day). Come back tomorrow UTC.`,
        );
      }
      if (amount > remainingDaily) {
        throw new Error(
          `Withdraw amount exceeds today's remaining on-chain cap. Withdraw up to ${remainingDaily.toLocaleString()} $BONGA today (vault balance: ${currentBank.bankedBonga.toLocaleString()}).`,
        );
      }

      if (ipKey) {
        const ipCheck = await assertIpCanClaim({
          ipKey,
          wallet,
          amount,
          date,
          kind: "miner", // bank uses the same IP daily limits as the main miner flow for now
        });
        if (!ipCheck.ok) throw new Error(ipCheck.reason);
      }

      // THE ACTUAL TREASURY SPEND — inherits every safety (sim, allow-list, ATA, anomaly auto-pause, etc.)
      const { signature: txSig } = await transferBongaFromTreasury({
        config,
        recipientWallet: recipient,
        amount,
      });

      // Debit the bank (only after successful on-chain)
      const { bank: updatedBank } = await withdrawFromBank(wallet, amount);

      // Tally + IP (for anomaly / velocity)
      try {
        await recordGlobalClaim(amount, "bank", wallet);
      } catch (e) {
        console.error("Failed to record bank withdraw to global tally:", e);
      }
      if (ipKey) {
        await recordIpClaim({ ipKey, wallet, amount, date, kind: "miner" });
      }

      return {
        ok: true,
        signature: txSig,
        amount,
        newBankBalance: updatedBank.bankedBonga,
        explorerUrl: `https://solscan.io/tx/${txSig}`,
      };
    }, "bank-withdraw");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Bank withdraw failed:", error);
    if (isRpcRateLimitError(error)) {
      return NextResponse.json({ error: rpcRateLimitMessage() }, { status: 503 });
    }
    const msg = error instanceof Error ? error.message : "Bank withdraw failed.";
    const status = /blocked|paused|treasury|limit|minimum|exceeds|nonce/i.test(msg) ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
