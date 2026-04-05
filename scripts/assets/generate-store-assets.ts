import sharp from "sharp";
import path from "path";
import fs from "fs";

const WIDTH = 1024;
const HEIGHT = 500;

async function generateFeatureGraphic() {
  const outDir = path.join(process.cwd(), "docs", "store-assets");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Create SVG with gradient background, logo text and tagline
  const svg = `
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#2563EB"/>
        <stop offset="100%" style="stop-color:#1E40AF"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#00000040"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" rx="0"/>

    <!-- Decorative circles -->
    <circle cx="120" cy="80" r="200" fill="#ffffff08"/>
    <circle cx="900" cy="420" r="180" fill="#ffffff08"/>

    <!-- PDF icon -->
    <g transform="translate(${WIDTH / 2 - 30}, 80)">
      <rect x="0" y="0" width="60" height="72" rx="8" fill="#ffffff30" stroke="#ffffffaa" stroke-width="2"/>
      <text x="30" y="48" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white">PDF</text>
    </g>

    <!-- App name -->
    <text x="${WIDTH / 2}" y="210" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="white" filter="url(#shadow)">
      PDFfULL
    </text>

    <!-- Tagline -->
    <text x="${WIDTH / 2}" y="280" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="400" fill="#ffffffcc">
      Foto em PDF. Um clique.
    </text>

    <!-- Feature pills -->
    <g transform="translate(${WIDTH / 2 - 320}, 330)">
      <rect x="0" y="0" width="180" height="44" rx="22" fill="#ffffff20" stroke="#ffffff40" stroke-width="1"/>
      <text x="90" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">📷 Câmera Direta</text>
    </g>
    <g transform="translate(${WIDTH / 2 - 100}, 330)">
      <rect x="0" y="0" width="200" height="44" rx="22" fill="#ffffff20" stroke="#ffffff40" stroke-width="1"/>
      <text x="100" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">⚡ PDF Instantâneo</text>
    </g>
    <g transform="translate(${WIDTH / 2 + 140}, 330)">
      <rect x="0" y="0" width="180" height="44" rx="22" fill="#ffffff20" stroke="#ffffff40" stroke-width="1"/>
      <text x="90" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="white">🤖 Análise com IA</text>
    </g>

    <!-- Bottom tagline -->
    <text x="${WIDTH / 2}" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#ffffff80">
      Grátis • Sem instalar nada • 100% no dispositivo
    </text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(outDir, "feature-graphic.png"));

  console.log("✅ Feature graphic gerada:", path.join(outDir, "feature-graphic.png"));
}

generateFeatureGraphic().catch(console.error);
