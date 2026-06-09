import { peaceAudio } from "./peace-audio";

const PREFERRED_VOICES = [
  "Samantha",
  "Karen",
  "Google UK English Female",
  "Microsoft Zira",
  "Moira",
  "Fiona",
  "Victoria",
  "Google US English",
];

function sanitizeForSpeech(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/✌️|🌅|🧘|🌇|🌌|🪵|💻|🦋|🌄|🌙|📦|🌬️/g, "")
    .replace(/—/g, ", ")
    .replace(/[""]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

class PeaceNarrationManager {
  private voicesLoaded = false;

  constructor() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      this.voicesLoaded = window.speechSynthesis.getVoices().length > 0;
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private canSpeak(): boolean {
    const s = peaceAudio.getSettings();
    return (
      this.isSupported() &&
      !s.muted &&
      s.voiceEnabled
    );
  }

  private pickVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return undefined;

    for (const name of PREFERRED_VOICES) {
      const match = voices.find((v) => v.name.includes(name));
      if (match) return match;
    }

    return (
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          !/male|david|mark|james|daniel/i.test(v.name)
      ) ??
      voices.find((v) => v.lang.startsWith("en")) ??
      voices[0]
    );
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

  speak(text: string, options?: { rate?: number; delayMs?: number }) {
    if (!this.canSpeak()) return;

    const run = () => {
      this.cancel();
      const utter = new SpeechSynthesisUtterance(sanitizeForSpeech(text));
      const voice = this.pickVoice();
      if (voice) utter.voice = voice;
      utter.rate = options?.rate ?? 0.9;
      utter.pitch = 1;
      utter.volume = 1;
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
    if (options?.intro) parts.push(options.intro);
    parts.push(title, instruction);
    this.speak(parts.join(". "), { delayMs: 0 });
  }

  speakBreathCue(label: string) {
    this.speak(label, { rate: 0.82 });
  }

  speakComplete(message: string) {
    this.speak(message, { rate: 0.88, delayMs: 1400 });
  }
}

export const peaceNarration = new PeaceNarrationManager();