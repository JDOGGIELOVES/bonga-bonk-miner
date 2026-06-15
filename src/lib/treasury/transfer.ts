import { Keypair, PublicKey, Transaction, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { TreasuryConfig } from "@/lib/treasury/config";
import { withRpcRetry } from "@/lib/treasury/rpc";
import {
  treasuryPayoutsAllowed,
  treasuryPayoutsBlockedReason,
  triggerAutoPause,
} from "@/lib/treasury/payout-guard";

// ====================== TREASURY PROTECTION (central audited path) ======================
// This is the SINGLE function through which ALL on-chain treasury $BONGA spends must go.
// It ALWAYS runs: env guards (in caller), safety allow-list, pre-sign simulation,
// recipient ATA existence (pre-created, never paid by treasury), and post-build checks.

const TREASURY_MIN_RECIPIENT_SOL = 0.001; // tiny dust filter; real ATA rent is ~0.002, so this catches pure-empty new wallets used in mass-spam

/** Strict allow-list + safety inspector. Rejects anything except a single exact transferChecked from treasury ATA. */
function checkTxSafety(
  tx: Transaction,
  treasuryPubkey: PublicKey,
  expectedTreasuryAta: PublicKey,
  expectedRecipientAta: PublicKey,
  mint: PublicKey,
  decimals: number
): { shouldBlock: boolean; messages: string[] } {
  const messages: string[] = [];

  try {
    if (tx.instructions.length !== 1) {
      return {
        shouldBlock: true,
        messages: ["BLOCKED: Treasury tx must contain exactly one instruction (transferChecked)."],
      };
    }

    const ix: TransactionInstruction = tx.instructions[0];

    // Must target the SPL Token program (or TOKEN_2022 in future if we migrate — currently TOKEN_PROGRAM_ID)
    if (!ix.programId.equals(TOKEN_PROGRAM_ID)) {
      messages.push(`BLOCKED: Instruction targets unexpected program ${ix.programId.toBase58()}. Only SPL Token transfers allowed.`);
      return { shouldBlock: true, messages };
    }

    // Must be a transferChecked (discriminator 12 for transferChecked per spl-token layout)
    // We also validate the accounts and data shape below.
    const data = ix.data;
    if (!data || data.length < 9 || data[0] !== 12) {
      messages.push("BLOCKED: Instruction is not a transferChecked (discriminator 12).");
      return { shouldBlock: true, messages };
    }

    // Account layout for transferChecked: [source, mint, destination, owner, ...]
    const keys = ix.keys;
    if (keys.length < 4) {
      messages.push("BLOCKED: transferChecked requires at least 4 accounts.");
      return { shouldBlock: true, messages };
    }

    const src = keys[0].pubkey;
    const mintAcc = keys[1].pubkey;
    const dst = keys[2].pubkey;
    const owner = keys[3].pubkey;

    if (!src.equals(expectedTreasuryAta)) {
      messages.push(`BLOCKED: Source ATA ${src.toBase58()} != treasury ATA ${expectedTreasuryAta.toBase58()}.`);
      return { shouldBlock: true, messages };
    }
    if (!mintAcc.equals(mint)) {
      messages.push("BLOCKED: Mint in instruction does not match configured BONGA mint.");
      return { shouldBlock: true, messages };
    }
    if (!dst.equals(expectedRecipientAta)) {
      messages.push(`BLOCKED: Destination ATA ${dst.toBase58()} != expected recipient ATA.`);
      return { shouldBlock: true, messages };
    }
    if (!owner.equals(treasuryPubkey)) {
      messages.push("BLOCKED: Owner/signer of transfer must be the treasury keypair.");
      return { shouldBlock: true, messages };
    }

    // Reject any SystemProgram create or ATA creation anywhere (defense in depth)
    for (const instruction of tx.instructions) {
      if (instruction.programId.equals(SystemProgram.programId)) {
        const d = instruction.data;
        if (d && d.length > 0 && d[0] === 0) {
          messages.push("BLOCKED: SystemProgram createAccount detected (rent drain vector).");
          return { shouldBlock: true, messages };
        }
      }
      if (instruction.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)) {
        if (instruction.keys.length > 0 && instruction.keys[0].pubkey.equals(treasuryPubkey)) {
          messages.push("BLOCKED: ATA creation instruction with treasury as payer detected.");
          return { shouldBlock: true, messages };
        }
      }
    }

    // Amount validation is done at rawAmount construction time; here we trust the ix data for shape.
    messages.push("✅ Transaction passed strict treasury allow-list and safety checks.");
    return { shouldBlock: false, messages };
  } catch (e) {
    return {
      shouldBlock: true,
      messages: ["Error during strict treasury instruction allow-list check. Blocked for safety."],
    };
  }
}

