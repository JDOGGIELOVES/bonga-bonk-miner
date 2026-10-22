"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import {
  BONGA_TOKEN_CA,
  BONGA_TOKEN_SOLSCAN_URL,
} from "@/lib/bonga-token";

/** Prominent homepage CA with one-tap copy. */
export function LandingCaCopy() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BONGA_TOKEN_CA);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — still show the address for manual select */
    }
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl border border-[#E8D4A0] bg-[#FFFBEA] p-4 text-left shadow-[0_8px_28px_rgba(239,180,0,0.12)] dark:border-[#3D3220] dark:bg-[#2A2114] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ff6a00]">
          Official $BONGA CA
        </p>
        <a
          href={BONGA_TOKEN_SOLSCAN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B5A3E] underline-offset-2 hover:underline dark:text-[#A89068]"
        >
          Solscan
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 flex w-full items-start gap-3 rounded-none border border-[#E8D4A0] bg-white px-3 py-3 text-left transition hover:border-[#ff6a00]/60 hover:bg-[#fff8eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6a00] dark:border-[#3D3220] dark:bg-[#1A1408] dark:hover:bg-[#241c10] sm:items-center"
        aria-label="Copy $BONGA contract address"
      >
        <code className="min-w-0 flex-1 break-all font-mono text-[13px] leading-relaxed text-[#1A1408] dark:text-[#FFF6D8] sm:text-[14px]">
          {BONGA_TOKEN_CA}
        </code>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-[11px] font-extrabold tracking-[0.08em] ${
            copied
              ? "bg-[#2DB8A8] text-white"
              : "bg-[#1A1408] text-white dark:bg-[#FFF6D8] dark:text-[#1A1408]"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              COPIED
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              COPY
            </>
          )}
        </span>
      </button>
      <p className="mt-2 text-center text-[11px] text-[#6B5A3E] dark:text-[#A89068]">
        Tap the address or COPY — paste into Phantom, Jupiter, or DexScreener
      </p>
    </div>
  );
}
