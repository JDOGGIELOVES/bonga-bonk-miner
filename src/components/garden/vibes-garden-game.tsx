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
  applyIdleEarnings,
  buyPlant,
  completeQuest,
  formatGardenBonga,
  gardenBeautyLevel,
  getNftMultiplier,
  loadGardenState,
  saveGardenState,
  waterPlant,
  type GardenState,
} from "@/lib/vibes-garden";
import { getTodaysAffirmation } from "@/lib/bonga-affirmations";
import { gameAudio } from "@/lib/audio/audio-manager";
import { ShoppingBag, Sparkles, Wallet } from "lucide-react";
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

  // Keep latest isHolder for interval without thrashing the effect
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

  // One-time offline catch-up using the final holder status (after hook finishes check/cache)
  useEffect(() => {
    if (!state || catchupDoneRef.current || checking) return;
    catchupDoneRef.current = true;
    setState((prev) => (prev ? applyIdleEarnings(prev, isHolder) : prev));
  }, [state, isHolder, checking]);

  useEffect(() => {
    if (!state) return;
    const tick = setInterval(() => {
      // Pause when tab is hidden to reduce background CPU (prevents high load / potential instability)
      if (document.hidden) return;
      setState((prev) =>
        prev ? applyIdleEarnings(prev, isHolderRef.current) : prev
      );
    }, 5000); // Throttled from 1s → 5s for much lower main-thread churn while still feeling live
    return () => clearInterval(tick);
  }, [state]);

  // When holder status changes while playing (e.g. connect mid-session), apply forward at new rate.
  // Guard with catchupDone so we don't poison lastTick with wrong mult during initial holder check.
  useEffect(() => {
    if (!state || !catchupDoneRef.current) return;
    setState((prev) => (prev ? applyIdleEarnings(prev, isHolder) : prev));
  }, [isHolder]);

  const showFloat = useCallback((text: string) => {
    const id = ++floatId.current;
    setFloatText({ id, text });
    setTimeout(() => setFloatText((f) => (f?.id === id ? null : f)), 900);
  }, []);

  const handleWater = useCallback(
    (instanceId: string) => {
      if (!state) return;
      void gameAudio.resume();
      const { state: next, earned } = waterPlant(state, instanceId, isHolder);
      setState(next);
      if (earned > 0) {
        showFloat(`+${earned.toFixed(2)} $BONGA`);
        gameAudio.playCoinCollect();
      }
    },
    [state, isHolder, showFloat]
  );

  const handleBuy = useCallback(
    (plantTypeId: string) => {
      if (!state) return;
      const result = buyPlant(state, plantTypeId, isHolder);
      if (!result.ok) {
        setShopMsg(result.reason ?? "Could not plant.");
        setTimeout(() => setShopMsg(""), 3000);
        return;
      }
      setState(result.state);
      setShopMsg("Planted! Water it to spread vibes. 🌼");
      setTimeout(() => setShopMsg(""), 3000);
      gameAudio.playCoinCollect();
    },
    [state, isHolder]
  );

  const tryQuest = useCallback(
    (questId: string) => {
      if (!state) return;
      const result = completeQuest(state, questId);
      if (result.ok) {
        setState(result.state);
        showFloat(`Quest +${result.reward} $BONGA`);
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

  return (
    <div className="space-y-4">
      <div className="bonga-card grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Garden $BONGA</p>
          <p className="font-display text-xl font-bold text-bonga-orange">
            {formatGardenBonga(state.gardenBonga)}
          </p>
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
      </div>

      {connected && isHolder && (
        <div className="flex items-center gap-2 rounded-bonga-lg border border-bonga-purple/30 bg-bonga-purple/10 px-4 py-2 text-sm text-bonga-purple">
          <Sparkles className="h-4 w-4 shrink-0" />
          {nftBonus.label}
        </div>
      )}

      {connected && !checking && !isHolder && (
        <p className="text-center text-xs text-muted-foreground">
          Hold a Bonga NFT for rare plants & vibe multipliers.{" "}
          <a href="/nft" className="font-semibold text-bonga-teal hover:underline">
            Mint one
          </a>
        </p>
      )}

      {!connected && (
        <Button
          variant="outline"
          size="sm"
          className="mx-auto flex gap-2 rounded-full"
          onClick={() => setVisible(true)}
        >
          <Wallet className="h-4 w-4" />
          Connect wallet for NFT garden perks
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
              className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 font-display text-lg font-bold text-bonga-orange"
            >
              {floatText.text}
            </motion.p>
          )}
        </AnimatePresence>
        {meditating && (
          <div className="absolute inset-0 flex items-center justify-center rounded-bonga-lg bg-card/60 backdrop-blur-sm">
            <p className="font-display text-sm font-semibold text-bonga-teal">
              Breathe... peace, love, good bonks...
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="gap-2 rounded-full px-5"
          onClick={() => setShopOpen(true)}
        >
          <ShoppingBag className="h-4 w-4" />
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
        Garden $BONGA is saved locally · idle up to 8h offline · {state.lifetimeWaters} lifetime waters
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