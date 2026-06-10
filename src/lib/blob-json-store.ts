type BlobAccess = "public" | "private";

export function blobAccess(): BlobAccess {
  const configured = process.env.BLOB_DEFAULT_ACCESS?.trim().toLowerCase();
  if (configured === "private" || configured === "public") {
    return configured;
  }
  return "public";
}

async function streamToText(
  stream: ReadableStream<Uint8Array> | NodeJS.ReadableStream
): Promise<string> {
  if ("getReader" in stream) {
    return new Response(stream).text();
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Read JSON blob text — tries configured access plus fallback (private stores need this). */
export async function readBlobText(pathname: string): Promise<string | null> {
  const { get, head } = await import("@vercel/blob");
  const primary = blobAccess();
  const fallback: BlobAccess = primary === "public" ? "private" : "public";

  for (const access of [primary, fallback]) {
    try {
      const result = await get(pathname, { access, useCache: false });
      if (result?.stream) {
        return streamToText(result.stream);
      }
    } catch {
      /* try fallback */
    }

    try {
      const meta = await head(pathname);
      const response = await fetch(meta.url, { cache: "no-store" });
      if (response.ok) {
        return response.text();
      }
    } catch {
      /* try next access */
    }
  }

  return null;
}

export async function writeBlobText(pathname: string, text: string): Promise<void> {
  const { put } = await import("@vercel/blob");
  await put(pathname, text, {
    access: blobAccess(),
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}