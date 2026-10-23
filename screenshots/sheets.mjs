// Draws the picture sheets in images/ from the extension's own sources:
// sprout-stages.png, sprout-species.png and sprout-patterns.png from
// media/sprites.js, and icons.png from the icon drawings.
//
// Run: npm run screenshots

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const images = join(root, 'images');

const BG = '#191410';
const CARD = '#1f1914';
const INK = '#e6dbcd';
const MUTED = '#b8aa9b';
const FONT = "font-family=\"Segoe UI, Inter, sans-serif\"";

const png = (svg, file) =>
  writeFileSync(join(images, file), new Resvg(svg, { font: { loadSystemFonts: true }, fitTo: { mode: 'zoom', value: 2 } }).render().asPng());

// Sprout stages.
const source = readFileSync(join(root, 'media', 'sprites.js'), 'utf8');
const { SPRITES, PALETTE, SPECIES, PATTERNS, paletteFor } = new Function(
  `${source};return { SPRITES, PALETTE, SPECIES, PATTERNS, paletteFor };`,
)();
const PX = 6;
const pixels = (rows, ox, oy, colors = PALETTE) => {
  let out = '';
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch !== '.') out += `<rect x="${ox + x * PX}" y="${oy + y * PX}" width="${PX}" height="${PX}" fill="${colors[ch]}"/>`;
    });
  });
  return out;
};
const stages = [
  ['Egg', '0 saves', SPRITES.egg.crackOne],
  ['Hatchling', '10 saves', SPRITES.stages[1].walkA],
  ['Juvenile', '100 saves', SPRITES.stages[2].walkA],
  ['Adolescent', '400 saves', SPRITES.stages[3].walkA],
  ['Adult', '1,000 saves', SPRITES.stages[4].walkA],
];
const ground = 190;
let x = 40;
let body = '';
for (const [name, saves, rows] of stages) {
  const w = rows[0].length * PX;
  body += pixels(rows, x, ground - rows.length * PX);
  body += `<text x="${x + w / 2}" y="${ground + 36}" text-anchor="middle" ${FONT} font-size="18" font-weight="600" fill="${INK}">${name}</text>`;
  body += `<text x="${x + w / 2}" y="${ground + 60}" text-anchor="middle" ${FONT} font-size="14" fill="${MUTED}">${saves}</text>`;
  x += w + 56;
}
const width = x - 16;
png(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${ground + 90}"><rect width="100%" height="100%" rx="20" fill="${BG}"/><rect x="24" y="${ground}" width="${width - 48}" height="3" rx="1.5" fill="#4a5c3d"/>${body}</svg>`,
  'sprout-stages.png',
);

// Every species at every stage, one row per species.
{
  const PX2 = 5;
  const big = (rows, ox, oy, colors = PALETTE) => {
    let out = '';
    rows.forEach((row, y) => {
      [...row].forEach((ch, x2) => {
        if (ch !== '.') out += `<rect x="${ox + x2 * PX2}" y="${oy + y * PX2}" width="${PX2}" height="${PX2}" fill="${colors[ch]}"/>`;
      });
    });
    return out;
  };
  const columns = [190, 330, 500, 700];
  const rowHeight = 150;
  let out = '';
  ['Hatchling', 'Juvenile', 'Adolescent', 'Adult'].forEach((name, i) => {
    out += `<text x="${columns[i]}" y="44" ${FONT} font-size="16" font-weight="600" fill="${MUTED}">${name}</text>`;
  });
  SPECIES.forEach((sp, r) => {
    const base = 70 + rowHeight * (r + 1) - 24;
    out += `<text x="40" y="${base - 30}" ${FONT} font-size="20" font-weight="600" fill="${INK}">${sp.name}</text>`;
    for (let i = 1; i <= 4; i++) {
      const rows = sp.stages[i].walkA;
      out += big(rows, columns[i - 1], base - rows.length * PX2);
    }
    out += `<rect x="180" y="${base}" width="720" height="2" rx="1" fill="#4a5c3d"/>`;
  });
  const h = 70 + rowHeight * SPECIES.length + 20;
  png(`<svg xmlns="http://www.w3.org/2000/svg" width="940" height="${h}"><rect width="100%" height="100%" rx="20" fill="${BG}"/>${out}</svg>`, 'sprout-species.png');
}

// The four patterns, each on a different adult.
{
  let out = '';
  let px = 40;
  const ground = 170;
  PATTERNS.forEach((pattern, i) => {
    const rows = SPECIES[i % SPECIES.length].stages[4].walkA;
    const w = rows[0].length * PX;
    out += pixels(rows, px, ground - rows.length * PX, paletteFor(pattern.id));
    out += `<text x="${px + w / 2}" y="${ground + 36}" text-anchor="middle" ${FONT} font-size="18" font-weight="600" fill="${INK}">${pattern.name}</text>`;
    px += w + 48;
  });
  const w = px - 8;
  png(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${ground + 70}"><rect width="100%" height="100%" rx="20" fill="${BG}"/><rect x="24" y="${ground}" width="${w - 48}" height="3" rx="1.5" fill="#4a5c3d"/>${out}</svg>`,
    'sprout-patterns.png',
  );
}

// Icons: the product icons with what they stand for, then a row of file icons.
const PRODUCT = [
  ['explorer', 'Explorer'],
  ['search', 'Search'],
  ['source-control', 'Source control'],
  ['run', 'Run and debug'],
  ['extensions', 'Extensions'],
  ['testing', 'Testing'],
  ['remote', 'Remote'],
  ['account', 'Account'],
  ['settings', 'Settings'],
];
const inner = (file, color) => {
  const svg = readFileSync(file, 'utf8').replace(/#000/g, color);
  return { attrs: svg.match(/<svg([^>]*)>/)[1].replace(/xmlns="[^"]+"|viewBox="[^"]+"/g, ''), body: svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '') };
};
const cell = 132;
let icons = '';
PRODUCT.forEach(([file, label], i) => {
  const { attrs, body: b } = inner(join(root, 'icons', 'product', `${file}.svg`), INK);
  const cx = 32 + i * cell;
  icons += `<svg x="${cx + 34}" y="40" width="48" height="48" viewBox="0 0 24 24" ${attrs}>${b}</svg>`;
  icons += `<text x="${cx + 58}" y="118" text-anchor="middle" ${FONT} font-size="14" fill="${MUTED}">${label}</text>`;
});
const FILES = readdirSync(join(root, 'icons', 'files'))
  .filter((f) => f.endsWith('.svg') && !f.endsWith('-open.svg'))
  .sort();
const perRow = Math.floor((PRODUCT.length * cell) / 52);
FILES.forEach((f, i) => {
  const { attrs, body: b } = inner(join(root, 'icons', 'files', f), '#000');
  const fx = 50 + (i % perRow) * 52;
  const fy = 170 + Math.floor(i / perRow) * 52;
  icons += `<svg x="${fx}" y="${fy}" width="32" height="32" viewBox="0 0 16 16" ${attrs}>${b}</svg>`;
});
const iconsHeight = 170 + Math.ceil(FILES.length / perRow) * 52 + 24;
const iconsWidth = PRODUCT.length * cell + 64;
png(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${iconsWidth}" height="${iconsHeight}"><rect width="100%" height="100%" rx="20" fill="${BG}"/><rect x="24" y="148" width="${iconsWidth - 48}" height="${iconsHeight - 172}" rx="14" fill="${CARD}"/>${icons}</svg>`,
  'icons.png',
);
console.log('Sheets written to images/');
