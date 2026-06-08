import type { BongaNFT } from "@/lib/nft-collection";

export function NFTPlaceholderArt({
  nft,
  size = "lg",
}: {
  nft: BongaNFT;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "h-64 w-64" : "h-32 w-32";
  const text = size === "lg" ? "text-7xl" : "text-4xl";

  return (
    <div
      className={`${dim} relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${nft.gradient} shadow-2xl`}
    >
      <span className={`${text} drop-shadow-2xl`}>{nft.emoji}</span>
      <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/30 px-2 py-1 text-center text-[10px] text-white backdrop-blur-sm">
        Trait art · final renders coming
      </div>
    </div>
  );
}