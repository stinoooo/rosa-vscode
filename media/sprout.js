// The sprout's drawings and behavior. A drawing is a list of rows, one
// character per pixel: o outline, g body, s spots, l belly, e eye, c cheek,
// p back plates, w egg shell, k shell speckle, h heart, H heart shine, and
// . for nothing.

const PALETTE = {
  o: '#3b2a1f',
  g: '#7f9a52',
  s: '#5f7a3a',
  l: '#efe2c8',
  e: '#191410',
  c: '#dd9b9b',
  p: '#c4733f',
  w: '#f5ede5',
  k: '#d8c8b4',
  h: '#dd6b7b',
  H: '#f5c4cb',
};

// Every row of a drawing is padded to the widest row, so a drawing only has
// to get its left edge right.
const pad = (rows) => {
  const width = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => r.padEnd(width, '.'));
};
const closeEyes = (rows) => rows.map((r) => r.replace('e', 'o'));

// One stage: a body, the leg rows for two steps, and the feet it sits on.
// Sitting lowers the body onto its feet and keeps the drawing the same height.
function stage(body, legsA, legsB, feet) {
  const blank = '.'.repeat(Math.max(...body.map((r) => r.length)));
  const sitting = [...Array(legsA.length - 1).fill(blank), ...body, feet];
  return {
    walkA: pad([...body, ...legsA]),
    walkB: pad([...body, ...legsB]),
    sit: pad(sitting),
    sleep: pad(closeEyes(sitting)),
  };
}

const HATCHLING = stage(
  [
    '.......ooooo..',
    '......ogggggo.',
    '......ogggegoo',
    '......ogcggggo',
    '.......ogggoo.',
    '..oooooogggo..',
    '.ogggsggggggo.',
    'ogsggggsgggo..',
    '.olllllllggo..',
  ],
  ['..ogo...ogo...', '..ooo...ooo...'],
  ['...ogo.ogo....', '...ooo.ooo....'],
  '..ooo...ooo...',
);

const JUVENILE = stage(
  [
    '..............oooo..',
    '.............oggggo.',
    '.............oggegoo',
    '.............ogcgggo',
    '..............oggoo.',
    '..............oggo..',
    '.......ooooo..oggo..',
    '.....oogggggooogggo.',
    '...oogsggggsggggggo.',
    'oooggggggsgggggggo..',
    '.ogsgggggggggsgggo..',
    '..oollllllllllllo...',
  ],
  ['....oggo.....oggo...', '....oggo.....oggo...', '....oooo.....oooo...'],
  ['.....oggo...oggo....', '.....oggo...oggo....', '.....oooo...oooo....'],
  '....oooo.....oooo...',
);

const ADOLESCENT = stage(
  [
    '.................oooo..',
    '................oggggo.',
    '................oggegoo',
    '................ogcgggo',
    '.................oggoo.',
    '.................oggo..',
    '.................oggo..',
    '................oggo...',
    '........oooooo..oggo...',
    '......ooggggggoooggo...',
    '....oogsggggsgggggggo..',
    '.oooggggggggggsgggggo..',
    'oogsgggsgggggggggggo...',
    '..oollllllllllllllo....',
  ],
  ['.....oggo......oggo....', '.....oggo......oggo....', '.....oooo......oooo....'],
  ['......oggo....oggo.....', '......oggo....oggo.....', '......oooo....oooo.....'],
  '.....oooo......oooo....',
);

const ADULT = stage(
  [
    '.......................oooo..',
    '......................oggggo.',
    '......................oggegoo',
    '......................ogcgggo',
    '.......................oggoo.',
    '.......................oggo..',
    '.......................oggo..',
    '......................oggo...',
    '......................oggo...',
    '..........o.o.o.o....oggo....',
    '.........opopopopo..oggo.....',
    '.......ooggggggggoooggo......',
    '.....oogsgggsggggsggggo......',
    '..oooggggggggggggggsgggo.....',
    'oogsggggsgggggsgggggggo......',
    '.oggggggggggggggggggggo......',
    '..oolllllllllllllllllo.......',
  ],
  ['.....ogggo.........ogggo.....', '.....ogggo.........ogggo.....', '.....ogggo.........ogggo.....', '.....ooooo.........ooooo.....'],
  ['......ogggo.......ogggo......', '......ogggo.......ogggo......', '......ogggo.......ogggo......', '......ooooo.......ooooo......'],
  '.....ooooo.........ooooo.....',
);

const EGG = [
  '...oooo...',
  '..owwwwo..',
  '.owwkwwwo.',
  '.owwwwwwo.',
  'owkwwwwkwo',
  'owwwwwwwwo',
  'owwwkwwwwo',
  'owwwwwwkwo',
  'owkwwwwwwo',
  '.owwwwkwo.',
  '.owwwwwwo.',
  '..oooooo..',
];
const crack = (rows, marks) =>
  rows.map((r, y) => [...r].map((ch, x) => (marks.some(([mx, my]) => mx === x && my === y) ? 'o' : ch)).join(''));
const CRACK_ONE = [[4, 2], [5, 3], [4, 4]];
const CRACK_TWO = [...CRACK_ONE, [5, 5], [6, 4], [3, 5], [6, 6], [2, 3]];
const EGG_OPEN = [
  '..oooo....',
  '.owwwwo...',
  'owwkwwwo..',
  '.oooooo...',
  '..........',
  '..........',
  '.o.o.o.o..',
  'owowowowo.',
  'owwwwwwwwo',
  'owkwwwwkwo',
  '.owwwwwwo.',
  '..oooooo..',
];
const SHELL = ['.o.o.o.', 'owowowo', 'owwkwwo', '.ooooo.'];
const HEART = ['.oo.oo.', 'ohHohho', 'ohhhhho', '.ohhho.', '..oho..', '...o...'];

