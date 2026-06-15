import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { treasuryPayoutsBlockedReason } from "@/lib/treasury/payout-guard";
import { withWalletClaimLock } from "@/lib/claim-lock";
import { verifyClaimSignature } from "@/lib/treasury/messages";
import { getTodayClaimedFromTreasury, consumeNonceIfFresh } from "@/lib/treasury/daily-claims";
import { recordGlobalClaim, isWalletBlocked } from "@/lib/claim-tally-store";
import { getBongaBank, getBankMinWithdraw, depositToBank } from "@/lib/bonga-bank";
import { walletMaxOnChainBongaPerDay } from "@/lib/wallet-daily-cap";
import { getTreasuryBalances, transferBongaFromTreasury } from "@/lib/treasury/transfer";
import { isRpcRateLimitError } from "@/lib/treasury/rpc";
import {
  claimableFromRecord,
  getMinerEarnRecord,
  isMinerEarnStorageReady,
  recordMinerClaim,
  rollbackMinerClaim,
} from "@/lib/miner-earn-store";
import { BONGA_CLAIM_BATCH } from "@/lib/miner-game";
import {
  assertIpCanClaim,
  ipStorageKey,
  recordIpClaim,
} from "@/lib/claim-ip-store";
import { getClientIp } from "@/lib/request-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_CACHE_MS = 60_000;
let statusCache: {
  at: number;
  payload: Record<string, unknown>;
} | null = null;

