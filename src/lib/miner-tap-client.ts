export interface MinerEarnedStatus {
  wallet: string;
  date: string;
  taps: number;
  earned: number;
  claimed: number;
  claimable: number;
}

export interface MinerTapSuccess {
  ok: true;
  taps: number;
  earned: number;
}

export interface MinerTapError {
  error: string;
  taps?: number;
  earned?: number;
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
}): Promise<MinerTapSuccess | MinerTapError> {
  const response = await fetch("/api/miner/tap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: params.wallet,
      date: todayKey(),
      tapIndex: params.tapIndex,
    }),
  });

  const data = (await response.json()) as MinerTapSuccess | MinerTapError;
  if (!response.ok) {
    return {
      error: "error" in data ? data.error : "Tap registration failed.",
      taps: "taps" in data ? data.taps : undefined,
      earned: "earned" in data ? data.earned : undefined,
    };
  }

  return data as MinerTapSuccess;
}