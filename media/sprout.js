// The sprout's behavior in the Sprout view. The drawings, species and
// patterns come from sprites.js, which the view loads first.

const vscode = acquireVsCodeApi();
const canvas = document.getElementById('sprite');
const shell = document.getElementById('shell');
const field = document.getElementById('field');
const bubble = document.getElementById('bubble');
const ctx = canvas.getContext('2d');
const SCALE = 4; // screen pixels per drawing pixel
const IDLE_MS = 5 * 60 * 1000;
const LOW = 0.2; // below this a need makes the sprout sit down
const TICK_MS = 160;

let state = {
  name: 'Sprout',
  saves: 0,
  stage: { index: 0, name: 'Egg', growth: 0, next: 'Hatchling' },
  errors: 0,
  hunger: 1,
  thirst: 1,
  love: 1,
  species: 'sauropod',
  speciesChosen: false,
  pattern: 'meadow',
  hatchedAt: null,
  streak: 0,
  bubbles: true,
};
let palette = paletteFor(state.pattern);
let x = 20;
let dir = 1;
let frame = 0;
let pause = 0;
let hop = 0;
let hatching = 0; // ticks left in the hatching scene
let lastActive = Date.now();
let bubbleTimer;
let clock = null;

function draw(target, context, rows, scale, colors = palette) {
  target.width = rows[0].length;
  target.height = rows.length;
  target.style.width = `${rows[0].length * scale}px`;
  target.style.height = `${rows.length * scale}px`;
  context.clearRect(0, 0, target.width, target.height);
  rows.forEach((row, y) => {
    [...row].forEach((ch, px) => {
      if (ch === '.') return;
      context.fillStyle = colors[ch];
      context.fillRect(px, y, 1, 1);
    });
  });
}

function say(text, ms = 2600) {
  if (!state.bubbles) return;
  bubble.textContent = text;
  bubble.hidden = false;
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => (bubble.hidden = true), ms);
}

const percent = (v) => `${Math.round(v * 100)}%`;
const needy = () => state.hunger < LOW || state.thirst < LOW;
const stages = () => SPRITES.species[state.species] ?? SPRITES.stages;

function age() {
  if (!state.hatchedAt) return null;
  const days = Math.floor((Date.now() - state.hatchedAt) / (24 * 60 * 60 * 1000));
  return days === 0 ? 'Hatched today' : days === 1 ? 'Hatched yesterday' : `Hatched ${days} days ago`;
}

// The picker buttons, made once from the species and pattern lists.
function buildChoices() {
  const speciesList = document.getElementById('species-list');
  for (const s of SPECIES) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.species = s.id;
    button.innerHTML = `<canvas aria-hidden="true"></canvas><span>${s.name}</span>`;
    button.addEventListener('click', () => vscode.postMessage({ type: 'species', id: s.id }));
    speciesList.appendChild(button);
  }
  const patternList = document.getElementById('pattern-list');
  for (const p of PATTERNS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.pattern = p.id;
    button.innerHTML = `<span class="swatch" aria-hidden="true"></span><span>${p.name}</span>`;
    button.querySelector('.swatch').style.background = `linear-gradient(135deg, ${p.colors.g} 60%, ${p.colors.p} 60%)`;
    button.addEventListener('click', () => vscode.postMessage({ type: 'pattern', id: p.id }));
    patternList.appendChild(button);
  }
}

// The species buttons while it is an egg, the pattern buttons after.
function renderChoices() {
  const egg = state.stage.index === 0;
  const species = document.getElementById('species');
  const patterns = document.getElementById('patterns');
  species.hidden = !egg;
  patterns.hidden = egg;
  document.getElementById('species-title').textContent = state.speciesChosen
    ? `${speciesOf(state.species).name} egg. You can still change your mind.`
    : "What's in the egg?";
  species.querySelectorAll('button').forEach((button) => {
    const id = button.dataset.species;
    button.setAttribute('aria-pressed', String(state.speciesChosen && id === state.species));
    const preview = button.querySelector('canvas');
    draw(preview, preview.getContext('2d'), SPRITES.species[id][4].walkA, 2, palette);
  });
  patterns.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.pattern === state.pattern));
  });
}

