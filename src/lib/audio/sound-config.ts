/**
 * Sound configuration — replace paths/URLs with your own files anytime.
 *
 * Local files: drop MP3/OGG/WAV into /public/sounds/ and uncomment paths below.
 * Remote URLs: paste royalty-free links (Pixabay, Freesound, etc.) into SOUND_URLS.
 * When a path/URL is empty or fails to load, crisp procedural sounds are used instead.
 */

export const AUDIO_SETTINGS_KEY = "bonga-bonk-audio";

export const SOUND_PATHS = {
  /** Multiple bonk variations — game picks one at random (or cycles) per tap */
  bonk: [
    "/sounds/bonk-1.mp3",
    "/sounds/bonk-2.mp3",
    "/sounds/bonk-3.mp3",
    "/sounds/bonk-4.mp3",
  ],
  /** Played when +1 $BONGA is earned */
  coinCollect: "/sounds/coin-collect.mp3",
  /** Extra sparkle layer on $BONGA earn */
  sparkle: "/sounds/sparkle.mp3",
  /** (Legacy) Background music path slot. Not used for primary BGM anymore.
   *  The active station is House Attack Radio (see HOUSE_ATTACK_RADIO_STREAM below).
   *  You can still drop a custom local MP3 here and update start logic if desired.
   */
  bgm: "",
  /** Gentle flute for Tai Chi sessions */
  taiChiFlute: "/sounds/taichi-flute.mp3",
} as const;

/**
 * House Attack Radio live stream (user requested — https://radio.garden/listen/house-attack-radio/8h6Ep8KU )
 *
 * We use a same-origin Next.js proxy (/api/radio/house-attack) so the browser <audio> element
 * can play it without CORS blocks from the upstream (radio.garden → virtualtronics.net Shoutcast).
 *
 * The proxy streams the raw audio/mpeg live feed. This should now play reliably when started
 * from a user gesture (tap the miner or garden, or click the Music icon).
 *
 * Direct upstream (for reference): https://virtualtronics.net/proxy/houseattack?mp=/stream
 */
export const HOUSE_ATTACK_RADIO_STREAM = "/api/radio/house-attack";

/**
 * Optional remote URLs — leave empty strings to use procedural fallback.
 * Example free sources: pixabay.com/sound-effects, freesound.org (check licenses)
 */
export const SOUND_URLS = {
  bonk: [
    // "https://example.com/cartoon-bonk-1.mp3",
  ] as string[],
  coinCollect: "",
  sparkle: "",
  // Legacy fallback (not used for BGM anymore). Kept for reference.
  bgm: "",
} as const;

export const DEFAULT_AUDIO_SETTINGS = {
  muted: false,
  masterVolume: 0.75,
  sfxVolume: 0.85,
  musicVolume: 0.35,
  musicEnabled: true,
} as const;

export type AudioSettings = {
  muted: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  musicEnabled: boolean;
};

export function loadAudioSettings(): AudioSettings {
  if (typeof window === "undefined") return { ...DEFAULT_AUDIO_SETTINGS };
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_AUDIO_SETTINGS };
    return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_AUDIO_SETTINGS };
  }
}

export function saveAudioSettings(settings: AudioSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
}