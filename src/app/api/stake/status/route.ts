import { NextResponse } from "next/server";
import { checkWalletIsBongaNftHolder } from "@/lib/nft-holder-server";
import { getStakeStatusForWallet } from "@/lib/stake-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet")?.trim();

  if (!wallet) {
    return NextResponse.json({ error: "wallet required" }, { status: 400 });
  }

  try {
    // Re-verify current holdings server-side for safety
    const isHolder = await checkWalletIsBongaNftHolder(wallet);
    // The holder server fn only returns bool; we need count. Re-implement lightweight count.
    // For simplicity fall back to a second fetch pattern or accept approximate.
    // Since holder-server is minimal, we'll call our own logic via a quick importable or approximate with 0-3.
    // Better: duplicate minimal count logic here (or export enhanced fn later).
    // For now, use a direct on-chain count fetch inline (kept small).

    const { Connection, PublicKey } = await import("@solana/web3.js");
    const bs58 = (await import("bs58")).default;
    const { getCollectionAddress } = await import("@/lib/mint-config");

    const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const METADATA_PROGRAM = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    function getRpcUrl() {
      return (
        process.env.SOLANA_RPC_URL ||
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com"
      );
    }

    let heldCount = 0;
    try {
      const owner = new PublicKey(wallet);
      const connection = new Connection(getRpcUrl(), "confirmed");
      const collection = getCollectionAddress();
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM });

      const nftMints: string[] = [];
      for (const { account } of tokenAccounts.value) {
        const info = account.data.parsed?.info;
        const amount = Number(info?.tokenAmount?.amount ?? 0);
        const decimals = Number(info?.tokenAmount?.decimals ?? 0);
        if (amount >= 1 && decimals === 0 && info?.mint) nftMints.push(info.mint as string);
      }

      if (nftMints.length > 0) {
        const collectionBytes = bs58.decode(collection);
        let matches = 0;
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
            const slice = data.subarray(0, Math.min(data.length, 500)).toString("utf8");
            if (hasCollectionKey || slice.toLowerCase().includes("bonga")) matches += 1;
          } catch {
            /* continue */
          }
        }
        heldCount = matches; // conservative verified count
      }
    } catch {
      heldCount = 0;
    }

    const status = await getStakeStatusForWallet(wallet, heldCount);

    return NextResponse.json({
      ok: true,
      heldCount,
      isHolder: heldCount > 0,
      stakedCount: status.record?.stakedCount ?? 0,
      stakedAt: status.record?.stakedAt ?? null,
      lastClaimedAt: status.record?.lastClaimedAt ?? null,
      pendingBonga: status.pendingBonga,
      dailyRate: status.dailyRate,
      canClaim: status.canClaim,
      ratePerNft: 75,
      minClaim: 10,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "stake status failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
