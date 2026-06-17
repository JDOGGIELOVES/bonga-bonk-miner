import {
  DEFAULT_AUDIO_SETTINGS,
  HOUSE_ATTACK_RADIO_STREAM,
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

    // Note: BGM is now the live House Attack Radio stream (HTMLAudioElement). No buffer preloading needed.
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
    if (this.settings.muted || !this.settings.musicEnabled) return;
    this.stopMusicPlayback();

    // Primary: House Attack Radio live stream (https://radio.garden/listen/house-attack-radio/8h6Ep8KU)
    // We load via our same-origin proxy (/api/radio/house-attack) so CORS from upstream is bypassed.
    // Live radio — continuous 24/7 underground house/tech house/deep house/techno.
    // "Play automatically" happens on the first user gesture (tap in miner / water in garden) when musicEnabled.
    const radioUrl = HOUSE_ATTACK_RADIO_STREAM;

    if (!radioUrl) {
      // Extremely unlikely — last resort old procedural
      console.warn('[audio] No House Attack Radio stream configured. Using procedural fallback.');
      void this.init().then(() => {
        if (this.ctx && this.musicGain) {
          this.proceduralBgm = startProceduralBgm(this.ctx, this.musicGain, this.settings.musicVolume);
        }
      });
      return;
    }

    // Live stream setup (no loop — it's continuous live feed)
    const audio = new Audio(radioUrl);
    audio.loop = false; // live radio does not "loop"
    audio.volume = this.settings.musicVolume;
    audio.preload = 'auto';
    (audio as any).crossOrigin = 'anonymous';

    // Robust reconnect logic for live streams (network blips, CORS hiccups, etc.)
    const attemptPlay = (reconnect = false) => {
      const playPromise = audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            console.log('[audio] House Attack Radio (proxied) playing live:', radioUrl, reconnect ? '(reconnected)' : '');
            this.bgmAudio = audio;
          })
          .catch((err) => {
            console.warn('[audio] House Attack Radio (proxied) play() blocked or failed:', err);
            // Keep the element; next gesture/toggle will retry via startMusic()
          });
      }
    };

    const handleError = () => {
      console.warn('[audio] House Attack Radio (proxied) stream error — attempting reconnect in 2s...');
      try { audio.pause(); } catch {}
      // Schedule a fresh reconnect attempt (common pattern for live radio in <audio>)
      setTimeout(() => {
        if (this.settings.musicEnabled && !this.settings.muted) {
          // Recreate audio element for clean reconnect
          this.stopMusicPlayback();
          // Re-trigger start (will create new audio + listeners)
          this.startMusic();
        }
      }, 2000);
    };

    audio.onerror = handleError;

    // Some live streams "end" on temporary disconnects — restart
    audio.onended = () => {
      if (this.settings.musicEnabled && !this.settings.muted && this.bgmAudio === audio) {
        console.log('[audio] House Attack Radio (proxied) ended (live reconnect)');
        audio.src = radioUrl; // reset source
        attemptPlay(true);
      }
    };

    // Try to start immediately (must be called from user gesture for autoplay)
    attemptPlay();

    // Keep reference even if play is async — volume controls etc. still work
    this.bgmAudio = audio;
  }

  setMuted(muted: boolean) {
    this.settings.muted = muted;
    this.applyGainValues();
    if (muted) {
      this.stopMusicPlayback();
    } else if (this.settings.musicEnabled) {
      // Direct start on unmute gesture
      this.startMusic();
      void this.resume();
    }
    this.notify();
  }

  toggleMute() {
    this.setMuted(!this.settings.muted);
  }

  setMusicEnabled(enabled: boolean) {
    this.settings.musicEnabled = enabled;
    if (enabled && !this.settings.muted) {
      // Start House Attack Radio directly — the click/tap that called toggleMusic is a user gesture,
      // so audio.play() should succeed without needing the async AudioContext resume first.
      this.startMusic();
      // Still resume ctx in background for SFX/bonks if needed
      void this.resume();
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
        // Direct (the caller of updateSettings is a click on a toggle/slider in the UI = gesture)
        this.startMusic();
        void this.resume();
      } else {
        this.stopMusicPlayback();
      }
    }

    if (partial.musicVolume !== undefined) {
      if (this.bgmAudio) {
        this.bgmAudio.volume = this.settings.musicVolume;
      }
      // For procedural fallback (rare)
      if (this.proceduralBgm) {
        // The procedural start handles volume internally on restart; simple restart if needed
        if (this.settings.musicEnabled && !this.settings.muted) {
          this.stopMusicPlayback();
          this.startMusic();
        }
      }
    }

    this.notify();
  }
}

export const gameAudio = new GameAudioManager();