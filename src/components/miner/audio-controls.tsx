"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { gameAudio } from "@/lib/audio/audio-manager";
import type { AudioSettings } from "@/lib/audio/sound-config";
import { Music, Volume2, VolumeX, Settings2 } from "lucide-react";

function VolumeSlider({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-bonga-orange disabled:opacity-40"
      />
    </div>
  );
}

export function AudioControls() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<AudioSettings>(gameAudio.getSettings());

  useEffect(() => {
    return gameAudio.subscribe(setSettings);
  }, []);

  const update = (partial: Partial<AudioSettings>) => {
    gameAudio.updateSettings(partial);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bonga-card w-56 p-4 shadow-bonga-lg"
          >
            <p className="mb-3 font-display text-sm font-bold tracking-tight">Sound</p>

            <div className="mb-3 flex gap-2">
              <Button
                variant={settings.muted ? "outline" : "secondary"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => gameAudio.toggleMute()}
              >
                {settings.muted ? (
                  <VolumeX className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <Volume2 className="mr-1 h-3.5 w-3.5" />
                )}
                {settings.muted ? "Unmute" : "Mute"}
              </Button>
              <Button
                variant={settings.musicEnabled ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => gameAudio.toggleMusic()}
              >
                <Music className="mr-1 h-3.5 w-3.5" />
                {settings.musicEnabled ? "Music On" : "Music Off"}
              </Button>
            </div>

            <div className="space-y-3">
              <VolumeSlider
                label="Master"
                value={settings.masterVolume}
                disabled={settings.muted}
                onChange={(v) => update({ masterVolume: v })}
              />
              <VolumeSlider
                label="Bonk SFX"
                value={settings.sfxVolume}
                disabled={settings.muted}
                onChange={(v) => update({ sfxVolume: v })}
              />
              <VolumeSlider
                label="Reggae Music"
                value={settings.musicVolume}
                disabled={settings.muted || !settings.musicEnabled}
                onChange={(v) => update({ musicVolume: v })}
              />
            </div>

            <p className="mt-2 text-xs font-medium text-bonga-teal">
              {settings.musicEnabled ? "♪ Now playing: Reggae Bonk Vibes (for the Miner)" : "Music paused"}
            </p>
            <p className="mt-1 text-[9px] leading-tight text-muted-foreground">
              Music: "B-Roll - Islandesque" by Kevin MacLeod (incompetech.com) • CC BY 4.0<br />
              Drop custom as <code className="rounded bg-muted px-1">/public/sounds/reggae-bonk.mp3</code> or edit config.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant="peace"
        size="icon"
        className="h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label="Audio settings"
      >
        {settings.muted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Settings2 className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}