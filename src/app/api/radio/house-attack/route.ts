import { NextResponse } from "next/server";

/**
 * Proxy for House Attack Radio live stream.
 * 
 * Why proxy?
 * - The radio.garden redirect + virtualtronics.net upstream often blocks direct <audio> cross-origin playback (CORS, referer, etc.).
 * - Same-origin request from our page (/api/...) has no CORS restrictions for the client Audio element.
 * - Server-side fetch (Node) follows the redirects and streams the raw audio/mpeg bytes.
 *
 * Original station: https://radio.garden/listen/house-attack-radio/8h6Ep8KU
 * Final upstream discovered: https://virtualtronics.net/proxy/houseattack?mp=/stream (Shoutcast-style, audio/mpeg)
 */

export const runtime = "nodejs";

export async function GET() {
  // Use the final working upstream for reliability (avoids extra redirects in the chain)
  const upstreamUrl = "https://virtualtronics.net/proxy/houseattack?mp=/stream";

  try {
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        // Some Shoutcast/Icecast proxies are picky about User-Agent and Referer
        "User-Agent": "Mozilla/5.0 (compatible; BongaHouseRadio/1.0)",
        "Referer": "https://radio.garden/",
        "Accept": "*/*",
      },
      // Important: do not cache live radio
      cache: "no-store",
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      console.error("[radio-proxy] Upstream failed:", upstreamRes.status, upstreamRes.statusText);
      return new NextResponse("House Attack Radio stream is currently unavailable", {
        status: 502,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const contentType = upstreamRes.headers.get("content-type") || "audio/mpeg";

    // Stream the live audio bytes to the client
    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        // Help some players
        "Accept-Ranges": "bytes",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("[radio-proxy] Proxy error:", err);
    return new NextResponse("Radio proxy error - try the external link below", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
