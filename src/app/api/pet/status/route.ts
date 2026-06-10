import { NextResponse } from "next/server";
import { isPetLoveClaimsPaused, PET_LOVE_REWARD } from "@/lib/pet-love";
import {
  getSubmissionForWalletToday,
  hasClaimedPetRewardToday,
  toPublicGalleryItem,
} from "@/lib/pet-love-store";
import { getTreasuryConfig } from "@/lib/treasury/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet")?.trim();
  if (!wallet) {
    return NextResponse.json({ error: "Wallet required." }, { status: 400 });
  }

  try {
    const submission = await getSubmissionForWalletToday(wallet);
    const claimedToday = await hasClaimedPetRewardToday(wallet);
    const treasury = getTreasuryConfig();

    const claimsPaused = isPetLoveClaimsPaused();

    return NextResponse.json({
      submittedToday: submission != null,
      claimedToday,
      submission: submission ? toPublicGalleryItem(submission) : null,
      reward: PET_LOVE_REWARD,
      treasuryEnabled: treasury?.enabled === true && !claimsPaused,
      claimsPaused,
      dailyOnChainLimit: treasury?.dailyLimit,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}