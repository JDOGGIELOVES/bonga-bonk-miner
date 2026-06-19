export interface MinerEarnedStatus {
  wallet: string;
  date: string;
  taps: number;
  earned: number;
  claimed: number;
  claimable: number;
  bankedBonga?: number;
  bankMinWithdraw?: number;
  dailyLimitReached?: boolean;
  nextDailyReset?: string;
  limitMessage?: string | null;
}

export interface MinerTapSuccess {
  ok: true;
  taps: number;
  earned: number;
  dailyLimitReached?: boolean;
  nextDailyReset?: string;
  limitMessage?: string | null;
}

export interface MinerTapError {
  error: string;
  taps?: number;
  earned?: number;
  dailyLimitReached?: boolean;
  nextDailyReset?: string;
  limitMessage?: string | null;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function fetchMinerEarned(wallet: string): Promise<MinerEarnedStatus | null> {
  try {
    const date = todayKey();
    const response = await fetch(
      `/api/miner/earned?wallet=${encodeURIComponent(wallet)}&date=${encodeURIComponent(date)}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    return (await response.json()) as MinerEarnedStatus;
  } catch {
    return null;
  }
}

export async function registerMinerTap(params: {
  wallet: string;
  tapIndex: number;
  signature?: string;
  signedMessage?: string;
}): Promise<MinerTapSuccess | MinerTapError> {
  const response = await fetch("/api/miner/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: params.wallet,
      date: todayKey(),
      tapIndex: params.tapIndex,
      signature: params.signature,
      signedMessage: params.signedMessage,
    }),
  });

  const data = (await response.json()) as MinerTapSuccess | MinerTapError;
  if (!response.ok) {
    const errData = data as any;
    return {
      error: "error" in errData ? errData.error : "Tap registration failed.",
      taps: "taps" in errData ? errData.taps : undefined,
      earned: "earned" in errData ? errData.earned : undefined,
      dailyLimitReached: errData.dailyLimitReached,
      nextDailyReset: errData.nextDailyReset,
      limitMessage: errData.limitMessage,
    };
  }

  return data as MinerTapSuccess;
}