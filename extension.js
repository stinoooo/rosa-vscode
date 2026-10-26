// Rosa sprout: a small dinosaur in the Explorer that grows as you save.
// Growth follows the Path of Titans stages. The state lives in globalState
// and travels with Settings Sync, so the sprout is the same in every window
// and on every computer.

const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

const STATE_KEY = 'rosa.sprout';
const REVEALED_KEY = 'rosa.sprout.revealed';
const STAGES = [
  { name: 'Egg', from: 0 },
  { name: 'Hatchling', from: 10 },
  { name: 'Juvenile', from: 100 },
  { name: 'Adolescent', from: 400 },
  { name: 'Adult', from: 1000 },
];

// The species and pattern lists live with the drawings, so the pickers here
// and in the view always offer the same choices.
const { SPECIES, PATTERNS } = new Function(
  `${fs.readFileSync(path.join(__dirname, 'media', 'sprites.js'), 'utf8')};return { SPECIES, PATTERNS };`,
)();

// A save counts once the file changed, and one file counts at most once a
// minute, so holding Ctrl+S or auto save does not farm growth.
const SAVE_COOLDOWN_MS = 60 * 1000;
// Hunger and thirst go from 1 (full) to 0 over these spans of wall time.
const HUNGER_EMPTIES_MS = 12 * 60 * 60 * 1000;
const THIRST_EMPTIES_MS = 8 * 60 * 60 * 1000;
// Love empties over a day, and every pet fills a bit of it. Pets closer
// together than the cooldown count once.
const LOVE_EMPTIES_MS = 24 * 60 * 60 * 1000;
const LOVE_PER_PET = 0.1;
const PET_COOLDOWN_MS = 2000;
const FOOD_PER_SAVE = 0.15;
const WATER_FOR_CLEAN_CODE = 0.6;
const LOW = 0.2;
// Typing tells the sprout you are there, at most this often.
const ACTIVE_EVERY_MS = 10 * 1000;

const clamp = (v) => Math.min(1, Math.max(0, v));

function stageOf(saves) {
  let index = 0;
  STAGES.forEach((s, i) => {
    if (saves >= s.from) index = i;
  });
  const next = STAGES[index + 1];
  const growth = next ? (saves - STAGES[index].from) / (next.from - STAGES[index].from) : 1;
  return { index, name: STAGES[index].name, growth, next: next?.name ?? null };
}

// The stage the sprout is drawn at. Once it has reached a stage it can look
// like that stage again; growth carries on underneath. No look, or a look it
// has not reached, shows its real stage.
function shownStage(state) {
  const real = stageOf(state.saves).index;
  return Number.isInteger(state.look) && state.look >= 1 && state.look < real ? state.look : real;
}

// Needs and love drop with wall time since they were last written. An egg
// has none, so its needs stay full until it hatches.
function needsAt(state, now) {
  if (stageOf(state.saves).index === 0) return { hunger: 1, thirst: 1, love: 1 };
  const since = Math.max(0, now - (state.needsAt ?? now));
  return {
    hunger: clamp((state.hunger ?? 1) - since / HUNGER_EMPTIES_MS),
    thirst: clamp((state.thirst ?? 1) - since / THIRST_EMPTIES_MS),
    love: clamp((state.love ?? 1) - since / LOVE_EMPTIES_MS),
  };
}

// Whether a save should count: the file changed since the last save, and
// this file has not counted in the last minute.
function countsAsSave(wasDirty, lastCounted, now) {
  return wasDirty && (lastCounted === undefined || now - lastCounted >= SAVE_COOLDOWN_MS);
}

