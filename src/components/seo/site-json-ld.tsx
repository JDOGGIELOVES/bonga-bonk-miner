import { JsonLd } from "@/components/seo/json-ld";
import { ABOUT_FAQ } from "@/lib/about-content";
import { BONGA_TOKEN_CA, BONGA_TOKEN_SOLSCAN_URL } from "@/lib/bonga-token";
import { COLLECTION_STATS } from "@/lib/nft-collection";
import {
  absoluteUrl,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL_LINKS,
} from "@/lib/site-seo";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function GlobalJsonLd() {
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": ORG_ID,
          name: "Bonga",
          alternateName: [
            "Bonga Bonk's Sister",
            "Bonga Bonk",
            "Bonk's Sister",
            "BONGA",
          ],
          url: SITE_URL,
          logo: absoluteUrl("/bonga-character.png"),
          description:
            "Bonga is Bonk's Sister — a Solana community built around the Bonga Bonk Miner game, $BONGA token, NFT collection, and Bonga Peace mindfulness.",
          sameAs: [
            SOCIAL_LINKS.website,
            SOCIAL_LINKS.twitter,
            SOCIAL_LINKS.telegram,
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": WEBSITE_ID,
          name: SITE_NAME,
          alternateName: [
            "Bonga Bonk's Sister",
            "Bonga",
            "Bonga Bonk",
            "bongabonks",
          ],
          url: SITE_URL,
          description: SITE_TAGLINE,
          publisher: { "@id": ORG_ID },
          inLanguage: "en-US",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
      ]}
    />
  );
}

export function HomeJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${absoluteUrl("/")}#webpage`,
        url: absoluteUrl("/"),
        name: "Bonga Bonk Miner — Tap, Mine $BONGA, Bonk's Sister on Solana",
        description:
          "Play Bonga Bonk Miner — 100 taps = 1 $BONGA (max 10/day), NFT stake up to 875/day. Bonk's Sister raises the frequency.",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        inLanguage: "en-US",
        primaryImageOfPage: absoluteUrl("/bonga-character.png"),
        mainEntity: {
          "@type": "VideoGame",
          name: "Bonga Bonk Miner",
          alternateName: ["Bonk Miner", "Bonga game"],
          description:
            "Free Solana tap game: 100 taps = 1 $BONGA (max 10/day), NFT staking up to 875/day Cosmic.",
          genre: "Casual game",
          gamePlatform: "Web browser",
          operatingSystem: "Any",
          url: absoluteUrl("/"),
          image: absoluteUrl("/bonga-character.png"),
          publisher: { "@id": ORG_ID },
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        },
      }}
    />
  );
}

export function NftJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${absoluteUrl("/nft")}#webpage`,
        url: absoluteUrl("/nft"),
        name: "Bonga NFT Collection — Mint Bonk's Sister on Solana",
        description:
          `${COLLECTION_STATS.totalSupply.toLocaleString()} unique Bonga NFTs on Solana. Stake up to 875 $BONGA/day (Cosmic). Mint and join the fam.`,
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        inLanguage: "en-US",
        primaryImageOfPage: absoluteUrl("/bonga-character.png"),
        mainEntity: {
          "@type": "Product",
          name: "Bonga NFT Collection",
          alternateName: ["Bonga NFTs", "Bonk Sister NFTs"],
          description:
            `${COLLECTION_STATS.totalSupply.toLocaleString()} chibi Shiba warrior NFTs — stake for tiered daily $BONGA (250–875/day).`,
          brand: { "@id": ORG_ID },
          category: "NFT",
          image: absoluteUrl("/bonga-character.png"),
          url: absoluteUrl("/nft"),
          offers: {
            "@type": "Offer",
            price: "0.08",
            priceCurrency: "SOL",
            availability: "https://schema.org/InStock",
            url: absoluteUrl("/nft#mint"),
          },
        },
      }}
    />
  );
}

export function AboutJsonLd() {
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${absoluteUrl("/about")}#webpage`,
          url: absoluteUrl("/about"),
          name: "About Bonga Bonk's Sister — Who Is Bonga on Solana?",
          description:
            "The official story of Bonga Bonk's Sister — Bonk's Sister on Solana. Bonga, Bonk, $BONGA, NFTs, Bonk Miner, and Bonga Peace.",
          isPartOf: { "@id": WEBSITE_ID },
          about: { "@id": ORG_ID },
          inLanguage: "en-US",
          primaryImageOfPage: absoluteUrl("/bonga-character.png"),
          mainEntity: {
            "@type": "CryptoCurrency",
            name: "$BONGA",
            alternateName: "Bonga Bonk's Sister token",
            identifier: BONGA_TOKEN_CA,
            url: BONGA_TOKEN_SOLSCAN_URL,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: ABOUT_FAQ.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        },
      ]}
    />
  );
}

export function PeaceJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${absoluteUrl("/peace")}#webpage`,
        url: absoluteUrl("/peace"),
        name: "Bonga Peace — Mindfulness the Bonga Way",
        description:
          "Free Bonga Peace tools: guided breathing, daily stretching, Tai Chi flows, affirmations, and check-ins.",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        inLanguage: "en-US",
        primaryImageOfPage: absoluteUrl("/nft/traits/bonga-01-peaceful.png"),
        mainEntity: {
          "@type": "SoftwareApplication",
          name: "Bonga Peace",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web browser",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
          url: absoluteUrl("/peace"),
          description:
            "Mindfulness from Bonk's Sister — slow flows, playful bonks, and peace without clinical vibes.",
        },
      }}
    />
  );
}