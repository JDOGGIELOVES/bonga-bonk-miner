import type { Metadata } from "next";
import Link from "next/link";
import { BongaHeader } from "@/components/layout/bonga-header";
import { BongaFooter } from "@/components/layout/bonga-footer";
import { buildPageMetadata } from "@/lib/site-seo";

export const metadata: Metadata = buildPageMetadata({
  title: "How to Connect Your Wallet | Play & Mine Bonga on Solana",
  description:
    "Learn how to connect Phantom or Solflare wallet to bongabonks.com to play Bonk Miner, Vibes Garden, claim $BONGA, stake NFTs, and more. Step-by-step download and setup instructions.",
  path: "/how-to-connect",
  keywords: [
    "how to connect wallet",
    "phantom wallet",
    "solflare wallet",
    "solana wallet",
    "connect to bongabonks",
    "mine bonga",
    "claim bonga",
    "solana web wallet",
    "bonga bonk miner wallet",
  ],
});

export default function HowToConnectPage() {
  return (
    <>
      <BongaHeader />
      <div className="min-h-screen bg-bonga-page">
        <div className="mx-auto max-w-3xl px-[30px] py-12">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight">
              How to Connect Your Wallet
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
              To play Bonk Miner, grow in Vibes Garden, claim $BONGA rewards, 
              stake NFTs, or use Pet Love — you need a Solana wallet.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We support <strong>Phantom</strong> and <strong>Solflare</strong> (the most popular and reliable options).
            </p>
          </div>

          {/* Why you need one */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">Why Connect a Wallet?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Claim your mined $BONGA from Bonk Miner and Vibes Garden (on-chain)</li>
              <li>• Stake Bonga NFTs to earn passive rewards</li>
              <li>• Participate in Pet Love and other community features</li>
              <li>• Your progress and claims are tied to your wallet address</li>
              <li>• All activity is on Solana mainnet — fully transparent and yours to control</li>
            </ul>
          </div>

          {/* Recommended Wallets */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">Recommended Wallets</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-bonga-orange">Phantom</h3>
                <p className="text-muted-foreground mb-3">
                  The most popular Solana wallet. Clean interface, great for beginners.
                </p>
                <a 
                  href="https://phantom.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bonga-teal hover:underline font-medium"
                >
                  Download Phantom →
                </a>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-bonga-teal">Solflare</h3>
                <p className="text-muted-foreground mb-3">
                  Excellent alternative with strong mobile support and features.
                </p>
                <a 
                  href="https://solflare.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-bonga-teal hover:underline font-medium"
                >
                  Download Solflare →
                </a>
              </div>
            </div>
          </div>

          {/* Web Wallet Instructions */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">How to Use a Web Wallet (Browser Extension)</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="bg-bonga-orange text-white text-xs px-2 py-0.5 rounded-full">1</span>
                  Install the Extension
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground ml-6">
                  <li>Go to <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="text-bonga-teal hover:underline">phantom.app</a> or <a href="https://solflare.com" target="_blank" rel="noopener noreferrer" className="text-bonga-teal hover:underline">solflare.com</a></li>
                  <li>Click "Download" or "Get Extension"</li>
                  <li>Install for Chrome, Edge, Firefox, or Brave (whichever you use)</li>
                  <li>Pin the wallet icon to your browser toolbar for easy access</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="bg-bonga-orange text-white text-xs px-2 py-0.5 rounded-full">2</span>
                  Create or Import a Wallet
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground ml-6">
                  <li>Open the wallet extension</li>
                  <li>Choose "Create a new wallet"</li>
                  <li><strong>Write down your Secret Recovery Phrase</strong> (12 or 24 words) on paper and store it safely offline. This is the only way to recover your wallet.</li>
                  <li>Never share your phrase with anyone or enter it on websites.</li>
                  <li>Set a strong password for the extension</li>
                  <li>(Optional) Import an existing wallet if you already have one</li>
                </ol>
                <p className="mt-2 text-xs text-amber-600">
                  ⚠️ Your seed phrase = your money. Treat it like cash.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="bg-bonga-orange text-white text-xs px-2 py-0.5 rounded-full">3</span>
                  Connect to bongabonks.com
                </h3>
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground ml-6">
                  <li>Go to <Link href="/" className="text-bonga-teal hover:underline">bongabonks.com</Link> (or any game page)</li>
                  <li>Click the <strong>"Connect Wallet"</strong> button (top right in the header, or in the game area)</li>
                  <li>Select <strong>Phantom</strong> or <strong>Solflare</strong> from the popup</li>
                  <li>Approve the connection in your wallet extension</li>
                  <li>You're connected! Your address will appear in the header.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Mobile Instructions */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">How to Connect on Mobile</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Download the <strong>Phantom</strong> or <strong>Solflare</strong> app from the App Store or Google Play.</li>
              <li>Create or restore your wallet in the app (back up your seed phrase!).</li>
              <li>Open the in-app browser (dApp browser) inside the wallet app.</li>
              <li>Navigate to <strong>bongabonks.com</strong></li>
              <li>Tap "Connect Wallet" and approve using the wallet inside the app.</li>
            </ol>
            <p className="mt-3 text-sm text-muted-foreground">
              Tip: Mobile works great for claiming and light play. Desktop extensions are often smoother for frequent tapping in the games.
            </p>
          </div>

          {/* Tips & Troubleshooting */}
          <div className="bonga-card p-8 mb-8">
            <h2 className="font-display text-2xl font-bold mb-4">Tips &amp; Troubleshooting</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Make sure you're on <strong>Solana Mainnet</strong> (not Devnet or Testnet) in your wallet settings.</li>
              <li>• You need a tiny amount of SOL in your wallet for transaction fees (usually &lt; $0.01).</li>
              <li>• If the connect button doesn't work, try refreshing the page or using a different browser.</li>
              <li>• Never approve suspicious connections or share your recovery phrase.</li>
              <li>• Your connected wallet address is public on-chain — this is normal for Solana.</li>
              <li>• The site will remember your connection on future visits (until you disconnect).</li>
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Still stuck? Join our <a href="https://t.me/bonga_sol_community" target="_blank" rel="noopener noreferrer" className="text-bonga-teal hover:underline">Telegram</a> or check the <Link href="/about" className="text-bonga-teal hover:underline">About page</Link>.
          </div>
        </div>
      </div>
      <BongaFooter />
    </>
  );
}
