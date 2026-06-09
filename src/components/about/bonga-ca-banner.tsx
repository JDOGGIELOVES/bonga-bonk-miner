"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BONGA_TOKEN_CA,
  BONGA_TOKEN_SOLSCAN_URL,
} from "@/lib/bonga-token";

export function BongaCaBanner({ prominent = false }: { prominent?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BONGA_TOKEN_CA);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div
      className={
        prominent
          ? "mx-auto mt-8 max-w-xl rounded-bonga-lg border-2 border-bonga-orange/40 bg-gradient-to-br from-bonga-orange/10 via-card to-bonga-teal/10 p-5 shadow-bonga-lg"
          : "rounded-bonga-lg border border-bonga-orange/30 bg-bonga-orange/5 p-4"
      }
    >
      <p
        className={
          prominent
            ? "text-center font-display text-sm font-bold uppercase tracking-wide text-bonga-orange"
            : "text-xs font-bold uppercase tracking-wide text-bonga-orange"
        }
      >
        Bonga Bonk&apos;s Sister CA
      </p>
      <p
        className={
          prominent
            ? "mt-1 text-center text-xs text-muted-foreground"
            : "mt-1 text-xs text-muted-foreground"
        }
      >
        Official $BONGA contract address on Solana
      </p>

      <div
        className={`mt-3 flex items-center gap-2 rounded-bonga-lg border border-border/60 bg-background/80 p-3 ${
          prominent ? "flex-col sm:flex-row" : ""
        }`}
      >
        <code
          className={`min-w-0 flex-1 break-all font-mono text-foreground ${
            prominent ? "text-center text-sm sm:text-left" : "text-xs"
          }`}
        >
          {BONGA_TOKEN_CA}
        </code>
        <div className={`flex shrink-0 gap-2 ${prominent ? "w-full sm:w-auto" : ""}`}>
          <Button
            variant="peace"
            size="sm"
            className={prominent ? "flex-1 sm:flex-none" : ""}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy CA
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" className={prominent ? "flex-1 sm:flex-none" : ""} asChild>
            <a
              href={BONGA_TOKEN_SOLSCAN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Solscan
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}