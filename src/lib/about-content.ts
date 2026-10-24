import { BONGA_TOKEN_CA } from "@/lib/bonga-token";
import { COLLECTION_STATS } from "@/lib/nft-collection";
import {
  COIN_STAKE_APR_HIGH,
  COIN_STAKE_APR_LOW,
  COIN_STAKE_TIER_MAX,
} from "@/lib/coin-stake";
import { PET_LOVE_REWARD } from "@/lib/pet-love";

const APR_HIGH_PCT = Math.round(COIN_STAKE_APR_HIGH * 100);
const APR_LOW_PCT = Math.round(COIN_STAKE_APR_LOW * 100);
const TIER_MAX_LABEL = COIN_STAKE_TIER_MAX.toLocaleString();

export const ABOUT_FAQ = [
  {
    question: "Who is Bonga Bonk's Sister?",
    answer:
      "Bonga is Bonk's Sister on Solana — a chill orange Shiba with dreadlocks, a teal headband, peace-sign necklace, and a peace-first vibe. She's the face of the $BONGA token, the Miner, NFTs, and the Bonga community at bongabonks.com.",
  },
  {
    question: "How is Bonga different from BONK?",
    answer:
      "BONK is the big Solana meme coin. Bonga is a separate sister brand inspired by that energy — more peace, play, and community tools. Bonga is not affiliated with the BONK Foundation.",
  },
  {
    question: "What can I do on bongabonks.com?",
    answer:
      "Browse and copy the official $BONGA CA, buy via Jupiter, play Bonk Miner, soft-stake $BONGA (Coin Stake), stake Bonga NFTs, use Bonga Bank to withdraw vault rewards, try Pet Love and Bonga Peace, and hang with the fam on Community.",
  },
  {
    question: "What is the official $BONGA CA?",
    answer: `The only official Solana mint is ${BONGA_TOKEN_CA}. Copy it from the homepage or About page, and double-check before you buy or add liquidity. Fake tickers reuse the name — trust the mint, not the emoji.`,
  },
  {
    question: "How do I earn $BONGA?",
    answer: `Bonk Miner: 100 taps = 1 $BONGA (max 10/day). Pet Love: ${PET_LOVE_REWARD} $BONGA per validated photo (1/wallet/day). NFT Stake: daily rates by rarity (Common 250 → Cosmic 875). Coin Stake: soft-lock $BONGA for monthly APR that settles into Bonga Bank. Game and stake earnings credit your Bank vault when your wallet is connected — withdraw on-chain from Bank when you're ready.`,
  },
  {
    question: "What are Coin Stake and Bonga Bank?",
    answer: `Coin Stake soft-locks $BONGA in your wallet. Positions up to ${TIER_MAX_LABEL} earn ${APR_HIGH_PCT}% APR; larger positions earn ${APR_LOW_PCT}% APR. Rewards settle monthly into Bonga Bank if you stay staked. Bonga Bank is your vault for settled rewards — open Bank to see the balance and withdraw $BONGA to your wallet.`,
  },
  {
    question: "Do I need a wallet just to visit?",
    answer:
      "No. You can read the site, copy the CA, and buy on Jupiter without connecting. Connect a Solana wallet (Phantom or Solflare) when you play Miner, stake, use Bank, or claim Pet Love. See How to Connect for a short setup guide.",
  },
  {
    question: "Where does the community treasury come from?",
    answer:
      "Secondary NFT sales send 7% royalties to the Bonga Community Treasury on Solana. Verified player claims (Miner, Pet Love, staking) are tracked publicly on the Treasury page for transparency.",
  },
] as const;

export const ECOSYSTEM_LINKS = [
  {
    href: "/?mode=miner",
    title: "Bonk Miner",
    description:
      "Tap Solana meme logos — 100 taps = 1 $BONGA (max 10/day). Free to play in the browser.",
    emoji: "🔨",
    accent: "text-bonga-orange",
  },
  {
    href: "/coin-staking",
    title: "Coin Stake",
    description: `Soft-lock $BONGA · ${APR_HIGH_PCT}% APR up to ${TIER_MAX_LABEL}, ${APR_LOW_PCT}% above · monthly settle into Bank.`,
    emoji: "🔒",
    accent: "text-bonga-teal",
  },
  {
    href: "/nft",
    title: "Bonga NFT Collection",
    description: `${COLLECTION_STATS.totalSupply.toLocaleString()} unique Bonga warriors on Solana — mint, collect, and stake for daily $BONGA.`,
    emoji: "✌️",
    accent: "text-bonga-teal",
  },
  {
    href: "/peace",
    title: "Bonga Peace",
    description:
      "Breathing, stretches, Tai Chi flows, affirmations, and quiet check-ins — the Bonga way.",
    emoji: "🧘",
    accent: "text-bonga-purple",
  },
] as const;
