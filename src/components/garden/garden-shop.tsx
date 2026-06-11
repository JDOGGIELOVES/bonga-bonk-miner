"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GARDEN_DAILY_EARN_CAP,
  GARDEN_ZONES,
  PLANT_CATALOG,
  countOwnedPlants,
  formatGardenBonga,
  getDailyEarnRemaining,
  isPlantAvailableInShop,
  type GardenState,
  type GardenZone,
} from "@/lib/vibes-garden";
import { X, Lock } from "lucide-react";

interface GardenShopProps {
  open: boolean;
  onClose: () => void;
  state: GardenState;
  isNftHolder: boolean;
  onBuy: (plantTypeId: string, zone: GardenZone) => void;
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
  const [plantZone, setPlantZone] = useState<GardenZone>("meadow");

  if (!open) return null;

  const earnRemaining = getDailyEarnRemaining(state);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bonga-card max-h-[92vh] w-full max-w-md overflow-y-auto rounded-b-none rounded-t-3xl p-5 pb-8 sm:max-h-[85vh] sm:rounded-bonga-lg sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted sm:hidden" />
        <div className="flex items-center justify-between">
          <div>
            <p className="bonga-section-label">Garden Shop</p>
            <h3 className="bonga-heading mt-1 text-lg">Cosmic hippie plants</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close shop">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Balance:{" "}
          <span className="font-semibold text-bonga-orange">
            {formatGardenBonga(state.gardenBonga)} $BONGA
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Daily farm cap: {formatGardenBonga(state.bongaFarmedToday)} / {GARDEN_DAILY_EARN_CAP}{" "}
          ({formatGardenBonga(earnRemaining)} left today)
        </p>
        {message && (
          <p className="mt-2 text-sm font-medium text-bonga-teal">{message}</p>
        )}

        <div className="mt-3 rounded-bonga-lg border border-bonga-teal/20 bg-bonga-teal/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Shop tips</p>
          <p className="mt-1">
            Pick a <strong className="text-foreground">zone</strong> (Meadow, Greenhouse, or Farm),
            then plant. Duplicates stack idle + tap income. Progression is slower — max{" "}
            {GARDEN_DAILY_EARN_CAP} garden $BONGA farmed per day.
          </p>
          <p className="mt-1.5">
            <strong className="text-foreground">Bonga Kush 🌿</strong> requires a Bonga NFT.
            Garden $BONGA is local only, not on-chain.
          </p>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-foreground">Plant in zone</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {GARDEN_ZONES.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setPlantZone(zone.id)}
                className={`min-h-[44px] shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  plantZone === zone.id
                    ? "border-bonga-teal bg-bonga-teal/15"
                    : "border-border bg-muted/40"
                }`}
              >
                {zone.emoji} {zone.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-4 space-y-3">
          {PLANT_CATALOG.map((plant) => {
            const nftLocked = plant.nftOnly && !isNftHolder;
            const available = isPlantAvailableInShop(state, plant.id, isNftHolder);
            const canAfford = state.gardenBonga >= plant.cost;
            const owned = countOwnedPlants(state, plant.id);
            const stackedIdle = plant.idleBongaPerSec * owned;

            return (
              <li
                key={plant.id}
                className="flex items-center gap-3 rounded-bonga-lg border border-border/60 bg-muted/30 p-3 sm:p-4"
              >
                <span className="text-4xl">{plant.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{plant.name}</p>
                  <p className="text-xs text-muted-foreground">{plant.description}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Per plant: tap +{plant.tapBonga} · idle {plant.idleBongaPerSec}/s · best in{" "}
                    {plant.defaultZone}
                  </p>
                  {owned > 0 && (
                    <p className="mt-1 text-[11px] font-medium text-bonga-teal">
                      You own {owned} · {stackedIdle.toFixed(3)}/s idle from this type
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {nftLocked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-bonga-purple">
                      <Lock className="h-3 w-3" /> NFT required
                    </span>
                  ) : !available ? (
                    <span className="text-xs text-muted-foreground">Soon</span>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-bonga-orange">
                        {plant.cost === 0 ? "Free" : `${plant.cost} $B`}
                      </p>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 h-10 min-w-[88px] px-3 text-xs"
                        disabled={!canAfford}
                        onClick={() => onBuy(plant.id, plantZone)}
                      >
                        {owned > 0 ? "Plant another" : "Plant"}
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