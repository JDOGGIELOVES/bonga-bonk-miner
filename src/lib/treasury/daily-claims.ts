import {
  Connection,
  PublicKey,
  type ParsedTransactionWithMeta,
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

function utcDayBounds(date: string) {
  const start = Math.floor(new Date(`${date}T00:00:00.000Z`).getTime() / 1000);
  return { start, end: start + 86_400 };
}

function getSplTransferToAccount(
  tx: ParsedTransactionWithMeta,
  mint: PublicKey,
  recipientAta: PublicKey
): number | null {
  const instructions = tx.transaction.message.instructions;
  const inner = tx.meta?.innerInstructions ?? [];

  const allParsed = [
    ...instructions
      .filter((ix) => "parsed" in ix && ix.program === "spl-token")
      .map((ix) => ("parsed" in ix ? ix.parsed : null)),
    ...inner.flatMap((group) =>
      group.instructions
        .filter((ix) => "parsed" in ix && ix.program === "spl-token")
        .map((ix) => ("parsed" in ix ? ix.parsed : null))
    ),
  ];

  for (const parsed of allParsed) {
    if (!parsed || typeof parsed !== "object") continue;
    const info = (parsed as { info?: Record<string, unknown> }).info;
    if (!info) continue;

    const type = (parsed as { type?: string }).type;
    if (type !== "transfer" && type !== "transferChecked") continue;

    const destination = info.destination as string | undefined;
    if (!destination || destination !== recipientAta.toBase58()) continue;

    if (type === "transferChecked") {
      const mintAddress = info.mint as string | undefined;
      if (mintAddress !== mint.toBase58()) continue;
    }

    const tokenAmount = info.tokenAmount as { uiAmount?: number | null } | undefined;
    if (tokenAmount?.uiAmount != null) return tokenAmount.uiAmount;

    const raw = info.amount as string | undefined;
    if (raw) return Number(raw);
  }

  return null;
}

export async function getTodayClaimedFromTreasury(params: {
  connection: Connection;
  treasury: PublicKey;
  recipientWallet: PublicKey;
  mint: PublicKey;
  date: string;
}): Promise<number> {
  const { connection, treasury, recipientWallet, mint, date } = params;
  const { start, end } = utcDayBounds(date);
  const recipientAta = getAssociatedTokenAddressSync(mint, recipientWallet, false);

  const signatures = await connection.getSignaturesForAddress(treasury, {
    limit: 200,
  });

  const todays = signatures.filter(
    (entry) => entry.blockTime != null && entry.blockTime >= start && entry.blockTime < end
  );

  if (todays.length === 0) return 0;

  const txs = await connection.getParsedTransactions(
    todays.map((s) => s.signature),
    { maxSupportedTransactionVersion: 0 }
  );

  let total = 0;
  for (const tx of txs) {
    if (!tx) continue;
    const amount = getSplTransferToAccount(tx, mint, recipientAta);
    if (amount != null) total += amount;
  }

  return total;
}