import { BONGA_TOKEN_CA } from "@/lib/bonga-token";

export const ABOUT_FAQ = [
  {
    question: "Who is Bonga Bonk's Sister?",
    answer:
      "Bonga Bonk's Sister is the official mascot and spirit of the Bonga ecosystem on Solana — a chill orange Shiba with dreadlocks, a wooden bonk club, and a peace-first vibe. She's Bonk's Sister: same bonk energy, more mindfulness.",
  },
  {
    question: "What is the difference between Bonga and Bonk?",
    answer:
      "Bonk is the legendary Solana meme coin energy. Bonga Bonk's Sister is the sister brand — she brings peace, love, and good bonks through the Bonga Bonk Miner game, $BONGA token, NFT collection, and Bonga Peace wellness tools.",
  },
  {
    question: "What can I do on bongabonks.com?",
    answer:
      "Play Bonga Bonk Miner to tap and mine $BONGA, mint Bonga NFTs on Solana, and use Bonga Peace for breathing, stretching, Tai Chi, Bonk Breaks, and daily affirmations — all free in the browser.",
  },
  {
    question: "What is the Bonga Bonk's Sister CA?",
    answer: `The official Bonga Bonk's Sister contract address (CA) for $BONGA on Solana is ${BONGA_TOKEN_CA}. Always verify this CA on bongabonks.com/about before buying or adding liquidity.`,
  },
  {
    question: "What is $BONGA?",
    answer:
      "$BONGA is the Bonga Bonk's Sister community token on Solana. Earn it in the Bonk Miner game — tap to bonk, stack bonks, and claim mined $BONGA when you connect your wallet.",
  },
  {
    question: "Is Bonga Bonk's Sister affiliated with Bonk?",
    answer:
      "Bonga Bonk's Sister is a sister brand inspired by the Bonk community spirit on Solana — playful, community-first, and built for the fam. The official home for Bonga is bongabonks.com.",
  },
] as const;

export const ECOSYSTEM_LINKS = [
  {
    href: "/",
    title: "Bonga Bonk Miner",
    description:
      "Tap meme coins, mine $BONGA, and climb the leaderboard. Bonk Miner players unlock NFT whitelist perks.",
    emoji: "🔨",
    accent: "text-bonga-orange",
  },
  {
    href: "/nft",
    title: "Bonga NFT Collection",
    description:
      "8,888 unique Bonga Bonk's Sister warriors on Solana — hippie, cosmic, beach, and bonk-powered traits.",
    emoji: "✌️",
    accent: "text-bonga-teal",
  },
  {
    href: "/peace",
    title: "Bonga Peace",
    description:
      "Guided breathing, daily stretches, Tai Chi flows, Bonk Break stress release, and affirmations the Bonga way.",
    emoji: "🧘",
    accent: "text-bonga-purple",
  },
] as const;