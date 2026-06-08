import {
  BONGA_NFTS,
  COLLECTION_META,
  type BongaNFT,
} from "@/lib/nft-collection";
import { getTraitPose } from "@/lib/nft-trait-poses";

export const NFT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bongabonks.com";

export const NFT_DEPLOY_SUPPLY = Number(
  process.env.NFT_DEPLOY_SUPPLY || process.env.NEXT_PUBLIC_NFT_SUPPLY || "2000"
);

function buildWeightedPool(supply: number): number[] {
  const totalWeight = BONGA_NFTS.reduce((sum, nft) => sum + nft.weight, 0);
  const pool: number[] = [];

  for (const nft of BONGA_NFTS) {
    const count = Math.round((nft.weight / totalWeight) * supply);
    for (let i = 0; i < count; i++) pool.push(nft.id);
  }

  while (pool.length < supply) {
    pool.push(BONGA_NFTS[0]?.id ?? 1);
  }

  return pool.slice(0, supply);
}

const TRAIT_POOL = buildWeightedPool(NFT_DEPLOY_SUPPLY);

/** Deterministic trait for candy-machine item index (1-based). */
export function getTraitIdForItemIndex(index: number): number {
  const slot = Math.max(0, index - 1) % TRAIT_POOL.length;
  return TRAIT_POOL[slot] ?? 1;
}

export function getNftByTraitId(traitId: number): BongaNFT {
  return BONGA_NFTS.find((nft) => nft.id === traitId) ?? BONGA_NFTS[0];
}

export function buildItemMetadata(index: number) {
  const traitId = getTraitIdForItemIndex(index);
  const nft = getNftByTraitId(traitId);
  const pose = getTraitPose(traitId);
  const imagePath = pose?.image ?? "/bonga-character.png";
  const imageUrl = `${NFT_SITE_URL}${imagePath}`;

  return {
    name: `${nft.name} #${index}`,
    symbol: COLLECTION_META.symbol,
    description: `${COLLECTION_META.description} — ${pose?.activity ?? nft.vibe}`,
    image: imageUrl,
    external_url: COLLECTION_META.externalUrl,
    seller_fee_basis_points: COLLECTION_META.sellerFeeBasisPoints,
    attributes: [
      { trait_type: "Rarity", value: nft.rarity },
      { trait_type: "Trait ID", value: String(traitId) },
      { trait_type: "Outfit", value: nft.outfit },
      { trait_type: "Background", value: nft.background },
      { trait_type: "Accessory", value: nft.accessory },
      { trait_type: "Vibe", value: nft.vibe },
      { trait_type: "Activity", value: pose?.activity ?? nft.vibe },
    ],
    properties: {
      category: "image",
      files: [{ uri: imageUrl, type: "image/png" }],
      creators: [
        {
          address: "8w1KpwzpAttJAonNHohTyAhzcw4iYuCrQPhppPRw5ASb",
          share: 100,
        },
      ],
    },
  };
}

export function buildCollectionMetadata() {
  return {
    name: COLLECTION_META.name,
    symbol: COLLECTION_META.symbol,
    description: COLLECTION_META.description,
    image: `${NFT_SITE_URL}/bonga-character.png`,
    external_url: COLLECTION_META.externalUrl,
    seller_fee_basis_points: COLLECTION_META.sellerFeeBasisPoints,
    properties: {
      category: "image",
      files: [
        {
          uri: `${NFT_SITE_URL}/bonga-character.png`,
          type: "image/png",
        },
      ],
    },
  };
}