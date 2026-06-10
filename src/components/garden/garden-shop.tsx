"use client";

import { Button } from "@/components/ui/button";
import { PLANT_CATALOG, type GardenState } from "@/lib/vibes-garden";
import { formatGardenBonga } from "@/lib/vibes-garden";
import { X, Lock } from "lucide-react";

interface GardenShopProps {
  open: boolean;
  onClose: () => void;
  state: GardenState;
  isNftHolder: boolean;
  onBuy: (plantTypeId: string) => void;
  message?: string;
}

export function GardenShop({
  open,
  onClose,
  state,
  isNftHolder,
  onBuy,
  message,
}: GardenShopProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="bonga-card max-h-[85vh] w-full max-w-md overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="bonga-section-label">Garden Shop</p>
            <h3 className="bonga-heading mt-1 text-lg">Cosmic hippie plants</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close shop">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Balance: <span className="font-semibold text-bonga-orange">{formatGardenBonga(state.gardenBonga)} $BONGA</span>
        </p>
        {message && (
          <p className="mt-2 text-sm font-medium text-bonga-teal">{message}</p>
        )}

        <ul className="mt-4 space-y-3">
          {PLANT_CATALOG.map((plant) => {
            const locked = plant.nftOnly && !isNftHolder;
            const canAfford = state.gardenBonga >= plant.cost;
            const inShop = state.unlockedPlantIds.includes(plant.id);

            return (
              <li
                key={plant.id}
                className="flex items-center gap-3 rounded-bonga-lg border border-border/60 bg-muted/30 p-3"
              >
                <span className="text-3xl">{plant.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{plant.name}</p>
                  <p className="text-xs text-muted-foreground">{plant.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Tap +{plant.tapBonga} · idle {plant.idleBongaPerSec}/s
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {locked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-bonga-purple">
                      <Lock className="h-3 w-3" /> NFT
                    </span>
                  ) : !inShop ? (
                    <span className="text-xs text-muted-foreground">Soon</span>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-bonga-orange">
                        {plant.cost === 0 ? "Free" : `${plant.cost} $B`}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-1 h-8 px-3 text-xs"
                        disabled={!canAfford}
                        onClick={() => onBuy(plant.id)}
                      >
                        Plant
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}