import {
  DEFAULT_AUDIO_SETTINGS,
  loadAudioSettings,
  saveAudioSettings,
  SOUND_PATHS,
  SOUND_URLS,
  type AudioSettings,
} from "./sound-config";
import {
  playProceduralBonk,
  playProceduralCoinCollect,
  startProceduralBgm,
  type BonkVariant,
  type BgmHandle,
} from "./procedural-sounds";

class GameAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  private bonkBuffers: AudioBuffer[] = [];
  private coinBuffer: AudioBuffer | null = null;
  private sparkleBuffer: AudioBuffer | null = null;
  private bgmBuffer: AudioBuffer | null = null;
  private bgmSource: AudioBufferSourceNode | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private proceduralBgm: BgmHandle | null = null;
  private bonkVariant = 0;
  private initialized = false;
  private listeners = new Set<(s: AudioSettings) => void>();

  getSettings() {
    return { ...this.settings };
  }

  subscribe(listener: (s: AudioSettings) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const s = this.getSettings();
    this.listeners.forEach((l) => l(s));
    saveAudioSettings(s);
  }

  private async init() {
    if (this.initialized || typeof window === "undefined") return;
    this.settings = loadAudioSettings();
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
    this.applyGainValues();
    this.initialized = true;
    void this.preloadSamples();
  }

  async resume() {
    await this.init();
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }
  }

  private applyGainValues() {
    if (!this.masterGain || !this.sfxGain || !this.musicGain) return;
    this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
    this.sfxGain.gain.value = this.settings.sfxVolume;
    this.musicGain.gain.value = this.settings.musicVolume;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.settings.musicVolume;
    }
  }

  private async fetchBuffer(url: string): Promise<AudioBuffer | null> {
    if (!this.ctx || !url) return null;
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      return await this.ctx.decodeAudioData(arr);
    } catch {
      return null;
    }
  }

  private async preloadSamples() {
    const bonkSources = [
      ...SOUND_URLS.bonk.filter(Boolean),
      ...SOUND_PATHS.bonk,
    ];
    const buffers = await Promise.all(bonkSources.map((u) => this.fetchBuffer(u)));
    this.bonkBuffers = buffers.filter((b): b is AudioBuffer => b !== null);

    const coinUrl = SOUND_URLS.coinCollect || SOUND_PATHS.coinCollect;
    this.coinBuffer = await this.fetchBuffer(coinUrl);

    const sparkleUrl = SOUND_URLS.sparkle || SOUND_PATHS.sparkle;
    this.sparkleBuffer = await this.fetchBuffer(sparkleUrl);

    // Note: bgm (reggae) is now loaded via HTMLAudioElement in startMusic for faster playback start.
    // No need to pre-decode as buffer (avoids the slow lo-fi procedural fallback).
  }

  private playBuffer(buffer: AudioBuffer, dest: AudioNode, volume: number, playbackRate = 1) {
    if (!this.ctx || this.settings.muted) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = playbackRate;
    const g = this.ctx.createGain();
    g.gain.value = volume;
    src.connect(g);
    g.connect(dest);
    src.start();
  }

  playBonk(combo = 0) {
    if (!this.ctx || !this.sfxGain || this.settings.muted) return;

    const pitchShift = 0.92 + Math.random() * 0.16 + Math.min(combo * 0.02, 0.12);

    if (this.bonkBuffers.length > 0) {
      const buf = this.bonkBuffers[Math.floor(Math.random() * this.bonkBuffers.length)];
      this.playBuffer(buf, this.sfxGain, 0.7, pitchShift);
      return;
    }

    const variant = this.bonkVariant as BonkVariant;
    this.bonkVariant = (this.bonkVariant + 1) % 5;
    playProceduralBonk(this.ctx, this.sfxGain, variant, this.settings.sfxVolume, pitchShift);
  }

  playCoinCollect() {
    if (!this.ctx || !this.sfxGain || this.settings.muted) return;

    if (this.coinBuffer) {
      this.playBuffer(this.coinBuffer, this.sfxGain, 0.75);
    } else {
      playProceduralCoinCollect(this.ctx, this.sfxGain, this.settings.sfxVolume);
    }

    if (this.sparkleBuffer) {
      setTimeout(() => {
        if (this.sfxGain) this.playBuffer(this.sparkleBuffer!, this.sfxGain, 0.4);
      }, 120);
    }
  }

  private stopMusicPlayback() {
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
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch {
        /* */
      }
      this.bgmAudio = null;
    }
  }

  startMusic() {
    if (!this.ctx || !this.musicGain || this.settings.muted || !this.settings.musicEnabled) return;
    this.stopMusicPlayback();

    const bgmUrl = SOUND_URLS.bgm || SOUND_PATHS.bgm;
    if (bgmUrl) {
      // Use HTMLAudioElement for the reggae track (faster start than full buffer decode + procedural fallback)
      // This replaces the slow lo-fi procedural fallback with the reggae track mentioned previously.
      const audio = new Audio(bgmUrl);
      audio.loop = true;
      audio.volume = this.settings.musicVolume;
      audio.preload = 'auto';
      // Play as soon as possible (after user gesture via resume)
      const playPromise = audio.play();
      if (playPromise) {
        playPromise.catch((err) => {
          // Autoplay policy or network — will retry on next user interaction or toggle
          console.warn('BGM reggae play deferred:', err);
        });
      }
      this.bgmAudio = audio;
    } else {
      this.proceduralBgm = startProceduralBgm(
        this.ctx,
        this.musicGain,
        this.settings.musicVolume
      );
    }
  }

  setMuted(muted: boolean) {
    this.settings.muted = muted;
    this.applyGainValues();
    if (muted) {
      this.stopMusicPlayback();
    } else if (this.settings.musicEnabled) {
      void this.resume().then(() => this.startMusic());
    }
    this.notify();
  }

  toggleMute() {
    this.setMuted(!this.settings.muted);
  }

  setMusicEnabled(enabled: boolean) {
    this.settings.musicEnabled = enabled;
    if (enabled && !this.settings.muted) {
      void this.resume().then(() => this.startMusic());
    } else {
      this.stopMusicPlayback();
    }
    this.notify();
  }

  toggleMusic() {
    this.setMusicEnabled(!this.settings.musicEnabled);
  }

  updateSettings(partial: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.applyGainValues();

    if (partial.musicEnabled !== undefined || partial.muted !== undefined) {
      if (this.settings.musicEnabled && !this.settings.muted) {
        void this.resume().then(() => this.startMusic());
      } else {
        this.stopMusicPlayback();
      }
    }

    if (partial.musicVolume !== undefined) {
      if (this.bgmAudio) {
        this.bgmAudio.volume = this.settings.musicVolume;
      }
      if (this.proceduralBgm && !this.bgmBuffer && !this.bgmAudio) {
        this.stopMusicPlayback();
        if (this.settings.musicEnabled && !this.settings.muted) this.startMusic();
      }
    }

    this.notify();
  }
}

export const gameAudio = new GameAudioManager();