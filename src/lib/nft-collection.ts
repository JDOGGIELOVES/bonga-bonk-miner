export type RarityTier = "Common" | "Rare" | "Legendary" | "Cosmic Bonga";

export interface BongaNFT {
  id: number;
  name: string;
  rarity: RarityTier;
  outfit: string;
  background: string;
  accessory: string;
  vibe: string;
  gradient: string;
  emoji: string;
  imagePrompt: string;
  weight: number;
}

export const RARITY_COLORS: Record<RarityTier, string> = {
  Common: "#7AE582",
  Rare: "#2EC4B6",
  Legendary: "#9B5DE5",
  "Cosmic Bonga": "#FF8C42",
};

export const RARITY_BADGE_VARIANT: Record<
  RarityTier,
  "green" | "teal" | "purple" | "default"
> = {
  Common: "green",
  Rare: "teal",
  Legendary: "purple",
  "Cosmic Bonga": "default",
};

/** Required on every Bonga — visible dreadlocks, never straight hair or flower hair */
export const BONGA_DREADLOCK_PROMPT =
  "long thick brown dreadlocks past shoulders with red accent beads, green-yellow-orange striped hippie headband";

function bongaPrompt(scene: string): string {
  return `Orange chibi Shiba Inu, ${BONGA_DREADLOCK_PROMPT}, ${scene}`;
}

