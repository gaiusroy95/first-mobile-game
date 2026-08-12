/**
 * Writes a simple Battle Formation app icon as PNG (no external deps).
 * 3x2 formation: brass back-row dots, ember front-row dots on ink background.
 */
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assets = join(__dirname, "../apps/mobile/assets");

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(path, size, { transparent = false } = {}) {
  const ink = [11, 18, 16, transparent ? 0 : 255];
  const brass = [212, 168, 75, 255];
  const ember = [196, 92, 38, 255];
  const line = [42, 58, 50, 200];

  const rgba = Buffer.alloc(size * size * 4);
  const set = (x, y, rgbaColor) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    rgba[i] = rgbaColor[0];
    rgba[i + 1] = rgbaColor[1];
    rgba[i + 2] = rgbaColor[2];
    rgba[i + 3] = rgbaColor[3];
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) set(x, y, ink);
  }

  const pad = size * 0.2;
  const cell = (size - 2 * pad) / 3;
  const rBack = cell * 0.22;
  const rFront = cell * 0.26;

  const centers = [];
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      centers.push({
        x: pad + cell * (col + 0.5),
        y: pad + cell * (row + 0.55),
        front: row === 1,
      });
    }
  }

  // grid lines
  const drawLine = (x0, y0, x1, y1) => {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = Math.round(x0 + (x1 - x0) * t);
      const y = Math.round(y0 + (y1 - y0) * t);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) set(x + dx, y + dy, line);
    }
  };

  for (let col = 0; col < 3; col++) {
    const a = centers[col];
    const b = centers[col + 3];
    drawLine(a.x, a.y, b.x, b.y);
  }
  for (let row = 0; row < 2; row++) {
    drawLine(centers[row * 3].x, centers[row * 3].y, centers[row * 3 + 2].x, centers[row * 3 + 2].y);
  }

  for (const c of centers) {
    const rad = c.front ? rFront : rBack;
    const color = c.front ? ember : brass;
    const r2 = rad * rad;
    for (let y = Math.floor(c.y - rad - 1); y <= c.y + rad + 1; y++) {
      for (let x = Math.floor(c.x - rad - 1); x <= c.x + rad + 1; x++) {
        const dx = x - c.x;
        const dy = y - c.y;
        if (dx * dx + dy * dy <= r2) set(x, y, color);
      }
    }
  }

  const stride = size * 4 + 1;
  const raw = Buffer.alloc(stride * size);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
  console.log("wrote", path, png.length);
}

writePng(join(assets, "icon.png"), 1024);
writePng(join(assets, "splash-icon.png"), 1024);
writePng(join(assets, "favicon.png"), 192);
writePng(join(assets, "android-icon-foreground.png"), 1024, { transparent: true });
writePng(join(assets, "android-icon-background.png"), 432);
writePng(join(assets, "android-icon-monochrome.png"), 432);
