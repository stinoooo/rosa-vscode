// Writes the Rosa file icons (icons/files/*.svg) and file-icons.json.
// Each icon is drawn on a 16 pixel grid in one of the colors below. The
// colors are mid tones so one set of icons reaches 3:1 against both the
// Rosa Dark and the Rosa Light sidebar, and the build stops when one does not.
//
// Run: node build-file-icons.mjs

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'icons', 'files');

const C = {
  sky: '#4d8ca0', // --season-monsoon
  gold: '#a07d25', // --color-gold
  rose: '#c06a6a', // --color-rose
  leaf: '#728c4a', // --color-olive
  ember: '#be703d', // --season-windswept
  sage: '#8e8362', // --season-wildfire
  bark: '#8f7c6c', // --faint
  danger: '#c95c5c', // --down
  plum: '#9a6f9a', // a dusty mauve, for the languages whose own color is purple
  cream: '#f5ede5',
};

// Surfaces the icons sit on: the Rosa Dark and Rosa Light sidebars.
const SURFACES = ['#16110d', '#efe6dc'];

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`;
const line = (color, d, w = 1.3) => `<path d="${d}" stroke="${color}" stroke-width="${w}"/>`;
const fill = (color, d) => `<path d="${d}" fill="${color}"/>`;
const badge = (color, letters, w = 1.45) =>
  `<rect x="1" y="1.5" width="14" height="13" rx="3" fill="${color}"/>` + line(C.cream, letters, w);

// Capital letters for the badges, drawn as strokes in a 4 by 6 cell with
// absolute M, L and C commands only, so they scale by their numbers.
const GLYPHS = {
  A: 'M0 6L2 0L4 6M0.7 4L3.3 4',
  B: 'M0 3L2.4 3C3.3 3 4 3.6 4 4.5C4 5.4 3.3 6 2.4 6L0 6L0 0L2.1 0C2.9 0 3.6 0.6 3.6 1.5C3.6 2.4 2.9 3 2.1 3',
  C: 'M4 1C3.5 0.4 2.8 0 2 0C0.8 0 0 1.3 0 3C0 4.7 0.8 6 2 6C2.8 6 3.5 5.6 4 5',
  D: 'M0 0L0 6L1.7 6C3.1 6 4 4.8 4 3C4 1.2 3.1 0 1.7 0L0 0',
  E: 'M4 0L0 0L0 6L4 6M0 3L3 3',
  F: 'M4 0L0 0L0 6M0 3L3 3',
  G: 'M4 1C3.5 0.4 2.8 0 2 0C0.8 0 0 1.3 0 3C0 4.7 0.8 6 2 6C3.2 6 4 5.1 4 3.7L4 3.3L2.4 3.3',
  H: 'M0 0L0 6M4 0L4 6M0 3L4 3',
  I: 'M2 0L2 6M0.8 0L3.2 0M0.8 6L3.2 6',
  K: 'M0 0L0 6M4 0L0 3.8M1.3 2.7L4 6',
  L: 'M0 0L0 6L4 6',
  M: 'M0 6L0 0L2 3.6L4 0L4 6',
  N: 'M0 6L0 0L4 6L4 0',
  O: 'M2 0C0.8 0 0 1.3 0 3C0 4.7 0.8 6 2 6C3.2 6 4 4.7 4 3C4 1.3 3.2 0 2 0',
  P: 'M0 6L0 0L2.2 0C3.3 0 4 0.7 4 1.7C4 2.7 3.3 3.4 2.2 3.4L0 3.4',
  R: 'M0 6L0 0L2.2 0C3.3 0 4 0.7 4 1.7C4 2.7 3.3 3.4 2.2 3.4L0 3.4M2.2 3.4L4 6',
  S: 'M3.8 0.9C3.4 0.3 2.8 0 2 0C1 0 0.2 0.6 0.2 1.6C0.2 3.7 4 2.5 4 4.5C4 5.4 3.1 6 2 6C1.1 6 0.4 5.6 0 5',
  T: 'M0 0L4 0M2 0L2 6',
  U: 'M0 0L0 4C0 5.3 0.8 6 2 6C3.2 6 4 5.3 4 4L4 0',
  V: 'M0 0L2 6L4 0',
  W: 'M0 0L1 6L2 2.4L3 6L4 0',
  X: 'M0 0L4 6M4 0L0 6',
  Y: 'M0 0L2 3L4 0M2 3L2 6',
  Z: 'M0 0L4 0L0 6L4 6',
  '#': 'M1.5 0.4L1 5.6M3.3 0.4L2.8 5.6M0 2L4 2M0 4L4 4',
  '+': 'M2 1.2L2 4.8M0.2 3L3.8 3',
};
// Lays one to three letters out across a badge, centered.
function letters(text) {
  const n = text.length;
  const [w, gap, h, top] = n === 1 ? [4.4, 0, 6.6, 4.7] : n === 2 ? [3.8, 1.5, 6, 5] : [2.9, 1, 5.4, 5.3];
  const left = 8 - (n * w + (n - 1) * gap) / 2;
  return [...text]
    .map((ch, i) => {
      const x = left + i * (w + gap);
      let k = 0;
      return GLYPHS[ch].replace(/\d*\.?\d+/g, (v) => +(k++ % 2 === 0 ? x + (v * w) / 4 : top + (v * h) / 6).toFixed(2));
    })
    .join('');
}
const lettered = (color, text) => svg(badge(color, letters(text), text.length === 3 ? 1.15 : 1.45));

const S_RIGHT = 'M12.6 6.4c-.35-.5-.95-.8-1.6-.8-.9 0-1.6.5-1.6 1.3 0 1.8 3.3 1 3.3 2.9 0 .9-.8 1.5-1.75 1.5-.7 0-1.35-.3-1.75-.85';
const PAGE = 'M4 1.75h5.25L12.5 5v8.25c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-10.5c0-.55.45-1 1-1Z';
const FOLD = 'M9.25 1.75V5h3.25';

const page = (color, inner = '') =>
  fill(color, PAGE) + line('#00000033', FOLD, 1) + inner;

const FOLDER_CLOSED = 'M1.5 4c0-.8.6-1.5 1.4-1.5h3.3l1.5 1.6h5.4c.8 0 1.4.6 1.4 1.4v6.6c0 .8-.6 1.4-1.4 1.4H2.9c-.8 0-1.4-.6-1.4-1.4Z';
const FOLDER_OPEN_BACK = 'M1.5 4c0-.8.6-1.5 1.4-1.5h3.3l1.5 1.6h5.4c.8 0 1.4.6 1.4 1.4v1H4.3c-.6 0-1.1.4-1.3.9L1.5 11.6Z';
const FOLDER_OPEN_FRONT = 'M3.1 7.4c.2-.5.7-.9 1.3-.9h10.1c.6 0 1 .6.8 1.2l-1.5 4.5c-.2.6-.7.9-1.3.9H2.2c-.5 0-.9-.5-.7-1Z';

function folder(color, emblem = '') {
  return {
    closed: svg(fill(color, FOLDER_CLOSED) + emblem),
    open: svg(fill(color, FOLDER_OPEN_BACK) + `<path d="${FOLDER_OPEN_FRONT}" fill="${color}" opacity=".75"/>` + emblem),
  };
}
// A small mark in the folder's lower right, on a cream disc so it reads on the color.
const emblem = (color, d) => `<circle cx="11.75" cy="10.25" r="3.5" fill="${C.cream}"/>` + line(color, d, 1.2);

// A rounded hexagon, for Godot resources.
const HEX = 'M7.4 1.65c.4-.2.8-.2 1.2 0l4.8 2.75c.35.2.6.6.6 1v5.2c0 .4-.25.8-.6 1l-4.8 2.75c-.4.2-.8.2-1.2 0L2.6 11.6c-.35-.2-.6-.6-.6-1V5.4c0-.4.25-.8.6-1Z';
// A shaded ball, for shaders.
const sphere = (color) =>
  svg(
    `<circle cx="8" cy="8" r="6.25" fill="${color}"/>` +
      fill('#00000033', 'M14.25 8A6.25 6.25 0 0 1 3.6 12.4 6.25 6.25 0 0 0 12.4 3.6 6.2 6.2 0 0 1 14.25 8Z') +
      line(C.cream, 'M4.6 7.3c.2-1.3 1.3-2.5 2.7-2.75', 1.3),
  );

const FILES = {
  file: svg(page(C.bark)),
  typescript: svg(badge(C.sky, 'M3.4 5.9h4.2M5.5 5.9v5.9 ' + S_RIGHT)),
  javascript: svg(badge(C.gold, 'M7.2 5.9v4.5c0 1-.6 1.6-1.5 1.6-.6 0-1.15-.3-1.45-.8 ' + S_RIGHT)),
  react: svg(
    `<ellipse cx="8" cy="8" rx="6.5" ry="2.6" stroke="${C.sky}" stroke-width="1.1"/>` +
      `<ellipse cx="8" cy="8" rx="6.5" ry="2.6" stroke="${C.sky}" stroke-width="1.1" transform="rotate(60 8 8)"/>` +
      `<ellipse cx="8" cy="8" rx="6.5" ry="2.6" stroke="${C.sky}" stroke-width="1.1" transform="rotate(120 8 8)"/>` +
      `<circle cx="8" cy="8" r="1.4" fill="${C.sky}"/>`,
  ),
  json: svg(line(C.gold, 'M5.5 2.5c-1.6 0-2 .7-2 2v1.6c0 .9-.6 1.6-1.5 1.9.9.3 1.5 1 1.5 1.9v1.6c0 1.3.4 2 2 2M10.5 2.5c1.6 0 2 .7 2 2v1.6c0 .9.6 1.6 1.5 1.9-.9.3-1.5 1-1.5 1.9v1.6c0 1.3-.4 2-2 2', 1.5)),
  markdown: svg(
    `<rect x="1" y="3" width="14" height="10" rx="2.25" stroke="${C.bark}" stroke-width="1.3"/>` +
      line(C.bark, 'M3.75 10.25v-4.5l1.9 2.3 1.9-2.3v4.5M11 5.75v4.4M9.4 8.6l1.6 1.65 1.6-1.65', 1.3),
  ),
  css: svg(line(C.rose, 'M6.2 2.5 4.6 13.5M11.4 2.5 9.8 13.5M2.8 6h11M2.2 10h11', 1.5)),
  html: svg(line(C.ember, 'M5.25 4 1.75 8l3.5 4M10.75 4l3.5 4-3.5 4M9.2 2.75 6.8 13.25', 1.5)),
  prisma: svg(
    fill(C.sky, 'M7.3 1.4c.3-.5 1-.5 1.3 0l5.6 10.1c.25.45 0 1-.5 1.15l-6.3 1.95c-.3.1-.6.05-.85-.15L2.3 11.6c-.35-.25-.45-.75-.25-1.1Z') +
      line(C.cream, 'M8 2.6 6.3 13.4', 1.1),
  ),
  database: svg(
    `<ellipse cx="8" cy="4" rx="5.25" ry="2" stroke="${C.sage}" stroke-width="1.3"/>` +
      line(C.sage, 'M2.75 4v8c0 1.1 2.35 2 5.25 2s5.25-.9 5.25-2V4M2.75 8c0 1.1 2.35 2 5.25 2s5.25-.9 5.25-2'),
  ),
  env: svg(
    `<circle cx="5.25" cy="8" r="3" stroke="${C.danger}" stroke-width="1.4"/>` +
      line(C.danger, 'M8.25 8h6M12.25 8v2.25M14.25 8v1.6', 1.4),
  ),
  yaml: svg(line(C.rose, 'M2.75 4h.1M6 4h7.25M4.75 8h.1M8 8h5.25M4.75 12h.1M8 12h5.25', 1.6)),
  image: svg(
    `<rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="${C.leaf}" stroke-width="1.3"/>` +
      `<circle cx="5.5" cy="6.25" r="1.25" fill="${C.leaf}"/>` +
      line(C.leaf, 'M2 12l3.8-3.6 2.4 2.2 2.3-2.4 3.7 3.8', 1.3),
  ),
  svgfile: svg(
    line(C.ember, 'M3.5 12.5C4.5 6 11.5 10 12.5 3.5M3.5 12.5 7 9M12.5 3.5 9 7', 1.2) +
      `<rect x="1.75" y="10.75" width="3.5" height="3.5" rx=".75" fill="${C.ember}"/><rect x="10.75" y="1.75" width="3.5" height="3.5" rx=".75" fill="${C.ember}"/>`,
  ),
  test: svg(
    fill(C.leaf, 'M8 1.6s-4.75 5.3-4.75 8.3a4.75 4.75 0 0 0 9.5 0c0-3-4.75-8.3-4.75-8.3Z') +
      line(C.cream, 'M5.9 10.1l1.4 1.4 2.8-2.9', 1.35),
  ),
  git: svg(
    `<circle cx="4.5" cy="3.5" r="1.6" fill="${C.ember}"/><circle cx="4.5" cy="12.5" r="1.6" fill="${C.ember}"/>` +
      line(C.ember, 'M4.5 5.1v5.8M4.5 10c0-2.6 5.6-1.6 7-4.3', 1.35) +
      fill(C.ember, 'M11.6 5.9c-2.4-.4-3.1-2.9-1.6-4.3 2.1.4 3 2.2 1.6 4.3Z'),
  ),
  package: svg(
    fill(C.leaf, 'M8 1.25c2.7 0 4.75 3.4 4.75 7.1 0 3.4-2.1 6.4-4.75 6.4s-4.75-3-4.75-6.4c0-3.7 2.05-7.1 4.75-7.1Z') +
      `<circle cx="6.3" cy="7" r=".9" fill="${C.cream}"/><circle cx="9.6" cy="9.6" r="1.1" fill="${C.cream}"/><circle cx="7" cy="11.6" r=".6" fill="${C.cream}"/>`,
  ),
  lock: svg(
    line(C.bark, 'M5 7V5.25a3 3 0 0 1 6 0V7', 1.4) +
      `<rect x="3" y="7" width="10" height="7.5" rx="1.75" fill="${C.bark}"/>` +
      line(C.cream, 'M8 9.75v2', 1.4),
  ),
  config: svg(
    `<circle cx="8" cy="8" r="2" stroke="${C.bark}" stroke-width="1.3"/>` +
      line(C.bark, 'M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M3.6 12.4 5 11M11 5l1.4-1.4', 1.4),
  ),
  shell: svg(
    `<rect x="1" y="2.5" width="14" height="11" rx="2.25" fill="${C.leaf}"/>` +
      line(C.cream, 'M4 6l2.25 2L4 10M8 10.5h4', 1.4),
  ),
  text: svg(page(C.bark, line(C.cream, 'M5 8h5.5M5 10.5h5.5M5 5.5h2.5', 1.1))),
  font: svg(line(C.sage, 'M3 13.5 7 2.5h2l4 11M4.75 9h6.5', 1.4)),
  video: svg(
    `<rect x="1" y="3" width="10" height="10" rx="2" fill="${C.rose}"/>` + fill(C.rose, 'M11.75 7.2 15 5v6l-3.25-2.2Z'),
  ),
  pdf: svg(page(C.danger, line(C.cream, 'M5 10.5h5.5M5 8h5.5', 1.1))),
  license: svg(page(C.gold, line(C.cream, 'M5.5 9.5l1.6 1.5 3-3.2', 1.3))),
  readme: svg(
    `<circle cx="8" cy="8" r="6.5" fill="${C.sky}"/>` + line(C.cream, 'M8 7.25v4M8 4.8v.1', 1.6),
  ),
  docker: svg(
    fill(C.sky, 'M1.5 8.25h12.2c.6-.9 1.6-1.2 1.8-1-.2 1-.9 1.7-1.6 2C12.8 12 10.7 13.5 7.4 13.5 3.7 13.5 1.9 11.4 1.5 8.25Z') +
      `<rect x="3" y="5.75" width="2" height="1.75" fill="${C.sky}"/><rect x="5.6" y="5.75" width="2" height="1.75" fill="${C.sky}"/><rect x="8.2" y="5.75" width="2" height="1.75" fill="${C.sky}"/><rect x="5.6" y="3.4" width="2" height="1.75" fill="${C.sky}"/>`,
  ),
  python: svg(
    fill(C.sky, 'M7.9 1.5c-2.6 0-3.2 1.1-3.2 2.4v1.6h3.4v.6H3.4C2 6.1 1.25 7.2 1.25 9c0 1.9.9 2.9 2.2 2.9h1.2v-1.8c0-1.3 1.1-2.4 2.4-2.4h3.3c1.1 0 2-.9 2-2V3.9c0-1.4-1.3-2.4-4.45-2.4Z') +
      fill(C.gold, 'M8.1 14.5c2.6 0 3.2-1.1 3.2-2.4v-1.6H7.9v-.6h4.7c1.4 0 2.15-1.1 2.15-2.9 0-1.9-.9-2.9-2.2-2.9h-1.2v1.8c0 1.3-1.1 2.4-2.4 2.4H5.65c-1.1 0-2 .9-2 2v1.8c0 1.4 1.3 2.4 4.45 2.4Z'),
  ),
  // Godot.
  godot: svg(
    fill(C.sky, 'M3 5.5c0-1.4 1.1-2.5 2.5-2.5h5c1.4 0 2.5 1.1 2.5 2.5v5.5c0 1.4-1.1 2.5-2.5 2.5h-5C4.1 13.5 3 12.4 3 11Z') +
      line(C.sky, 'M5 3 4 1.4M11 3l1-1.6M3 8.5H1.6M13 8.5h1.4', 1.3) +
      `<circle cx="5.9" cy="7.9" r="1.55" fill="${C.cream}"/><circle cx="10.1" cy="7.9" r="1.55" fill="${C.cream}"/>` +
      `<circle cx="6.1" cy="8.1" r=".7" fill="${C.sky}"/><circle cx="9.9" cy="8.1" r=".7" fill="${C.sky}"/>` +
      line(C.cream, 'M6.4 11.2h3.2', 1.2),
  ),
  gdscript: lettered(C.sky, 'GD'),
  'godot-scene': svg(
    line(C.sky, 'M8 4.5v3M8 7.5H4.5v4M8 7.5h3.5v4', 1.3) +
      `<circle cx="8" cy="3.25" r="2" fill="${C.sky}"/><circle cx="4.5" cy="12.25" r="2" fill="${C.sky}"/><circle cx="11.5" cy="12.25" r="2" fill="${C.sky}"/>`,
  ),
  'godot-resource': svg(fill(C.sky, HEX) + line(C.cream, 'M5 6.25 8 8l3-1.75M8 8v3.5', 1.2)),
  'godot-import': svg(fill(C.sage, HEX) + line(C.cream, 'M8 4.75v5.5M5.75 8 8 10.25 10.25 8', 1.3)),
  'godot-uid': svg(
    fill(C.bark, 'M2 3.25c0-.7.55-1.25 1.25-1.25H7.6c.35 0 .65.15.9.35l5.2 5.2c.5.5.5 1.3 0 1.8l-4.35 4.35c-.5.5-1.3.5-1.8 0l-5.2-5.2c-.2-.25-.35-.55-.35-.9Z') +
      `<circle cx="5.25" cy="5.25" r="1.2" fill="${C.cream}"/>`,
  ),
  gdshader: sphere(C.sky),
  shader: sphere(C.plum),

  // Languages, mostly as letter badges in a color close to their own.
  c: lettered(C.sky, 'C'),
  cpp: lettered(C.sky, 'C++'),
  csharp: lettered(C.plum, 'C#'),
  go: lettered(C.sky, 'GO'),
  rust: lettered(C.ember, 'RS'),
  kotlin: lettered(C.plum, 'KT'),
  swift: lettered(C.ember, 'SW'),
  php: lettered(C.plum, 'PHP'),
  dart: lettered(C.sky, 'DT'),
  elixir: lettered(C.plum, 'EX'),
  erlang: lettered(C.danger, 'ERL'),
  zig: lettered(C.gold, 'ZIG'),
  r: lettered(C.sky, 'R'),
  perl: lettered(C.sky, 'PL'),
  ocaml: lettered(C.ember, 'ML'),
  fsharp: lettered(C.sky, 'F#'),
  elm: lettered(C.sky, 'ELM'),
  nim: lettered(C.gold, 'NIM'),
  crystal: lettered(C.bark, 'CR'),
  solidity: lettered(C.bark, 'SOL'),
  objc: lettered(C.sky, 'OC'),
  assembly: lettered(C.bark, 'ASM'),
  svelte: lettered(C.ember, 'SV'),
  astro: lettered(C.plum, 'AS'),
  terraform: lettered(C.plum, 'TF'),
  proto: lettered(C.leaf, 'PB'),
  latex: lettered(C.leaf, 'TEX'),
  vb: lettered(C.sky, 'VB'),
  groovy: lettered(C.sky, 'GR'),
  wasm: lettered(C.plum, 'WA'),
  java: svg(
    fill(C.ember, 'M2.75 6.5h8.5v3.4c0 2.3-1.9 4.1-4.25 4.1s-4.25-1.8-4.25-4.1Z') +
      line(C.ember, 'M11.25 7.6h.9c1 0 1.8.75 1.8 1.65s-.8 1.65-1.8 1.65h-.9M5.5 1.6c-.7.8.7 1.5 0 2.9M8.5 1.6c-.7.8.7 1.5 0 2.9', 1.3),
  ),
  ruby: svg(
    fill(C.danger, 'M4.4 2.25h7.2l3.15 4.1L8 14.25 1.25 6.35Z') +
      line(C.cream, 'M1.6 6.35h12.8M5.7 6.35 8 13M10.3 6.35 8 13M4.4 2.6l1.3 3.75L8 2.6l2.3 3.75 1.3-3.75', 0.85),
  ),
  lua: svg(
    `<circle cx="7" cy="9" r="5.5" fill="${C.sky}"/><circle cx="9.3" cy="6.7" r="1.6" fill="${C.cream}"/><circle cx="13.5" cy="2.5" r="1.5" fill="${C.sky}"/>`,
  ),
  haskell: svg(line(C.plum, 'M1.75 3 5 8l-3.25 5M5.5 3 12 13M8.75 8 5.5 13M11.5 6.5h3M12.75 9.5h1.75', 1.55)),
  scala: svg(fill(C.danger, 'M3.5 3.1 12.5 1.6v2.6L3.5 5.7ZM3.5 7.3l9-1.5v2.6l-9 1.5ZM3.5 11.5l9-1.5v2.6l-9 1.5Z')),
  julia: svg(
    `<circle cx="8" cy="4.3" r="2.65" fill="${C.rose}"/><circle cx="4.25" cy="11" r="2.65" fill="${C.leaf}"/><circle cx="11.75" cy="11" r="2.65" fill="${C.plum}"/>`,
  ),
  vue: svg(line(C.leaf, 'M1.5 2.75 8 13.5l6.5-10.75M5 2.75l3 5 3-5', 1.5)),
  graphql: svg(
    line(C.rose, 'M8 1.75 13.4 4.9v6.2L8 14.25 2.6 11.1V4.9ZM8 1.75l5.4 9.35H2.6Z', 1.05) +
      [[8, 1.75], [13.4, 4.9], [13.4, 11.1], [8, 14.25], [2.6, 11.1], [2.6, 4.9]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${C.rose}"/>`)
        .join(''),
  ),
  nix: svg(line(C.sky, 'M8 1.5v13M2.4 4.75l11.2 6.5M2.4 11.25l11.2-6.5M6.6 1.9 8 3.3l1.4-1.4M6.6 14.1 8 12.7l1.4 1.4', 1.4)),
  lisp: svg(line(C.leaf, 'M5 2C3.2 3.6 2.25 5.7 2.25 8S3.2 12.4 5 14M11 2c1.8 1.6 2.75 3.7 2.75 6S12.8 12.4 11 14M6.4 4.6l3.2 6.8M8 8l-1.6 3.4', 1.45)),
  xml: svg(line(C.leaf, 'M5.25 4 1.75 8l3.5 4M10.75 4l3.5 4-3.5 4M6.6 6.2l2.8 3.6M9.4 6.2 6.6 9.8', 1.45)),
  build: svg(fill(C.bark, 'M4.6 2.25h6.4c.55 0 1 .45 1 1v2.1c0 .55-.45 1-1 1H4.6L2.5 5.1V3.5Z') + line(C.bark, 'M8 6.35v7.4', 1.9)),
  diff: svg(
    `<rect x="1.5" y="1.5" width="13" height="13" rx="2.5" stroke="${C.bark}" stroke-width="1.2"/>` +
      line(C.leaf, 'M8 3.75v4.5M5.75 6h4.5', 1.45) +
      line(C.danger, 'M5.75 11h4.5', 1.45),
  ),
  key: svg(
    `<circle cx="5" cy="11" r="3.25" fill="${C.gold}"/><circle cx="4.6" cy="11.4" r="1" fill="${C.cream}"/>` +
      line(C.gold, 'M7.2 8.8l6.3-6.3M11.4 4.6l1.7 1.7M9.7 6.3l1.3 1.3', 1.5),
  ),
  binary: svg(
    `<rect x="4" y="4" width="8" height="8" rx="1.5" fill="${C.bark}"/><circle cx="8" cy="8" r="1.2" fill="${C.cream}"/>` +
      line(C.bark, 'M6 1.75v1.5M10 1.75v1.5M6 12.75v1.5M10 12.75v1.5M1.75 6h1.5M1.75 10h1.5M12.75 6h1.5M12.75 10h1.5', 1.3),
  ),

  // Media and documents.
  audio: svg(
    `<circle cx="4.6" cy="12" r="2.2" fill="${C.gold}"/><circle cx="11.9" cy="10.4" r="2.2" fill="${C.gold}"/>` +
      line(C.gold, 'M6.8 12V3.6l7.3-1.85v8.65M6.8 6l7.3-1.85', 1.4),
  ),
  model: svg(
    fill(C.sage, 'M8 1.75 13.5 4.9 8 8 2.5 4.9Z') +
      line(C.sage, 'M8 1.75 13.5 4.9v6.2L8 14.25 2.5 11.1V4.9ZM2.5 4.9 8 8l5.5-3.1M8 8v6.25', 1.25),
  ),
  design: svg(
    fill(C.rose, 'M8 1.5 12.25 7 9.6 13.25H6.4L3.75 7Z') +
      `<circle cx="8" cy="8.25" r="1.1" fill="${C.cream}"/>` +
      line(C.cream, 'M8 2.5v4.6', 1) +
      line(C.rose, 'M5.75 14.6h4.5', 1.4),
  ),
  archive: svg(
    `<rect x="2" y="1.75" width="12" height="12.5" rx="2" fill="${C.bark}"/>` +
      line(C.cream, 'M8 1.75v1.1M8 4.1v1.1M8 6.45v1.1', 1.3) +
      `<rect x="6.6" y="8.6" width="2.8" height="3.4" rx=".7" fill="${C.cream}"/>`,
  ),
  disc: svg(
    `<circle cx="8" cy="8" r="6.25" fill="${C.bark}"/><circle cx="8" cy="8" r="1.6" stroke="${C.cream}" stroke-width="1.2"/>` +
      line(C.cream, 'M4.4 6.2c.5-1 1.3-1.8 2.3-2.2', 1),
  ),
  notebook: svg(
    `<rect x="4" y="1.5" width="10" height="13" rx="1.75" fill="${C.ember}"/>` +
      line(C.ember, 'M2 4.5h3M2 8h3M2 11.5h3', 1.4) +
      line(C.cream, 'M7 5.25h4.5M7 8h4.5M7 10.75h2.75', 1.1),
  ),
  table: svg(
    `<rect x="1.5" y="2.5" width="13" height="11" rx="2" stroke="${C.leaf}" stroke-width="1.3"/>` +
      fill(C.leaf, 'M1.5 4.5c0-1.1.9-2 2-2h9c1.1 0 2 .9 2 2v1.75h-13Z') +
      line(C.leaf, 'M1.5 9.75h13M6 6v7.5M10.5 6v7.5', 1.1),
  ),
  document: svg(page(C.sky, line(C.cream, 'M5 6h5.5M5 8.5h5.5M5 11h3.5', 1.1))),
  slides: svg(page(C.ember, `<rect x="4.75" y="6.5" width="6" height="4.5" rx=".6" fill="${C.cream}"/>`)),
  subtitles: svg(
    `<rect x="1.5" y="3" width="13" height="10" rx="2" stroke="${C.rose}" stroke-width="1.3"/>` +
      line(C.rose, 'M4.25 9.5h3.5M9.25 9.5h2.5M4.25 7h1.5M7.25 7h4.5', 1.3),
  ),
  ebook: svg(fill(C.leaf, 'M2 3.25c2-.9 4-.9 5.6.4v10.1c-1.6-1.1-3.6-1.1-5.6-.3ZM14 3.25c-2-.9-4-.9-5.6.4v10.1c1.6-1.1 3.6-1.1 5.6-.3Z')),
};