function render() {
  const { stage } = state;
  palette = paletteFor(state.pattern);
  document.getElementById('name').textContent = state.name;
  document.getElementById('stage').textContent =
    stage.index === 0 ? stage.name : `${speciesOf(state.species).name}, ${stage.name.toLowerCase()}`;
  document.getElementById('growth').style.width = percent(stage.growth);
  document.getElementById('food').style.width = percent(state.hunger);
  document.getElementById('water').style.width = percent(state.thirst);
  document.getElementById('food-value').textContent = percent(state.hunger);
  document.getElementById('water-value').textContent = percent(state.thirst);
  document.getElementById('love').style.width = percent(state.love);
  document.getElementById('love-value').textContent = percent(state.love);
  let hint;
  if (stage.index > 0 && state.hunger < LOW) hint = `${state.name} is hungry. Save some real work to feed it.`;
  else if (stage.index > 0 && state.thirst < LOW) hint = `${state.name} is thirsty. Clear the errors in your code to give it water.`;
  else if (stage.index > 0 && state.love < LOW) hint = `${state.name} misses you. Click it to give it a pet.`;
  else if (state.errors > 0) hint = `${state.errors} ${state.errors === 1 ? 'error' : 'errors'} nearby. ${state.name} is keeping an eye on it.`;
  else if (stage.next) hint = `${Math.floor(stage.growth * 100)}% of the way to ${stage.next}. Saves that change a file count.`;
  else hint = `Fully grown, with ${state.saves.toLocaleString('en-US')} saves behind it.`;
  document.getElementById('hint').textContent = hint;
  document.getElementById('needs').hidden = stage.index === 0;
  const stats = [age(), `${state.saves.toLocaleString('en-US')} ${state.saves === 1 ? 'save' : 'saves'}`];
  if (state.streak > 1) stats.push(`${state.streak}-day streak`);
  document.getElementById('stats').textContent = stats.filter(Boolean).join(' · ');
  field.setAttribute('aria-label', stage.index === 0 ? `${state.name}'s egg. Press Enter to tap it.` : `Pet ${state.name}`);
  if (!state.bubbles) bubble.hidden = true;
  renderChoices();
}

// A small heart that floats up from the sprout and fades.
function heart() {
  const c = document.createElement('canvas');
  c.className = 'heart';
  draw(c, c.getContext('2d'), SPRITES.heart, 3);
  const box = canvas.getBoundingClientRect();
  const fieldBox = field.getBoundingClientRect();
  c.style.left = `${box.left - fieldBox.left + box.width / 2 - 10 + (Math.random() * 24 - 12)}px`;
  c.style.bottom = `${box.height - 6}px`;
  field.appendChild(c);
  setTimeout(() => c.remove(), 1400);
}

function placeShell(visible) {
  shell.hidden = !visible;
  if (visible) {
    draw(shell, shell.getContext('2d'), SPRITES.shell, SCALE);
    shell.style.transform = `translateX(${Math.max(0, x - 8 * SCALE)}px)`;
  }
}

