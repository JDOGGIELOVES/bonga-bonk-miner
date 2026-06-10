import { NextResponse } from "next/server";
import { isPetLoveClaimsPaused, PET_LOVE_REWARD, todayKey } from "@/lib/pet-love";
import {
  getPetDailyClaimCapStatus,
  getSubmissionForWalletToday,
  hasClaimedPetRewardToday,
  toPublicGalleryItem,
} from "@/lib/pet-love-store";
import { getIpPetStatus } from "@/lib/claim-ip-store";
import { getTreasuryConfig } from "@/lib/treasury/config";
import { getClientIpKey } from "@/lib/request-ip";

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
    const ipKey = getClientIpKey(request);
    const ipLimits = ipKey ? await getIpPetStatus(ipKey, todayKey()) : null;
    const globalClaimCap = await getPetDailyClaimCapStatus(todayKey());

    return NextResponse.json({
      submittedToday: submission != null,
      claimedToday,
      submission: submission ? toPublicGalleryItem(submission) : null,
      reward: PET_LOVE_REWARD,
      treasuryEnabled: treasury?.enabled === true && !claimsPaused,
      claimsPaused,
      dailyOnChainLimit: treasury?.dailyLimit,
      ipLimits: ipLimits
        ? {
            submissionsToday: ipLimits.submissionsToday,
            claimsToday: ipLimits.claimsToday,
            maxSubmissions: ipLimits.maxSubmissions,
            maxClaims: ipLimits.maxClaims,
            submissionCapReached:
              ipLimits.submissionsToday >= ipLimits.maxSubmissions,
            claimCapReached: ipLimits.claimsToday >= ipLimits.maxClaims,
          }
        : null,
      globalClaimCap: globalClaimCap.enabled
        ? {
            claimsToday: globalClaimCap.claimsToday,
            maxClaims: globalClaimCap.maxClaims,
            capReached: globalClaimCap.capReached,
          }
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status unavailable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}