const FOLDERS = {
  folder: folder(C.sage),
  'folder-src': folder(C.leaf, emblem(C.leaf, 'M11.75 12.5c-2.3-.3-2.6-2.8-1-4.4 1.7.2 2.7 2.4 1 4.4ZM11.75 12.5l-.5-2.4')),
  'folder-test': folder(C.leaf, emblem(C.leaf, 'M10.2 10.3l1.1 1.1 2.1-2.2')),
  'folder-docs': folder(C.sky, emblem(C.sky, 'M10 9.25h3.5M10 11.25h3.5')),
  'folder-git': folder(C.ember, emblem(C.ember, 'M10.6 8.6v3.4M10.6 11c0-1.3 2.3-.8 2.6-2.4')),
  'folder-public': folder(C.gold, emblem(C.gold, 'M9.6 12l1.4-1.6 1 .9 1-1 1 1.6')),
  'folder-scripts': folder(C.leaf, emblem(C.leaf, 'M10.2 8.9l1.3 1.3-1.3 1.3M12.3 11.6h1.3')),
  'folder-components': folder(C.sky, emblem(C.sky, 'M10.1 8.6h1.3v1.3h-1.3ZM12.1 8.6h1.3v1.3h-1.3ZM10.1 10.6h1.3v1.3h-1.3Z')),
  'folder-config': folder(C.bark, emblem(C.bark, 'M10.2 9.25h3.1M10.2 11.25h3.1M12.4 8.6v1.3M11.1 10.6v1.3')),
  'folder-apps': folder(C.rose, emblem(C.rose, 'M9.9 12h3.7M10.4 12V9.6l1.35-1.1 1.35 1.1V12')),
  'folder-packages': folder(C.gold, emblem(C.gold, 'M11.75 8.3c1 0 1.65 1.2 1.65 2.4 0 1.1-.7 1.95-1.65 1.95s-1.65-.85-1.65-1.95c0-1.2.65-2.4 1.65-2.4Z')),
  'folder-database': folder(C.sage, emblem(C.sage, 'M10.1 9v2.5c0 .4.75.75 1.65.75s1.65-.35 1.65-.75V9M10.1 9c0 .4.75.7 1.65.7s1.65-.3 1.65-.7-.75-.7-1.65-.7-1.65.3-1.65.7')),
  'folder-shaders': folder(C.plum, emblem(C.plum, 'M13.4 10.25a1.65 1.65 0 1 1-3.3 0 1.65 1.65 0 0 1 3.3 0Z')),
  'folder-node': {
    closed: svg(`<path d="${FOLDER_CLOSED}" fill="${C.bark}" opacity=".55"/>`),
    open: svg(`<path d="${FOLDER_OPEN_BACK}" fill="${C.bark}" opacity=".55"/><path d="${FOLDER_OPEN_FRONT}" fill="${C.bark}" opacity=".4"/>`),
  },
};

