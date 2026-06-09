"use client";

import { useEffect, useState } from "react";
import { peaceAudio } from "@/lib/audio/peace-audio";
import { peaceNarration } from "@/lib/audio/peace-narration";
import type { PeaceAudioSettings } from "@/lib/audio/peace-audio";
import { Mic, MicOff, Music, VolumeX } from "lucide-react";

function ToggleButton({
  title,
  onClick,
  active,
  muted,
  compact,
  children,
}: {
  title: string;
  onClick: () => void;
  active: boolean;
  muted?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        compact
          ? `rounded-full p-2 transition-colors ${
              active && !muted
                ? "bg-bonga-teal/10 text-bonga-teal"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          : `flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active && !muted
                ? "border-bonga-teal/40 text-bonga-teal"
                : "border-border/60 text-muted-foreground hover:border-bonga-teal/40 hover:text-foreground"
            }`
      }
    >
      {children}
    </button>
  );
}

export function PeaceAudioToggle({
  compact = false,
  showVoice = true,
  showMusic = true,
}: {
  compact?: boolean;
  showVoice?: boolean;
  showMusic?: boolean;
}) {
  const [settings, setSettings] = useState<PeaceAudioSettings>(
    peaceAudio.getSettings()
  );

  useEffect(() => peaceAudio.subscribe(setSettings), []);

  const voiceSupported = peaceNarration.isSupported();

  return (
    <div
      className={compact ? "flex items-center gap-0.5" : "flex flex-wrap items-center gap-2"}
      onContextMenu={(e) => {
        e.preventDefault();
        peaceAudio.toggleMute();
        if (peaceAudio.getSettings().muted) peaceNarration.cancel();
      }}
      title={settings.muted ? "All sound muted — right-click to unmute" : undefined}
    >
      {settings.muted && (
        <ToggleButton
          title="All sound muted — right-click to unmute"
          onClick={() => peaceAudio.toggleMute()}
          active={false}
          muted
          compact={compact}
        >
          <VolumeX className="h-4 w-4" />
          {!compact && <span>Muted</span>}
        </ToggleButton>
      )}

      {showMusic && (
        <ToggleButton
          title={
            settings.musicEnabled
              ? "Ambient music on"
              : "Ambient music off"
          }
          onClick={() => peaceAudio.toggleMusic()}
          active={settings.musicEnabled}
          muted={settings.muted}
          compact={compact}
        >
          <Music className="h-4 w-4" />
          {!compact && (
            <span>{settings.musicEnabled ? "Music on" : "Music off"}</span>
          )}
        </ToggleButton>
      )}

      {showVoice && voiceSupported && (
        <ToggleButton
          title={
            settings.voiceEnabled
              ? "Voice guide on"
              : "Voice guide off"
          }
          onClick={() => {
            peaceAudio.toggleVoice();
            if (!peaceAudio.getSettings().voiceEnabled) peaceNarration.cancel();
          }}
          active={settings.voiceEnabled}
          muted={settings.muted}
          compact={compact}
        >
          {settings.voiceEnabled ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
          {!compact && (
            <span>{settings.voiceEnabled ? "Voice on" : "Voice off"}</span>
          )}
        </ToggleButton>
      )}
    </div>
  );
}