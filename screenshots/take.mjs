// Takes the listing screenshots in images/ from a real VS Code window.
// VS Code runs with its own profile and extensions folder under
// screenshots/.profile, so your own setup is never touched.
//
// Run: npm run screenshots (after npm run package)

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { _electron as electron } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const images = join(root, 'images');
const profile = join(here, '.profile');
const userData = join(profile, 'data');
const extensions = join(profile, 'extensions');
const demo = join(here, 'demo');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const vsix = join(root, `${pkg.name}-${pkg.version}.vsix`);

const CODE_EXE =
  process.env.CODE_EXE ?? join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Microsoft VS Code', 'Code.exe');
// VS Code's own CLI script, found the way the code command finds it. Newer
// builds keep it under a folder named after the build.
function cliScript() {
  const cmd = join(dirname(CODE_EXE), 'bin', 'code.cmd');
  const named = existsSync(cmd) && readFileSync(cmd, 'utf8').match(/\.\.\\([^"]*cli\.js)/);
  return named ? join(dirname(CODE_EXE), ...named[1].split('\\')) : join(dirname(CODE_EXE), 'resources', 'app', 'out', 'cli.js');
}
const WIDTH = 1600;
const HEIGHT = 1100;

if (!existsSync(vsix)) throw new Error(`Build ${vsix} first with npm run package.`);

rmSync(profile, { recursive: true, force: true });
mkdirSync(join(userData, 'User'), { recursive: true });
mkdirSync(images, { recursive: true });
// The same call the code command makes: VS Code's own CLI script run as Node.
execFileSync(CODE_EXE, [cliScript(), '--extensions-dir', extensions, '--user-data-dir', userData, '--install-extension', vsix, '--force'], {
  stdio: 'ignore',
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
});

function settings(colorTheme) {
  writeFileSync(
    join(userData, 'User', 'settings.json'),
    JSON.stringify(
      {
        'workbench.colorTheme': colorTheme,
        'workbench.iconTheme': 'rosa-files',
        'workbench.productIconTheme': 'rosa-product',
        'workbench.startupEditor': 'none',
        'workbench.tips.enabled': false,
        'workbench.secondarySideBar.defaultVisibility': 'hidden',
        'workbench.layoutControl.enabled': false,
        'window.commandCenter': false,
        'window.titleBarStyle': 'custom',
        'chat.disableAIFeatures': true,
        'editor.fontSize': 15,
        'editor.lineHeight': 24,
        'editor.minimap.enabled': false,
        'editor.cursorBlinking': 'solid',
        'editor.lightbulb.enabled': 'off',
        'explorer.autoReveal': true,
        'security.workspace.trust.enabled': false,
        'update.mode': 'none',
        'extensions.autoCheckUpdates': false,
        'telemetry.telemetryLevel': 'off',
        'git.enabled': false,
      },
      null,
      2,
    ),
  );
}

async function open(files) {
  const app = await electron.launch({
    executablePath: CODE_EXE,
    args: [
      '--extensions-dir', extensions,
      '--user-data-dir', userData,
      '--disable-workspace-trust',
      '--skip-release-notes',
      '--skip-welcome',
      '--disable-updates',
      '--new-window',
      demo,
      ...files.map((f) => join(demo, f)),
    ],
  });
  const page = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }, size) => {
    const win = BrowserWindow.getAllWindows()[0];
    win.unmaximize();
    win.setContentSize(size.width, size.height);
    win.center();
  }, { width: WIDTH, height: HEIGHT });
  await page.waitForSelector('.monaco-workbench', { timeout: 60_000 });
  await page.waitForTimeout(4000);
  // VS Code starts the Sprout view folded; open it like a person would.
  const header = page.locator('.pane-header', { hasText: 'Sprout' });
  if ((await header.getAttribute('aria-expanded')) !== 'true') await header.click();
  await page.waitForTimeout(1000);
  await growSprout(page, 110);
  await page.waitForTimeout(4000);
  return { app, page };
}