// Which icon each file extension gets. VS Code matches the longest suffix, so
// 'test.ts' wins over 'ts', and 'png.import' over 'import'.
const extensionGroups = {
  typescript: ['ts', 'mts', 'cts', 'd.ts', 'd.mts', 'd.cts'],
  react: ['tsx', 'jsx'],
  javascript: ['js', 'mjs', 'cjs', 'es6', 'coffee', 'litcoffee'],
  json: ['json', 'jsonc', 'json5', 'jsonl', 'ndjson', 'webmanifest', 'har', 'geojson', 'topojson'],
  markdown: ['md', 'mdx', 'markdown', 'mdown', 'mkd', 'rst', 'adoc', 'asciidoc', 'org'],
  css: ['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'pcss', 'postcss'],
  html: ['html', 'htm', 'xhtml', 'hbs', 'handlebars', 'mustache', 'ejs', 'pug', 'jade', 'njk', 'liquid', 'twig', 'cshtml', 'razor', 'jinja', 'jinja2', 'j2', 'heex', 'eex', 'leex'],
  prisma: ['prisma'],
  database: ['sql', 'psql', 'pgsql', 'mysql', 'db', 'sqlite', 'sqlite3', 'db3', 'mdb', 'accdb', 'dump', 'surql', 'cql'],
  yaml: ['yaml', 'yml', 'toml'],
  config: ['ini', 'cfg', 'conf', 'config', 'properties', 'prefs', 'editorconfig', 'plist', 'reg', 'desktop', 'service', 'kdl'],
  image: ['png', 'jpg', 'jpeg', 'jfif', 'gif', 'webp', 'avif', 'ico', 'icns', 'bmp', 'tif', 'tiff', 'heic', 'heif', 'jxl', 'tga', 'dds', 'exr', 'hdr', 'qoi', 'ktx', 'ktx2', 'astc', 'pbm', 'pgm', 'ppm', 'raw', 'cr2', 'nef', 'dng', 'arw'],
  svgfile: ['svg', 'svgz'],
  design: ['psd', 'psb', 'ai', 'eps', 'xcf', 'kra', 'clip', 'sketch', 'fig', 'xd', 'afdesign', 'afphoto', 'afpub', 'aseprite', 'ase', 'pdn', 'procreate', 'cdr', 'indd'],
  model: ['glb', 'gltf', 'fbx', 'obj', 'mtl', 'dae', 'stl', '3ds', 'blend', 'blend1', 'max', 'ma', 'mb', 'c4d', 'usd', 'usda', 'usdc', 'usdz', 'ply', 'abc', 'vox', 'step', 'stp', 'iges', 'igs', '3mf', 'x3d', 'gcode', 'lwo', 'mesh', 'vrm'],
  test: [
    'test.ts', 'test.tsx', 'test.mts', 'test.cts', 'test.js', 'test.jsx', 'test.mjs', 'test.cjs',
    'spec.ts', 'spec.tsx', 'spec.mts', 'spec.js', 'spec.jsx', 'spec.mjs', 'e2e.ts', 'e2e.js', 'cy.ts', 'cy.js',
    'test.py', 'spec.rb', 'test.go', 'test.rs', 'test.dart', 'test.exs', 'test.lua', 'spec.lua',
  ],
  shell: ['sh', 'bash', 'zsh', 'fish', 'ksh', 'csh', 'tcsh', 'nu', 'ps1', 'psm1', 'psd1', 'ps1xml', 'bat', 'cmd', 'command', 'tool', 'ahk', 'applescript', 'scpt', 'awk', 'sed'],
  text: ['txt', 'text', 'log', 'nfo', 'diz', 'me', '1st', 'todo', 'wiki'],
  table: ['csv', 'tsv', 'psv', 'xlsx', 'xls', 'xlsm', 'xlsb', 'ods', 'numbers', 'parquet', 'arrow', 'feather', 'dta', 'sav'],
  document: ['doc', 'docx', 'odt', 'rtf', 'pages', 'wpd', 'gdoc', 'dotx'],
  slides: ['ppt', 'pptx', 'odp', 'potx', 'gslides'],
  ebook: ['epub', 'mobi', 'azw', 'azw3', 'fb2', 'djvu', 'cbz', 'cbr'],
  font: ['woff', 'woff2', 'ttf', 'otf', 'eot', 'ttc', 'pfb', 'fnt', 'bdf'],
  video: ['mp4', 'm4v', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'f4v', 'mpg', 'mpeg', 'm2ts', '3gp', 'ogv', 'vob', 'gifv', 'ogm', 'rm', 'divx', 'hevc', 'h264', 'h265', 'braw', 'r3d', 'prproj', 'aep', 'drp', 'kdenlive', 'veg'],
  audio: ['mp3', 'wav', 'wave', 'ogg', 'oga', 'opus', 'flac', 'alac', 'aac', 'm4a', 'm4b', 'wma', 'aif', 'aiff', 'aifc', 'mid', 'midi', 'amr', 'ape', 'wv', 'caf', 'au', 'snd', 'ra', 'mka', 'dsf', 'xm', 'mod', 'it', 's3m', 'sf2', 'bank', 'fsb', 'wem', 'bnk', 'als', 'flp', 'logicx', 'ptx', 'rpp', 'cwp', 'band', 'sfz', 'nki'],
  subtitles: ['srt', 'vtt', 'ass', 'ssa', 'sub', 'sbv', 'lrc', 'ttml', 'dfxp'],
  archive: ['zip', 'tar', 'gz', 'tgz', 'bz2', 'tbz', 'xz', 'txz', 'zst', 'lz', 'lz4', 'lzma', '7z', 'rar', 'cab', 'arj', 'z', 'jar', 'war', 'ear', 'apk', 'aab', 'ipa', 'xapk', 'deb', 'rpm', 'pkg', 'snap', 'flatpak', 'appimage', 'pck', 'pak', 'unitypackage', 'nupkg', 'whl', 'egg', 'gem', 'crate', 'vpk', 'mcpack', 'mcworld'],
  disc: ['iso', 'img', 'dmg', 'vhd', 'vhdx', 'vmdk', 'vdi', 'qcow2', 'ova', 'ovf', 'toast', 'cue', 'nrg', 'mdf'],
  pdf: ['pdf', 'xps', 'oxps'],
  lock: ['lock', 'lockb'],
  python: ['py', 'pyw', 'pyi', 'pyx', 'pxd', 'pyz', 'rpy', 'gyp', 'gypi', 'pyc', 'pyo'],
  env: ['env'],
  package: ['vsix'],
  docker: ['dockerfile', 'containerfile'],
  key: ['pem', 'key', 'crt', 'cer', 'cert', 'csr', 'der', 'p7b', 'p12', 'pfx', 'jks', 'keystore', 'pub', 'asc', 'gpg', 'pgp', 'sig', 'kdbx', 'ppk', 'age', 'gpg-key'],
  binary: ['exe', 'msi', 'dll', 'so', 'dylib', 'a', 'lib', 'o', 'ko', 'bin', 'elf', 'out', 'app', 'com', 'sys', 'class', 'dex', 'pdb', 'ilk', 'exp', 'nro', 'nso', 'spv', 'hex', 'rom', 'uf2', 'efi'],
  wasm: ['wasm', 'wat', 'wast'],
  diff: ['diff', 'patch', 'rej', 'orig'],
  notebook: ['ipynb', 'rmd', 'qmd', 'livemd', 'dib', 'nb', 'jl.ipynb'],
  // Godot.
  gdscript: ['gd'],
  gdshader: ['gdshader', 'gdshaderinc'],
  godot: ['godot', 'gdextension', 'gdnlib', 'gdns'],
  'godot-scene': ['tscn', 'scn', 'escn'],
  'godot-resource': ['tres', 'res', 'theme', 'material', 'translation', 'gdmaterial'],
  'godot-import': ['import'],
  'godot-uid': ['uid'],
  shader: [
    'glsl', 'vert', 'frag', 'geom', 'tesc', 'tese', 'comp', 'rgen', 'rchit', 'rmiss', 'rahit', 'rint', 'task', 'vsh', 'fsh',
    'hlsl', 'hlsli', 'fx', 'fxh', 'cg', 'cginc', 'compute', 'shader', 'shadergraph', 'shadersubgraph', 'usf', 'ush', 'wgsl', 'metal', 'msl', 'slang', 'osl', 'effect',
  ],
  // Languages.
  c: ['c', 'h', 'i'],
  cpp: ['cpp', 'cc', 'cxx', 'c++', 'cppm', 'ixx', 'hpp', 'hh', 'hxx', 'h++', 'inl', 'ipp', 'tpp', 'txx', 'ino', 'cu', 'cuh', 'mm'],
  csharp: ['cs', 'csx', 'csproj', 'sln', 'slnx', 'props', 'targets'],
  java: ['java', 'jsp', 'jav'],
  kotlin: ['kt', 'kts', 'ktm'],
  scala: ['scala', 'sc', 'sbt'],
  groovy: ['groovy', 'gvy', 'gy', 'gsh'],
  go: ['go', 'tmpl', 'gotmpl'],
  rust: ['rs', 'ron'],
  swift: ['swift', 'swiftinterface'],
  objc: ['m'],
  php: ['php', 'phtml', 'php3', 'php4', 'php5', 'phps', 'phpt', 'blade.php'],
  ruby: ['rb', 'rbw', 'rake', 'gemspec', 'ru', 'erb', 'rbs', 'podspec', 'thor', 'jbuilder'],
  lua: ['lua', 'luau', 'rockspec', 'p8'],
  dart: ['dart'],
  elixir: ['ex', 'exs'],
  erlang: ['erl', 'hrl', 'escript', 'app.src'],
  haskell: ['hs', 'lhs', 'hs-boot', 'cabal'],
  ocaml: ['ml', 'mli', 'mll', 'mly', 're', 'rei', 'resi'],
  fsharp: ['fs', 'fsi', 'fsx', 'fsscript', 'fsproj'],
  elm: ['elm'],
  zig: ['zig', 'zon'],
  nim: ['nim', 'nims', 'nimble'],
  crystal: ['cr'],
  r: ['r', 'rdata', 'rds', 'rda', 'rproj'],
  julia: ['jl'],
  perl: ['pl', 'pm', 'pod', 't', 'psgi', 'raku', 'rakumod', 'p6', 'pm6'],
  lisp: ['lisp', 'lsp', 'cl', 'el', 'elc', 'clj', 'cljs', 'cljc', 'edn', 'scm', 'ss', 'rkt', 'fnl', 'hy', 'janet'],
  solidity: ['sol'],
  assembly: ['asm', 's', 'nasm', 'masm', 'a51', 'inc', 'z80', '6502'],
  vb: ['vb', 'vbs', 'vba', 'bas', 'frm', 'cls', 'vbproj'],
  vue: ['vue'],
  svelte: ['svelte'],
  astro: ['astro'],
  graphql: ['graphql', 'gql', 'graphqls'],
  terraform: ['tf', 'tfvars', 'tfstate', 'hcl', 'nomad', 'pkr.hcl'],
  proto: ['proto', 'fbs', 'thrift', 'avsc', 'capnp'],
  nix: ['nix'],
  latex: ['tex', 'ltx', 'sty', 'cls.tex', 'bib', 'bst', 'dtx', 'ins', 'typ'],
  xml: ['xml', 'xsd', 'xsl', 'xslt', 'dtd', 'wsdl', 'rss', 'atom', 'xaml', 'axaml', 'resx', 'storyboard', 'xib', 'plist.xml', 'tmx', 'tsx.xml', 'kml', 'gpx', 'xliff', 'xlf', 'nuspec', 'manifest', 'config.xml', 'iml', 'uxml', 'uss'],
  build: ['mk', 'mak', 'make', 'cmake', 'gradle', 'gradle.kts', 'ninja', 'bazel', 'bzl', 'meson', 'just', 'xcodeproj', 'pbxproj', 'vcxproj', 'filters', 'sln.dotsettings'],
};

const fileNames = {
  // Package manifests and their lockfiles.
  'package.json': 'package', 'cargo.toml': 'package', 'go.mod': 'package', 'pyproject.toml': 'package',
  'requirements.txt': 'package', 'pipfile': 'package', 'setup.py': 'package', 'setup.cfg': 'package',
  'composer.json': 'package', 'gemfile': 'package', 'pubspec.yaml': 'package', 'deno.json': 'package', 'deno.jsonc': 'package',
  'build.zig.zon': 'package', 'mix.exs': 'package', 'rebar.config': 'package', 'stack.yaml': 'package',
  'project.clj': 'package', 'deps.edn': 'package', 'shard.yml': 'package', 'vcpkg.json': 'package', 'conanfile.txt': 'package',
  'conanfile.py': 'package', 'environment.yml': 'package', 'bower.json': 'package', 'jsr.json': 'package', 'flake.nix': 'package',
  'pnpm-lock.yaml': 'lock', 'package-lock.json': 'lock', 'npm-shrinkwrap.json': 'lock', 'yarn.lock': 'lock', 'bun.lockb': 'lock', 'bun.lock': 'lock',
  'cargo.lock': 'lock', 'go.sum': 'lock', 'go.work.sum': 'lock', 'poetry.lock': 'lock', 'pipfile.lock': 'lock', 'uv.lock': 'lock', 'pdm.lock': 'lock',
  'composer.lock': 'lock', 'gemfile.lock': 'lock', 'pubspec.lock': 'lock', 'deno.lock': 'lock', 'mix.lock': 'lock', 'flake.lock': 'lock',
  'packages.lock.json': 'lock', 'podfile.lock': 'lock', 'package.resolved': 'lock', 'gradle.lockfile': 'lock', 'conan.lock': 'lock',
  // Environment and secrets.
  '.env': 'env', '.env.local': 'env', '.env.example': 'env', '.env.sample': 'env', '.env.template': 'env', '.env.test': 'env',
  '.env.production': 'env', '.env.development': 'env', '.env.staging': 'env', '.dev.vars': 'env', '.envrc': 'env', '.flaskenv': 'env',
  'id_rsa': 'key', 'id_rsa.pub': 'key', 'id_ed25519': 'key', 'id_ed25519.pub': 'key', 'id_ecdsa': 'key', 'known_hosts': 'key',
  'authorized_keys': 'key', '.htpasswd': 'key', '.npmrc': 'config', '.pypirc': 'key', '.netrc': 'key',
  // Git.
  '.gitignore': 'git', '.gitattributes': 'git', '.gitmodules': 'git', '.gitkeep': 'git', '.git-blame-ignore-revs': 'git',
  '.gitmessage': 'git', '.mailmap': 'git', '.keep': 'git', 'codeowners': 'git',
  // Tooling configuration.
  'tsconfig.json': 'config', 'tsconfig.base.json': 'config', 'tsconfig.build.json': 'config', 'tsconfig.app.json': 'config',
  'tsconfig.node.json': 'config', 'jsconfig.json': 'config', 'turbo.json': 'config', 'nx.json': 'config', 'lerna.json': 'config',
  'vercel.json': 'config', 'netlify.toml': 'config', 'railway.json': 'config', 'railway.toml': 'config', 'fly.toml': 'config',
  'render.yaml': 'config', 'wrangler.toml': 'config', 'wrangler.json': 'config', 'wrangler.jsonc': 'config', 'firebase.json': 'config',
  'app.json': 'config', 'app.yaml': 'config', 'nixpacks.toml': 'config', 'procfile': 'config', 'heroku.yml': 'config',
  '.editorconfig': 'config', '.prettierrc': 'config', '.prettierrc.json': 'config', '.prettierrc.js': 'config', '.prettierrc.yaml': 'config',
  '.prettierrc.yml': 'config', 'prettier.config.js': 'config', 'prettier.config.mjs': 'config', '.prettierignore': 'config',
  '.eslintrc': 'config', '.eslintrc.js': 'config', '.eslintrc.cjs': 'config', '.eslintrc.json': 'config', '.eslintrc.yml': 'config',
  '.eslintignore': 'config', 'eslint.config.js': 'config', 'eslint.config.mjs': 'config', 'eslint.config.cjs': 'config', 'eslint.config.ts': 'config',
  'biome.json': 'config', 'biome.jsonc': 'config', 'dprint.json': 'config', '.stylelintrc': 'config', '.stylelintrc.json': 'config',
  'stylelint.config.js': 'config', '.babelrc': 'config', 'babel.config.js': 'config', 'babel.config.json': 'config', '.swcrc': 'config',
  '.browserslistrc': 'config', 'browserslist': 'config', '.nvmrc': 'config', '.node-version': 'config', '.python-version': 'config',
  '.ruby-version': 'config', '.tool-versions': 'config', '.yarnrc': 'config', '.yarnrc.yml': 'config', '.vscodeignore': 'config',
  'pnpm-workspace.yaml': 'config', 'bunfig.toml': 'config', '.clang-format': 'config', '.clang-tidy': 'config', '.clangd': 'config',
  'rustfmt.toml': 'config', '.rustfmt.toml': 'config', 'clippy.toml': 'config', 'rust-toolchain': 'config', 'rust-toolchain.toml': 'config',
  '.flake8': 'config', '.pylintrc': 'config', 'pylintrc': 'config', 'tox.ini': 'config', 'pytest.ini': 'config', 'mypy.ini': 'config',
  'ruff.toml': 'config', '.ruff.toml': 'config', '.rubocop.yml': 'config', '.golangci.yml': 'config', '.golangci.yaml': 'config',
  'renovate.json': 'config', '.releaserc': 'config', 'commitlint.config.js': 'config', '.commitlintrc': 'config', '.lintstagedrc': 'config',
  '.markdownlint.json': 'config', '.markdownlint.jsonc': 'config', '.markdownlint.yaml': 'config', 'cspell.json': 'config', '.cspell.json': 'config',
  'components.json': 'config', 'manifest.json': 'config', 'settings.json': 'config', 'launch.json': 'config', 'tasks.json': 'config',
  'extensions.json': 'config', 'keybindings.json': 'config', '.gdignore': 'config', 'editor_settings-4.tres': 'config',
  // Framework and bundler configuration, which also reads as config.
  ...Object.fromEntries(
    ['next', 'vite', 'vitest', 'vitest.workspace', 'vitest.integration', 'webpack', 'rollup', 'rolldown', 'esbuild', 'tsup', 'tsdown', 'astro', 'svelte', 'nuxt', 'remix',
      'tailwind', 'postcss', 'playwright', 'jest', 'cypress', 'karma', 'nodemon', 'drizzle', 'knexfile', 'gatsby', 'quasar', 'electron.vite', 'electron-builder',
      'metro', 'react-router', 'unocss', 'uno', 'panda', 'vue', 'angular', 'storybook', 'docusaurus', 'sanity', 'payload', 'wxt', 'capacitor', 'ionic', 'tauri']
      .flatMap((n) => ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts', 'json'].map((x) => [`${n}.config.${x}`, 'config'])),
  ),
  // Build files.
  'makefile': 'build', 'gnumakefile': 'build', 'cmakelists.txt': 'build', 'cmakepresets.json': 'build', 'meson.build': 'build',
  'meson_options.txt': 'build', 'build.gradle': 'build', 'build.gradle.kts': 'build', 'settings.gradle': 'build', 'settings.gradle.kts': 'build',
  'gradle.properties': 'build', 'gradlew': 'build', 'gradlew.bat': 'build', 'pom.xml': 'build', 'build.xml': 'build', 'build.sbt': 'build',
  'build.zig': 'build', 'build.rs': 'build', 'justfile': 'build', '.justfile': 'build', 'taskfile.yml': 'build', 'taskfile.yaml': 'build',
  'rakefile': 'build', 'gulpfile.js': 'build', 'gruntfile.js': 'build', 'build.bazel': 'build', 'workspace': 'build', 'workspace.bazel': 'build',
  'module.bazel': 'build', 'buck': 'build', 'premake5.lua': 'build', 'sconstruct': 'build', 'xmake.lua': 'build', 'vagrantfile': 'build',
  'podfile': 'build', 'fastfile': 'build', 'brewfile': 'build', 'snapcraft.yaml': 'build', 'export_presets.cfg': 'godot',
  // Containers and CI.
  'dockerfile': 'docker', 'containerfile': 'docker', 'dockerfile.dev': 'docker', 'dockerfile.prod': 'docker', 'dockerfile.test': 'docker', 'docker-compose.yml': 'docker', 'docker-compose.yaml': 'docker',
  'docker-compose.override.yml': 'docker', 'docker-compose.dev.yml': 'docker', 'docker-compose.prod.yml': 'docker',
  'compose.yaml': 'docker', 'compose.yml': 'docker', '.dockerignore': 'docker', 'devcontainer.json': 'docker', '.devcontainer.json': 'docker',
  '.gitlab-ci.yml': 'config', '.travis.yml': 'config', 'jenkinsfile': 'build', 'azure-pipelines.yml': 'config', 'bitbucket-pipelines.yml': 'config',
  'cloudbuild.yaml': 'config', 'appveyor.yml': 'config', 'codecov.yml': 'config', '.pre-commit-config.yaml': 'config', 'package.swift': 'package', 'buildkite.yml': 'config', 'dependabot.yml': 'config',
  // Godot.
  'project.godot': 'godot', 'icon.svg.import': 'godot-import', 'default_env.tres': 'godot-resource', 'default_bus_layout.tres': 'godot-resource',
  // Docs.
  'license': 'license', 'license.md': 'license', 'license.txt': 'license', 'licence': 'license', 'licence.md': 'license', 'copying': 'license',
  'copying.md': 'license', 'unlicense': 'license', 'license-mit': 'license', 'license-apache': 'license', 'notice': 'license', 'notice.md': 'license',
  'readme': 'readme', 'readme.md': 'readme', 'readme.txt': 'readme', 'readme.rst': 'readme', 'claude.md': 'readme', 'claude.local.md': 'readme',
  'agents.md': 'readme', 'gemini.md': 'readme', 'copilot-instructions.md': 'readme', '.cursorrules': 'readme', 'changelog.md': 'readme',
  'changelog': 'readme', 'changes.md': 'readme', 'history.md': 'readme', 'contributing.md': 'readme', 'code_of_conduct.md': 'readme',
  'security.md': 'readme', 'support.md': 'readme', 'authors': 'readme', 'authors.md': 'readme', 'contributors.md': 'readme', 'todo.md': 'readme',
  'llms.txt': 'readme', 'robots.txt': 'text', 'humans.txt': 'text', 'sitemap.xml': 'xml', 'favicon.ico': 'image',
};

const folderGroups = {
  'folder-src': ['src', 'source', 'sources', 'lib', 'libs', 'cmd', 'pkg', 'internal', 'include', 'core', 'crates', 'modules'],
  'folder-test': ['test', 'tests', '__tests__', '__test__', 'e2e', 'test-results', 'spec', 'specs', 'testing', 'fixtures', '__fixtures__', '__mocks__', 'mocks', 'benches', 'benchmarks', 'playwright-report', 'coverage', 'cypress', '__snapshots__'],
  'folder-docs': ['docs', 'doc', 'documentation', 'wiki', 'guides', 'manual', 'examples', 'samples', 'demo', 'demos', '.storybook'],
  'folder-git': ['.git', '.github', '.husky', '.gitlab', '.githooks', '.changeset', 'workflows', '.forgejo', '.gitea'],
  'folder-public': [
    'public', 'assets', 'static', 'images', 'img', 'media', 'icons', 'fonts', 'audio', 'sounds', 'sound', 'sfx', 'music', 'video', 'videos',
    'textures', 'sprites', 'art', 'graphics', 'models', 'meshes', 'materials', 'animations', 'res', 'resources', 'www', 'changelog-assets', 'screenshots',
  ],
  'folder-scripts': ['scripts', 'script', 'bin', 'tools', 'tooling', 'utils', 'helpers', 'hooks', 'autoload', 'autoloads', 'commands', 'tasks', 'actions'],
  'folder-components': ['components', 'ui', 'widgets', 'layouts', 'views', 'templates', 'partials', 'controls', 'nodes', 'prefabs'],
  'folder-config': ['.vscode', '.claude', '.cursor', '.idea', '.fleet', '.zed', 'config', '.config', 'configs', 'settings', '.devcontainer', '.circleci', '.buildkite', 'env', 'environments', 'k8s', 'deploy', 'infra', '.wrangler', '.vercel', '.netlify', '.cargo', 'ci'],
  'folder-apps': ['apps', 'app', 'pages', 'routes', 'screens', 'scenes', 'levels', 'maps', 'worlds', 'stages', 'features', 'api', 'server', 'client', 'web', 'mobile'],
  'folder-packages': ['packages', 'dist', 'out', 'build', 'builds', 'release', 'releases', 'export', 'exports', 'artifacts', 'addons', 'plugins', 'extensions', 'third_party', 'thirdparty', 'external', 'deps'],
  'folder-database': ['prisma', 'db', 'migrations', 'schema', 'schemas', 'database', 'data', 'seeds', 'seeders', 'sql', 'drizzle', 'supabase'],
  'folder-shaders': ['shaders', 'shader', 'glsl', 'hlsl', 'vfx'],
  // Folders tools make and fill for you, drawn quieter.
  'folder-node': [
    'node_modules', '.pnpm-store', '.yarn', 'bower_components', 'jspm_packages', 'vendor', '.godot', '.import', '__pycache__', '.venv', 'venv',
    '.tox', '.pytest_cache', '.mypy_cache', '.ruff_cache', '.ipynb_checkpoints', 'target', '.gradle', '.dart_tool', '.cache', '.parcel-cache',
    '.turbo', '.next', '.nuxt', '.output', '.svelte-kit', '.astro', '.angular', '.expo', '.docusaurus', 'zig-cache', '.zig-cache', 'zig-out',
    '_build', 'deps-cache', '.elixir_ls', '.stack-work', 'dist-newstyle', 'obj', '.vs', 'temp', 'tmp', '.tmp', 'logs', '.terraform', '.serverless', '.sass-cache', 'cmake-build-debug', 'cmake-build-release', '.cxx', '.externalnativebuild', 'pods', 'deriveddata',
  ],
};

// 3:1 against both sidebars, the WCAG minimum for a non-text graphic.
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
let weak = false;
for (const [name, hex] of Object.entries(C)) {
  if (name === 'cream') continue;
  const worst = Math.min(...SURFACES.map((s) => contrast(hex, s)));
  if (worst < 3) {
    weak = true;
    console.error(`${name} ${hex} is ${worst.toFixed(2)}:1 on one of the sidebars`);
  }
}
if (weak) process.exit(1);

// Each extension and folder name gets one icon. A name listed under two
// icons is a mistake, and so is a name that points at no drawing, so the
// build stops on either.
const fileExtensions = {};
const folderOf = {};
let clash = false;
for (const [groups, into, label] of [[extensionGroups, fileExtensions, (n) => `.${n}`], [folderGroups, folderOf, (n) => `${n}/`]]) {
  for (const [id, list] of Object.entries(groups)) {
    for (const n of list) {
      if (into[n]) {
        clash = true;
        console.error(`${label(n)} is listed under ${into[n]} and ${id}`);
      }
      into[n] = id;
    }
  }
}
const drawn = new Set([...Object.keys(FILES), ...Object.keys(FOLDERS)]);
for (const [name, id] of [...Object.entries(fileExtensions), ...Object.entries(fileNames), ...Object.entries(folderOf)]) {
  if (!drawn.has(id)) {
    clash = true;
    console.error(`${name} points at ${id}, which has no drawing`);
  }
}
if (clash) process.exit(1);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const iconDefinitions = {};
const define = (id, markup) => {
  writeFileSync(join(out, `${id}.svg`), markup);
  iconDefinitions[id] = { iconPath: `./icons/files/${id}.svg` };
};
for (const [id, markup] of Object.entries(FILES)) define(id, markup);
for (const [id, pair] of Object.entries(FOLDERS)) {
  define(id, pair.closed);
  define(`${id}-open`, pair.open);
}

const folderNames = {};
const folderNamesExpanded = {};
for (const [n, id] of Object.entries(folderOf)) {
  folderNames[n] = id;
  folderNamesExpanded[n] = `${id}-open`;
}

const theme = {
  hidesExplorerArrows: false,
  iconDefinitions,
  file: 'file',
  folder: 'folder',
  folderExpanded: 'folder-open',
  rootFolder: 'folder',
  rootFolderExpanded: 'folder-open',
  fileExtensions,
  fileNames,
  folderNames,
  folderNamesExpanded,
  rootFolderNames: folderNames,
  rootFolderNamesExpanded: folderNamesExpanded,
  // For files whose language is known but whose name is not listed above.
  languageIds: {
    typescript: 'typescript', typescriptreact: 'react', javascript: 'javascript', javascriptreact: 'react', coffeescript: 'javascript',
    json: 'json', jsonc: 'json', jsonl: 'json', json5: 'json', snippets: 'json',
    markdown: 'markdown', mdx: 'markdown', restructuredtext: 'markdown', asciidoc: 'markdown',
    css: 'css', scss: 'css', sass: 'css', less: 'css', stylus: 'css', postcss: 'css', tailwindcss: 'css',
    html: 'html', handlebars: 'html', pug: 'html', jade: 'html', razor: 'html', aspnetcorerazor: 'html', jinja: 'html',
    'jinja-html': 'html', twig: 'html', liquid: 'html', ejs: 'html', nunjucks: 'html',
    yaml: 'yaml', toml: 'yaml', 'github-actions-workflow': 'yaml', dockercompose: 'docker', dockerfile: 'docker',
    ini: 'config', properties: 'config', editorconfig: 'config', ssh_config: 'config', nginx: 'config',
    prisma: 'prisma', sql: 'database', mysql: 'database', postgres: 'database', plsql: 'database',
    shellscript: 'shell', powershell: 'shell', bat: 'shell', fish: 'shell', nushell: 'shell',
    makefile: 'build', cmake: 'build', meson: 'build', justfile: 'build', bazel: 'build', starlark: 'build',
    python: 'python', cython: 'python', dotenv: 'env', plaintext: 'text', log: 'text',
    ignore: 'git', 'git-commit': 'git', 'git-rebase': 'git',
    csv: 'table', tsv: 'table', diff: 'diff', jupyter: 'notebook', 'code-text-binary': 'binary',
    c: 'c', cpp: 'cpp', 'cuda-cpp': 'cpp', arduino: 'cpp', csharp: 'csharp', java: 'java', kotlin: 'kotlin', scala: 'scala', groovy: 'groovy',
    go: 'go', 'go.mod': 'package', 'go.sum': 'lock', gotmpl: 'go', rust: 'rust', swift: 'swift', 'objective-c': 'objc', 'objective-cpp': 'objc',
    php: 'php', blade: 'php', ruby: 'ruby', erb: 'ruby', lua: 'lua', luau: 'lua', dart: 'dart', elixir: 'elixir', erlang: 'erlang',
    haskell: 'haskell', ocaml: 'ocaml', reason: 'ocaml', fsharp: 'fsharp', elm: 'elm', zig: 'zig', nim: 'nim', crystal: 'crystal',
    r: 'r', julia: 'julia', perl: 'perl', perl6: 'perl', raku: 'perl',
    clojure: 'lisp', scheme: 'lisp', racket: 'lisp', lisp: 'lisp', commonlisp: 'lisp', fennel: 'lisp',
    solidity: 'solidity', asm: 'assembly', nasm: 'assembly', vb: 'vb', vbscript: 'vb',
    vue: 'vue', svelte: 'svelte', astro: 'astro', graphql: 'graphql', terraform: 'terraform', hcl: 'terraform',
    proto: 'proto', proto3: 'proto', nix: 'nix', latex: 'latex', tex: 'latex', bibtex: 'latex', typst: 'latex',
    xml: 'xml', xsl: 'xml', svg: 'svgfile', wat: 'wasm',
    gdscript: 'gdscript', gdshader: 'gdshader', gdresource: 'godot-resource',
    glsl: 'shader', hlsl: 'shader', wgsl: 'shader', shaderlab: 'shader', metal: 'shader', slang: 'shader',
  },
};
writeFileSync(join(here, 'file-icons.json'), `${JSON.stringify(theme, null, 2)}\n`);
console.log(`File icons: ${Object.keys(iconDefinitions).length} icons`);
