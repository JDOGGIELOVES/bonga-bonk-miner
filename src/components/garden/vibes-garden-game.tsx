"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { GardenVisual } from "@/components/garden/garden-visual";
import { GardenShop } from "@/components/garden/garden-shop";
import { GardenQuests } from "@/components/garden/garden-quests";
import { depositPendingToBank } from "@/lib/claim-client";
import { buildBootstrapAction, syncGardenActions, fetchGardenEarnStatus, type GardenEarnStatus } from "@/lib/garden-sync-client";
import type { GardenSyncAction } from "@/lib/garden-sync-server";
import { useBongaNftHolder } from "@/hooks/use-bonga-nft-holder";
import {
  GARDEN_DAILY_EARN_CAP,
  applyIdleEarnings,
  buyPlant,
  completeQuest,
  computeOfflineEarnings,
  formatGardenBonga,
  formatNextDailyReset,
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
import { LiveRadioPlayer } from "@/components/audio/LiveRadioPlayer";
import { Info, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export function VibesGardenGame({ onClaimSuccess }: { onClaimSuccess?: () => void } = {}) {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { isHolder, checking } = useBongaNftHolder();
  const walletAddress = publicKey?.toBase58() ?? null;
  const [state, setState] = useState<GardenState | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopMsg, setShopMsg] = useState("");
  const [meditating, setMeditating] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);
  const floatId = useRef(0);
  const isHolderRef = useRef(isHolder);
  const catchupDoneRef = useRef(false);
  const serverBootstrappedRef = useRef(false);
  const walletLinkedRef = useRef<string | null>(null);
  const syncInFlightRef = useRef(false);
  const pendingActionsRef = useRef<GardenSyncAction[]>([]);
  const [syncRefreshKey, setSyncRefreshKey] = useState(0);
  const [gardenStatus, setGardenStatus] = useState<GardenEarnStatus | null>(null);
  const [gardenDepositLoading, setGardenDepositLoading] = useState(false);

  // Per-plant pop feedback for watering (localized, no layout shift on the game window).
  // General feedback for quests/affirms etc. (will render inside the visual area).
  const [plantPops, setPlantPops] = useState<Record<string, { id: number; text: string }>>({});
  const [generalFeedback, setGeneralFeedback] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    isHolderRef.current = isHolder;
  }, [isHolder]);

  useEffect(() => {
    const loaded = loadGardenState(walletAddress);
    setState(loaded);
  }, [walletAddress]);

  useEffect(() => {
    if (!state) return;
    saveGardenState(state, walletAddress);
  }, [state, walletAddress]);

  useEffect(() => {
    if (!state || catchupDoneRef.current || checking) return;
    catchupDoneRef.current = true;

    // Compute & surface a friendly "welcome back" offline earnings notice
    const offline = computeOfflineEarnings(state, isHolder);
    if (offline > 0.01) {
      setOfflineNotice(`Welcome back — your garden grew +${offline.toFixed(2)} $BONGA while you were away 🌱`);
      // Auto-hide after a nice readable moment
      setTimeout(() => setOfflineNotice((cur) => (cur ? null : cur)), 5200);
    }

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
    // Longer duration so people can actually read it (especially on mobile)
    setTimeout(() => setGeneralFeedback((f) => (f?.id === id ? null : f)), 3000);
  }, []);

  const handleWater = useCallback(
    (instanceId: string) => {
      if (!state) return;
      // Start House Attack Radio (live) *synchronously* on this user gesture (water/plant). Critical for autoplay.
      // Resume for WebAudio (SFX) can be async.
      const s = gameAudio.getSettings();
      if (s.musicEnabled && !s.muted) {
        gameAudio.startMusic();
      }
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

      // Auto deposit to personal Bonga Bank Vault as mined (no manual move/claim in game)
      if (connected && walletAddress) {
        depositPendingToBank({ wallet: walletAddress, source: "garden" }).catch(() => {});
      }
    },
    [state, isHolder, showPlantPop, queueGardenSync, connected, walletAddress]
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
        showGeneralFeedback(`Daily cap (${GARDEN_DAILY_EARN_CAP}) reached — earnings go to Bonga Bank`);
      }

      // Auto deposit to personal Bonga Bank Vault as earned
      if (connected && walletAddress) {
        depositPendingToBank({ wallet: walletAddress, source: "garden" }).catch(() => {});
      }
    },
    [state, showGeneralFeedback, queueGardenSync, connected, walletAddress]
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
    // Complete the quest first (gives the +3 reward feedback)
    tryQuest("affirm");
    // Then show the actual affirmation text so the user can read it
    setTimeout(() => {
      const shortText = affirmation.text.length > 92 
        ? affirmation.text.slice(0, 89) + "..." 
        : affirmation.text;
      showGeneralFeedback(`${affirmation.emoji}  ${shortText}`);
    }, 220);
  }, [tryQuest, showGeneralFeedback]);

  const handleGoodDeed = useCallback(() => {
    showGeneralFeedback("Good vibes sent 🫶");
    tryQuest("good-deed");
  }, [tryQuest, showGeneralFeedback]);

  // Manual deposit button for consistency with Tap Miner and Staking.
  // Auto-deposits already happen on water/quest, but this gives explicit "Deposit to Bank" control + loading UI + timeout protection like miner.
  const handleDepositToBank = useCallback(async () => {
    if (!publicKey) return;
    setGardenDepositLoading(true);
    try {
      const depositPromise = depositPendingToBank({ 
        wallet: publicKey.toBase58(), 
        source: "garden" 
      });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Deposit timeout - please try the Bonga Bank page sync instead")), 8000)
      );
      await Promise.race([depositPromise, timeoutPromise]);

      // Refresh server verified status (farmedToday etc. may update)
      const status = await fetchGardenEarnStatus(publicKey.toBase58());
      if (status) setGardenStatus(status);
    } catch (e: any) {
      console.warn("Garden deposit issue:", e?.message);
    } finally {
      setGardenDepositLoading(false);
    }
  }, [publicKey]);

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
  const capReached = gardenStatus 
    ? (gardenStatus.farmedToday >= GARDEN_DAILY_EARN_CAP) 
    : isDailyEarnCapReached(state);

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
            {gardenStatus ? formatGardenBonga(gardenStatus.farmedToday) : formatGardenBonga(state.bongaFarmedToday)}
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

      {/* Manual deposit for consistency with Bonk Miner (has "Deposit Pending..." button) and Staking.
          Auto deposit happens on water/quests, this provides explicit sync + loading state like the other games. */}
      {connected && publicKey && (
        <div className="flex justify-center -mt-2 mb-1">
          <Button
            variant="outline"
            size="sm"
            className="text-[10px] tracking-wider"
            disabled={gardenDepositLoading}
            onClick={handleDepositToBank}
          >
            {gardenDepositLoading ? "Depositing to Vault..." : "Deposit to Bonga Bank Vault"}
          </Button>
        </div>
      )}

      {/* Clear daily limit progress bar + label */}
      {(() => {
        const farmed = gardenStatus ? gardenStatus.farmedToday : state.bongaFarmedToday;
        const cap = GARDEN_DAILY_EARN_CAP;
        const pct = Math.min(100, Math.max(0, (farmed / cap) * 100));
        return (
          <div className="bonga-card px-4 py-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              <span>Daily garden cap (to Bonga Bank)</span>
              <span className={capReached ? "text-amber-600 font-semibold" : "font-medium"}>
                {formatGardenBonga(farmed)} / {cap} $BONGA
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted/60 overflow-hidden">
              <motion.div
                className={`h-full rounded-full transition-all ${capReached ? "bg-amber-500" : "bg-gradient-to-r from-bonga-teal via-bonga-green to-bonga-teal"}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {capReached ? "Cap reached — resets at midnight UTC" : `${(100 - pct).toFixed(0)}% remaining today`}
            </p>
          </div>
        );
      })()}

      {gardenStatus && (
        <p className="text-center text-[10px] text-muted-foreground -mt-1 mb-1">
          Verified today: {gardenStatus.farmedToday.toFixed(2)} / {GARDEN_DAILY_EARN_CAP} (to Bonga Bank Vault)
        </p>
      )}

      <p className="text-center text-[10px] text-muted-foreground mb-1">
        Next daily reset: {formatNextDailyReset()}
      </p>

      {capReached && (
        <p className="rounded-bonga-lg border border-amber-300/40 bg-amber-50/60 px-4 py-2 text-center text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
          Daily farm cap reached ({GARDEN_DAILY_EARN_CAP} garden $BONGA). Resets at midnight UTC.
          All earnings go to Bonga Bank Vault. Idle and taps pause until tomorrow.
        </p>
      )}

      {/* Friendly offline earnings notice — shows once on return */}
      <AnimatePresence>
        {offlineNotice && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-bonga-lg border border-bonga-teal/40 bg-bonga-teal/10 px-4 py-2.5 text-center text-sm font-medium text-bonga-teal"
          >
            {offlineNotice}
          </motion.div>
        )}
      </AnimatePresence>



      <div className="bonga-card border-bonga-teal/20 bg-gradient-to-br from-bonga-teal/5 to-bonga-purple/5 p-4">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-bonga-teal" />
          <div className="min-w-0 text-sm">
            <p className="font-display font-bold text-foreground">How the garden works</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">One beautiful garden</span> — plant Peace Lily, Love Lotus, Frequency Crystal, or Affirmation Tree. The central garden grows visibly more lush the more friends you add.
              </li>
              <li>
                Tap any plant to water and earn instantly. Plants earn idle $BONGA in the background even when closed.
              </li>
              <li>
                Daily cap {GARDEN_DAILY_EARN_CAP} garden $BONGA total (idle + taps + quests). All earnings auto-deposit to your Bonga Bank Vault. Resets at midnight UTC.
              </li>
              <li>
                <strong>$BONGA can only be claimed on-chain after your BONGA BANK VAULT reaches 10,000 $BONGA.</strong> Small verified claims go straight to bank (no SOL cost).
              </li>
              <li>
                <span className="font-semibold text-foreground">NFT holders</span> get +25% yield on everything. Connect wallet to activate.
              </li>
              <li>
                Local progress saved automatically. Connect wallet to verify earnings for on-chain claims.
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
          Hold a Bonga NFT for +25% garden yield.{" "}
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
          Connect wallet for +25% yield
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

      {/* Prominent, consistent Live Radio controls — same component as in the Miner */}
      <div className="mx-auto w-full max-w-md px-2">
        <LiveRadioPlayer />
      </div>

      {/* Prominent daily affirmation — one tap peace moment */}
      <div className="flex justify-center px-2">
        <Button
          variant="peace"
          size="lg"
          className="h-12 w-full max-w-md gap-2 rounded-full text-base shadow-sm"
          onClick={handleAffirm}
        >
          🌼 Daily Affirmation
        </Button>
      </div>

      <div className="flex justify-center px-2">
        <Button
          variant="secondary"
          size="lg"
          className="h-11 w-full max-w-md gap-2 rounded-full text-base sm:w-auto sm:px-8"
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
        Saved in your browser · {GARDEN_DAILY_EARN_CAP} $BONGA daily cap (to Bonga Bank) · idle keeps running · {state.lifetimeWaters} waters
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