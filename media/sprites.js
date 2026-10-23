// The sprout's drawings: four species at every stage, the egg, and the
// color patterns. A drawing is a list of rows, one character per pixel:
// o outline, g body, s spots, l belly, e eye, c cheek, p plates and frills,
// w egg shell, k shell speckle, h heart, H heart shine, and . for nothing.
// Read by the Sprout view and by the build scripts for the pictures.

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

const SAUROPOD_HATCHLING = stage(
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

const SAUROPOD_JUVENILE = stage(
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

const SAUROPOD_ADOLESCENT = stage(
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

const SAUROPOD_ADULT = stage(
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

// The other three species, hatchling to adult.
const STEGOSAUR = [
  null,
  stage(
    [
      '....p.p.p.....',
      '...opopopoo...',
      '..oggggggggoo.',
      'opogsgggggegoo',
      '.oogggggsggggo',
      '...olllllllgo.',
    ],
    ['...ogo..ogo...', '...ooo..ooo...'],
    ['....ogoogo....', '....ooooo.....'],
    '...ooo..ooo...',
  ),
  stage(
    [
      '.......p.p.p........',
      '......opopopo.......',
      '....oogggggggoo.....',
      '..oogsgggsgggggoo...',
      '.ogggggggggsggggggoo',
      'opoggggggggggggggego',
      '..oollllllllllllggoo',
    ],
    ['....oggo.....oggo...', '....oggo.....oggo...', '....oooo.....oooo...'],
    ['.....oggo...oggo....', '.....oggo...oggo....', '.....oooo...oooo....'],
    '....oooo.....oooo...',
  ),
  stage(
    [
      '.........p.p.p.p.......',
      '........opopopopo......',
      '.......opgpgpgpgo......',
      '.....oogggggggggoo.....',
      '...oogsggggsgggggoo....',
      '..ogggggggggggsggggoo..',
      'pogggggsgggggggggggggo.',
      'opoggggggggggggggggegoo',
      '...oollllllllllllllgggo',
    ],
    ['.....oggo.......oggo....', '.....oggo.......oggo....', '.....oooo.......oooo....'],
    ['......oggo.....oggo.....', '......oggo.....oggo.....', '......oooo.....oooo.....'],
    '.....oooo.......oooo....',
  ),
  stage(
    [
      '...........p..p..p..p.......',
      '..........opoopoopoopo......',
      '.........opgppgppgppgpo.....',
      '........oggggggggggggggo....',
      '......oogsgggsggggsgggggoo..',
      '....ooggggggggggggggggsgggoo',
      '..ooggsggggggsgggggggggggggo',
      'p.oggggggggggggggggggggggego',
      'opoogggggsggggggggggggggggoo',
      '.p..oollllllllllllllllllgggo',
    ],
    ['......ogggo..........ogggo..', '......ogggo..........ogggo..', '......ogggo..........ogggo..', '......ooooo..........ooooo..'],
    ['.......ogggo........ogggo...', '.......ogggo........ogggo...', '.......ogggo........ogggo...', '.......ooooo........ooooo...'],
    '......ooooo..........ooooo..',
  ),
];

const CERATOPSIAN = [
  null,
  stage(
    [
      '........opo...',
      '.......oppoo..',
      '......opgggoo.',
      '..oooopggegggo',
      '.ogggsogcgggo.',
      'ogsggggggggo..',
      '.olllllllggo..',
    ],
    ['..ogo...ogo...', '..ooo...ooo...'],
    ['...ogo.ogo....', '...ooo.ooo....'],
    '..ooo...ooo...',
  ),
  stage(
    [
      '...............oo...',
      '.............oopo.o.',
      '............oppgoog.',
      '.....ooooooopggggego',
      '...oogsggggopgcgggoo',
      '.ooggggggsggoggggo..',
      'ogsgggggggggggggo...',
      '.oolllllllllllggo...',
    ],
    ['....oggo.....oggo...', '....oggo.....oggo...', '....oooo.....oooo...'],
    ['.....oggo...oggo....', '.....oggo...oggo....', '.....oooo...oooo....'],
    '....oooo.....oooo...',
  ),
  stage(
    [
      '................oo.......',
      '...............opoo.oo...',
      '..............oppppoogo..',
      '.............opppgggggo..',
      '......ooooooopppgggggego.',
      '....oogsgggggopgcggggggoo',
      '..ooggggggsgggoggggggoo..',
      '.ogsgggggggggggggggggo...',
      'ogggggsgggggggggggsgo....',
      '.oolllllllllllllllggo....',
    ],
    ['.....oggo........oggo....', '.....oggo........oggo....', '.....oooo........oooo....'],
    ['......oggo......oggo.....', '......oggo......oggo.....', '......oooo......oooo.....'],
    '.....oooo........oooo....',
  ),
  stage(
    [
      '...................ooo.......',
      '..................oppoo..oo..',
      '.................opppppooggo.',
      '................oppppgggggo..',
      '...............opppgggggggo..',
      '.......ooooooooopppgggggegooo',
      '.....oogsggggsggopgcgggggggoo',
      '...ooggggggggggggogggggggoo..',
      '..ogsggggggsgggggggggggggo...',
      '.ogggggggggggggggsggggggo....',
      'ogggsggggggggsggggggggggo....',
      '.oolllllllllllllllllllggo....',
    ],
    ['......ogggo..........ogggo...', '......ogggo..........ogggo...', '......ogggo..........ogggo...', '......ooooo..........ooooo...'],
    ['.......ogggo........ogggo....', '.......ogggo........ogggo....', '.......ogggo........ogggo....', '.......ooooo........ooooo....'],
    '......ooooo..........ooooo...',
  ),
];

const RAPTOR = [
  null,
  stage(
    [
      '.........oooo.',
      '........oggggo',
      '........oggego',
      '........ogcggo',
      '.......oggoo..',
      'oo....ogggo...',
      'opooooggggo...',
      '.oogsgggggo...',
      '...ooollggo...',
    ],
    ['.....ogo.ogo..', '.....ooo.ooo..'],
    ['....ogo...ogo.', '....ooo...ooo.'],
    '....oooo.ooo..',
  ),
  stage(
    [
      '..............ooo...',
      '.............ogggo..',
      '.............ogegoo.',
      '.............ogcgggo',
      '............oggoooo.',
      '...........oggo.....',
      'oo........ogggo.....',
      'oppoooooooogggo.....',
      '.oogggsgggggggo.....',
      '...ooggggggsgo......',
      '.....olllllggo......',
    ],
    ['.......ogo.ogo......', '.......ogo..ogo.....', '......ooo..ooo......'],
    ['......ogo...ogo.....', '.....ogo...ogo......', '....ooo...ooo.......'],
    '......oooo.ooo......',
  ),
  stage(
    [
      '..................oooo..',
      '.................oggggo.',
      '.................oggegoo',
      '.................ogcggggo',
      '................oggooooo',
      '...............oggo.....',
      '..............oggo......',
      'ooo..........ogggo......',
      'oppoo.......ogggggo.....',
      '.opppoooooooggggggo.....',
      '..oogggsggggggsgggo.....',
      '....oogggggggggggo......',
      '......oollllllggo.......',
    ],
    ['.........oggo.oggo......', '.........ogo...ogo......', '........ooo...ooo.......'],
    ['........oggo...oggo.....', '.......ogo...ogo........', '......ooo...ooo.........'],
    '........ooooo.ooo.......',
  ),
  stage(
    [
      '......................oooo...',
      '.....................oggggo..',
      '.....................oggegoo.',
      '.....................ogcgggggo',
      '.....................oggooooo.',
      '....................oggo......',
      '...................oggo.......',
      '..................ogggo.......',
      'oooo.............ogggggo......',
      'opppoo..........oggsggggo.....',
      '.opppppooooooooogggggggggo....',
      '..ooppgggsgggggggggsggggo.....',
      '....oogggggggsgggggggggo......',
      '......ooggggggggggggggo.......',
      '........oolllllllllggo........',
    ],
    ['............ogggo.ogggo.......', '............oggo...oggo.......', '...........oggo...oggo........', '..........oooo...oooo.........'],
    ['...........ogggo...ogggo......', '..........oggo...oggo.........', '.........oggo...oggo..........', '........oooo...oooo...........'],
    '...........oooooo.oooo........',
  ),
];

// Shown in the egg picker, in this order. The sauropod is the default, so a
// sprout from before species existed stays one.
const SPECIES = [
  { id: 'sauropod', name: 'Sauropod', stages: [null, SAUROPOD_HATCHLING, SAUROPOD_JUVENILE, SAUROPOD_ADOLESCENT, SAUROPOD_ADULT] },
  { id: 'stegosaur', name: 'Stegosaur', stages: STEGOSAUR },
  { id: 'ceratopsian', name: 'Ceratopsian', stages: CERATOPSIAN },
  { id: 'raptor', name: 'Raptor', stages: RAPTOR },
];

// Color patterns swap the body, spot, belly, plate and cheek colors.
const PATTERNS = [
  { id: 'meadow', name: 'Meadow', colors: { g: '#7f9a52', s: '#5f7a3a', l: '#efe2c8', p: '#c4733f', c: '#dd9b9b' } },
  { id: 'desert', name: 'Desert', colors: { g: '#c9a46a', s: '#a67c45', l: '#f3e6cc', p: '#8a4a24', c: '#dd9b9b' } },
  { id: 'river', name: 'River', colors: { g: '#6f9aa8', s: '#4f7a88', l: '#e8efe6', p: '#d9b64a', c: '#e8b5b5' } },
  { id: 'ember', name: 'Ember', colors: { g: '#b8674a', s: '#8f4a33', l: '#f0d9c4', p: '#d9b64a', c: '#f0b7a4' } },
];

const SPRITES = {
  egg: { rest: pad(EGG), crackOne: pad(crack(EGG, CRACK_ONE)), crackTwo: pad(crack(EGG, CRACK_TWO)), open: pad(EGG_OPEN) },
  shell: pad(SHELL),
  heart: pad(HEART),
  species: Object.fromEntries(SPECIES.map((s) => [s.id, s.stages])),
  stages: SPECIES[0].stages,
};

const speciesOf = (id) => SPECIES.find((s) => s.id === id) ?? SPECIES[0];
const patternOf = (id) => PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
const paletteFor = (patternId) => ({ ...PALETTE, ...patternOf(patternId).colors });
