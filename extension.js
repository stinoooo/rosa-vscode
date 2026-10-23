// Rosa sprout: a small dinosaur in the Explorer that grows as you save.
// Growth follows the Path of Titans stages. The state lives in globalState,
// so the sprout is the same in every window and survives a restart.

const vscode = require('vscode');

const STATE_KEY = 'rosa.sprout';
const STAGES = [
  { name: 'Egg', from: 0 },
  { name: 'Hatchling', from: 10 },
  { name: 'Juvenile', from: 100 },
  { name: 'Adolescent', from: 400 },
  { name: 'Adult', from: 1000 },
];

// A save counts once the file changed, and one file counts at most once a
// minute, so holding Ctrl+S or auto save does not farm growth.
const SAVE_COOLDOWN_MS = 60 * 1000;
// Hunger and thirst go from 1 (full) to 0 over these spans of wall time.
const HUNGER_EMPTIES_MS = 12 * 60 * 60 * 1000;
const THIRST_EMPTIES_MS = 8 * 60 * 60 * 1000;
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

// Needs drop with wall time since they were last written. An egg has none,
// so its needs stay full until it hatches.
function needsAt(state, now) {
  if (stageOf(state.saves).index === 0) return { hunger: 1, thirst: 1 };
  const since = Math.max(0, now - (state.needsAt ?? now));
  return {
    hunger: clamp((state.hunger ?? 1) - since / HUNGER_EMPTIES_MS),
    thirst: clamp((state.thirst ?? 1) - since / THIRST_EMPTIES_MS),
  };
}

// Whether a save should count: the file changed since the last save, and
// this file has not counted in the last minute.
function countsAsSave(wasDirty, lastCounted, now) {
  return wasDirty && (lastCounted === undefined || now - lastCounted >= SAVE_COOLDOWN_MS);
}

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
    return { type: 'state', name: state.name, saves: state.saves, stage: stageOf(state.saves), errors: errorCount(), ...this.needs() };
  }

  resolveWebviewView(view) {
    this.view = view;
    view.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')] };
    const script = view.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'sprout.js'));
    const style = view.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'sprout.css'));
    const nonce = [...Array(24)].map(() => Math.random().toString(36)[2]).join('');
    view.webview.html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${view.webview.cspSource}; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${style}">
</head>
<body>
<main>
  <div class="field" id="field" role="img" aria-label="Your sprout">
    <canvas id="shell" hidden></canvas>
    <canvas id="sprite"></canvas>
    <div class="bubble" id="bubble" hidden></div>
  </div>
  <div class="card">
    <div class="row"><strong id="name">Sprout</strong><span id="stage"></span></div>
    <div class="bar" aria-hidden="true"><div id="growth"></div></div>
    <div class="needs" id="needs" hidden>
      <div class="need"><span>Food</span><div class="bar small" aria-hidden="true"><div id="food"></div></div><span id="food-value"></span></div>
      <div class="need"><span>Water</span><div class="bar small" aria-hidden="true"><div id="water"></div></div><span id="water-value"></span></div>
    </div>
    <p id="hint"></p>
  </div>
</main>
<script nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
    view.webview.onDidReceiveMessage((m) => {
      if (m.type === 'ready') this.post(this.snapshot());
      if (m.type === 'rename') vscode.commands.executeCommand('rosa.sprout.rename');
    });
    view.onDidChangeVisibility(() => view.visible && this.post(this.snapshot()));
  }
}

function activate(context) {
  const sprout = new SproutView(context);
  const config = () => vscode.workspace.getConfiguration('rosa.sprout');
  const enabled = () => config().get('enabled', true);
  const dirtyAtSave = new Set();
  const lastCounted = new Map();
  let lastActivePost = 0;
  let lastErrors = errorCount();

  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
  status.command = 'rosa.sprout.show';
  const refreshStatus = () => {
    if (!enabled() || !config().get('statusBar', true)) return status.hide();
    const { name, saves } = sprout.state;
    const stage = stageOf(saves);
    const { hunger, thirst } = sprout.needs();
    const icon = stage.index === 0 ? '$(rosa-egg)' : '$(rosa-sprout)';
    const low = stage.index > 0 && (hunger < LOW || thirst < LOW);
    status.text = `${icon} ${low ? (hunger < LOW ? 'Hungry' : 'Thirsty') : stage.next ? `${Math.floor(stage.growth * 100)}%` : stage.name}`;
    const growth = stage.next ? `${Math.floor(stage.growth * 100)}% of the way to ${stage.next}.` : 'Fully grown.';
    const needs = stage.index > 0 ? ` Food ${Math.round(hunger * 100)}%, water ${Math.round(thirst * 100)}%.` : '';
    status.tooltip = `${name}, ${stage.name}. ${growth}${needs}`;
    status.show();
  };
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
      const state = await sprout.update({ saves: sprout.state.saves + 1, hunger: fed });
      const after = stageOf(state.saves);
      sprout.post({ type: 'saved' });
      sprout.post(sprout.snapshot());
      refreshStatus();
      if (after.index > before.index) {
        const line = after.index === 1 ? `${state.name} hatched!` : `${state.name} grew into a ${after.name.toLowerCase()}.`;
        sprout.post({ type: 'grew', index: after.index, line });
        vscode.window.setStatusBarMessage(line, 6000);
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
        sprout.post(sprout.snapshot());
        refreshStatus();
      }
      lastErrors = errors;
      sprout.post({ type: 'errors', errors });
    }),

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('rosa.sprout')) refreshStatus();
    }),

    vscode.commands.registerCommand('rosa.sprout.show', () => vscode.commands.executeCommand('rosa.sprout.focus')),

    vscode.commands.registerCommand('rosa.sprout.rename', async () => {
      const name = await vscode.window.showInputBox({
        title: 'Rename your sprout',
        value: sprout.state.name,
        prompt: 'Up to 20 characters.',
        validateInput: (v) => (v.trim().length === 0 ? 'Give your sprout a name.' : v.trim().length > 20 ? 'Keep it to 20 characters.' : null),
      });
      if (!name) return;
      await sprout.update({ name: name.trim() });
      sprout.post(sprout.snapshot());
      refreshStatus();
    }),

    vscode.commands.registerCommand('rosa.sprout.newEgg', async () => {
      const pick = await vscode.window.showWarningMessage(
        `Start over with a new egg? ${sprout.state.name}'s growth goes back to zero, and you can't undo this.`,
        { modal: true },
        'Start over with a new egg',
      );
      if (pick !== 'Start over with a new egg') return;
      await sprout.update({ saves: 0, hunger: 1, thirst: 1 });
      sprout.post(sprout.snapshot());
      refreshStatus();
    }),
  );

  refreshStatus();
}

function deactivate() {}

module.exports = { activate, deactivate, stageOf, needsAt, countsAsSave };