export const BONGA_NFTS: BongaNFT[] = [
  {
    id: 1,
    name: "Peaceful Bonga",
    rarity: "Common",
    outfit: "Tie-dye hoodie",
    background: "Sunset meadow",
    accessory: "Peace sign pendant",
    vibe: "Classic hippie",
    gradient: "from-orange-300 via-pink-300 to-teal-300",
    emoji: "✌️",
    weight: 30,
    imagePrompt: bongaPrompt(
      "blue eyes, tie-dye hoodie, double peace sign, sunset meadow, hippie aesthetic, kawaii"
    ),
  },
  {
    id: 2,
    name: "Beach Bonga",
    rarity: "Common",
    outfit: "Floral sarong",
    background: "Tropical beach",
    accessory: "Shell necklace",
    vibe: "Island chill",
    gradient: "from-cyan-300 via-teal-200 to-amber-200",
    emoji: "🏖️",
    weight: 30,
    imagePrompt: bongaPrompt(
      "tropical beach, floral sarong, shell necklace, palm trees, peaceful summer vibes"
    ),
  },
  {
    id: 3,
    name: "Festival Bonga",
    rarity: "Common",
    outfit: "Glow paint & fringe vest",
    background: "Music festival lights",
    accessory: "Flower crown",
    vibe: "Rave hippie",
    gradient: "from-purple-400 via-pink-400 to-orange-300",
    emoji: "🎪",
    weight: 28,
    imagePrompt: bongaPrompt(
      "music festival, glow paint, fringe vest, flower crown, colorful stage lights, bohemian rave aesthetic"
    ),
  },
  {
    id: 4,
    name: "Garden Bonga",
    rarity: "Common",
    outfit: "Overalls & bandana",
    background: "Community garden",
    accessory: "Watering can",
    vibe: "Earth mother",
    gradient: "from-green-300 via-lime-200 to-yellow-200",
    emoji: "🌻",
    weight: 30,
    imagePrompt: bongaPrompt(
      "community garden, overalls, bandana, watering flowers, sunflowers, earthy peaceful vibes"
    ),
  },
  {
    id: 5,
    name: "Skater Bonga",
    rarity: "Common",
    outfit: "Baggy jeans & crop top",
    background: "Venice boardwalk",
    accessory: "Skateboard",
    vibe: "Coastal cool",
    gradient: "from-sky-300 via-orange-200 to-rose-200",
    emoji: "🛹",
    weight: 28,
    imagePrompt: bongaPrompt(
      "skateboard, Venice boardwalk, baggy jeans, chill California vibe"
    ),
  },
  {
    id: 6,
    name: "Meditation Bonga",
    rarity: "Rare",
    outfit: "Linen robes",
    background: "Zen temple garden",
    accessory: "Mala beads",
    vibe: "Inner peace",
    gradient: "from-indigo-300 via-purple-200 to-teal-200",
    emoji: "🧘",
    weight: 15,
    imagePrompt: bongaPrompt(
      "meditating in zen garden, linen robes, mala beads, lotus flowers, serene spiritual aesthetic"
    ),
  },
  {
    id: 7,
    name: "Cosmic Surfer Bonga",
    rarity: "Rare",
    outfit: "Galaxy wetsuit",
    background: "Nebula wave",
    accessory: "Star surfboard",
    vibe: "Space beach",
    gradient: "from-violet-500 via-purple-400 to-cyan-400",
    emoji: "🌊",
    weight: 12,
    imagePrompt: bongaPrompt(
      "surfing nebula wave, galaxy wetsuit, star surfboard, cosmic ocean, purple teal orange palette"
    ),
  },
  {
    id: 8,
    name: "Cyber Bonga",
    rarity: "Rare",
    outfit: "Neon tech jacket",
    background: "Cyber city rooftop",
    accessory: "Holographic visor",
    vibe: "Future hippie",
    gradient: "from-fuchsia-500 via-purple-500 to-cyan-500",
    emoji: "🤖",
    weight: 12,
    imagePrompt: bongaPrompt(
      "cyberpunk style, neon tech jacket, holographic visor, futuristic city, synthwave"
    ),
  },
  {
    id: 9,
    name: "Rainbow Bonga",
    rarity: "Rare",
    outfit: "Pride cape",
    background: "Rainbow sky",
    accessory: "Heart sunglasses",
    vibe: "Love is love",
    gradient: "from-red-400 via-yellow-300 to-blue-400",
    emoji: "🌈",
    weight: 14,
    imagePrompt: bongaPrompt(
      "rainbow cape, heart sunglasses, pride celebration, colorful sky, love and peace theme"
    ),
  },
  {
    id: 10,
    name: "Desert Shaman Bonga",
    rarity: "Rare",
    outfit: "Shaman cloak",
    background: "Desert at dusk",
    accessory: "Crystal staff",
    vibe: "Mystic wanderer",
    gradient: "from-amber-400 via-orange-400 to-purple-500",
    emoji: "🔮",
    weight: 11,
    imagePrompt: bongaPrompt(
      "desert shaman, crystal staff, cloak, dusk desert, mystical bohemian aesthetic"
    ),
  },
  {
    id: 11,
    name: "Golden Bonga",
    rarity: "Legendary",
    outfit: "Gold-trim kimono",
    background: "Cherry blossom temple",
    accessory: "Golden club",
    vibe: "Royal bonk",
    gradient: "from-yellow-400 via-amber-300 to-orange-400",
    emoji: "👑",
    weight: 5,
    imagePrompt: bongaPrompt(
      "gold-trim kimono, golden bonk club, cherry blossom temple, regal peaceful aesthetic, legendary NFT"
    ),
  },
  {
    id: 12,
    name: "Aurora Bonga",
    rarity: "Legendary",
    outfit: "Northern lights cloak",
    background: "Arctic aurora",
    accessory: "Ice crystal crown",
    vibe: "Frozen magic",
    gradient: "from-emerald-400 via-teal-300 to-violet-500",
    emoji: "❄️",
    weight: 4,
    imagePrompt: bongaPrompt(
      "aurora borealis, ice crystal crown, northern lights cloak, arctic magical scene"
    ),
  },
  {
    id: 13,
    name: "Volcano Bonga",
    rarity: "Legendary",
    outfit: "Lava-resistant armor",
    background: "Active volcano",
    accessory: "Flame headband",
    vibe: "Fire spirit",
    gradient: "from-red-500 via-orange-500 to-yellow-400",
    emoji: "🌋",
    weight: 4,
    imagePrompt: bongaPrompt(
      "active volcano, flame accessories, lava glow, powerful legendary fire spirit aesthetic"
    ),
  },
  {
    id: 14,
    name: "Diamond Bonga",
    rarity: "Legendary",
    outfit: "Crystal armor",
    background: "Gem cave",
    accessory: "Diamond club",
    vibe: "Ultra rare",
    gradient: "from-sky-200 via-indigo-300 to-purple-400",
    emoji: "💎",
    weight: 3,
    imagePrompt: bongaPrompt(
      "crystal armor, diamond bonk club, gem cave, sparkling legendary NFT art"
    ),
  },
  {
    id: 15,
    name: "Cosmic Bonga Prime",
    rarity: "Cosmic Bonga",
    outfit: "Stardust bodysuit",
    background: "Deep space galaxy",
    accessory: "Orbiting moons",
    vibe: "Universe entity",
    gradient: "from-orange-400 via-purple-600 to-teal-500",
    emoji: "🌌",
    weight: 2,
    imagePrompt: bongaPrompt(
      "stardust suit, orbiting moons, deep galaxy background, divine peaceful energy, 1/1 tier art"
    ),
  },
  {
    id: 16,
    name: "Eternal Peace Bonga",
    rarity: "Cosmic Bonga",
    outfit: "Celestial robes",
    background: "Infinite rainbow void",
    accessory: "Universe peace sign",
    vibe: "Transcendent",
    gradient: "from-pink-500 via-violet-600 to-cyan-400",
    emoji: "☮️",
    weight: 1,
    imagePrompt: bongaPrompt(
      "celestial robes, universe peace sign, infinite rainbow void, most rare NFT in collection"
    ),
  },
];

