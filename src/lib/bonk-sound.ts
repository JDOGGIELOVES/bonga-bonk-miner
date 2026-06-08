/**
 * @deprecated Use gameAudio from @/lib/audio/audio-manager instead.
 * Kept for backward compatibility.
 */
import { gameAudio } from "@/lib/audio/audio-manager";

export function playBonkSound(intensity = 1) {
  void gameAudio.resume();
  const combo = Math.round((intensity - 0.8) / 0.05);
  gameAudio.playBonk(combo);
}

export function playBongaEarnedSound() {
  void gameAudio.resume();
  gameAudio.playCoinCollect();
}