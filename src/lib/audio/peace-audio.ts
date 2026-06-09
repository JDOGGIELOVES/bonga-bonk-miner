import { SOUND_PATHS } from "./sound-config";
import {
  playPeaceBeginChime,
  playPeaceEndChime,
  playPeaceStepTick,
  startProceduralPeaceBgm,
  type BgmHandle,
} from "./procedural-sounds";

export const PEACE_AUDIO_SETTINGS_KEY = "bonga-peace-audio";

export const DEFAULT_PEACE_AUDIO_SETTINGS = {
  muted: false,
  musicEnabled: true,
  voiceEnabled: true,
  sfxVolume: 0.75,
  musicVolume: 0.3,
} as const;

export type PeaceAudioSettings = {
  muted: boolean;
  musicEnabled: boolean;
  voiceEnabled: boolean;
  sfxVolume: number;
  musicVolume: number;
};

function loadPeaceAudioSettings(): PeaceAudioSettings {
  if (typeof window === "undefined") return { ...DEFAULT_PEACE_AUDIO_SETTINGS };
  try {
    const raw = localStorage.getItem(PEACE_AUDIO_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_PEACE_AUDIO_SETTINGS };
    return { ...DEFAULT_PEACE_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PEACE_AUDIO_SETTINGS };
  }
}

function savePeaceAudioSettings(settings: PeaceAudioSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PEACE_AUDIO_SETTINGS_KEY, JSON.stringify(settings));
}

class PeaceAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private settings: PeaceAudioSettings = { ...DEFAULT_PEACE_AUDIO_SETTINGS };
  private bgmBuffer: AudioBuffer | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmElementGain: GainNode | null = null;
  private proceduralBgm: BgmHandle | null = null;
  private sessionActive = false;
  private initialized = false;
  private listeners = new Set<(s: PeaceAudioSettings) => void>();

  getSettings() {
    return { ...this.settings };
  }

  subscribe(listener: (s: PeaceAudioSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const s = this.getSettings();
    this.listeners.forEach((l) => l(s));
    savePeaceAudioSettings(s);
  }

  private async init() {
    if (this.initialized || typeof window === "undefined") return;
    this.settings = loadPeaceAudioSettings();
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    this.applyGainValues();
    this.initialized = true;
    void this.preloadBgm();
  }

  async resume() {
    await this.init();
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
  }

  private applyGainValues() {
    if (!this.masterGain || !this.sfxGain || !this.musicGain) return;
    this.masterGain.gain.value = this.settings.muted ? 0 : 1;
    this.sfxGain.gain.value = this.settings.sfxVolume;
    this.musicGain.gain.value = this.settings.musicVolume;
  }

  private async preloadBgm() {
    if (!this.ctx) return;
    try {
      const res = await fetch(SOUND_PATHS.bgm);
      if (!res.ok) return;
      const arr = await res.arrayBuffer();
      this.bgmBuffer = await this.ctx.decodeAudioData(arr);
    } catch {
      this.bgmBuffer = null;
    }
  }

  private stopMusic() {
    if (this.bgmSource) {
      try {
        this.bgmSource.stop();
      } catch {
        /* */
      }
      this.bgmSource = null;
    }
    if (this.proceduralBgm) {
      this.proceduralBgm.stop();
      this.proceduralBgm = null;
    }
  }

  private startAmbientMusic() {
    if (!this.ctx || !this.musicGain || this.settings.muted || !this.settings.musicEnabled) {
      return;
    }
    this.stopMusic();

    if (this.bgmBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.bgmBuffer;
      src.loop = true;
      const g = this.ctx.createGain();
      g.gain.value = 0.85;
      src.connect(g);
      g.connect(this.musicGain);
      src.start();
      this.bgmSource = src;
      this.bgmElementGain = g;
    } else {
      this.proceduralBgm = startProceduralPeaceBgm(
        this.ctx,
        this.musicGain,
        this.settings.musicVolume
      );
    }
  }

  private fadeMusic(to: number) {
    if (this.proceduralBgm?.fade) {
      this.proceduralBgm.fade(to);
      return;
    }
    if (this.bgmElementGain && this.ctx) {
      this.bgmElementGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, to * 0.85),
        this.ctx.currentTime + 0.6
      );
    }
  }

  async startSession() {
    await this.resume();
    if (!this.ctx || !this.sfxGain || this.settings.muted) return;
    this.sessionActive = true;
    playPeaceBeginChime(this.ctx, this.sfxGain, this.settings.sfxVolume);
    if (this.settings.musicEnabled) {
      window.setTimeout(() => this.startAmbientMusic(), 400);
    }
  }

  pauseSession() {
    this.fadeMusic(0.08);
  }

  resumeSession() {
    if (!this.sessionActive || this.settings.muted || !this.settings.musicEnabled) return;
    if (this.proceduralBgm?.fade || this.bgmSource) {
      this.fadeMusic(1);
    } else {
      this.startAmbientMusic();
    }
  }

  playStepChange() {
    if (!this.ctx || !this.sfxGain || this.settings.muted) return;
    playPeaceStepTick(this.ctx, this.sfxGain, this.settings.sfxVolume);
  }

  endSession() {
    if (!this.ctx || !this.sfxGain || this.settings.muted) {
      this.stopSession();
      return;
    }
    this.fadeMusic(0.05);
    playPeaceEndChime(this.ctx, this.sfxGain, this.settings.sfxVolume);
    window.setTimeout(() => this.stopSession(), 2800);
  }

  stopSession() {
    this.sessionActive = false;
    this.stopMusic();
  }

  toggleMute() {
    this.settings.muted = !this.settings.muted;
    this.applyGainValues();
    if (this.settings.muted) this.stopMusic();
    else if (this.sessionActive && this.settings.musicEnabled) this.startAmbientMusic();
    this.notify();
  }

  toggleVoice() {
    this.settings.voiceEnabled = !this.settings.voiceEnabled;
    this.notify();
  }

  toggleMusic() {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    if (this.sessionActive) {
      if (this.settings.musicEnabled && !this.settings.muted) this.startAmbientMusic();
      else this.stopMusic();
    }
    this.notify();
  }

  updateSettings(partial: Partial<PeaceAudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.applyGainValues();
    if (this.sessionActive) {
      if (this.settings.musicEnabled && !this.settings.muted) {
        if (!this.proceduralBgm && !this.bgmSource) this.startAmbientMusic();
      } else {
        this.stopMusic();
      }
    }
    this.notify();
  }
}

export const peaceAudio = new PeaceAudioManager();