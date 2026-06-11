"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { GardenVisual } from "@/components/garden/garden-visual";
import { GardenShop } from "@/components/garden/garden-shop";
import { GardenQuests } from "@/components/garden/garden-quests";
import { GardenClaimBonga } from "@/components/garden/garden-claim-bonga";
import { buildBootstrapAction, syncGardenActions, fetchGardenEarnStatus, type GardenEarnStatus } from "@/lib/garden-sync-client";
import type { GardenSyncAction } from "@/lib/garden-sync-server";
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
import Link from "next/link";

export function VibesGardenGame({ onClaimSuccess }: { onClaimSuccess?: () => void } = {}) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { isHolder, checking } = useBongaNftHolder();
  const [state, setState] = useState<GardenState | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopMsg, setShopMsg] = useState("");
  const [meditating, setMeditating] = useState(false);
  const floatId = useRef(0);
  const isHolderRef = useRef(isHolder);
  const catchupDoneRef = useRef(false);
  const serverBootstrappedRef = useRef(false);
  const walletLinkedRef = useRef<string | null>(null);
  const syncInFlightRef = useRef(false);
  const pendingActionsRef = useRef<GardenSyncAction[]>([]);
  const [syncRefreshKey, setSyncRefreshKey] = useState(0);
  const [gardenStatus, setGardenStatus] = useState<GardenEarnStatus | null>(null);

  // Per-plant pop feedback for watering (localized, no layout shift on the game window).
  // General feedback for quests/affirms etc. (will render inside the visual area).
  const [plantPops, setPlantPops] = useState<Record<string, { id: number; text: string }>>({});
  const [generalFeedback, setGeneralFeedback] = useState<{ id: number; text: string } | null>(null);

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

  const flushGardenSync = useCallback(
    async (actions: GardenSyncAction[], currentState?: GardenState | null) => {
      if (!connected || !publicKey || actions.length === 0) return;
      if (syncInFlightRef.current) {
        pendingActionsRef.current.push(...actions);
        return;
      }

      syncInFlightRef.current = true;
      const wallet = publicKey.toBase58();
      const batch: GardenSyncAction[] = [...actions];

      if (!serverBootstrappedRef.current && currentState) {
        batch.unshift(buildBootstrapAction(currentState));
      }

      try {
        const result = await syncGardenActions({ wallet, actions: batch });
        if (result.ok) {
          if (result.bootstrapped) serverBootstrappedRef.current = true;
          setSyncRefreshKey((key) => key + 1);
        }
      } catch {
        /* local play continues */
      } finally {
        syncInFlightRef.current = false;
        const pending = pendingActionsRef.current.splice(0);
        if (pending.length > 0) {
          void flushGardenSync(pending, currentState);
        }
      }
    },
    [connected, publicKey]
  );

  const queueGardenSync = useCallback(
    (action: GardenSyncAction, currentState?: GardenState | null) => {
      if (!connected || !publicKey) return;
      void flushGardenSync([action], currentState);
    },
    [connected, publicKey, flushGardenSync]
  );

  useEffect(() => {
    serverBootstrappedRef.current = false;
    walletLinkedRef.current = null;
  }, [publicKey?.toBase58()]);

  useEffect(() => {
    if (!connected || !publicKey || !state) return;
    const wallet = publicKey.toBase58();
    if (walletLinkedRef.current === wallet) return;
    walletLinkedRef.current = wallet;
    void flushGardenSync([{ type: "tick", now: Date.now() }], state);
  }, [connected, publicKey, flushGardenSync, state]);

  useEffect(() => {
    if (!state || !catchupDoneRef.current) return;
    setState((prev) => (prev ? applyIdleEarnings(prev, isHolder) : prev));
  }, [isHolder, state]);

  useEffect(() => {
    if (!state) return;
    const tick = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setState((prev) => {
        if (!prev) return prev;
        const next = applyIdleEarnings(prev, isHolderRef.current);
        queueGardenSync({ type: "tick", now: Date.now() }, next);
        return next;
      });
    }, 10000);
    return () => clearInterval(tick);
  }, [state, queueGardenSync]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setGardenStatus(null);
      return;
    }
    let cancelled = false;
    void fetchGardenEarnStatus(publicKey.toBase58()).then((status) => {
      if (!cancelled) setGardenStatus(status);
    });
    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, syncRefreshKey]);

  const showPlantPop = useCallback((instanceId: string, text: string) => {
    const id = ++floatId.current;
    setPlantPops((prev) => ({ ...prev, [instanceId]: { id, text } }));
    setTimeout(() => {
      setPlantPops((prev) => {
        const next = { ...prev };
        if (next[instanceId]?.id === id) delete next[instanceId];
        return next;
      });
    }, 1200);
  }, []);

  const showGeneralFeedback = useCallback((text: string) => {
    const id = ++floatId.current;
    setGeneralFeedback({ id, text });
    setTimeout(() => setGeneralFeedback((f) => (f?.id === id ? null : f)), 1200);
  }, []);

  const handleWater = useCallback(
    (instanceId: string) => {
      if (!state) return;
      void gameAudio.resume();
      const { state: next, earned, capped } = waterPlant(state, instanceId, isHolder);
      setState(next);
      queueGardenSync({ type: "water", instanceId }, next);
      if (earned > 0) {
        showPlantPop(instanceId, `+${earned.toFixed(2)} $BONGA`);
        gameAudio.playCoinCollect();
      } else if (capped) {
        showPlantPop(instanceId, `Daily cap reached`);
      }
    },
    [state, isHolder, showPlantPop, queueGardenSync]
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
      queueGardenSync(
        { type: "buy", plantTypeId, zone },
        result.state
      );
      setShopMsg(`Planted in ${zone}! Stacks with your other plants. 🌼`);
      setTimeout(() => setShopMsg(""), 3000);
      gameAudio.playCoinCollect();
    },
    [state, isHolder, queueGardenSync]
  );

  const tryQuest = useCallback(
    (questId: string) => {
      if (!state) return;
      const result = completeQuest(state, questId);
      if (result.ok && result.reward > 0) {
        setState(result.state);
        queueGardenSync({ type: "quest", questId }, result.state);
        showGeneralFeedback(`Quest +${result.reward} $BONGA`);
      } else if (result.capped) {
        showGeneralFeedback(`Daily cap (${GARDEN_DAILY_EARN_CAP}) reached`);
      }
    },
    [state, showGeneralFeedback, queueGardenSync]
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
    showGeneralFeedback(affirmation.emoji);
    tryQuest("affirm");
  }, [tryQuest, showGeneralFeedback]);

  const handleGoodDeed = useCallback(() => {
    showGeneralFeedback("Good vibes sent 🫶");
    tryQuest("good-deed");
  }, [tryQuest, showGeneralFeedback]);

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
          <p className="font-display text-xl font-bold text-bonga-orange tabular-nums">
            {formatGardenBonga(state.gardenBonga)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Farmed today</p>
          <p className={`font-display text-xl font-bold tabular-nums ${capReached ? "text-amber-600" : "text-foreground"}`}>
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
          <p className="font-display text-xl font-bold tabular-nums text-bonga-teal">{state.waterCountToday}</p>
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

      {gardenStatus && (
        <p className="text-center text-[10px] text-muted-foreground -mt-1 mb-1">
          Verified today: {gardenStatus.farmedToday.toFixed(2)} / {GARDEN_DAILY_EARN_CAP} (claimable from server)
        </p>
      )}

      {capReached && (
        <p className="rounded-bonga-lg border border-amber-300/40 bg-amber-50/60 px-4 py-2 text-center text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
          Daily farm cap reached ({GARDEN_DAILY_EARN_CAP} garden $BONGA). Resets at midnight UTC.
          You can still explore zones — taps and idle pause until tomorrow.
        </p>
      )}

      <GardenClaimBonga refreshKey={syncRefreshKey} onClaimSuccess={onClaimSuccess} />

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
                <span className="font-semibold text-foreground">Idle pacing</span> — plants grow
                slowly in the background. Check back through the day; most gardens need several
                hours to reach the {GARDEN_DAILY_EARN_CAP} garden $BONGA daily cap (idle + taps +
                quests).
              </li>
              <li>
                <span className="font-semibold text-foreground">Verified claims</span> — connect
                wallet to sync progress server-side. Only verified idle + taps count toward on-chain
                payouts (local numbers are for play).
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
          Hold a Bonga NFT for 2× garden earnings, Bonga Kush & exclusive plants.{" "}
          <Link href="/nft" className="font-semibold text-bonga-teal hover:underline">
            Mint one
          </Link>
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
          Connect wallet for 2× earnings & Bonga Kush
        </Button>
      )}

      <div className="relative">
        <GardenVisual
          plants={state.plants}
          onWater={handleWater}
          beautyLevel={beauty}
          plantPops={plantPops}
          generalFeedback={generalFeedback}
        />
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
        Garden $BONGA saved locally · {GARDEN_DAILY_EARN_CAP}/day cap · check back for idle gains ·{" "}
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