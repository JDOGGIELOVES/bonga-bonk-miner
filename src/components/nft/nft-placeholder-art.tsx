import type { BongaNFT } from "@/lib/nft-collection";
import { BongaNFTArt } from "@/components/nft/bonga-nft-art";

export function NFTPlaceholderArt({
  nft,
  size = "lg",
}: {
  nft: BongaNFT;
  size?: "sm" | "lg";
}) {
  return <BongaNFTArt nft={nft} size={size === "lg" ? "lg" : "sm"} />;
}