function rpcRateLimitMessage() {
  return "Solana RPC rate limit hit. Add a dedicated RPC URL (Helius/QuickNode) to SOLANA_RPC_URL in Vercel, then redeploy.";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const config = getTreasuryConfig();
    if (!config) {
      return NextResponse.json(
        { error: treasuryPayoutsBlockedReason() },
        { status: 503 }
      );
    }

    if (process.env.CLAIMS_PAUSED === "true") {
      return NextResponse.json(
        { error: "Claims are temporarily paused. Try again shortly." },
        { status: 503 }
      );
    }

    if (!isMinerEarnStorageReady()) {
      return NextResponse.json(
        {
          error:
            "Miner earn tracking is not configured. Connect Vercel Blob before enabling on-chain claims.",
        },
        { status: 503 }
      );
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

    const wallet = body.wallet?.trim();
    const amount = Number(body.amount);
    const date = body.date?.trim() ?? todayKey();
    const nonce = (body.nonce || "").trim();
    const expiresAt = (body.expiresAt || "").trim();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !Number.isFinite(amount) || !nonce) {
      return NextResponse.json({ error: "Invalid claim request (wallet, amount, signature, and nonce required)." }, { status: 400 });
    }

    if (
      amount < BONGA_CLAIM_BATCH ||
      amount % BONGA_CLAIM_BATCH !== 0 ||
      amount > config.dailyLimit ||
      !Number.isInteger(amount)
    ) {
      return NextResponse.json(
        { error: `Amount must be a multiple of ${BONGA_CLAIM_BATCH} (e.g. 10, 20, 30, ...) up to your daily limit of ${config.dailyLimit}.` },
        { status: 400 }
      );
    }

    if (date !== todayKey()) {
      return NextResponse.json({ error: "Claims are only valid for today (UTC)." }, { status: 400 });
    }

    // Basic expiration check (if provided): must be in the future and not wildly in the past/future
    if (expiresAt) {
      const expTs = Date.parse(expiresAt);
      const now = Date.now();
      if (!Number.isFinite(expTs) || expTs < now - 5 * 60 * 1000 || expTs > now + 48 * 60 * 60 * 1000) {
        return NextResponse.json({ error: "Claim message expired or expiration invalid." }, { status: 400 });
      }
    }

    // Auto-block check for flagged wallets (3 days)
    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      const until = blockCheck.until ? new Date(blockCheck.until).toLocaleString() : "soon";
      return NextResponse.json(
        { error: `This wallet is temporarily blocked due to suspicious claiming activity. Blocked until ${until}. Reason: ${blockCheck.reason || "high velocity claims"}` },
        { status: 403 }
      );
    }

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: "Invalid wallet address." }, { status: 400 });
    }

    const signature = bs58.decode(signatureB58);
    let signedMessage: Uint8Array | undefined;
    if (body.signedMessage?.trim()) {
      try {
        signedMessage = bs58.decode(body.signedMessage.trim());
      } catch {
        return NextResponse.json({ error: "Invalid signed message payload." }, { status: 400 });
      }
    }

    const valid = verifyClaimSignature({
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

    try {
      const result = await withWalletClaimLock(wallet, date, async () => {
        const earnRecord = await getMinerEarnRecord(wallet, date);
        const serverClaimable = claimableFromRecord(earnRecord);

        if (ipKey) {
          const ipCheck = await assertIpCanClaim({
            ipKey,
            wallet,
            amount,
            date,
            kind: "miner",
            boundIpKey: earnRecord.ipKey,
          });
          if (!ipCheck.ok) {
            throw new Error(ipCheck.reason);
          }
        }

        if (amount > serverClaimable) {
          throw new Error(
            `You can only claim ${serverClaimable} $BONGA based on verified taps today.`
          );
        }

        const alreadyClaimed = await getTodayClaimedFromTreasury({
          treasury: config.treasuryPublicKey,
          recipientWallet: recipient,
          mint: config.mint,
          date,
        });

        const walletCap = walletMaxOnChainBongaPerDay();
        if (alreadyClaimed + amount > walletCap) {
          throw new Error(
            `Daily on-chain wallet limit reached (${walletCap} $BONGA/day across miner, garden, and pet).`
          );
        }

        const minBank = getBankMinWithdraw();

        await recordMinerClaim(wallet, date, amount);

        if (amount < minBank) {
          // Auto-deposit small claims under the Bonga Bank threshold (no treasury tx cost)
          await depositToBank(wallet, amount, { source: "miner", date });
          if (ipKey) {
            await recordIpClaim({ ipKey, wallet, amount, date, kind: "miner" });
          }
          const updatedBank = await getBongaBank(wallet);
          return {
            ok: true as const,
            depositedToBank: amount,
            amount,
            newBankBalance: updatedBank.bankedBonga,
            message: `Claim of ${amount} auto-deposited to your Bonga Bank. $BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches ${minBank} $BONGA.`,
          };
        }

        // Replay protection for on-chain claims >= threshold
        const nonceCheck = await consumeNonceIfFresh(wallet, "claim", date, nonce);
        if (!nonceCheck.ok) {
          throw new Error(nonceCheck.reason);
        }

        try {
          const { signature: txSignature } = await transferBongaFromTreasury({
            config,
            recipientWallet: recipient,
            amount,
          });

          // Record to lifetime community tally
          // Wrapped to not fail the payout if tally update fails
          try {
            await recordGlobalClaim(amount, 'miner', wallet);
          } catch (e) {
            console.error("Failed to record global miner claim to tally (payout already succeeded):", e);
          }
          if (ipKey) {
            await recordIpClaim({ ipKey, wallet, amount, date, kind: "miner" });
          }

          return {
            ok: true as const,
            signature: txSignature,
            amount,
            explorerUrl: `https://solscan.io/tx/${txSignature}`,
          };
        } catch (transferError) {
          await rollbackMinerClaim(wallet, date, amount);
          throw transferError;
        }
      }, "miner");

      return NextResponse.json(result);
    } catch (lockError) {
      const message =
        lockError instanceof Error ? lockError.message : "Claim failed.";
      const status = message.includes("in progress") ? 429 : 400;
      return NextResponse.json({ error: message }, { status });
    }
  } catch (error) {
    console.error("Claim failed:", error);
    if (isRpcRateLimitError(error)) {
      return NextResponse.json({ error: rpcRateLimitMessage() }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Claim failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("mint") === "status") {
    try {
      const { getMintStatusPayload } = await import("@/lib/mint-status-server");
      return NextResponse.json(await getMintStatusPayload());
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Mint status unavailable.";
      return NextResponse.json(
        { simulated: true, live: false, error: message },
        { status: 502 }
      );
    }
  }

  try {
    const config = getTreasuryConfig();
    if (!config) {
      return NextResponse.json({
        enabled: false,
        hint: "Set ON_CHAIN_CLAIMS_ENABLED=true and treasury env vars in Vercel.",
      });
    }

    const walletParam = url.searchParams.get("wallet")?.trim();
    const now = Date.now();
    if (!walletParam && statusCache && now - statusCache.at < STATUS_CACHE_MS) {
      return NextResponse.json(statusCache.payload);
    }

    let balances;
    try {
      balances = await getTreasuryBalances(config);
    } catch (error) {
      if (isRpcRateLimitError(error)) {
        const errPayload: any = {
          enabled: true,
          treasury: config.treasuryPublicKey.toBase58(),
          mint: config.mint.toBase58(),
          dailyLimit: config.dailyLimit,
          balancesUnavailable: true,
          hint: rpcRateLimitMessage(),
        };
        if (walletParam) {
          try {
            const bank = await getBongaBank(walletParam);
            const min = getBankMinWithdraw();
            errPayload.bank = {
              bankedBonga: bank.bankedBonga,
              minWithdraw: min,
              canWithdraw: bank.bankedBonga >= min,
            };
            errPayload.note = "$BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA.";
          } catch {}
        }
        return NextResponse.json(errPayload);
      }
      throw error;
    }

    const payload: any = {
      enabled: true,
      treasury: config.treasuryPublicKey.toBase58(),
      mint: config.mint.toBase58(),
      dailyLimit: config.dailyLimit,
      balances,
      dailyOnChainWalletCap: walletMaxOnChainBongaPerDay(),
      note: "$BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA (getBankMinWithdraw). All smaller claims auto-deposit to the vault.",
    };

    if (walletParam) {
      try {
        const bank = await getBongaBank(walletParam);
        const min = getBankMinWithdraw();
        payload.bank = {
          bankedBonga: bank.bankedBonga,
          minWithdraw: min,
          canWithdraw: bank.bankedBonga >= min,
          lifetimeBanked: bank.lifetimeBanked || 0,
          lifetimeWithdrawn: bank.lifetimeWithdrawn || 0,
          lastActivity: bank.lastWithdrawAt || bank.lastDepositAt || bank.updatedAt,
        };
      } catch (e) {
        payload.bank = { error: "Unable to load Bonga Bank" };
      }
    }

    if (!walletParam) {
      statusCache = { at: now, payload };
    }

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Treasury status unavailable.";
    return NextResponse.json({ enabled: false, error: message }, { status: 500 });
  }
}