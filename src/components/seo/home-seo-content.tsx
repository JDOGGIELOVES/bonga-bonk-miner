import Link from "next/link";

/** Server-rendered crawlable content — always in the HTML for search engines. */
export function HomeSeoContent() {
  return (
    <section
      aria-label="About Bonga and Bonk"
      className="sr-only"
    >
      <h1>Bonga Bonk Miner — Bonga Bonk&apos;s Sister on Solana</h1>
      <p>
        Bonga Bonk&apos;s Sister is Bonk&apos;s Sister. Play the free Bonga Bonk Miner game at
        bongabonks.com — tap to bonk meme coins, mine $BONGA on Solana, and
        raise the frequency with peace, love, and good bonks.
      </p>
      <p>
        The Bonga ecosystem includes the Bonk Miner tap game, an 8,888-piece
        Bonga NFT collection, and Bonga Peace — guided breathing, stretching,
        Tai Chi, and daily affirmations the Bonga way.
      </p>
      <nav aria-label="Bonga site sections">
        <ul>
          <li>
            <Link href="/">Bonga Bonk Miner — play and mine $BONGA</Link>
          </li>
          <li>
            <Link href="/nft">Bonga NFT collection — mint on Solana</Link>
          </li>
          <li>
            <Link href="/peace">Bonga Peace — mindfulness and bonk breaks</Link>
          </li>
          <li>
            <Link href="/about">About Bonga Bonk&apos;s Sister — official story</Link>
          </li>
        </ul>
      </nav>
      <p>
        Keywords: Bonga Bonk&apos;s Sister, Bonga, Bonk, Bonga Bonk, Bonk&apos;s Sister, Bonga Solana,
        Bonk Miner, $BONGA token, Bonga NFT, bongabonks, Raise the Frequency.
      </p>
    </section>
  );
}