import { peaceAudio } from "./peace-audio";

const VOICE_CACHE_KEY = "bonga-peace-voice-uri";

/** Natural-sounding female voices, best first */
const PREFERRED_FEMALE_VOICES = [
  "Microsoft Aria Online (Natural)",
  "Microsoft Jenny Online (Natural)",
  "Microsoft Michelle Online (Natural)",
  "Google UK English Female",
  "Google US English Female",
  "Samantha",
  "Karen",
  "Moira",
  "Fiona",
  "Victoria",
  "Tessa",
  "Serena",
  "Zira",
  "Susan",
  "Hazel",
  "Kate",
  "Sonia",
  "Emma",
];

const ROBOTIC_VOICE_PATTERN =
  /eSpeak|novelty|bad news|good news|whisper|cellos|trinoids|bahh|bells|boing|bubbles|deranged|klatt|zarvox/i;

const MALE_VOICE_PATTERN =
  /male|david|mark|james|daniel|richard|thomas|george|alex(?!a)|fred|gordon|lee|bruce|tom\b/i;

function sanitizeForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/✌️|🌅|🧘|🌇|🌌|🪵|💻|🦋|🌄|🌙|📦|🌬️/g, "peace")
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

function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name;

  if (ROBOTIC_VOICE_PATTERN.test(name)) return -100;
  if (MALE_VOICE_PATTERN.test(name)) return -50;

  for (let i = 0; i < PREFERRED_FEMALE_VOICES.length; i++) {
    if (name.includes(PREFERRED_FEMALE_VOICES[i])) {
      score += 100 - i * 3;
      break;
    }
  }

  if (/natural|neural|premium|enhanced/i.test(name)) score += 25;
  if (/female|woman/i.test(name)) score += 20;
  if (voice.lang.startsWith("en")) score += 10;
  if (voice.localService) score += 5;

  return score;
}

class PeaceNarrationManager {
  private cachedVoiceUri: string | null = null;
  private voicesReady = false;
  private voiceLoadPromise: Promise<void> | null = null;

  constructor() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      this.cachedVoiceUri = localStorage.getItem(VOICE_CACHE_KEY);
    } catch {
      /* */
    }
    this.voiceLoadPromise = this.loadVoices();
  }

  private loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const finish = () => {
        this.voicesReady = window.speechSynthesis.getVoices().length > 0;
        resolve();
      };

      finish();
      if (!this.voicesReady) {
        window.speechSynthesis.onvoiceschanged = () => {
          finish();
        };
        window.setTimeout(finish, 500);
      }
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
      if (cached && scoreVoice(cached) > 0) return cached;
    }

    const ranked = voices
      .map((v) => ({ voice: v, score: scoreVoice(v) }))
      .filter((v) => v.score > 0)
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
    }
  }

  isSpeaking(): boolean {
    return this.isSupported() && window.speechSynthesis.speaking;
  }

  isPaused(): boolean {
    return this.isSupported() && window.speechSynthesis.paused;
  }

  private applyWarmVoice(utter: SpeechSynthesisUtterance) {
    const voice = this.pickVoice();
    if (voice) utter.voice = voice;
    utter.rate = 0.82;
    utter.pitch = 1.08;
    utter.volume = 0.95;
  }

  async speak(text: string, options?: { rate?: number; delayMs?: number }) {
    if (!this.canSpeak()) return;
    await (this.voiceLoadPromise ?? this.loadVoices());

    const run = () => {
      this.cancel();
      const utter = new SpeechSynthesisUtterance(sanitizeForSpeech(text));
      this.applyWarmVoice(utter);
      if (options?.rate) utter.rate = options.rate;
      window.speechSynthesis.speak(utter);
    };

    if (options?.delayMs) {
      window.setTimeout(run, options.delayMs);
    } else {
      run();
    }
  }

  speakStep(title: string, instruction: string, options?: { intro?: string }) {
    const parts: string[] = [];

    if (options?.intro) {
      parts.push(options.intro);
    } else {
      parts.push(`Now, ${title.toLowerCase()}.`);
    }

    parts.push(humanizeInstruction(instruction));
    parts.push("Take your time with this one.");

    void this.speak(parts.join(" "), { delayMs: 0 });
  }

  speakBreathCue(label: string) {
    void this.speak(label.replace(/✌️/g, "").trim(), { rate: 0.78 });
  }

  speakComplete(message: string) {
    void this.speak(`Beautiful. ${message}`, { rate: 0.8, delayMs: 1400 });
  }
}

export const peaceNarration = new PeaceNarrationManager();