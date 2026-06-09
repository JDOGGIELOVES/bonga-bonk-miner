"use client";

import { useEffect, useState } from "react";
import { peaceAudio } from "@/lib/audio/peace-audio";
import type { PeaceAudioSettings } from "@/lib/audio/peace-audio";
import { Music, Volume2, VolumeX } from "lucide-react";

export function PeaceAudioToggle({ compact = false }: { compact?: boolean }) {
  const [settings, setSettings] = useState<PeaceAudioSettings>(
    peaceAudio.getSettings()
  );

  useEffect(() => peaceAudio.subscribe(setSettings), []);

  const icon = settings.muted ? (
    <VolumeX className="h-4 w-4" />
  ) : settings.musicEnabled ? (
    <Music className="h-4 w-4" />
  ) : (
    <Volume2 className="h-4 w-4" />
  );

  return (
    <button
      type="button"
      onClick={() => peaceAudio.toggleMusic()}
      onContextMenu={(e) => {
        e.preventDefault();
        peaceAudio.toggleMute();
      }}
      title={
        settings.muted
          ? "Sound muted — right-click to unmute"
          : settings.musicEnabled
            ? "Ambient music on — click to turn off"
            : "Ambient music off — click to turn on"
      }
      className={
        compact
          ? "rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          : "flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-bonga-teal/40 hover:text-foreground"
      }
    >
      {icon}
      {!compact && (
        <span>{settings.musicEnabled && !settings.muted ? "Music on" : "Music off"}</span>
      )}
    </button>
  );
}