function tick() {
  const index = state.stage.index;
  const width = canvas.getBoundingClientRect().width;
  const room = Math.max(0, field.clientWidth - width);

  // The hatching scene: a hard shake, the shell opening, then the hatchling
  // beside the bottom half of its shell.
  if (hatching > 0) {
    hatching -= 1;
    if (hatching > 22) {
      draw(canvas, ctx, SPRITES.egg.crackTwo, SCALE);
      x = room / 2;
      canvas.style.transform = `translateX(${x}px) rotate(${frame % 2 ? 12 : -12}deg)`;
    } else if (hatching > 14) {
      draw(canvas, ctx, SPRITES.egg.open, SCALE);
      canvas.style.transform = `translateX(${x}px)`;
    } else {
      draw(canvas, ctx, stages()[1].walkA, SCALE);
      canvas.style.transform = `translateX(${x}px) scaleX(${dir})`;
      placeShell(hatching > 0);
    }
    frame += 1;
    return;
  }

  if (index === 0) {
    // The egg rocks from the start, and cracks as it gets close.
    const g = state.stage.growth;
    const rows = g >= 0.7 ? SPRITES.egg.crackTwo : g >= 0.4 ? SPRITES.egg.crackOne : SPRITES.egg.rest;
    draw(canvas, ctx, rows, SCALE);
    x = room / 2;
    const strength = 2 + g * 8;
    const angle = Math.sin(frame / (g >= 0.7 ? 1.5 : 4)) * strength;
    canvas.style.transform = `translateX(${x}px) rotate(${angle.toFixed(1)}deg)`;
    frame += 1;
    return;
  }

  const sprite = stages()[index];
  const asleep = Date.now() - lastActive > IDLE_MS;
  if (asleep) {
    draw(canvas, ctx, sprite.sleep, SCALE);
    if (bubble.hidden || bubble.textContent !== 'z z z') say('z z z', 60000);
  } else if (needy()) {
    draw(canvas, ctx, sprite.sit, SCALE);
    if (frame % 150 === 0) say(state.hunger < LOW ? 'Tummy rumble.' : 'Parched.');
  } else if (state.love < LOW && frame % 200 === 0) {
    say('Could use a pet.');
  } else if (pause > 0) {
    pause -= 1;
    draw(canvas, ctx, sprite.walkA, SCALE);
  } else {
    const speed = state.errors > 0 ? 1 : 2;
    x += dir * speed;
    if (x <= 0 || x >= room) {
      dir *= -1;
      x = Math.min(Math.max(x, 0), room);
    }
    if (Math.random() < 0.02) pause = 10 + Math.floor(Math.random() * 20);
    draw(canvas, ctx, frame % 2 ? sprite.walkA : sprite.walkB, SCALE);
  }
  if (!asleep && state.love >= 0.9 && frame % 70 === 0) heart();
  const lift = hop > 0 ? Math.sin((hop / 6) * Math.PI) * 10 : 0;
  if (hop > 0) hop -= 1;
  canvas.style.transform = `translate(${x}px, ${-lift}px) scaleX(${dir})`;
  frame += 1;
}

// The animation only runs while the view is on screen.
function setRunning(running) {
  if (running && !clock) clock = setInterval(tick, TICK_MS);
  if (!running && clock) {
    clearInterval(clock);
    clock = null;
  }
}

function wake() {
  lastActive = Date.now();
  if (bubble.textContent === 'z z z') bubble.hidden = true;
}

function pet() {
  wake();
  hop = 6;
  if (state.stage.index > 0) {
    vscode.postMessage({ type: 'pet' });
    heart();
  }
  const lines =
    state.stage.index === 0
      ? ['Something moved in there.', 'Still warm.', 'A tiny tap from inside.']
      : needy()
        ? ['A hopeful look.', 'A small sigh.']
        : ['Happy chirp.', 'Tail wag.', 'A gentle head bump.', 'Leans into the pet.'];
  // After hatching the heart answers a pet, so a line only comes now and then.
  if (state.stage.index === 0 || Math.random() < 0.3) say(lines[Math.floor(Math.random() * lines.length)]);
}

window.addEventListener('message', (event) => {
  const m = event.data;
  if (m.type === 'state') {
    state = m;
    render();
  }
  if (m.type === 'errors') {
    state.errors = m.errors;
    render();
  }
  if (m.type === 'visible') setRunning(m.visible);
  if (m.type === 'active') wake();
  if (m.type === 'saved') {
    wake();
    hop = 6;
  }
  if (m.type === 'grew') {
    if (m.index === 1) hatching = 50;
    say(m.line, 5000);
  }
});

field.addEventListener('click', pet);
field.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    pet();
  }
});
document.getElementById('name').addEventListener('click', () => vscode.postMessage({ type: 'rename' }));
buildChoices();
render();
setRunning(true);
vscode.postMessage({ type: 'ready' });
