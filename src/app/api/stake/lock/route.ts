import { NextResponse } from "next/server";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { checkWalletIsBongaNftHolder } from "@/lib/nft-holder-server";
import { verifyStakeLockSignature } from "@/lib/treasury/messages";
import { isWalletBlocked } from "@/lib/claim-tally-store";
import { setStakedCount } from "@/lib/stake-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      wallet?: string;
      count?: number;
      at?: string;
      signature?: string;
      signedMessage?: string;
    };

    const wallet = body.wallet?.trim();
    const count = Math.floor(Number(body.count));
    const at = body.at?.trim();
    const signatureB58 = body.signature?.trim();

    if (!wallet || !signatureB58 || !Number.isFinite(count) || count <= 0 || !at) {
      return NextResponse.json({ error: "Invalid stake lock request." }, { status: 400 });
    }

    // Block check
    const blockCheck = await isWalletBlocked(wallet);
    if (blockCheck.blocked) {
      const until = blockCheck.until ? new Date(blockCheck.until).toLocaleString() : "soon";
      return NextResponse.json(
        { error: `This wallet is temporarily blocked. Blocked until ${until}.` },
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
        return NextResponse.json({ error: "Invalid signed message." }, { status: 400 });
      }
    }

    const valid = verifyStakeLockSignature({
      wallet,
      count,
      at,
      signature,
      signedMessage,
    });
    if (!valid) {
      return NextResponse.json({ error: "Wallet signature verification failed." }, { status: 401 });
    }

    // Re-verify they actually hold at least this many right now
    // We use the lightweight server check (bool) + a quick count via same logic path.
    // For precision we do an on-chain count here too.
    const { Connection } = await import("@solana/web3.js");
    const bs58mod = (await import("bs58")).default;
    const { getCollectionAddress } = await import("@/lib/mint-config");

    const TOKEN_PROGRAM = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    const METADATA_PROGRAM = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

    function getRpcUrl() {
      return process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    }

    let heldVerified = 0;
    try {
      const owner = new PublicKey(wallet);
      const connection = new Connection(getRpcUrl(), "confirmed");
      const collection = getCollectionAddress();
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM });

      const nftMints: string[] = [];
      for (const { account } of tokenAccounts.value) {
        const info = account.data.parsed?.info;
        const amt = Number(info?.tokenAmount?.amount ?? 0);
        const dec = Number(info?.tokenAmount?.decimals ?? 0);
        if (amt >= 1 && dec === 0 && info?.mint) nftMints.push(info.mint as string);
      }

      if (nftMints.length > 0) {
        const collBytes = bs58mod.decode(collection);
        for (const mint of nftMints.slice(0, 12)) {
          try {
            const mk = new PublicKey(mint);
            const [pda] = PublicKey.findProgramAddressSync(
              [Buffer.from("metadata"), METADATA_PROGRAM.toBuffer(), mk.toBuffer()],
              METADATA_PROGRAM
            );
            const ai = await connection.getAccountInfo(pda);
            if (!ai?.data) continue;
            const d = ai.data;
            if (d.includes(Buffer.from(collBytes)) || d.subarray(0, 500).toString("utf8").toLowerCase().includes("bonga")) {
              heldVerified += 1;
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      heldVerified = 0;
    }

    if (heldVerified < count) {
      return NextResponse.json(
        { error: `You currently hold only ${heldVerified} verified Bonga NFT(s). Cannot stake ${count}.` },
        { status: 400 }
      );
    }

    const updated = await setStakedCount(wallet, count, heldVerified);

    return NextResponse.json({
      ok: true,
      stakedCount: updated?.stakedCount ?? count,
      stakedAt: updated?.stakedAt,
      heldVerified,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stake lock failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
