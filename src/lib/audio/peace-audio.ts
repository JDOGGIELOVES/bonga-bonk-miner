import { SOUND_PATHS } from "./sound-config";
import {
  playPeaceBeginChime,
  playPeaceEndChime,
  playPeaceStepTick,
  startProceduralFluteBgm,
  startProceduralPeaceBgm,
  type BgmHandle,
} from "./procedural-sounds";

export const PEACE_AUDIO_SETTINGS_KEY = "bonga-peace-audio";

export type PeaceMusicMode = "ambient" | "flute";

export const DEFAULT_PEACE_AUDIO_SETTINGS = {
  muted: false,
  musicEnabled: true,
  voiceEnabled: true,
  sfxVolume: 0.75,
  musicVolume: 0.55,
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
  private fluteBuffer: AudioBuffer | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmElementGain: GainNode | null = null;
  private proceduralBgm: BgmHandle | null = null;
  private sessionActive = false;
  private musicMode: PeaceMusicMode = "ambient";
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
    void this.preloadBuffers();
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

  private async fetchBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      return await this.ctx.decodeAudioData(arr);
    } catch {
      return null;
    }
  }

  private async preloadBuffers() {
    const [bgm, flute] = await Promise.all([
      this.fetchBuffer(SOUND_PATHS.bgm),
      this.fetchBuffer(SOUND_PATHS.taiChiFlute),
    ]);
    this.bgmBuffer = bgm;
    this.fluteBuffer = flute;
  }

  private stopMusic() {
    if (this.bgmSource) {
      try {
        this.bgmSource.stop();
      } catch {
        /* */
      }
      this.bgmSource = null;
      this.bgmElementGain = null;
    }
    if (this.proceduralBgm) {
      this.proceduralBgm.stop();
      this.proceduralBgm = null;
    }
  }

  private startSessionMusic() {
    if (!this.ctx || !this.musicGain || this.settings.muted || !this.settings.musicEnabled) {
      return;
    }
    this.stopMusic();

    if (this.musicMode === "flute") {
      if (this.fluteBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.fluteBuffer;
        src.loop = true;
        const g = this.ctx.createGain();
        g.gain.value = 0.8;
        src.connect(g);
        g.connect(this.musicGain);
        src.start();
        this.bgmSource = src;
        this.bgmElementGain = g;
      } else {
        this.proceduralBgm = startProceduralFluteBgm(
          this.ctx,
          this.musicGain,
          this.settings.musicVolume
        );
      }
      return;
    }

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
      const peak = this.musicMode === "flute" ? 0.8 : 0.85;
      this.bgmElementGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, to * peak),
        this.ctx.currentTime + 0.6
      );
    }
  }

  async startSession(mode: PeaceMusicMode = "ambient") {
    await this.resume();
    if (!this.ctx) return;
    this.musicMode = mode;
    this.sessionActive = true;

    if (this.sfxGain && !this.settings.muted) {
      playPeaceBeginChime(this.ctx, this.sfxGain, this.settings.sfxVolume);
    }
    if (this.settings.musicEnabled && !this.settings.muted) {
      window.setTimeout(() => this.startSessionMusic(), 350);
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
      this.startSessionMusic();
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
    else if (this.sessionActive && this.settings.musicEnabled) this.startSessionMusic();
    this.notify();
  }

  toggleVoice() {
    this.settings.voiceEnabled = !this.settings.voiceEnabled;
    this.notify();
  }

  toggleMusic() {
    this.settings.musicEnabled = !this.settings.musicEnabled;
    if (this.sessionActive) {
      if (this.settings.musicEnabled && !this.settings.muted) this.startSessionMusic();
      else this.stopMusic();
    }
    this.notify();
  }

  updateSettings(partial: Partial<PeaceAudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.applyGainValues();
    if (this.sessionActive) {
      if (this.settings.musicEnabled && !this.settings.muted) {
        if (!this.proceduralBgm && !this.bgmSource) this.startSessionMusic();
      } else {
        this.stopMusic();
      }
    }
    this.notify();
  }
}

export const peaceAudio = new PeaceAudioManager();