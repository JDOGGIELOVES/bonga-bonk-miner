import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@vercel/blob",
    "undici",
    "@metaplex-foundation/umi",
    "@metaplex-foundation/umi-bundle-defaults",
    "@metaplex-foundation/mpl-candy-machine",
    "@metaplex-foundation/mpl-token-metadata",
    "@metaplex-foundation/mpl-toolbox",
  ],
  async redirects() {
    // Vibes Garden retired from UI — send old bookmarks to Miner.
    return [
      {
        source: "/",
        has: [{ type: "query", key: "mode", value: "garden" }],
        destination: "/?mode=miner",
        permanent: false,
      },
    ];
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;