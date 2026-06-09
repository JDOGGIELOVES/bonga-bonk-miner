/** Official $BONGA / Bonga Bonk's Sister token contract address on Solana. */

export const BONGA_TOKEN_CA =
  process.env.NEXT_PUBLIC_BONGA_MINT_ADDRESS?.trim() ||
  "7YoAymCyauHAXus3snMEKcLgRx546MrHuBW3EuUNKKQs";

export const BONGA_TOKEN_SOLSCAN_URL = `https://solscan.io/token/${BONGA_TOKEN_CA}`;