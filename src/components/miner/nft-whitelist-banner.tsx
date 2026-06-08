"use client";

import { motion } from "framer-motion";
import { getWhitelistStatus } from "@/lib/bonga-whitelist";
import { Badge } from "@/components/ui/badge";

export function NFTWhitelistBanner() {
  const wl = getWhitelistStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bonga-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="bonga-section-label">NFT Perks</p>
        <p className="mt-1 font-display text-sm font-semibold">
          Bonga NFT Whitelist
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{wl.label}</p>
        <div className="mt-2 flex gap-2">
          {wl.tier === "free" && <Badge variant="green">Free mint</Badge>}
          {wl.tier === "discount" && <Badge variant="teal">50% off</Badge>}
        </div>
      </div>
      <a
        href="https://bonga.uno"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-full bg-bonga-orange px-5 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-[#E55800]"
      >
        Learn more
      </a>
    </motion.div>
  );
}