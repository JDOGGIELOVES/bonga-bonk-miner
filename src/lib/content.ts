export const SECTIONS = [
  { id: "what", label: "What is Bitcoin?", icon: "₿" },
  { id: "why", label: "Why Use It?", icon: "✨" },
  { id: "how", label: "How It Works", icon: "🔗" },
  { id: "buy", label: "How to Buy", icon: "🛒" },
  { id: "use", label: "How to Use", icon: "📱" },
  { id: "risks", label: "Risks & Tips", icon: "🛡️" },
  { id: "bonus", label: "Bonga Bonus", icon: "✌️" },
  { id: "quiz", label: "Quiz", icon: "🎯" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What makes Bitcoin different from regular money?",
    options: [
      "It's controlled by one big bank",
      "It's decentralized — no single boss",
      "It only works on weekends",
      "You need a passport to use it",
    ],
    correct: 1,
    explanation:
      "Bitcoin runs on a global network. No government or company owns it — that's the freedom vibe!",
  },
  {
    id: 2,
    question: "What is a blockchain?",
    options: [
      "A type of skateboard",
      "A chain of gold blocks in a vault",
      "A public ledger of all Bitcoin transactions",
      "A password for your email",
    ],
    correct: 2,
    explanation:
      "Think of it as a shared notebook everyone can read but nobody can erase. Peace through transparency!",
  },
  {
    id: 3,
    question: "What does 'self-custody' mean?",
    options: [
      "Letting an exchange hold your Bitcoin forever",
      "You hold your own keys — you own your Bitcoin",
      "Sharing your password with friends",
      "Keeping Bitcoin in a shoebox",
    ],
    correct: 1,
    explanation:
      "Not your keys, not your coins! Self-custody means YOU control your Bitcoin. Bonga approves. ✌️",
  },
  {
    id: 4,
    question: "What is the Lightning Network?",
    options: [
      "A weather app",
      "A fast layer for small, quick Bitcoin payments",
      "A type of Bitcoin mining machine",
      "A government tax program",
    ],
    correct: 1,
    explanation:
      "Lightning lets you send Bitcoin instantly with tiny fees — perfect for coffee, tips, and good vibes!",
  },
  {
    id: 5,
    question: "What's a smart first step before buying Bitcoin?",
    options: [
      "Invest your rent money immediately",
      "Learn the basics and only invest what you can afford to lose",
      "Trust any random DM promising 10x returns",
      "Share your seed phrase for good luck",
    ],
    correct: 1,
    explanation:
      "Stay chill, stay educated, stay safe. Start small, learn lots, and never share your seed phrase!",
  },
] as const;

export const AFFIRMATIONS = [
  "I am early to the future of money. ✌️",
  "My financial freedom journey starts with knowledge.",
  "I HODL peace, love, and good vibes.",
  "Every satoshi is a step toward sovereignty.",
  "I learn before I leap — Bonga style!",
  "Inflation can't steal my curiosity.",
  "I am part of a global community of builders.",
] as const;

export const ILLUSTRATION_PROMPTS = [
  {
    id: "hero",
    title: "Hero Mascot",
    prompt:
      "Chibi Shiba Inu girl with bright blue eyes, brown dreadlocks, orange BONGA headband, hippie peace sign, sitting on a rainbow gradient cloud with floating Bitcoin symbols, warm orange teal purple palette, kawaii style, transparent background, cheerful peaceful vibes",
  },
  {
    id: "blockchain",
    title: "Blockchain Visual",
    prompt:
      "Cute illustrated blockchain as a chain of glowing colorful blocks connected by peace signs, chibi Shiba Inu with dreads pointing at it, orange teal purple green palette, educational infographic style, soft rounded shapes",
  },
  {
    id: "wallet",
    title: "Wallet & Keys",
    prompt:
      "Adorable chibi Shiba Inu with brown dreadlocks and orange BONGA headband holding a golden key next to a digital wallet on a phone, flowers and Bitcoin symbols around, hippie bohemian style, warm peaceful colors",
  },
  {
    id: "mining",
    title: "Mining Explained",
    prompt:
      "Friendly cartoon miners (cute animals) securing a glowing Bitcoin block, chibi Shiba Inu supervisor with dreads giving thumbs up, soft pastel orange purple teal, non-technical beginner-friendly illustration",
  },
  {
    id: "lightning",
    title: "Lightning Network",
    prompt:
      "Chibi Shiba Inu with brown dreadlocks sending instant Bitcoin through a cute lightning bolt pathway between two phones, blue eyes sparkling, orange BONGA headband, fast and fun energy, teal and purple accents",
  },
  {
    id: "community",
    title: "Bonga Community",
    prompt:
      "Group of happy diverse cartoon characters and chibi Shiba Inu with dreads at a peaceful outdoor gathering, Bitcoin and BONGA symbols, flowers, peace signs, festival hippie aesthetic, orange teal purple green",
  },
] as const;