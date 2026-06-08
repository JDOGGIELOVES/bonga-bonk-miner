/** On-chain Candy Machine deployed for Bonga (public, safe to embed). */
export const DEPLOYED_CANDY_MACHINE =
  "BbWqpzPW95VDnbK5niSxWSaH4KDuifvHHqa89XQTTmt1";
export const DEPLOYED_COLLECTION =
  "29euf1CexRvPydBUnu9HtSpMBUanKADoicie3MT4nBPY";

export function getCandyMachineAddress(): string {
  return (
    process.env.CANDY_MACHINE_ADDRESS ||
    process.env.NEXT_PUBLIC_CANDY_MACHINE_ADDRESS ||
    DEPLOYED_CANDY_MACHINE
  );
}

export function getCollectionAddress(): string {
  return (
    process.env.COLLECTION_ADDRESS ||
    process.env.NEXT_PUBLIC_COLLECTION_ADDRESS ||
    DEPLOYED_COLLECTION
  );
}

export function getMintPriceSol(): number {
  return Number(
    process.env.MINT_PRICE_SOL ||
      process.env.NEXT_PUBLIC_MINT_PRICE_SOL ||
      "0.08"
  );
}

/** Server/runtime: live when explicitly enabled or candy machine is configured. */
export function isMintSimulated(): boolean {
  if (process.env.MINT_SIMULATED === "false") return false;
  if (process.env.NEXT_PUBLIC_MINT_SIMULATED === "false") return false;
  if (process.env.MINT_SIMULATED === "true") return true;
  if (process.env.NEXT_PUBLIC_MINT_SIMULATED === "true") return true;
  // Candy machine is deployed — default to live unless preview is forced above.
  if (getCandyMachineAddress()) return false;
  return true;
}

/** Build-time client hint only — UI should prefer GET /api/mint. */
export function isMintSimulatedBuildHint(): boolean {
  return process.env.NEXT_PUBLIC_MINT_SIMULATED !== "false";
}