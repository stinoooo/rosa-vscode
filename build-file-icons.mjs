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
  cream: '#f5ede5',
};

// Surfaces the icons sit on: the Rosa Dark and Rosa Light sidebars.
const SURFACES = ['#16110d', '#efe6dc'];

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>\n`;
const line = (color, d, w = 1.3) => `<path d="${d}" stroke="${color}" stroke-width="${w}"/>`;
const fill = (color, d) => `<path d="${d}" fill="${color}"/>`;
const badge = (color, letters) =>
  `<rect x="1" y="1.5" width="14" height="13" rx="3" fill="${color}"/>` + line(C.cream, letters, 1.45);

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
  'folder-node': {
    closed: svg(`<path d="${FOLDER_CLOSED}" fill="${C.bark}" opacity=".55"/>`),
    open: svg(`<path d="${FOLDER_OPEN_BACK}" fill="${C.bark}" opacity=".55"/><path d="${FOLDER_OPEN_FRONT}" fill="${C.bark}" opacity=".4"/>`),
  },
};

const fileExtensions = {
  ts: 'typescript', mts: 'typescript', cts: 'typescript', 'd.ts': 'typescript',
  tsx: 'react', jsx: 'react',
  js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  json: 'json', jsonc: 'json', json5: 'json', webmanifest: 'json',
  md: 'markdown', mdx: 'markdown',
  css: 'css', scss: 'css', sass: 'css', less: 'css',
  html: 'html', htm: 'html',
  prisma: 'prisma',
  sql: 'database', db: 'database', sqlite: 'database',
  yaml: 'yaml', yml: 'yaml', toml: 'yaml',
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', avif: 'image', ico: 'image', bmp: 'image',
  svg: 'svgfile',
  'test.ts': 'test', 'test.tsx': 'test', 'test.mts': 'test', 'test.js': 'test', 'test.mjs': 'test',
  'spec.ts': 'test', 'spec.tsx': 'test', 'spec.js': 'test', 'e2e.ts': 'test',
  sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'shell', bat: 'shell', cmd: 'shell',
  txt: 'text', log: 'text', csv: 'text',
  woff: 'font', woff2: 'font', ttf: 'font', otf: 'font',
  mp4: 'video', webm: 'video', mov: 'video', mp3: 'video', wav: 'video', ogg: 'video',
  pdf: 'pdf',
  lock: 'lock',
  py: 'python',
  env: 'env',
  vsix: 'package',
};
const fileNames = {
  'package.json': 'package',
  'pnpm-lock.yaml': 'lock', 'package-lock.json': 'lock', 'yarn.lock': 'lock', 'bun.lockb': 'lock',
  '.env': 'env', '.env.local': 'env', '.env.example': 'env', '.env.production': 'env', '.env.development': 'env', '.dev.vars': 'env',
  '.gitignore': 'git', '.gitattributes': 'git', '.gitmodules': 'git', '.gitkeep': 'git',
  'tsconfig.json': 'config', 'tsconfig.base.json': 'config', 'jsconfig.json': 'config', 'turbo.json': 'config',
  'vercel.json': 'config', 'railway.json': 'config', 'wrangler.toml': 'config', 'wrangler.jsonc': 'config',
  '.editorconfig': 'config', '.prettierrc': 'config', '.prettierignore': 'config', '.npmrc': 'config',
  '.vscodeignore': 'config', 'pnpm-workspace.yaml': 'config',
  'next.config.ts': 'config', 'next.config.js': 'config', 'next.config.mjs': 'config',
  'vitest.config.mts': 'config', 'vitest.config.ts': 'config', 'vitest.integration.mts': 'config',
  'playwright.config.ts': 'config', 'postcss.config.mjs': 'config', 'eslint.config.mjs': 'config',
  'dockerfile': 'docker', 'docker-compose.yml': 'docker', 'compose.yaml': 'docker', '.dockerignore': 'docker',
  'license': 'license', 'license.md': 'license', 'license.txt': 'license',
  'readme.md': 'readme', 'claude.md': 'readme', 'agents.md': 'readme', 'changelog.md': 'readme',
};
const folderGroups = {
  'folder-src': ['src', 'lib', 'source'],
  'folder-test': ['test', 'tests', '__tests__', 'e2e', 'test-results', 'spec'],
  'folder-docs': ['docs', 'doc', 'documentation'],
  'folder-git': ['.git', '.github', '.husky'],
  'folder-public': ['public', 'assets', 'static', 'images', 'media', 'changelog-assets'],
  'folder-scripts': ['scripts', 'bin', 'tools'],
  'folder-components': ['components', 'ui', 'widgets'],
  'folder-config': ['.vscode', '.claude', 'config', '.config', 'settings', '.turbo', '.wrangler', '.vercel', '.next'],
  'folder-apps': ['apps', 'app', 'pages', 'routes'],
  'folder-packages': ['packages', 'dist', 'out', 'build'],
  'folder-database': ['prisma', 'db', 'migrations', 'schema', 'database'],
  'folder-node': ['node_modules', '.pnpm-store'],
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
for (const [id, names] of Object.entries(folderGroups)) {
  for (const n of names) {
    folderNames[n] = id;
    folderNamesExpanded[n] = `${id}-open`;
  }
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
  languageIds: {
    typescript: 'typescript', typescriptreact: 'react', javascript: 'javascript', javascriptreact: 'react',
    json: 'json', jsonc: 'json', markdown: 'markdown', css: 'css', scss: 'css', html: 'html',
    yaml: 'yaml', prisma: 'prisma', sql: 'database', shellscript: 'shell', powershell: 'shell',
    python: 'python', dockerfile: 'docker', dotenv: 'env', plaintext: 'text', ignore: 'git',
  },
};
writeFileSync(join(here, 'file-icons.json'), `${JSON.stringify(theme, null, 2)}\n`);
console.log(`File icons: ${Object.keys(iconDefinitions).length} icons`);
