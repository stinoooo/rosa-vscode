// The grammars, the file icons and the theme, checked the way VS Code reads
// them: every grammar regex compiles in Oniguruma, sample code tokenizes into
// the colors Rosa means it to have, and every file name finds its icon.
// Run: npm test

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const oniguruma = require('vscode-oniguruma');
const textmate = require('vscode-textmate');
const root = new URL('../', import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));

await oniguruma.loadWASM(readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm')).buffer);
const onigLib = {
  createOnigScanner: (sources) => new oniguruma.OnigScanner(sources),
  createOnigString: (s) => new oniguruma.OnigString(s),
};

const manifest = read('package.json');
const grammars = manifest.contributes.grammars;
const byScope = Object.fromEntries(grammars.map((g) => [g.scopeName, g.path]));
const dark = read('themes/rosa-dark.json');
const C = {
  ink: '#E6DBCD', comment: '#8F8375', rose: '#DD9B9B', gold: '#D9B64A', sky: '#7FB8C9', ember: '#E0A06F',
  accent: '#A8BD7F', sage: '#C4B898', peach: '#E8B287', muted: '#B8AA9B',
};

const registry = new textmate.Registry({
  onigLib: Promise.resolve(onigLib),
  loadGrammar: async (scope) => (byScope[scope] ? read(byScope[scope]) : null),
  theme: { settings: [{ settings: { foreground: dark.colors['editor.foreground'] } }, ...dark.tokenColors] },
});

// The color Rosa Dark gives the first token that starts with `text` on `line`.
async function colorsOf(scope, source) {
  const grammar = await registry.loadGrammar(scope);
  const colors = registry.getColorMap();
  const out = [];
  let state = textmate.INITIAL;
  for (const line of source.split('\n')) {
    const result = grammar.tokenizeLine2(line, state);
    for (let i = 0; i < result.tokens.length; i += 2) {
      const start = result.tokens[i];
      const end = i + 2 < result.tokens.length ? result.tokens[i + 2] : line.length;
      const fg = (result.tokens[i + 1] & 0x00ff8000) >>> 15;
      out.push({ text: line.slice(start, end), color: colors[fg].toUpperCase() });
    }
    state = result.ruleStack;
  }
  return (text) => {
    const hit = out.find((t) => t.text.trim().startsWith(text));
    assert.ok(hit, `no token starts with ${JSON.stringify(text)} in ${scope}`);
    return hit.color;
  };
}

test('every grammar regex compiles in Oniguruma', () => {
  let count = 0;
  const walk = (node, path) => {
    if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${path}[${i}]`));
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries(node)) {
      if (['match', 'begin', 'end', 'while'].includes(key) && typeof value === 'string') {
        // An end or while may refer back to its begin with \1, which only
        // compiles once the begin has matched.
        if ((key === 'end' || key === 'while') && /\\[1-9]/.test(value)) continue;
        assert.doesNotThrow(() => new oniguruma.OnigScanner([value]), `${path}.${key}: ${value}`);
        count++;
      } else walk(value, `${path}.${key}`);
    }
  };
  for (const g of grammars) walk(read(g.path), g.path);
  assert.ok(count > 500, `only ${count} regexes`);
});

test('every language and grammar in package.json has its files', () => {
  for (const g of grammars) assert.ok(existsSync(new URL(g.path, root)), g.path);
  for (const l of manifest.contributes.languages) assert.ok(existsSync(new URL(l.configuration, root)), l.configuration);
  const ids = new Set(manifest.contributes.languages.map((l) => l.id));
  for (const g of grammars.filter((g) => g.language)) assert.ok(ids.has(g.language), g.language);
});

test('a Godot shader reads in Rosa colors', async () => {
  const color = await colorsOf('source.gdshader', readFileSync(new URL('./samples/highlight.gdshader', import.meta.url), 'utf8'));
  assert.equal(color('shader_type'), C.rose);
  assert.equal(color('spatial'), C.ember);
  assert.equal(color('unshaded'), C.ember);
  assert.equal(color('// A soft'), C.comment);
  assert.equal(color('uniform'), C.rose);
  assert.equal(color('vec4'), C.sky);
  assert.equal(color('source_color'), C.peach);
  assert.equal(color('0.35'), C.ember);
  assert.equal(color('void'), C.sky);
  assert.equal(color('fragment'), C.gold);
  assert.equal(color('smoothstep'), C.gold);
  assert.equal(color('UV'), C.ember);
  assert.equal(color('ALBEDO'), C.ember);
  assert.equal(color('rgb'), C.sage);
  assert.equal(color('TIME'), C.ember);
});

test('GDScript reads in Rosa colors', async () => {
  const color = await colorsOf('source.gdscript', readFileSync(new URL('./samples/player.gd', import.meta.url), 'utf8'));
  assert.equal(color('@export'), C.peach);
  assert.equal(color('extends'), C.rose);
  assert.equal(color('CharacterBody3D'), C.sky);
  assert.equal(color('class_name'), C.rose);
  assert.equal(color('Player'), C.sky);
  assert.equal(color('signal'), C.rose);
  assert.equal(color('hit'), C.gold);
  assert.equal(color('func'), C.rose);
  assert.equal(color('_physics_process'), C.gold);
  assert.equal(color('delta'), C.peach);
  assert.equal(color('float'), C.sky);
  assert.equal(color('MAX_SPEED'), C.ember);
  assert.equal(color('Camera'), C.sky);
  assert.equal(color('$'), C.accent);
  assert.equal(color('"jump"'), C.accent);
  assert.equal(color('print'), C.gold);
  assert.equal(color('self'), C.rose);
  assert.equal(color('velocity'), C.ink);
  assert.equal(color('## The'), C.comment);
});

test('Godot scenes and resources read in Rosa colors', async () => {
  const color = await colorsOf('source.gdresource', readFileSync(new URL('./samples/level.tscn', import.meta.url), 'utf8'));
  assert.equal(color('gd_scene'), C.rose);
  assert.equal(color('load_steps'), C.gold);
  assert.equal(color('transform'), C.sage);
  assert.equal(color('Transform3D'), C.sky);
  assert.equal(color('ExtResource'), C.gold);
  assert.equal(color('res://'), C.sky);
  assert.equal(color('"1_abc'), C.accent);
});

test('the generated grammars read in Rosa colors', async () => {
  const cases = [
    ['source.kotlin', 'fun greet(name: String) = println("Hi $name")', { fun: C.rose, greet: C.gold, String: C.sky, println: C.gold, $name: C.sky }],
    ['source.zig', 'pub fn main() !void { const x: u32 = @intCast(4); }', { pub: C.rose, main: C.gold, u32: C.sky, '@intCast': C.gold, 4: C.ember }],
    ['source.toml', '[package]\nname = "rosa" # the name\nversion = 1', { package: C.rose, name: C.sage, '"rosa"': C.accent, '# the': C.comment, 1: C.ember }],
    ['source.dart', "class Egg extends Shell { final int size = 3; }", { class: C.rose, Egg: C.sky, int: C.sky, 3: C.ember }],
    ['source.glsl', '#version 450\nuniform vec3 tint;\nvoid main() { gl_FragColor = vec4(tint, 1.0); }', { '#': C.peach, uniform: C.rose, vec3: C.sky, gl_FragColor: C.ember, '1.0': C.ember }],
    ['source.nix', '{ pkgs, ... }: { name = "rosa"; src = ./src; }', { name: C.sage, '"rosa"': C.accent, './src': C.sky }],
    ['source.terraform', 'resource "aws_s3_bucket" "nest" {\n  bucket = "${var.name}"\n}', { resource: C.rose, bucket: C.sage }],
    ['source.elixir', 'defmodule Nest do\n  def hatch(egg), do: :ok\nend', { defmodule: C.rose, Nest: C.sky, hatch: C.gold, ':ok': C.ember }],
  ];
  for (const [scope, source, expected] of cases) {
    const color = await colorsOf(scope, source);
    for (const [text, want] of Object.entries(expected)) assert.equal(color(text), want, `${scope}: ${text}`);
  }
});

test('every file name finds the icon it should', () => {
  const theme = read('file-icons.json');
  for (const def of Object.values(theme.iconDefinitions)) assert.ok(existsSync(new URL(def.iconPath, root)), def.iconPath);
  const ids = new Set(Object.keys(theme.iconDefinitions));
  for (const table of ['fileExtensions', 'fileNames', 'folderNames', 'folderNamesExpanded', 'rootFolderNames', 'languageIds']) {
    for (const [name, id] of Object.entries(theme[table])) assert.ok(ids.has(id), `${table}.${name} -> ${id}`);
  }
  // How VS Code picks: the whole name first, then the longest extension.
  const iconFor = (file) => {
    const name = file.toLowerCase();
    if (theme.fileNames[name]) return theme.fileNames[name];
    const parts = name.split('.');
    for (let i = 1; i < parts.length; i++) {
      const ext = parts.slice(i).join('.');
      if (theme.fileExtensions[ext]) return theme.fileExtensions[ext];
    }
    return theme.file;
  };
  const expected = {
    'player.gd': 'gdscript', 'audio.gd.uid': 'godot-uid', 'highlight.gdshader': 'gdshader', 'level.tscn': 'godot-scene',
    'theme.tres': 'godot-resource', 'icon.png.import': 'godot-import', 'project.godot': 'godot', 'export_presets.cfg': 'godot',
    'song.mp3': 'audio', 'take.wav': 'audio', 'clip.mov': 'video', 'clip.mp4': 'video', 'scene.glb': 'model', 'sprite.aseprite': 'design',
    'notes.pdf': 'pdf', 'sheet.csv': 'table', 'game.zip': 'archive', 'main.rs': 'rust', 'main.go': 'go', 'App.kt': 'kotlin',
    'main.c': 'c', 'main.cpp': 'cpp', 'Program.cs': 'csharp', 'Main.java': 'java', 'app.rb': 'ruby', 'init.lua': 'lua',
    'Cargo.toml': 'package', 'Cargo.lock': 'lock', 'vite.config.ts': 'config', 'Makefile': 'build', 'id_ed25519': 'key',
    'cert.pem': 'key', 'water.glsl': 'shader', 'notebook.ipynb': 'notebook', 'hatch.test.ts': 'test', 'types.d.ts': 'typescript',
  };
  for (const [file, id] of Object.entries(expected)) assert.equal(iconFor(file), id, file);
  assert.equal(theme.folderNames['.godot'], 'folder-node');
  assert.equal(theme.folderNames.shaders, 'folder-shaders');
  assert.equal(theme.folderNames.addons, 'folder-packages');
});