// The local calendar day of a moment, like 2026-10-23.
function dayOf(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// The streak counts days in a row with at least one counted save.
function nextStreak(lastDay, streak, today) {
  if (lastDay === today) return { streak: streak || 1, lastSaveDay: today };
  const yesterday = dayOf(new Date(`${today}T12:00:00`).getTime() - 24 * 60 * 60 * 1000);
  return { streak: lastDay === yesterday ? (streak || 0) + 1 : 1, lastSaveDay: today };
}

const knownSpecies = (id) => SPECIES.some((s) => s.id === id);
const knownPattern = (id) => PATTERNS.some((p) => p.id === id);

function errorCount() {
  let errors = 0;
  for (const [, list] of vscode.languages.getDiagnostics()) {
    for (const d of list) if (d.severity === vscode.DiagnosticSeverity.Error) errors += 1;
  }
  return errors;
}

class SproutView {
  constructor(context) {
    this.context = context;
    this.view = undefined;
  }

  get state() {
    return this.context.globalState.get(STATE_KEY, { name: 'Sprout', saves: 0 });
  }

  needs() {
    return needsAt(this.state, Date.now());
  }

  async update(change) {
    const now = Date.now();
    const next = { ...this.state, ...this.needs(), needsAt: now, ...change };
    await this.context.globalState.update(STATE_KEY, next);
    return next;
  }

  post(message) {
    this.view?.webview.postMessage(message);
  }

  snapshot() {
    const state = this.state;
    return {
      type: 'state',
      name: state.name,
      saves: state.saves,
      stage: stageOf(state.saves),
      look: shownStage(state),
      errors: errorCount(),
      species: knownSpecies(state.species) ? state.species : 'sauropod',
      speciesChosen: knownSpecies(state.species),
      pattern: knownPattern(state.pattern) ? state.pattern : 'meadow',
      hatchedAt: state.hatchedAt ?? null,
      streak: state.streak ?? 0,
      bubbles: vscode.workspace.getConfiguration('rosa.sprout').get('speechBubbles', true),
      ...this.needs(),
    };
  }

  refresh() {
    this.post(this.snapshot());
    this.onChange?.();
  }

  // A pet fills love once the sprout has hatched.
  async pet() {
    const now = Date.now();
    if (stageOf(this.state.saves).index === 0 || now - (this.lastPet ?? 0) < PET_COOLDOWN_MS) return;
    this.lastPet = now;
    await this.update({ love: clamp(this.needs().love + LOVE_PER_PET) });
    this.refresh();
  }

  // The species is picked while it is an egg, and set for good at hatching.
  async setSpecies(id) {
    if (!knownSpecies(id)) return;
    if (stageOf(this.state.saves).index > 0) {
      vscode.window.showInformationMessage(`${this.state.name} has hatched, so its species is set. You can still change its pattern.`);
      return;
    }
    await this.update({ species: id });
    this.refresh();
  }

  async setPattern(id) {
    if (!knownPattern(id)) return;
    await this.update({ pattern: id });
    this.refresh();
  }

  // Picking its real stage clears the look, so it follows its growth again.
  async setLook(index) {
    const real = stageOf(this.state.saves).index;
    if (!Number.isInteger(index) || index < 1 || index > real) return;
    await this.update({ look: index < real ? index : undefined });
    this.refresh();
  }

  resolveWebviewView(view) {
    this.view = view;
    const media = (file) => view.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', file));
    view.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')] };
    const nonce = [...Array(24)].map(() => Math.random().toString(36)[2]).join('');
    view.webview.html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${view.webview.cspSource}; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${media('sprout.css')}">
</head>
<body>
<main>
  <div class="field" id="field" role="button" tabindex="0" aria-label="Your sprout">
    <canvas id="shell" hidden></canvas>
    <canvas id="sprite"></canvas>
    <div class="bubble" id="bubble" role="status" aria-live="polite" hidden></div>
  </div>
  <div class="card">
    <div class="row"><strong id="name" title="Rename your sprout">Sprout</strong><span id="stage"></span></div>
    <div class="bar" aria-hidden="true"><div id="growth"></div></div>
    <div class="needs" id="needs" hidden>
      <div class="need"><span>Food</span><div class="bar small" aria-hidden="true"><div id="food"></div></div><span id="food-value"></span></div>
      <div class="need"><span>Water</span><div class="bar small" aria-hidden="true"><div id="water"></div></div><span id="water-value"></span></div>
      <div class="need"><span>Love</span><div class="bar small" aria-hidden="true"><div id="love"></div></div><span id="love-value"></span></div>
    </div>
    <p id="hint"></p>
    <p id="stats"></p>
  </div>
  <section class="choices" id="species" hidden>
    <h2 id="species-title">What's in the egg?</h2>
    <div class="species-list" id="species-list"></div>
  </section>
  <section class="choices" id="looks" hidden>
    <h2>Look</h2>
    <div class="species-list" id="look-list"></div>
  </section>
  <section class="choices" id="patterns" hidden>
    <h2>Pattern</h2>
    <div class="pattern-list" id="pattern-list"></div>
  </section>
</main>
<script nonce="${nonce}" src="${media('sprites.js')}"></script>
<script nonce="${nonce}" src="${media('sprout.js')}"></script>
</body>
</html>`;
    view.webview.onDidReceiveMessage((m) => {
      if (m.type === 'ready') {
        this.post(this.snapshot());
        this.post({ type: 'visible', visible: view.visible });
      }
      if (m.type === 'rename') vscode.commands.executeCommand('rosa.sprout.rename');
      if (m.type === 'pet') this.pet();
      if (m.type === 'species') this.setSpecies(m.id);
      if (m.type === 'pattern') this.setPattern(m.id);
      if (m.type === 'look') this.setLook(m.index);
    });
    // The animation pauses while the view is hidden, to spare the battery.
    view.onDidChangeVisibility(() => {
      this.post({ type: 'visible', visible: view.visible });
      if (view.visible) this.post(this.snapshot());
    });
  }
}

async function pickSpecies(title) {
  const pick = await vscode.window.showQuickPick(
    SPECIES.map((s) => ({ label: s.name, id: s.id })),
    { title, placeHolder: 'Pick a species. It is set for good once the egg hatches.' },
  );
  return pick?.id;
}

function activate(context) {
  const sprout = new SproutView(context);
  const config = () => vscode.workspace.getConfiguration('rosa.sprout');
  const enabled = () => config().get('enabled', true);
  const dirtyAtSave = new Set();
  const lastCounted = new Map();
  let lastActivePost = 0;
  let lastErrors = errorCount();

  // Settings Sync carries the sprout to your other computers.
  context.globalState.setKeysForSync([STATE_KEY]);

  // A sprout that hatched before ages were kept counts its age from now.
  if (stageOf(sprout.state.saves).index > 0 && !sprout.state.hatchedAt) sprout.update({ hatchedAt: Date.now() });

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
  status.command = 'rosa.sprout.show';
  const refreshStatus = () => {
    if (!enabled() || !config().get('statusBar', true)) return status.hide();
    const { name, saves } = sprout.state;
    const stage = stageOf(saves);
    const { hunger, thirst, love } = sprout.needs();
    const icon = stage.index === 0 ? '$(rosa-egg)' : '$(rosa-sprout)';
    const low = stage.index > 0 && (hunger < LOW || thirst < LOW);
    status.text = `${icon} ${low ? (hunger < LOW ? 'Hungry' : 'Thirsty') : stage.next ? `${Math.floor(stage.growth * 100)}%` : stage.name}`;
    const growth = stage.next ? `${Math.floor(stage.growth * 100)}% of the way to ${stage.next}.` : 'Fully grown.';
    const needs = stage.index > 0 ? ` Food ${Math.round(hunger * 100)}%, water ${Math.round(thirst * 100)}%, love ${Math.round(love * 100)}%.` : '';
    const shown = shownStage(sprout.state);
    const lookName = STAGES[shown].name.toLowerCase();
    const look = shown < stage.index ? ` Looks like ${/^[aeiou]/.test(lookName) ? 'an' : 'a'} ${lookName}.` : '';
    status.tooltip = `${name}, ${stage.name}.${look} ${growth}${needs}`;
    status.show();
  };
  sprout.onChange = refreshStatus;
  // Needs drop on their own, so the status bar is checked now and then.
  const needsClock = setInterval(refreshStatus, 60 * 1000);

  context.subscriptions.push(
    status,
    { dispose: () => clearInterval(needsClock) },
    vscode.window.registerWebviewViewProvider('rosa.sprout', sprout, { webviewOptions: { retainContextWhenHidden: true } }),

    vscode.workspace.onWillSaveTextDocument((e) => {
      if (e.document.isDirty) dirtyAtSave.add(e.document.uri.toString());
    }),

    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      const key = doc.uri.toString();
      const wasDirty = dirtyAtSave.delete(key);
      if (!enabled()) return;
      const now = Date.now();
      sprout.post({ type: 'active' });
      if (!countsAsSave(wasDirty, lastCounted.get(key), now)) return;
      lastCounted.set(key, now);
      const before = stageOf(sprout.state.saves);
      const fed = before.index > 0 ? clamp(sprout.needs().hunger + FOOD_PER_SAVE) : 1;
      const saves = sprout.state.saves + 1;
      const hatches = before.index === 0 && stageOf(saves).index > 0;
      const state = await sprout.update({
        saves,
        hunger: fed,
        ...nextStreak(sprout.state.lastSaveDay, sprout.state.streak, dayOf(now)),
        ...(hatches ? { hatchedAt: now } : {}),
      });
      const after = stageOf(state.saves);
      sprout.post({ type: 'saved' });
      sprout.refresh();
      if (after.index > before.index) {
        const line = after.index === 1 ? `${state.name} hatched!` : `${state.name} grew into a ${after.name.toLowerCase()}.`;
        sprout.post({ type: 'grew', index: after.index, line });
        vscode.window.setStatusBarMessage(line, 6000);
      }
      // An egg that hatches before anyone picked asks what came out.
      if (hatches && !knownSpecies(state.species)) {
        const id = (await pickSpecies(`${state.name} is hatching! What came out of the egg?`)) ?? 'sauropod';
        await sprout.update({ species: id });
        sprout.refresh();
      }
    }),

    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.contentChanges.length === 0 || e.document.uri.scheme === 'output') return;
      const now = Date.now();
      if (now - lastActivePost < ACTIVE_EVERY_MS) return;
      lastActivePost = now;
      sprout.post({ type: 'active' });
    }),

    vscode.languages.onDidChangeDiagnostics(async () => {
      const errors = errorCount();
      // Clearing every error gives the sprout water.
      if (lastErrors > 0 && errors === 0 && enabled() && stageOf(sprout.state.saves).index > 0) {
        await sprout.update({ thirst: clamp(sprout.needs().thirst + WATER_FOR_CLEAN_CODE) });
        sprout.refresh();
      }
      lastErrors = errors;
      sprout.post({ type: 'errors', errors });
    }),

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('rosa.sprout')) sprout.refresh();
    }),

    vscode.commands.registerCommand('rosa.sprout.show', () => vscode.commands.executeCommand('rosa.sprout.focus')),

    vscode.commands.registerCommand('rosa.sprout.pet', () => sprout.pet()),

    vscode.commands.registerCommand('rosa.sprout.chooseSpecies', async () => {
      if (stageOf(sprout.state.saves).index > 0) {
        vscode.window.showInformationMessage(`${sprout.state.name} has hatched, so its species is set. You can still change its pattern.`);
        return;
      }
      const id = await pickSpecies("What's in the egg?");
      if (id) await sprout.setSpecies(id);
    }),

    vscode.commands.registerCommand('rosa.sprout.choosePattern', async () => {
      const current = sprout.snapshot().pattern;
      const pick = await vscode.window.showQuickPick(
        PATTERNS.map((p) => ({ label: p.name, description: p.id === current ? 'Current' : undefined, id: p.id })),
        { title: `Pick a pattern for ${sprout.state.name}` },
      );
      if (pick) await sprout.setPattern(pick.id);
    }),

    vscode.commands.registerCommand('rosa.sprout.chooseLook', async () => {
      const real = stageOf(sprout.state.saves).index;
      if (real < 2) {
        const line = real === 0 ? 'still an egg' : 'a hatchling, its first stage';
        vscode.window.showInformationMessage(`${sprout.state.name} is ${line}. Once it grows, you can show it at any stage it has reached.`);
        return;
      }
      const shown = shownStage(sprout.state);
      const pick = await vscode.window.showQuickPick(
        STAGES.slice(1, real + 1).map((s, i) => ({
          label: s.name,
          description: [i + 1 === real ? 'Its real stage' : undefined, i + 1 === shown ? 'Current look' : undefined].filter(Boolean).join(', ') || undefined,
          index: i + 1,
        })),
        { title: `Pick the stage ${sprout.state.name} looks like`, placeHolder: 'It keeps growing either way. Pick its real stage to follow its growth again.' },
      );
      if (pick) await sprout.setLook(pick.index);
    }),

    vscode.commands.registerCommand('rosa.sprout.rename', async () => {
      const name = await vscode.window.showInputBox({
        title: 'Rename your sprout',
        value: sprout.state.name,
        prompt: 'Up to 20 characters.',
        validateInput: (v) => (v.trim().length === 0 ? 'Give your sprout a name.' : v.trim().length > 20 ? 'Keep it to 20 characters.' : null),
      });
      if (!name) return;
      await sprout.update({ name: name.trim() });
      sprout.refresh();
    }),

    vscode.commands.registerCommand('rosa.sprout.newEgg', async () => {
      const pick = await vscode.window.showWarningMessage(
        `Start over with a new egg? ${sprout.state.name}'s growth goes back to zero, and you can't undo this.`,
        { modal: true },
        'Start over with a new egg',
      );
      if (pick !== 'Start over with a new egg') return;
      await sprout.update({ saves: 0, hunger: 1, thirst: 1, love: 1, species: undefined, look: undefined, hatchedAt: undefined, streak: 0, lastSaveDay: undefined });
      sprout.refresh();
    }),
  );

  refreshStatus();

  // VS Code starts a new view folded, so the sprout opens itself once.
  if (enabled() && !context.globalState.get(REVEALED_KEY)) {
    context.globalState.update(REVEALED_KEY, true);
    vscode.commands.executeCommand('rosa.sprout.focus').then(() =>
      vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup'),
    );
  }
}

function deactivate() {}

module.exports = { activate, deactivate, stageOf, shownStage, needsAt, countsAsSave, nextStreak, dayOf };