// Gives the Sprout view more room by dragging the edge above it upward.
async function growSprout(page, by) {
  const box = await page.locator('.pane-header', { hasText: 'Sprout' }).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y - 1);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y - by, { steps: 8 });
  await page.mouse.up();
  await page.mouse.move(1000, 600);
  await page.waitForTimeout(800);
}

// Seeds the sprout, so the Explorer shows the state a picture needs.
function seedSprout(sprout) {
  const db = join(userData, 'User', 'globalStorage', 'state.vscdb');
  const value = JSON.stringify({
    'rosa.sprout': sprout,
    'rosa.sprout.revealed': true,
  });
  execFileSync('python', [
    '-c',
    'import sqlite3,sys;c=sqlite3.connect(sys.argv[1]);c.execute("INSERT OR REPLACE INTO ItemTable(key,value) VALUES(?,?)",(sys.argv[2],sys.argv[3]));c.commit()',
    db,
    `${pkg.publisher}.${pkg.name}`.toLowerCase(),
    value,
  ]);
}

// First run creates the state database, then the sprout is seeded.
settings('Rosa Dark');
{
  const { app } = await open([]);
  await app.close();
}
// A grown stegosaur for the main pictures.
seedSprout({
  name: 'Pebble',
  saves: 260,
  species: 'stegosaur',
  pattern: 'meadow',
  hunger: 0.82,
  thirst: 0.64,
  love: 0.95,
  needsAt: Date.now(),
  hatchedAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
  streak: 6,
});

for (const [file, theme] of [
  ['dark.png', 'Rosa Dark'],
  ['light.png', 'Rosa Light'],
]) {
  settings(theme);
  const { app, page } = await open(['src/nesting/hatch.ts', 'src/components/NestCard.tsx', 'src/nesting/hatch.ts']);
  await page.screenshot({ path: join(images, file) });
  if (theme === 'Rosa Dark') {
    await page.locator('.part.sidebar').screenshot({ path: join(images, 'file-icons.png') });
    await page.locator('.part.activitybar').screenshot({ path: join(images, 'product-icons.png') });
    const sprout = page.locator('.pane').filter({ has: page.locator('.pane-header', { hasText: 'Sprout' }) });
    await growSprout(page, 260);
    // Pet the sprout so the close-up shows a heart on its way up.
    for (const frame of page.frames()) {
      const field = await frame.$('#field').catch(() => null);
      if (!field) continue;
      // Fixed chance, so the pet shows a heart and no speech bubble.
      await frame.evaluate(() => {
        Math.random = () => 0.5;
      });
      await field.click();
      await page.waitForTimeout(300);
      break;
    }
    await sprout.screenshot({ path: join(images, 'sprout.png') });
  }
  await app.close();
}
// An egg close to hatching, with the species picker.
seedSprout({ name: 'Pebble', saves: 6, species: 'raptor' });
{
  settings('Rosa Dark');
  const { app, page } = await open(['src/nesting/hatch.ts']);
  const sprout = page.locator('.pane').filter({ has: page.locator('.pane-header', { hasText: 'Sprout' }) });
  await growSprout(page, 260);
  await sprout.screenshot({ path: join(images, 'sprout-egg.png') });
  await app.close();
}
// An adult stegosaur shown as a hatchling, with the look picker.
seedSprout({
  name: 'Pebble',
  saves: 1240,
  species: 'stegosaur',
  pattern: 'meadow',
  look: 1,
  hunger: 0.9,
  thirst: 0.8,
  love: 0.7,
  needsAt: Date.now(),
  hatchedAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
  streak: 12,
});
{
  settings('Rosa Dark');
  const { app, page } = await open(['src/nesting/hatch.ts']);
  const sprout = page.locator('.pane').filter({ has: page.locator('.pane-header', { hasText: 'Sprout' }) });
  await growSprout(page, 320);
  await sprout.screenshot({ path: join(images, 'sprout-look.png') });
  await app.close();
}
console.log('Screenshots written to images/');
