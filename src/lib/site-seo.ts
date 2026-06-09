import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bongabonks.com";

export const SITE_NAME = "Bonga Bonk Miner";

export const SITE_TAGLINE = "Raise the Frequency";

export const DEFAULT_DESCRIPTION =
  "Bonga is Bonk's Sister — tap to bonk, mine $BONGA on Solana, mint Bonga NFTs, and unwind with Bonga Peace. The official Bonga & Bonk experience at bongabonks.com.";

export const DEFAULT_OG_IMAGE = "/bonga-character.png";

export const TWITTER_HANDLE = "@BongaSolana";

export const PRIMARY_KEYWORDS = [
  "Bonga",
  "Bonk",
  "Bonga Bonk",
  "Bonk's Sister",
  "Bonga Solana",
  "Bonk Miner",
  "Bonga Bonk Miner",
  "BONGA token",
  "$BONGA",
  "Bonga NFT",
  "Bonga NFT collection",
  "Solana meme coin",
  "Bonk sister",
  "bongabonks",
  "Raise the Frequency",
  "Bonga Peace",
  "Bonga mindfulness",
] as const;

export const SOCIAL_LINKS = {
  website: "https://bonga.uno",
  twitter: "https://x.com/BongaSolana",
  telegram: "https://t.me/bonga_sol_community",
} as const;

export const PUBLIC_ROUTES = [
  { path: "/", changeFrequency: "daily" as const, priority: 1 },
  { path: "/nft", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/peace", changeFrequency: "weekly" as const, priority: 0.9 },
];

export function absoluteUrl(path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, "")}${normalized}`;
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = [...PRIMARY_KEYWORDS],
  image = DEFAULT_OG_IMAGE,
  imageAlt = "Bonga — Bonk's Sister mascot on Solana",
}: {
  title: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1024,
          height: 1024,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE,
      creator: TWITTER_HANDLE,
      title,
      description,
      images: [imageUrl],
    },
  };
}