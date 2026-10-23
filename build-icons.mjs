// Builds the Rosa product icon font from the line drawings in icons/product.
// A font only keeps filled shapes, so each drawing is traced to an outline
// first. Writes fonts/rosa-icons.woff and product-icons.json, points the
// rosa-sprout icon in package.json at the sauropod, and draws icon.png from
// the sprout sprite.
//
// Run: node build-icons.mjs (needs the devDependencies in package.json)

import { createReadStream, createWriteStream, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import SVGFixer from 'oslllo-svg-fixer';
import { SVGIcons2SVGFontStream } from 'svgicons2svgfont';
import svg2ttf from 'svg2ttf';
import ttf2woff from 'ttf2woff';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, 'icons', 'product');
const traced = join(here, '.traced');

// Drawing file -> the VS Code icon ids it replaces.
const ICONS = {
  explorer: ['explorer-view-icon'],
  search: ['search-view-icon'],
  'source-control': ['source-control-view-icon'],
  run: ['run-view-icon'],
  extensions: ['extensions-view-icon'],
  testing: ['testing-view-icon'],
  remote: ['remote-explorer-view-icon'],
  account: ['accounts-view-bar-icon'],
  settings: ['settings-view-bar-icon'],
};

rmSync(traced, { recursive: true, force: true });
mkdirSync(traced, { recursive: true });
await SVGFixer(source, traced, { showProgressBar: false, traceResolution: 1200 }).fix();

const glyphs = readdirSync(traced).filter((f) => f.endsWith('.svg')).sort();
const names = glyphs.map((f) => f.replace(/\.svg$/, ''));
for (const name of Object.keys(ICONS)) {
  if (!names.includes(name)) throw new Error(`No drawing for ${name}`);
}
for (const name of ['account', 'egg']) {
  if (!names.includes(name)) throw new Error(`No drawing for the status bar ${name}`);
}

const svgFont = await new Promise((resolve, reject) => {
  const chunks = [];
  const stream = new SVGIcons2SVGFontStream({ fontName: 'rosa-icons', fontHeight: 1000, normalize: true, log: () => {} });
  stream.on('data', (c) => chunks.push(c)).on('end', () => resolve(chunks.map(String).join(""))).on('error', reject);
  names.forEach((name, i) => {
    const glyph = createReadStream(join(traced, `${name}.svg`));
    glyph.metadata = { name, unicode: [String.fromCodePoint(0xe000 + i)] };
    stream.write(glyph);
  });
  stream.end();
});

const ttf = svg2ttf(svgFont, {});
mkdirSync(join(here, 'fonts'), { recursive: true });
writeFileSync(join(here, 'fonts', 'rosa-icons.woff'), Buffer.from(ttf2woff(new Uint8Array(ttf.buffer)).buffer));

// VS Code wants the code point written as a backslash and hex, like "\e000".
const glyphCode = (i) => `\\${(0xe000 + i).toString(16)}`;
const iconDefinitions = {};
names.forEach((name, i) => {
  for (const id of ICONS[name] ?? []) {
    iconDefinitions[id] = { fontCharacter: glyphCode(i) };
  }
});
const theme = {
  fonts: [{ id: 'rosa-icons', src: [{ path: './fonts/rosa-icons.woff', format: 'woff' }], weight: 'normal', style: 'normal' }],
  iconDefinitions,
};
writeFileSync(join(here, 'product-icons.json'), `${JSON.stringify(theme, null, 2)}\n`);
rmSync(traced, { recursive: true, force: true });

// The status bar shows the egg until it hatches, then the account sauropod.
const pkgPath = join(here, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.contributes.icons['rosa-sprout'].default.fontCharacter = glyphCode(names.indexOf('account'));
pkg.contributes.icons['rosa-egg'].default.fontCharacter = glyphCode(names.indexOf('egg'));
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

// icon.png: the adult sprout on a cream tile.
const sproutSource = readFileSync(join(here, 'media', 'sprites.js'), 'utf8');
const { SPRITES, PALETTE } = new Function(`${sproutSource};return { SPRITES, PALETTE };`)();
const adult = SPRITES.stages[4].walkA;
const px = 4;
const left = Math.round((128 - adult[0].length * px) / 2);
const top = 104 - adult.length * px;
let pixels = '';
adult.forEach((row, y) => {
  [...row].forEach((ch, x) => {
    if (ch !== '.') pixels += `<rect x="${left + x * px}" y="${top + y * px}" width="${px}" height="${px}" fill="${PALETTE[ch]}"/>`;
  });
});
const tile = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="28" fill="#f5ede5"/><rect x="10" y="104" width="108" height="4" rx="2" fill="#4a5c3d" opacity=".35"/>${pixels}</svg>`;
writeFileSync(join(here, 'icon.png'), new Resvg(tile).render().asPng());
console.log(`Product icons: ${Object.keys(iconDefinitions).length} icons in fonts/rosa-icons.woff`);
