"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  ExternalLink,
  Heart,
  Loader2,
  PawPrint,
  Shield,
  Sparkles,
  Upload,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PET_LOVE_REWARD, PET_TYPE_OPTIONS } from "@/lib/pet-love";
import {
  claimPetReward,
  fetchPetGallery,
  fetchPetStatus,
  submitPetPhoto,
  type PetGalleryItem,
  type PetStatus,
} from "@/lib/pet-claim-client";
import {
  hashImageFile,
  verifyPetPhotoOnDevice,
} from "@/lib/pet-verify-client";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function petEmoji(label: string) {
  const map: Record<string, string> = {
    cat: "🐱",
    dog: "🐶",
    bird: "🐦",
    horse: "🐴",
    sheep: "🐑",
    cow: "🐄",
    elephant: "🐘",
    bear: "🐻",
    zebra: "🦓",
    giraffe: "🦒",
  };
  return map[label] ?? "🐾";
}

export function PetLoveModule() {
  const { connected, publicKey, signMessage, wallet: connectedWallet } = useWallet();
  const { setVisible } = useWalletModal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [gallery, setGallery] = useState<PetGalleryItem[]>([]);
  const [status, setStatus] = useState<PetStatus | null>(null);
  const [todaySubmission, setTodaySubmission] = useState<PetGalleryItem | null>(
    null
  );
  const actionsRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifyState, setVerifyState] = useState<
    "idle" | "checking" | "passed" | "assist" | "failed"
  >("idle");
  const [verifyReason, setVerifyReason] = useState("");
  const [petLabel, setPetLabel] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  const refreshGallery = useCallback(async () => {
    const items = await fetchPetGallery();
    setGallery(items);
  }, []);

  const refreshStatus = useCallback(async (wallet: string) => {
    const next = await fetchPetStatus(wallet);
    setStatus(next);
    return next;
  }, []);

  useEffect(() => {
    void refreshGallery();
  }, [refreshGallery]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setStatus(null);
      setTodaySubmission(null);
      return;
    }
    void (async () => {
      const next = await refreshStatus(publicKey.toBase58());
      if (next.submittedToday && next.submission) {
        setTodaySubmission(next.submission);
      }
    })();
  }, [connected, publicKey, refreshStatus]);

  const activeSubmission = status?.submission ?? todaySubmission;
  const hasSubmittedToday =
    status?.submittedToday === true || todaySubmission != null;

  const galleryItems = useMemo(() => {
    const byId = new Map<string, PetGalleryItem>();
    for (const item of gallery) byId.set(item.id, item);
    if (todaySubmission) byId.set(todaySubmission.id, todaySubmission);
    if (status?.submission) byId.set(status.submission.id, status.submission);
    return Array.from(byId.values()).sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt)
    );
  }, [gallery, status?.submission, todaySubmission]);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setVerifyState("idle");
    setVerifyReason("");
    setPetLabel("");
    setConfidence(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (file: File | null) => {
    resetSelection();
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setVerifyState("checking");
    setError("");

    const result = await verifyPetPhotoOnDevice(file);
    if (result.ok) {
      setVerifyState("passed");
      setPetLabel(result.petLabel);
      setConfidence(result.confidence);
      setVerifyReason(`Looks good — ${result.petLabel} and hand petting detected.`);
    } else if ("assist" in result && result.assist) {
      setVerifyState("assist");
      setPetLabel(result.defaultPet);
      setConfidence(result.assistedConfidence);
      setVerifyReason(result.reason);
    } else {
      setVerifyState("failed");
      setVerifyReason(result.reason);
    }
  };

  const handleSubmit = async () => {
    if (
      !connected ||
      !publicKey ||
      !selectedFile ||
      (verifyState !== "passed" && verifyState !== "assist") ||
      !petLabel
    ) {
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const wallet = publicKey.toBase58();
      const imageHash = await hashImageFile(selectedFile);
      const result = await submitPetPhoto({
        wallet,
        date: todayKey(),
        file: selectedFile,
        imageHash,
        petLabel,
        confidence,
        connectedWallet,
        signMessage,
      });

      setTodaySubmission(result.submission);
      setGallery((prev) => [
        result.submission,
        ...prev.filter((item) => item.id !== result.submission.id),
      ]);

      const nextStatus = await fetchPetStatus(wallet);
      setStatus(
        nextStatus.submittedToday
          ? nextStatus
          : {
              ...nextStatus,
              submittedToday: true,
              submission: result.submission,
            }
      );

      const items = await fetchPetGallery();
      if (items.length > 0) {
        setGallery(items);
      }

      setMessage("Shared with the community! Claim your daily reward below.");
      resetSelection();
      requestAnimationFrame(() => {
        actionsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async () => {
    if (!connected || !publicKey || !activeSubmission) return;

    setClaiming(true);
    setError("");
    setMessage("");
    setExplorerUrl(null);

    try {
      const wallet = publicKey.toBase58();
      const result = await claimPetReward({
        wallet,
        date: todayKey(),
        submissionId: activeSubmission.id,
        connectedWallet,
        signMessage,
      });

      setMessage(`Sent ${result.amount} $BONGA on-chain!`);
      setExplorerUrl(result.explorerUrl);
      await refreshStatus(wallet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setClaiming(false);
    }
  };

  const alreadyClaimed = status?.claimedToday === true;
  const canClaim =
    hasSubmittedToday && !alreadyClaimed && status?.treasuryEnabled === true;

  return (
    <div className="space-y-8">
      <div className="bonga-card border-bonga-teal/20 bg-gradient-to-br from-bonga-teal/5 via-card to-bonga-purple/5 p-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bonga-teal/15 text-bonga-teal">
            <PawPrint className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold">Pet Love Daily</h3>
              <Badge variant="teal">{PET_LOVE_REWARD} $BONGA / day</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Share a photo of your hand petting any pet — cats, dogs, birds,
              horses, and more. Stay anonymous if you like; we only need the
              gentle hand-and-pet moment, not your face.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1">
                <Shield className="h-3 w-3" /> Verified on your device — free & private
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1">
                <Heart className="h-3 w-3" /> One upload per wallet per day
              </span>
            </div>
          </div>
        </div>
      </div>

      {galleryItems.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-base font-bold">
              Community Pet Gallery
            </h3>
            <p className="text-xs text-muted-foreground">Anonymous — wallets hidden</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {galleryItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                className="group overflow-hidden rounded-2xl border border-border/50 bg-card"
              >
                <div className="relative aspect-square bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imagePath}
                    alt={`Anonymous pet love — ${item.petLabel}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs font-medium capitalize">
                    {petEmoji(item.petLabel)} {item.petLabel}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.date}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div ref={actionsRef} className="bonga-card p-6">
        {!connected ? (
          <div className="text-center">
            <div className="relative mx-auto h-20 w-20">
              <Image
                src="/bonga-character.png"
                alt="Bonga"
                fill
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Connect your wallet to share today&apos;s pet love photo and earn{" "}
              {PET_LOVE_REWARD} $BONGA.
            </p>
            <Button variant="peace" className="mt-4" onClick={() => setVisible(true)}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </div>
        ) : hasSubmittedToday ? (
          <div className="space-y-4 text-center">
            {activeSubmission && (
              <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-border/50">
                <div className="relative aspect-square bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSubmission.imagePath}
                    alt="Your pet love submission"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="px-3 py-2 text-xs capitalize text-muted-foreground">
                  {petEmoji(activeSubmission.petLabel)} {activeSubmission.petLabel} · shared today
                </p>
              </div>
            )}
            <p className="text-sm font-medium text-bonga-teal">
              Your pet photo is in the gallery. One upload per wallet per UTC day.
            </p>
            {canClaim ? (
              <Button
                variant="peace"
                className="w-full max-w-sm"
                onClick={() => void handleClaim()}
                disabled={claiming}
              >
                {claiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending on-chain...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Claim {PET_LOVE_REWARD} $BONGA
                  </>
                )}
              </Button>
            ) : alreadyClaimed ? (
              <Badge variant="green">Reward claimed today</Badge>
            ) : (
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Photo saved. On-chain claim is not available yet — treasury env vars
                may need to be set in Vercel (ON_CHAIN_CLAIMS_ENABLED).
              </p>
            )}
            {status?.dailyOnChainLimit != null &&
              status.dailyOnChainLimit < PET_LOVE_REWARD && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                Treasury daily cap is {status.dailyOnChainLimit} $BONGA — raise
                DAILY_CLAIM_LIMIT to {PET_LOVE_REWARD}+ in Vercel for full pet
                payouts.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
            />

            {previewUrl ? (
              <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-border/50">
                <div className="relative aspect-square bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Pet photo preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-bonga-teal/30 bg-bonga-teal/5 px-6 py-12 transition-colors hover:border-bonga-teal/50 hover:bg-bonga-teal/10"
              >
                <Camera className="h-8 w-8 text-bonga-teal" />
                <span className="mt-3 font-display text-sm font-bold">
                  Choose a hand + pet photo
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  Include your hand and some of your pet in frame — faces optional
                </span>
              </button>
            )}

            <AnimatePresence mode="wait">
              {verifyState === "checking" && (
                <motion.p
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking on your device (nothing leaves until you submit)...
                </motion.p>
              )}
              {verifyState === "passed" && (
                <motion.p
                  key="passed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-bonga-teal"
                >
                  {verifyReason}
                </motion.p>
              )}
              {verifyState === "assist" && (
                <motion.div
                  key="assist"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3 rounded-xl border border-amber-300/40 bg-amber-50/60 p-4 dark:bg-amber-950/20"
                >
                  <p className="text-center text-sm text-amber-800 dark:text-amber-200">
                    {verifyReason}
                  </p>
                  <p className="text-center text-xs text-muted-foreground">
                    What pet are you petting?
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {PET_TYPE_OPTIONS.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPetLabel(type)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                          petLabel === type
                            ? "bg-bonga-orange text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {petEmoji(type)} {type}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {verifyState === "failed" && (
                <motion.p
                  key="failed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-sm text-red-600 dark:text-red-400"
                >
                  {verifyReason}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-3">
              {previewUrl && (
                <Button variant="outline" onClick={resetSelection}>
                  Choose another
                </Button>
              )}
              {verifyState === "assist" ? (
                <Button
                  variant="peace"
                  className="flex-1"
                  disabled={!petLabel || submitting}
                  onClick={() => void handleSubmit()}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing & sharing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Confirm & share
                    </>
                  )}
                </Button>
              ) : (
              <Button
                variant="peace"
                className="flex-1"
                disabled={verifyState !== "passed" || submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing & sharing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Share to gallery
                  </>
                )}
              </Button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-bonga-teal/30 bg-bonga-teal/5 p-4 text-center text-sm text-bonga-teal"
            >
              {message}
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs underline"
                >
                  View on Solscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-red-300/40 bg-red-50/50 p-4 text-center text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}