export const COLLECTION_META = {
  name: "Bonga NFT Collection",
  symbol: "BONGA",
  description:
    "8,888 peaceful chibi Shiba warriors from Bonk's Sister. Hippie, cosmic, and bonk-powered vibes on Solana.",
  externalUrl: "https://bongabonks.com/nft",
  sellerFeeBasisPoints: 500,
};

export const COLLECTION_STATS = {
  totalSupply: 8888,
  minted: 0,
  maxPerWallet: 3,
};

export const ROADMAP = [
  {
    phase: "Phase 1",
    title: "Mint & Fam",
    status: "live" as const,
    items: ["NFT mint launch", "Bonk Miner whitelist", "Community Discord/X"],
  },
  {
    phase: "Phase 2",
    title: "Game Boosts",
    status: "next" as const,
    items: ["NFT holders get 2x bonk power", "Exclusive meme coins", "Rare club skins"],
  },
  {
    phase: "Phase 3",
    title: "Staking & Rewards",
    status: "soon" as const,
    items: ["Stake Bonga NFTs for $BONGA", "Monthly airdrops", "IRL event access"],
  },
  {
    phase: "Phase 4",
    title: "Merch & Metaverse",
    status: "future" as const,
    items: ["Bonga merch drops", "3D avatar integration", "Virtual peace festival"],
  },
];

export const TEAM = [
  { name: "Bonga Bonk's Sister", role: "Founder & Vibes", emoji: "✌️" },
  { name: "DJ Dreads", role: "Music & Community", emoji: "🎧" },
  { name: "Bonk Dev", role: "Smart Contracts", emoji: "💻" },
  { name: "Peace Keeper", role: "Moderation", emoji: "🕊️" },
  { name: "Art Shaman", role: "Visuals & NFTs", emoji: "🎨" },
];

export const UTILITY = [
  {
    icon: "🎮",
    title: "Bonk Miner Boosts",
    description: "NFT holders get faster mining, exclusive clubs, and bonus $BONGA multipliers.",
  },
  {
    icon: "💰",
    title: "Staking Rewards",
    description: "Stake your Bonga NFT to earn $BONGA tokens and exclusive airdrops.",
  },
  {
    icon: "👕",
    title: "Merch & IRL",
    description: "Holder-only merch drops, festival tickets, and meetups with the Bonga Fam.",
  },
  {
    icon: "🗳️",
    title: "DAO Governance",
    description: "Vote on new traits, game features, and community treasury spending.",
  },
];

export const COMMUNITY_LINKS = [
  { label: "Website", href: "https://bongabonks.com", icon: "🌐" },
  { label: "Bonk Miner", href: "https://bongabonks.com", icon: "🔨" },
  { label: "X / Twitter", href: "https://x.com", icon: "𝕏" },
];