/** Run full pre-sign simulation + the allow-list/safety checks. Must be called after blockhash + feePayer set, before sign. */
async function simulateAndCheckSafety(params: {
  connection: import("@solana/web3.js").Connection;
  tx: Transaction;
  treasuryPubkey: PublicKey;
  treasuryAta: PublicKey;
  recipientAta: PublicKey;
  mint: PublicKey;
  decimals: number;
}): Promise<{ ok: boolean; messages: string[] }> {
  const { connection, tx, treasuryPubkey, treasuryAta, recipientAta, mint, decimals } = params;

  // 1. Static allow-list + safety (no network)
  const safety = checkTxSafety(tx, treasuryPubkey, treasuryAta, recipientAta, mint, decimals);
  if (safety.shouldBlock) {
    return { ok: false, messages: safety.messages };
  }

  // 2. Pre-sign simulation (catches invalid state, insufficient funds, program errors, etc. before we broadcast + burn sig)
  try {
    // Legacy Transaction path: simple call is widely compatible. sigVerify false not needed pre-sign.
    const sim = await connection.simulateTransaction(tx);
    if (sim.value.err) {
      const errStr = typeof sim.value.err === "string" ? sim.value.err : JSON.stringify(sim.value.err);
      const logs = (sim.value.logs || []).join(" | ");
      return {
        ok: false,
        messages: [
          `BLOCKED: Pre-sign simulation failed: ${errStr}`,
          logs ? `Simulation logs: ${logs}` : "",
          "Treasury will not sign or broadcast transactions that do not simulate cleanly.",
        ].filter(Boolean),
      };
    }
  } catch (simErr) {
    return {
      ok: false,
      messages: [
        "BLOCKED: Pre-sign simulation threw. " + (simErr instanceof Error ? simErr.message : String(simErr)),
      ],
    };
  }

  return { ok: true, messages: safety.messages };
}
// ================================================================

export async function transferBongaFromTreasury(params: {
  config: TreasuryConfig;
  recipientWallet: PublicKey;
  amount: number;
}): Promise<{ signature: string }> {
  if (!treasuryPayoutsAllowed()) {
    throw new Error(treasuryPayoutsBlockedReason());
  }

  const { config, recipientWallet, amount } = params;
  const treasury = Keypair.fromSecretKey(config.treasuryPrivateKey);

  if (!treasury.publicKey.equals(config.treasuryPublicKey)) {
    throw new Error("Treasury private key does not match public key");
  }

  const rawAmount = BigInt(Math.round(amount * 10 ** config.tokenDecimals));
  if (rawAmount <= BigInt(0)) {
    throw new Error("Claim amount must be greater than zero");
  }

  const treasuryAta = getAssociatedTokenAddressSync(
    config.mint,
    treasury.publicKey,
    false
  );
  const recipientAta = getAssociatedTokenAddressSync(
    config.mint,
    recipientWallet,
    false
  );

  return withRpcRetry(async (connection) => {
    // 1. Strict ATA requirement: recipient MUST have pre-created their own ATA.
    // Treasury never pays rent or creation. This was the root cause of the mass 0.13 SOL drain attack.
    try {
      await getAccount(connection, recipientAta);
    } catch (err) {
      if (err instanceof TokenAccountNotFoundError) {
        throw new Error(
          "Recipient $BONGA token account (ATA) does not exist. " +
            "Please create it first from your own wallet (small one-time SOL rent cost ~0.002 SOL). " +
            "The treasury will NEVER pay to create or initialize accounts on behalf of recipients."
        );
      } else {
        throw err;
      }
    }

    // 2. Optional light min-balance on recipient to deter pure brand-new wallets used for tiny-claim spam.
    // (We already require the ATA which costs rent, but this adds a second cheap signal.)
    try {
      const solBal = await connection.getBalance(recipientWallet);
      if (solBal < TREASURY_MIN_RECIPIENT_SOL * 1_000_000_000) {
        // still allow if they have the ATA (they paid rent already); only log/warn for now.
        // If you want hard block, throw here. Keeping soft to avoid punishing real low-balance users who created ATA.
        console.warn("[TREASURY] Recipient has very low SOL balance", recipientWallet.toBase58(), solBal / 1e9);
      }
    } catch {
      // non-fatal
    }

    const tx = new Transaction();
    tx.add(
      createTransferCheckedInstruction(
        treasuryAta,
        config.mint,
        recipientAta,
        treasury.publicKey,
        rawAmount,
        config.tokenDecimals
      )
    );

    // 3. Set blockhash + feePayer BEFORE simulation/safety (required for realistic sim)
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = treasury.publicKey;

    // 4. CENTRAL AUDITED GATE: always run strict allow-list + pre-sign simulation here.
    // No other code path in the app is allowed to construct & sign treasury SPL transfers.
    const gate = await simulateAndCheckSafety({
      connection,
      tx,
      treasuryPubkey: treasury.publicKey,
      treasuryAta,
      recipientAta,
      mint: config.mint,
      decimals: config.tokenDecimals,
    });

    if (!gate.ok) {
      console.error("[TREASURY SAFETY BLOCK]", gate.messages);
      // On certain classes of safety failure we can auto-pause to stop an ongoing attack wave.
      // The allow-list + sim already block the tx; anomaly detectors in tally can also call triggerAutoPause.
      throw new Error("TREASURY SAFETY: " + gate.messages.join(" "));
    }

    tx.sign(treasury);

    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 2,
    });

    const confirmation = await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed"
    );

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    return { signature };
  });
}

export async function getTreasuryBalances(config: TreasuryConfig) {
  const treasuryAta = getAssociatedTokenAddressSync(
    config.mint,
    config.treasuryPublicKey,
    false
  );

  return withRpcRetry(async (connection) => {
    const solBalance = await connection.getBalance(config.treasuryPublicKey);

    let tokenBalance = 0;
    try {
      const account = await getAccount(connection, treasuryAta);
      tokenBalance = Number(account.amount) / 10 ** config.tokenDecimals;
    } catch {
      tokenBalance = 0;
    }

    return {
      sol: solBalance / 1_000_000_000,
      bonga: tokenBalance,
      tokenAccount: treasuryAta.toBase58(),
    };
  });
}