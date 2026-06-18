"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { gameAudio } from "@/lib/audio/audio-manager";
import type { AudioSettings } from "@/lib/audio/sound-config";
import { Play, Square, Radio } from "lucide-react";

export function LiveRadioPlayer() {
  const [settings, setSettings] = useState<AudioSettings>(gameAudio.getSettings());

  useEffect(() => {
    return gameAudio.subscribe((s) => {
      setSettings(s);
    });
  }, []);

  const isPlaying = !!settings.musicEnabled && !settings.muted;

  const handleToggle = () => {
    gameAudio.toggleMusic();
  };

  return (
    <div className="bonga-card mx-auto w-full max-w-md p-5 text-center">
      <div className="mb-1 flex items-center justify-center gap-2">
        <Radio className="h-4 w-4 text-bonga-teal" />
        <span className="text-xs font-semibold uppercase tracking-[2px] text-bonga-teal">
          Live 24/7
        </span>
      </div>

      <div className="mb-2 font-display text-xl font-semibold tracking-tight">
        House Attack Radio
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        Underground • Tech House • Deep House • Techno
      </p>

      <Button
        onClick={handleToggle}
        variant={isPlaying ? "destructive" : "default"}
        size="lg"
        className="w-full max-w-[260px] gap-2 text-base font-semibold"
      >
        {isPlaying ? (
          <>
            <Square className="h-4 w-4" />
            Stop Radio
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Play Live Radio
          </>
        )}
      </Button>

      {isPlaying && (
        <p className="mt-3 text-xs font-medium text-bonga-teal">
          ♪ Streaming live from radio.garden
        </p>
      )}

      {!isPlaying && (
        <p className="mt-3 text-[10px] text-muted-foreground">
          Tap to start the continuous house stream
        </p>
      )}
    </div>
  );
}
