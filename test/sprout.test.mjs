// The sprout's growth, needs and save rules, without VS Code.
// Run: npm test

import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const load = Module._load;
Module._load = (request, ...rest) => (request === 'vscode' ? {} : load(request, ...rest));
const { stageOf, shownStage, needsAt, countsAsSave, nextStreak } = require('../extension.js');
const { readFileSync } = require('node:fs');
const { SPECIES, PATTERNS, SPRITES } = new Function(
  `${readFileSync(new URL('../media/sprites.js', import.meta.url), 'utf8')};return { SPECIES, PATTERNS, SPRITES };`,
)();
Module._load = load;

const HOUR = 60 * 60 * 1000;
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} is not ${b}`);

test('stages start at 0, 10, 100, 400 and 1,000 saves', () => {
  assert.deepEqual([0, 9, 10, 99, 100, 399, 400, 999, 1000].map((n) => stageOf(n).name), [
    'Egg', 'Egg', 'Hatchling', 'Hatchling', 'Juvenile', 'Juvenile', 'Adolescent', 'Adolescent', 'Adult',
  ]);
  close(stageOf(5).growth, 0.5);
  assert.equal(stageOf(5000).next, null);
});

test('a sprout looks like any stage it has reached, and its real stage otherwise', () => {
  assert.equal(shownStage({ saves: 1500 }), 4);
  assert.equal(shownStage({ saves: 1500, look: 1 }), 1);
  assert.equal(shownStage({ saves: 450, look: 3 }), 3);
  assert.equal(shownStage({ saves: 150, look: 3 }), 2, 'a stage it has not reached');
  assert.equal(shownStage({ saves: 5, look: 1 }), 0, 'an egg is always an egg');
  assert.equal(shownStage({ saves: 1500, look: 0 }), 4, 'never back to the egg');
  assert.equal(shownStage({ saves: 1500, look: 'adult' }), 4);
});

test('a save counts only after a change, once a minute per file', () => {
  assert.equal(countsAsSave(false, undefined, 0), false);
  assert.equal(countsAsSave(true, undefined, 0), true);
  assert.equal(countsAsSave(true, 0, 59_000), false);
  assert.equal(countsAsSave(true, 0, 60_000), true);
});

test('an egg has no needs', () => {
  assert.deepEqual(needsAt({ saves: 3, hunger: 0, thirst: 0, love: 0, needsAt: 0 }, 99 * HOUR), { hunger: 1, thirst: 1, love: 1 });
});

test('food, water and love empty over 12, 8 and 24 hours', () => {
  const needs = needsAt({ saves: 50, hunger: 1, thirst: 1, love: 1, needsAt: 0 }, 6 * HOUR);
  close(needs.hunger, 0.5);
  close(needs.thirst, 0.25);
  close(needs.love, 0.75);
  assert.deepEqual(needsAt({ saves: 50, hunger: 0.1, thirst: 0.1, love: 0.1, needsAt: 0 }, 48 * HOUR), { hunger: 0, thirst: 0, love: 0 });
});

test('a sprout from before needs existed starts full', () => {
  assert.deepEqual(needsAt({ saves: 250 }, Date.now()), { hunger: 1, thirst: 1, love: 1 });
});

test('the streak grows on days in a row and starts over after a gap', () => {
  assert.deepEqual(nextStreak(undefined, 0, '2026-10-23'), { streak: 1, lastSaveDay: '2026-10-23' });
  assert.deepEqual(nextStreak('2026-10-23', 1, '2026-10-23'), { streak: 1, lastSaveDay: '2026-10-23' });
  assert.deepEqual(nextStreak('2026-10-23', 1, '2026-10-24'), { streak: 2, lastSaveDay: '2026-10-24' });
  assert.deepEqual(nextStreak('2026-10-31', 5, '2026-11-01'), { streak: 6, lastSaveDay: '2026-11-01' });
  assert.deepEqual(nextStreak('2026-10-20', 9, '2026-10-24'), { streak: 1, lastSaveDay: '2026-10-24' });
});

test('every species has every stage and pose, with rows of one width', () => {
  assert.deepEqual(SPECIES.map((s) => s.id), ['sauropod', 'stegosaur', 'ceratopsian', 'raptor']);
  for (const species of SPECIES) {
    for (let i = 1; i <= 4; i++) {
      for (const pose of ['walkA', 'walkB', 'sit', 'sleep']) {
        const rows = species.stages[i][pose];
        assert.ok(rows.length > 0, `${species.id} ${i} ${pose}`);
        assert.ok(rows.every((r) => r.length === rows[0].length), `${species.id} ${i} ${pose} has uneven rows`);
        assert.equal(species.stages[i].walkA.length, species.stages[i].sit.length, `${species.id} ${i} sits at another height`);
      }
    }
  }
  assert.equal(SPRITES.stages, SPECIES[0].stages);
});

test('every pattern sets the colors a drawing uses', () => {
  for (const pattern of PATTERNS) assert.deepEqual(Object.keys(pattern.colors).sort(), ['c', 'g', 'l', 'p', 's']);
});
