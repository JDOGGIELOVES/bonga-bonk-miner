"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GARDEN_DAILY_EARN_CAP,
  PLANT_CATALOG,
  countOwnedPlants,
  formatGardenBonga,
  formatNextDailyReset,
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
  // Unified garden — zone kept only for buyPlant data shape compatibility.
  const plantZone: GardenZone = "meadow";

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
          ({formatGardenBonga(earnRemaining)} left today) — goes to Bonga Bank Vault
        </p>
        <p className="text-[10px] text-muted-foreground">Next reset: {formatNextDailyReset()}</p>
        {message && (
          <p className="mt-2 text-sm font-medium text-bonga-teal">{message}</p>
        )}

        <div className="mt-3 rounded-bonga-lg border border-bonga-teal/20 bg-bonga-teal/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold text-foreground">Shop tips</p>
          <p className="mt-1">
            Buy plants for your central garden. Duplicates stack full idle + tap income. Up to 10 free Peace Lilies. Max{" "}
            {GARDEN_DAILY_EARN_CAP} $BONGA per day across everything — all deposited to your Bonga Bank Vault (on-chain up to 20,001 daily, no min).
          </p>
          <p className="mt-1.5">
            NFT holders get +25% yield on taps and idle. All progress saves locally.
          </p>
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
                  {plant.id === "peace-lily" && owned >= 10 && (
                    <p className="mt-1 text-[11px] font-medium text-amber-600">
                      Max 10 free reached
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
                        disabled={!canAfford || (plant.id === "peace-lily" && owned >= 10)}
                        onClick={() => onBuy(plant.id, plantZone)}
                      >
                        {plant.id === "peace-lily" && owned >= 10
                          ? "Max 10 free"
                          : owned > 0
                          ? "Plant another"
                          : "Plant"}
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