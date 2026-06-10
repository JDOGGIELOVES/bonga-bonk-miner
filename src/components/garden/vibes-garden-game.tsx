"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { GardenVisual } from "@/components/garden/garden-visual";
import { GardenShop } from "@/components/garden/garden-shop";
import { GardenQuests } from "@/components/garden/garden-quests";
import { useBongaNftHolder } from "@/hooks/use-bonga-nft-holder";
import {
  GARDEN_DAILY_EARN_CAP,
  applyIdleEarnings,
  buyPlant,
  completeQuest,
  formatGardenBonga,
  gardenBeautyLevel,
  getGardenIdleRate,
  getNftMultiplier,
  isDailyEarnCapReached,
  loadGardenState,
  saveGardenState,
  waterPlant,
  type GardenState,
  type GardenZone,
} from "@/lib/vibes-garden";
import { getTodaysAffirmation } from "@/lib/bonga-affirmations";
import { gameAudio } from "@/lib/audio/audio-manager";
import { Info, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function VibesGardenGame() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { isHolder, checking } = useBongaNftHolder();
  const [state, setState] = useState<GardenState | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopMsg, setShopMsg] = useState("");
  const [floatText, setFloatText] = useState<{ id: number; text: string } | null>(null);
  const [meditating, setMeditating] = useState(false);
  const floatId = useRef(0);
  const isHolderRef = useRef(isHolder);
  const catchupDoneRef = useRef(false);

  useEffect(() => {
    isHolderRef.current = isHolder;
  }, [isHolder]);

  useEffect(() => {
    const loaded = loadGardenState();
    setState(loaded);
  }, []);

  useEffect(() => {
    if (!state) return;
    saveGardenState(state);
  }, [state]);

  useEffect(() => {
    if (!state || catchupDoneRef.current || checking) return;
    catchupDoneRef.current = true;
    setState((prev) => (prev ? applyIdleEarnings(prev, isHolder) : prev));
  }, [state, isHolder, checking]);

  useEffect(() => {
    if (!state) return;
    const tick = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setState((prev) =>
        prev ? applyIdleEarnings(prev, isHolderRef.current) : prev
      );
    }, 5000);
    return () => clearInterval(tick);
  }, [state]);

  useEffect(() => {
    if (!state || !catchupDoneRef.current) return;
    setState((prev) => (prev ? applyIdleEarnings(prev, isHolder) : prev));
  }, [isHolder]);

  const showFloat = useCallback((text: string) => {
    const id = ++floatId.current;
    setFloatText({ id, text });
    setTimeout(() => setFloatText((f) => (f?.id === id ? null : f)), 1200);
  }, []);

  const handleWater = useCallback(
    (instanceId: string) => {
      if (!state) return;
      void gameAudio.resume();
      const { state: next, earned, capped } = waterPlant(state, instanceId, isHolder);
      setState(next);
      if (earned > 0) {
        showFloat(`+${earned.toFixed(2)} $BONGA`);
        gameAudio.playCoinCollect();
      } else if (capped) {
        showFloat(`Daily cap (${GARDEN_DAILY_EARN_CAP}) reached`);
      }
    },
    [state, isHolder, showFloat]
  );

  const handleBuy = useCallback(
    (plantTypeId: string, zone: GardenZone) => {
      if (!state) return;
      const result = buyPlant(state, plantTypeId, zone, isHolder);
      if (!result.ok) {
        setShopMsg(result.reason ?? "Could not plant.");
        setTimeout(() => setShopMsg(""), 3000);
        return;
      }
      setState(result.state);
      setShopMsg(`Planted in ${zone}! Stacks with your other plants. 🌼`);
      setTimeout(() => setShopMsg(""), 3000);
      gameAudio.playCoinCollect();
    },
    [state, isHolder]
  );

  const tryQuest = useCallback(
    (questId: string) => {
      if (!state) return;
      const result = completeQuest(state, questId);
      if (result.ok && result.reward > 0) {
        setState(result.state);
        showFloat(`Quest +${result.reward} $BONGA`);
      } else if (result.capped) {
        showFloat(`Daily cap (${GARDEN_DAILY_EARN_CAP}) reached`);
      }
    },
    [state, showFloat]
  );

  const handleMeditate = useCallback(() => {
    if (meditating || !state) return;
    setMeditating(true);
    setTimeout(() => {
      setMeditating(false);
      tryQuest("meditate");
    }, 10000);
  }, [meditating, state, tryQuest]);

  const handleAffirm = useCallback(() => {
    const affirmation = getTodaysAffirmation();
    showFloat(affirmation.emoji);
    tryQuest("affirm");
  }, [tryQuest, showFloat]);

  const handleGoodDeed = useCallback(() => {
    showFloat("Good vibes sent 🫶");
    tryQuest("good-deed");
  }, [tryQuest, showFloat]);

  if (!state) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-sm font-semibold text-muted-foreground"
        >
          Growing the garden...
        </motion.p>
      </div>
    );
  }

  const beauty = gardenBeautyLevel(state.plants.length);
  const nftBonus = getNftMultiplier(isHolder);
  const idlePerSec = getGardenIdleRate(state, isHolder);
  const capReached = isDailyEarnCapReached(state);

  return (
    <div className="space-y-4">
      <div className="bonga-card grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Garden $BONGA</p>
          <p className="font-display text-xl font-bold text-bonga-orange">
            {formatGardenBonga(state.gardenBonga)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Farmed today</p>
          <p className={`font-display text-xl font-bold ${capReached ? "text-amber-600" : "text-foreground"}`}>
            {formatGardenBonga(state.bongaFarmedToday)}
          </p>
          <p className="text-[10px] text-muted-foreground">/ {GARDEN_DAILY_EARN_CAP} cap</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plants</p>
          <p className="font-display text-xl font-bold text-foreground">{state.plants.length}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Waters today</p>
          <p className="font-display text-xl font-bold text-bonga-teal">{state.waterCountToday}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Beauty</p>
          <p className="font-display text-xl font-bold text-bonga-purple">Lv {beauty}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Idle earn</p>
          <p className="font-display text-xl font-bold text-bonga-teal">
            {capReached ? "0" : formatGardenBonga(idlePerSec)}/s
          </p>
        </div>
      </div>

      {capReached && (
        <p className="rounded-bonga-lg border border-amber-300/40 bg-amber-50/60 px-4 py-2 text-center text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
          Daily farm cap reached ({GARDEN_DAILY_EARN_CAP} garden $BONGA). Resets at midnight UTC.
          You can still explore zones — taps and idle pause until tomorrow.
        </p>
      )}

      <div className="bonga-card border-bonga-teal/20 bg-gradient-to-br from-bonga-teal/5 to-bonga-purple/5 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-bonga-teal" />
          <div className="min-w-0 text-sm">
            <p className="font-display font-bold text-foreground">How the garden works</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Three zones</span> — Meadow 🌾,
                Greenhouse 🪴, and Farm 🚜. Plant in any zone from the shop; switch tabs to water
                each area.
              </li>
              <li>
                <span className="font-semibold text-foreground">Slower progression</span> — earn
                rates are gentler. Max {GARDEN_DAILY_EARN_CAP} garden $BONGA farmed per UTC day
                (idle + taps + quests).
              </li>
              <li>
                <span className="font-semibold text-foreground">Duplicates stack</span> — another
                of the same plant adds full idle + tap again.
              </li>
              <li>
                <span className="font-semibold text-foreground">Bonga Kush 🌿</span> — NFT holders
                only. Connect wallet & hold a Bonga NFT to plant it in the Greenhouse.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {connected && isHolder && (
        <div className="flex items-center gap-2 rounded-bonga-lg border border-bonga-purple/30 bg-bonga-purple/10 px-4 py-2 text-sm text-bonga-purple">
          <Sparkles className="h-4 w-4 shrink-0" />
          {nftBonus.label}
        </div>
      )}

      {connected && !checking && !isHolder && (
        <p className="text-center text-xs text-muted-foreground">
          Hold a Bonga NFT to unlock Bonga Kush, rare plants & vibe multipliers.{" "}
          <a href="/nft" className="font-semibold text-bonga-teal hover:underline">
            Mint one
          </a>
        </p>
      )}

      {!connected && (
        <Button
          variant="outline"
          size="lg"
          className="mx-auto flex min-h-[48px] w-full max-w-sm gap-2 rounded-full sm:w-auto"
          onClick={() => setVisible(true)}
        >
          <Wallet className="h-4 w-4" />
          Connect wallet for Bonga Kush & NFT perks
        </Button>
      )}

      <div className="relative">
        <GardenVisual
          plants={state.plants}
          onWater={handleWater}
          beautyLevel={beauty}
        />
        <AnimatePresence>
          {floatText && (
            <motion.p
              key={floatText.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: -24 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute left-1/2 top-1/3 z-10 max-w-[90%] -translate-x-1/2 text-center font-display text-base font-bold text-bonga-orange sm:text-lg"
            >
              {floatText.text}
            </motion.p>
          )}
        </AnimatePresence>
        {meditating && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-bonga-lg bg-card/60 backdrop-blur-sm">
            <p className="font-display text-sm font-semibold text-bonga-teal">
              Breathe... peace, love, good bonks...
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center px-2">
        <Button
          variant="secondary"
          size="lg"
          className="h-12 w-full max-w-md gap-2 rounded-full text-base sm:w-auto sm:px-8"
          onClick={() => setShopOpen(true)}
        >
          <ShoppingBag className="h-5 w-5" />
          Plant Shop
        </Button>
      </div>

      <GardenQuests
        state={state}
        onComplete={tryQuest}
        onMeditate={handleMeditate}
        onAffirm={handleAffirm}
        onGoodDeed={handleGoodDeed}
      />

      <p className="text-center text-xs text-muted-foreground">
        Garden $BONGA saved locally · {GARDEN_DAILY_EARN_CAP}/day cap · idle up to 8h offline ·{" "}
        {state.lifetimeWaters} lifetime waters
      </p>

      <GardenShop
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        state={state}
        isNftHolder={isHolder}
        onBuy={handleBuy}
        message={shopMsg}
      />
    </div>
  );
}