const SPRITES = {
  egg: { rest: pad(EGG), crackOne: pad(crack(EGG, CRACK_ONE)), crackTwo: pad(crack(EGG, CRACK_TWO)), open: pad(EGG_OPEN) },
  shell: pad(SHELL),
  heart: pad(HEART),
  stages: [null, HATCHLING, JUVENILE, ADOLESCENT, ADULT],
};

if (typeof acquireVsCodeApi === 'function') {
  const vscode = acquireVsCodeApi();
  const canvas = document.getElementById('sprite');
  const shell = document.getElementById('shell');
  const field = document.getElementById('field');
  const bubble = document.getElementById('bubble');
  const ctx = canvas.getContext('2d');
  const SCALE = [4, 4, 4, 4, 4]; // screen pixels per drawing pixel, per stage
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
  };
  let x = 20;
  let dir = 1;
  let frame = 0;
  let pause = 0;
  let hop = 0;
  let hatching = 0; // ticks left in the hatching scene
  let lastActive = Date.now();
  let bubbleTimer;

  function draw(target, context, rows, scale) {
    target.width = rows[0].length;
    target.height = rows.length;
    target.style.width = `${rows[0].length * scale}px`;
    target.style.height = `${rows.length * scale}px`;
    context.clearRect(0, 0, target.width, target.height);
    rows.forEach((row, y) => {
      [...row].forEach((ch, px) => {
        if (ch === '.') return;
        context.fillStyle = PALETTE[ch];
        context.fillRect(px, y, 1, 1);
      });
    });
  }

  function say(text, ms = 2600) {
    bubble.textContent = text;
    bubble.hidden = false;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => (bubble.hidden = true), ms);
  }

  const percent = (v) => `${Math.round(v * 100)}%`;
  const needy = () => state.hunger < LOW || state.thirst < LOW;

  function render() {
    const { stage } = state;
    document.getElementById('name').textContent = state.name;
    document.getElementById('stage').textContent = stage.name;
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

  function placeShell(visible, scale) {
    shell.hidden = !visible;
    if (visible) {
      draw(shell, shell.getContext('2d'), SPRITES.shell, scale);
      shell.style.transform = `translateX(${Math.max(0, x - 8 * scale)}px)`;
    }
  }

  function tick() {
    const index = state.stage.index;
    const scale = SCALE[index];
    const width = canvas.getBoundingClientRect().width;
    const room = Math.max(0, field.clientWidth - width);

    // The hatching scene: a hard shake, the shell opening, then the hatchling
    // beside the bottom half of its shell.
    if (hatching > 0) {
      hatching -= 1;
      if (hatching > 22) {
        draw(canvas, ctx, SPRITES.egg.crackTwo, scale);
        x = room / 2;
        canvas.style.transform = `translateX(${x}px) rotate(${frame % 2 ? 12 : -12}deg)`;
      } else if (hatching > 14) {
        draw(canvas, ctx, SPRITES.egg.open, scale);
        canvas.style.transform = `translateX(${x}px)`;
      } else {
        draw(canvas, ctx, SPRITES.stages[1].walkA, scale);
        canvas.style.transform = `translateX(${x}px) scaleX(${dir})`;
        placeShell(hatching > 0, scale);
      }
      frame += 1;
      return;
    }

    if (index === 0) {
      // The egg rocks from the start, and cracks as it gets close.
      const g = state.stage.growth;
      const rows = g >= 0.7 ? SPRITES.egg.crackTwo : g >= 0.4 ? SPRITES.egg.crackOne : SPRITES.egg.rest;
      draw(canvas, ctx, rows, scale);
      x = room / 2;
      const strength = 2 + g * 8;
      const angle = Math.sin(frame / (g >= 0.7 ? 1.5 : 4)) * strength;
      canvas.style.transform = `translateX(${x}px) rotate(${angle.toFixed(1)}deg)`;
      frame += 1;
      return;
    }

    const sprite = SPRITES.stages[index];
    const asleep = Date.now() - lastActive > IDLE_MS;
    if (asleep) {
      draw(canvas, ctx, sprite.sleep, scale);
      if (bubble.hidden || bubble.textContent !== 'z z z') say('z z z', 60000);
    } else if (needy()) {
      draw(canvas, ctx, sprite.sit, scale);
      if (frame % 150 === 0) say(state.hunger < LOW ? 'Tummy rumble.' : 'Parched.');
    } else if (state.love < LOW && frame % 200 === 0) {
      say('Could use a pet.');
    } else if (pause > 0) {
      pause -= 1;
      draw(canvas, ctx, sprite.walkA, scale);
    } else {
      const speed = state.errors > 0 ? 1 : 2;
      x += dir * speed;
      if (x <= 0 || x >= room) {
        dir *= -1;
        x = Math.min(Math.max(x, 0), room);
      }
      if (Math.random() < 0.02) pause = 10 + Math.floor(Math.random() * 20);
      draw(canvas, ctx, frame % 2 ? sprite.walkA : sprite.walkB, scale);
    }
    if (!asleep && state.love >= 0.9 && frame % 70 === 0) heart();
    const lift = hop > 0 ? Math.sin((hop / 6) * Math.PI) * 10 : 0;
    if (hop > 0) hop -= 1;
    canvas.style.transform = `translate(${x}px, ${-lift}px) scaleX(${dir})`;
    frame += 1;
  }

  function wake() {
    lastActive = Date.now();
    if (bubble.textContent === 'z z z') bubble.hidden = true;
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

  field.addEventListener('click', () => {
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
  });
  document.getElementById('name').addEventListener('click', () => vscode.postMessage({ type: 'rename' }));

  setInterval(tick, TICK_MS);
  vscode.postMessage({ type: 'ready' });
}
