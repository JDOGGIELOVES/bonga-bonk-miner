import { peaceAudio } from "./peace-audio";

const VOICE_CACHE_KEY = "bonga-peace-voice-uri";

const PREFERRED_FEMALE_VOICES = [
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Aria Online (Natural)",
  "Microsoft Jenny Online (Natural)",
  "Microsoft Michelle Online (Natural)",
  "Microsoft Ana Online (Natural)",
  "Google UK English Female",
  "Google US English Female",
  "Samantha",
  "Karen",
  "Moira",
  "Fiona",
  "Victoria",
  "Tessa",
  "Serena",
  "Aria",
  "Jenny",
  "Michelle",
  "Zira",
  "Susan",
  "Hazel",
  "Kate",
  "Sonia",
  "Emma",
  "Linda",
  "Heather",
];

const ROBOTIC_VOICE_PATTERN =
  /eSpeak|novelty|bad news|good news|whisper|cellos|trinoids|bahh|bells|boing|bubbles|deranged|klatt|zarvox|compact|desktop.*english.*david|microsoft david|microsoft mark|microsoft richard/i;

const MALE_VOICE_PATTERN =
  /\bmale\b|david|mark\b|james|daniel|richard|thomas|george|fred|gordon|bruce|tom\b|alex\b(?!a)/i;

function sanitizeForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/✌️|🌅|🧘|🌇|🌌|🪵|💻|🦋|🌄|🌙|📦|🌬️/g, "")
    .replace(/—/g, ", ")
    .replace(/[""]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function humanizeInstruction(instruction: string): string {
  return sanitizeForSpeech(instruction)
    .replace(/Repeat three times/gi, "Repeat this three times, nice and slow")
    .replace(/Slow is the speed limit/gi, "Remember, slow is the speed limit")
    .replace(/Go bonk something nice/gi, "Now go bonk something nice");
}

function splitIntoChunks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name;
  if (ROBOTIC_VOICE_PATTERN.test(name)) return -100;
  if (MALE_VOICE_PATTERN.test(name)) return -50;
  if (/google us english$/i.test(name) && !/female/i.test(name)) return -40;

  let score = 0;

  for (let i = 0; i < PREFERRED_FEMALE_VOICES.length; i++) {
    if (name.includes(PREFERRED_FEMALE_VOICES[i])) {
      score += 120 - i * 2;
      break;
    }
  }

  if (/natural|neural|premium|enhanced|online/i.test(name)) score += 35;
  if (/female|woman|samantha|aria|jenny/i.test(name)) score += 25;
  if (voice.lang.startsWith("en")) score += 10;
  if (!voice.localService && /online|natural/i.test(name)) score += 15;

  return score;
}

class PeaceNarrationManager {
  private cachedVoiceUri: string | null = null;
  private voiceLoadPromise: Promise<void> | null = null;
  private speechQueue: string[] = [];
  private queueActive = false;
  private queueRate = 0.76;

  constructor() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      this.cachedVoiceUri = localStorage.getItem(VOICE_CACHE_KEY);
    } catch {
      /* */
    }
    this.voiceLoadPromise = this.loadVoices();
  }

  /** Call on first user tap so voices are ready */
  warmUp() {
    if (!this.isSupported()) return;
    void this.loadVoices();
    window.speechSynthesis.getVoices();
  }

  private loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) return;
        resolved = true;
        resolve();
      };

      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => finish();
      window.setTimeout(finish, 2000);
    });
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private canSpeak(): boolean {
    const s = peaceAudio.getSettings();
    return this.isSupported() && !s.muted && s.voiceEnabled;
  }

  private pickVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return undefined;

    if (this.cachedVoiceUri) {
      const cached = voices.find((v) => v.voiceURI === this.cachedVoiceUri);
      if (cached && scoreVoice(cached) >= 20) return cached;
      this.cachedVoiceUri = null;
      try {
        localStorage.removeItem(VOICE_CACHE_KEY);
      } catch {
        /* */
      }
    }

    const ranked = voices
      .map((v) => ({ voice: v, score: scoreVoice(v) }))
      .filter((v) => v.score >= 20)
      .sort((a, b) => b.score - a.score);

    const best = ranked[0]?.voice;
    if (best) {
      this.cachedVoiceUri = best.voiceURI;
      try {
        localStorage.setItem(VOICE_CACHE_KEY, best.voiceURI);
      } catch {
        /* */
      }
    }

    return best;
  }

  cancel() {
    if (!this.isSupported()) return;
    this.speechQueue = [];
    this.queueActive = false;
    window.speechSynthesis.cancel();
  }

  pause() {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }

  resume() {
    if (!this.isSupported()) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else if (!this.queueActive && this.speechQueue.length > 0) {
      void this.drainQueue();
    }
  }

  isSpeaking(): boolean {
    return (
      this.isSupported() &&
      (window.speechSynthesis.speaking || this.queueActive)
    );
  }

  isPaused(): boolean {
    return this.isSupported() && window.speechSynthesis.paused;
  }

  private buildUtterance(text: string, rate: number): SpeechSynthesisUtterance {
    const utter = new SpeechSynthesisUtterance(text);
    const voice = this.pickVoice();
    if (voice) utter.voice = voice;
    utter.rate = rate;
    utter.pitch = 1.05;
    utter.volume = 1;
    return utter;
  }

  private async drainQueue(): Promise<void> {
    if (!this.canSpeak() || this.speechQueue.length === 0) {
      this.queueActive = false;
      return;
    }

    this.queueActive = true;
    const text = this.speechQueue.shift()!;
    const utter = this.buildUtterance(text, this.queueRate);

    await new Promise<void>((resolve) => {
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });

    if (this.speechQueue.length > 0) {
      await new Promise((r) => window.setTimeout(r, 420));
      await this.drainQueue();
    } else {
      this.queueActive = false;
    }
  }

  async speakSequence(chunks: string[], rate = 0.76) {
    if (!this.canSpeak()) return;
    await (this.voiceLoadPromise ?? this.loadVoices());

    this.cancel();
    this.queueRate = rate;
    this.speechQueue = chunks.map((c) => sanitizeForSpeech(c)).filter(Boolean);
    await this.drainQueue();
  }

  async speak(text: string, options?: { rate?: number; delayMs?: number }) {
    const run = () => {
      void this.speakSequence([text], options?.rate ?? 0.76);
    };
    if (options?.delayMs) {
      window.setTimeout(run, options.delayMs);
    } else {
      run();
    }
  }

  speakStep(title: string, instruction: string, options?: { intro?: string }) {
    const chunks: string[] = [];

    if (options?.intro) {
      chunks.push(options.intro);
    } else {
      chunks.push(`Let's gently move into ${title.toLowerCase()}.`);
    }

    chunks.push(...splitIntoChunks(humanizeInstruction(instruction)));
    chunks.push("Take your time with this one.");

    void this.speakSequence(chunks, 0.76);
  }

  speakBreathCue(label: string) {
    void this.speakSequence(
      [label.replace(/✌️/g, "").trim()],
      0.74
    );
  }

  speakComplete(message: string) {
    window.setTimeout(() => {
      void this.speakSequence(["Beautiful.", message], 0.75);
    }, 1400);
  }
}

export const peaceNarration = new PeaceNarrationManager();