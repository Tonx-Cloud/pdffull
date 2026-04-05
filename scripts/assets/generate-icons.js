const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

async function generateIcon(size, filename, maskable = false) {
  const padding = maskable ? Math.round(size * 0.1) : Math.round(size * 0.05);
  const innerSize = size - padding * 2;
  const fontSize = Math.round(innerSize * 0.32);
  const subFontSize = Math.round(innerSize * 0.14);
  const cornerRadius = Math.round(size * 0.18);

  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${maskable ? 0 : cornerRadius}" fill="#2563eb"/>
    <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${Math.round(innerSize * 0.12)}" fill="white" opacity="0.15"/>
    <text x="${size / 2}" y="${size * 0.48}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${fontSize}" fill="white" text-anchor="middle" dominant-baseline="middle">PDF</text>
    <text x="${size / 2}" y="${size * 0.68}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${subFontSize}" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">fULL</text>
  </svg>`;

  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(iconsDir, filename));
  console.log(`✅ ${filename} (${size}x${size})`);
}

async function generateFavicon() {
  const size = 32;
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="6" fill="#2563eb"/>
    <text x="${size / 2}" y="${size * 0.55}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">P</text>
  </svg>`;

  // Generate as ICO-compatible PNG
  await sharp(Buffer.from(svg)).resize(32, 32).png().toFile(path.join(__dirname, '..', 'public', 'favicon.png'));

  // Also generate favicon.ico (just a renamed 32x32 PNG — browsers accept it)
  const buf = await sharp(Buffer.from(svg)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'favicon.ico'), buf);
  console.log('✅ favicon.ico');
}

(async () => {
  await generateIcon(192, 'icon-192x192.png');
  await generateIcon(512, 'icon-512x512.png');
  await generateIcon(512, 'icon-512-maskable.png', true);
  await generateFavicon();
  console.log('\nAll icons generated!');
})();
