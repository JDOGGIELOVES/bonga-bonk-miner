import sharp from "sharp";
import { readdir } from "fs/promises";
import path from "path";

const PUBLIC = path.resolve("public");

const TARGETS = [
  "bonga-character.png",
  "characters/bonga-idle.png",
  "characters/bonga-swing-impact.png",
  "characters/bonga-bonk-happy.png",
];

function isBackground(r, g, b, a) {
  if (a < 10) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max - min;
  const lum = (r + g + b) / 3;
  // Checkerboard: light gray (~192-204) and white (~255), low saturation
  return sat <= 28 && lum >= 165;
}

function floodRemoveBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const o = i * 4;
    if (!isBackground(data[o], data[o + 1], data[o + 2], data[o + 3])) return;
    visited[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i - x) / width;
    const o = i * 4;
    data[o + 3] = 0;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  return data;
}

async function processImage(relPath) {
  const filePath = path.join(PUBLIC, relPath);
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  floodRemoveBackground(pixels, info.width, info.height);

  const outPath = filePath;
  await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outPath + ".tmp");

  const { rename, unlink } = await import("fs/promises");
  await unlink(outPath).catch(() => {});
  await rename(outPath + ".tmp", outPath);
  console.log(`✓ ${relPath} (${info.width}x${info.height})`);
}

for (const rel of TARGETS) {
  try {
    await processImage(rel);
  } catch (err) {
    console.warn(`skip ${rel}:`, err.message);
  }
}