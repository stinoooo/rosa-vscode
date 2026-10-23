// The sprout's growth, needs and save rules, without VS Code.
// Run: npm test

import assert from 'node:assert/strict';
import Module, { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const load = Module._load;
Module._load = (request, ...rest) => (request === 'vscode' ? {} : load(request, ...rest));
const { stageOf, needsAt, countsAsSave } = require('../extension.js');
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
