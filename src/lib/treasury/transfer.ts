import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  getAccount,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import type { TreasuryConfig } from "@/lib/treasury/config";
import { withRpcRetry } from "@/lib/treasury/rpc";
import {
  treasuryPayoutsAllowed,
  treasuryPayoutsBlockedReason,
} from "@/lib/treasury/payout-guard";

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
    const tx = new Transaction();

    try {
      await getAccount(connection, recipientAta);
    } catch (err) {
      if (err instanceof TokenAccountNotFoundError) {
        tx.add(
          createAssociatedTokenAccountInstruction(
            treasury.publicKey,
            recipientAta,
            recipientWallet,
            config.mint
          )
        );
      } else {
        throw err;
      }
    }

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

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = treasury.publicKey;
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