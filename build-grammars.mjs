// Writes the grammars for languages VS Code has no colors for out of the box,
// their language settings (comments, brackets, indentation), the Markdown
// code fence support, and the languages and grammars in package.json.
//
// The Godot grammars in syntaxes/ are written by hand. Every other grammar
// here comes from one table per language below, so all of them name their
// tokens the same way and Rosa colors them alike.
//
// Run: node build-grammars.mjs

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const R = String.raw;
const words = (list) => R`\b(?:${list.join('|')})\b`;

// Number literals most languages share: hex, octal, binary, floats with an
// exponent, digit separators and a type suffix.
const NUMBERS = [
  { name: 'constant.numeric.hex', match: R`\b0[xX][0-9A-Fa-f][0-9A-Fa-f_]*(?:[uUlLiI]\w*)?\b` },
  { name: 'constant.numeric.binary', match: R`\b0[bB][01][01_]*(?:[uUlLiI]\w*)?\b` },
  { name: 'constant.numeric.octal', match: R`\b0[oO][0-7][0-7_]*\b` },
  { name: 'constant.numeric.float', match: R`(?:\b\d[\d_]*\.\d[\d_]*|\B\.\d[\d_]*)(?:[eE][+-]?\d+)?(?:[fFdDhH]|f16|f32|f64)?\b|\b\d[\d_]*[eE][+-]?\d+(?:[fFdD])?\b` },
  { name: 'constant.numeric.integer', match: R`\b\d[\d_]*(?:[uUlLnfFdDiI]\w*)?\b` },
];

const OPERATORS = [
  { name: 'keyword.operator.arrow', match: R`=>|->|<-|\|>` },
  { name: 'keyword.operator.comparison', match: R`===|!==|==|!=|<=|>=` },
  { name: 'keyword.operator.assignment', match: R`(?:\+|-|\*|/|%|&|\||\^|<<|>>|\?\?)?=(?![=>])|:=` },
  { name: 'keyword.operator.logical', match: R`&&|\|\||!(?!=)` },
  { name: 'keyword.operator.range', match: R`\.\.[.<=]?` },
  { name: 'keyword.operator.arithmetic', match: R`\*\*|\+\+|--|[-+*/%]` },
  { name: 'keyword.operator.bitwise', match: R`<<|>>|[&|^~]` },
  { name: 'keyword.operator.comparison', match: R`[<>]` },
  { name: 'keyword.operator', match: R`\?|::|:|@` },
];

// Each language: its id (the one the language's own extension uses, so a
// language server still finds the files), the files it covers, and its words.
const C_COMMENTS = { line: '//', block: ['/*', '*/'] };
const LANGUAGES = [
  {
    id: 'kotlin', name: 'Kotlin', extensions: ['.kt', '.kts', '.ktm'],
    comments: { ...C_COMMENTS, nested: true },
    strings: [
      { begin: '"""', end: '"""', interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
      { begin: '"', end: '"', escape: true, interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
      { begin: "'", end: "'", escape: true, kind: 'char' },
    ],
    annotation: R`@(?:[A-Za-z_][\w.]*:)?[A-Za-z_][\w.]*`,
    control: ['if', 'else', 'when', 'for', 'while', 'do', 'try', 'catch', 'finally', 'throw', 'return', 'break', 'continue'],
    declare: ['fun', 'val', 'var', 'class', 'interface', 'object', 'typealias', 'constructor', 'init', 'companion', 'package', 'import', 'get', 'set', 'by', 'where'],
    modifiers: ['public', 'private', 'protected', 'internal', 'open', 'final', 'abstract', 'override', 'sealed', 'data', 'enum', 'inner', 'annotation', 'inline', 'value', 'noinline', 'crossinline', 'reified', 'tailrec', 'operator', 'infix', 'suspend', 'external', 'const', 'lateinit', 'vararg', 'expect', 'actual', 'out', 'in'],
    wordOperators: ['is', 'as', 'in', '!in', '!is'],
    constants: ['true', 'false', 'null'],
    self: ['this', 'super', 'it', 'field'],
    types: ['Any', 'Unit', 'Nothing', 'Int', 'Long', 'Short', 'Byte', 'Float', 'Double', 'Boolean', 'Char', 'String', 'Array', 'List', 'MutableList', 'Map', 'MutableMap', 'Set', 'MutableSet', 'UInt', 'ULong', 'UShort', 'UByte'],
    builtins: ['println', 'print', 'listOf', 'mutableListOf', 'mapOf', 'mutableMapOf', 'setOf', 'mutableSetOf', 'arrayOf', 'emptyList', 'emptyMap', 'require', 'requireNotNull', 'check', 'checkNotNull', 'error', 'lazy', 'repeat', 'run', 'let', 'apply', 'also', 'with', 'takeIf', 'TODO'],
    defineFunction: ['fun'],
    defineType: ['class', 'interface', 'object', 'typealias'],
  },
  {
    id: 'dart', name: 'Dart', extensions: ['.dart'],
    comments: C_COMMENTS,
    strings: [
      { begin: "r'''", end: "'''", raw: true },
      { begin: 'r"""', end: '"""', raw: true },
      { begin: "r'", end: "'", raw: true },
      { begin: 'r"', end: '"', raw: true },
      { begin: "'''", end: "'''", escape: true, interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
      { begin: '"""', end: '"""', escape: true, interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
      { begin: "'", end: "'", escape: true, interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
      { begin: '"', end: '"', escape: true, interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
    ],
    annotation: R`@[A-Za-z_][\w.]*`,
    control: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'rethrow', 'on', 'await', 'yield', 'assert', 'when'],
    declare: ['class', 'enum', 'mixin', 'extension', 'typedef', 'import', 'export', 'library', 'part', 'of', 'show', 'hide', 'as', 'deferred', 'var', 'final', 'const', 'late', 'void', 'dynamic', 'type', 'with', 'implements', 'extends', 'get', 'set', 'operator', 'factory', 'new'],
    modifiers: ['static', 'abstract', 'external', 'covariant', 'required', 'async', 'sync', 'base', 'interface', 'sealed', 'macro', 'augment'],
    wordOperators: ['is', 'as', 'in'],
    constants: ['true', 'false', 'null'],
    self: ['this', 'super'],
    types: ['int', 'double', 'num', 'bool', 'String', 'List', 'Map', 'Set', 'Iterable', 'Future', 'Stream', 'Object', 'Never', 'Function', 'Record', 'Symbol', 'Type', 'Duration', 'DateTime', 'Uri'],
    builtins: ['print', 'identical', 'identityHashCode'],
    defineType: ['class', 'enum', 'mixin', 'extension', 'typedef'],
  },
  {
    id: 'zig', name: 'Zig', extensions: ['.zig', '.zon'],
    comments: { line: '//' },
    strings: [
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", escape: true, kind: 'char' },
    ],
    extra: [
      { name: 'string.quoted.multiline.zig', match: R`\\\\.*$` },
      { name: 'support.function.builtin.zig', match: R`@[A-Za-z_]\w*` },
    ],
    control: ['if', 'else', 'switch', 'while', 'for', 'break', 'continue', 'return', 'try', 'catch', 'orelse', 'defer', 'errdefer', 'unreachable', 'suspend', 'resume', 'nosuspend', 'await', 'async'],
    declare: ['fn', 'const', 'var', 'struct', 'enum', 'union', 'error', 'opaque', 'test', 'comptime', 'usingnamespace'],
    modifiers: ['pub', 'export', 'extern', 'inline', 'noinline', 'packed', 'align', 'volatile', 'allowzero', 'threadlocal', 'linksection', 'callconv', 'noalias'],
    wordOperators: ['and', 'or'],
    constants: ['true', 'false', 'null', 'undefined'],
    types: ['i8', 'u8', 'i16', 'u16', 'i32', 'u32', 'i64', 'u64', 'i128', 'u128', 'isize', 'usize', 'c_char', 'c_short', 'c_ushort', 'c_int', 'c_uint', 'c_long', 'c_ulong', 'c_longlong', 'c_ulonglong', 'c_longdouble', 'f16', 'f32', 'f64', 'f80', 'f128', 'bool', 'anyopaque', 'void', 'noreturn', 'type', 'anyerror', 'comptime_int', 'comptime_float', 'anytype', 'anyframe'],
    defineFunction: ['fn'],
    typePattern: R`\b[iu]\d+\b`,
  },
  {
    id: 'scala', name: 'Scala', extensions: ['.scala', '.sc', '.sbt', '.mill'],
    comments: { ...C_COMMENTS, nested: true },
    strings: [
      { begin: R`(?:[a-z]\w*)?"""`, end: '"""', interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
      { begin: R`(?:[a-z]\w*)?"`, end: '"', escape: true, interpolate: ['${', '}'], simple: R`\$[A-Za-z_]\w*` },
      { begin: "'", end: "'", escape: true, kind: 'char', single: true },
    ],
    annotation: R`@[A-Za-z_][\w.]*`,
    control: ['if', 'then', 'else', 'match', 'case', 'for', 'while', 'do', 'yield', 'try', 'catch', 'finally', 'throw', 'return'],
    declare: ['def', 'val', 'var', 'lazy', 'class', 'object', 'trait', 'enum', 'type', 'given', 'using', 'extension', 'package', 'import', 'export', 'extends', 'with', 'derives', 'new', 'end'],
    modifiers: ['private', 'protected', 'override', 'abstract', 'final', 'sealed', 'implicit', 'inline', 'opaque', 'open', 'transparent', 'infix', 'case'],
    constants: ['true', 'false', 'null'],
    self: ['this', 'super'],
    types: ['Int', 'Long', 'Short', 'Byte', 'Float', 'Double', 'Boolean', 'Char', 'String', 'Unit', 'Any', 'AnyRef', 'AnyVal', 'Nothing', 'Null', 'Option', 'Some', 'None', 'List', 'Seq', 'Vector', 'Map', 'Set', 'Either', 'Left', 'Right', 'Future', 'Array'],
    builtins: ['println', 'print', 'require', 'assert'],
    defineFunction: ['def'],
    defineType: ['class', 'object', 'trait', 'enum', 'type'],
  },
  {
    id: 'elixir', name: 'Elixir', extensions: ['.ex', '.exs'],
    comments: { line: '#' },
    strings: [
      { begin: '"""', end: '"""', escape: true, interpolate: ['#{', '}'] },
      { begin: '"', end: '"', escape: true, interpolate: ['#{', '}'] },
      { begin: "'''", end: "'''", escape: true, interpolate: ['#{', '}'] },
      { begin: "'", end: "'", escape: true, interpolate: ['#{', '}'] },
      { begin: R`~[a-zA-Z]\(`, end: R`\)[a-zA-Z]*`, kind: 'regexp' },
      { begin: R`~[a-zA-Z]\[`, end: R`\][a-zA-Z]*`, kind: 'regexp' },
      { begin: R`~[a-zA-Z]\{`, end: R`\}[a-zA-Z]*`, kind: 'regexp' },
      { begin: R`~[a-zA-Z]/`, end: R`/[a-zA-Z]*`, kind: 'regexp' },
      { begin: R`~[a-zA-Z]\|`, end: R`\|[a-zA-Z]*`, kind: 'regexp' },
      { begin: R`~[a-zA-Z]"`, end: R`"[a-zA-Z]*`, kind: 'regexp' },
    ],
    extra: [
      { name: 'constant.other.symbol.elixir', match: R`(?<![\w:]):(?:[A-Za-z_][\w@]*[?!]?|"[^"]*")` },
      { name: 'constant.other.symbol.elixir', match: R`\b[a-z_][\w@]*[?!]?:(?=\s)` },
      { name: 'meta.decorator.elixir entity.name.function.decorator.elixir', match: R`@[a-z_]\w*` },
      { name: 'variable.language.elixir', match: R`\b__(?:MODULE|DIR|ENV|CALLER|STACKTRACE)__\b` },
      { name: 'entity.name.type.module.elixir', match: R`\b[A-Z][\w]*(?:\.[A-Z]\w*)*\b` },
    ],
    control: ['if', 'unless', 'else', 'cond', 'case', 'with', 'for', 'try', 'catch', 'rescue', 'after', 'raise', 'reraise', 'throw', 'receive', 'send', 'do', 'end', 'fn', 'when', 'quote', 'unquote', 'unquote_splicing'],
    declare: ['def', 'defp', 'defmacro', 'defmacrop', 'defmodule', 'defprotocol', 'defimpl', 'defstruct', 'defexception', 'defdelegate', 'defguard', 'defguardp', 'defoverridable', 'import', 'alias', 'require', 'use'],
    wordOperators: ['and', 'or', 'not', 'in'],
    constants: ['true', 'false', 'nil'],
    builtins: ['spawn', 'spawn_link', 'self', 'is_atom', 'is_binary', 'is_list', 'is_map', 'is_integer', 'is_nil', 'elem', 'hd', 'tl', 'length', 'map_size', 'put_elem', 'inspect', 'to_string'],
    defineFunction: ['def', 'defp', 'defmacro', 'defmacrop', 'defguard', 'defguardp', 'defdelegate'],
    noPascal: true,
  },
  {
    id: 'erlang', name: 'Erlang', extensions: ['.erl', '.hrl', '.escript', '.app.src'], filenames: ['rebar.config'],
    comments: { line: '%' },
    strings: [
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", escape: true, kind: 'symbol' },
    ],
    extra: [
      { name: 'meta.decorator.erlang entity.name.function.decorator.erlang', match: R`^-[a-z_]\w*` },
      { name: 'variable.other.erlang', match: R`\b[A-Z_][\w]*\b` },
      { name: 'constant.other.macro.erlang', match: R`\?\??[A-Za-z_]\w*` },
      { name: 'constant.character.erlang', match: R`\$\\?.` },
      { match: R`^([a-z]\w*)(?=\()`, captures: { 1: { name: 'entity.name.function.erlang' } } },
    ],
    control: ['if', 'case', 'of', 'end', 'receive', 'after', 'when', 'try', 'catch', 'throw', 'begin', 'fun', 'maybe', 'else'],
    wordOperators: ['and', 'andalso', 'or', 'orelse', 'not', 'xor', 'band', 'bor', 'bxor', 'bnot', 'bsl', 'bsr', 'div', 'rem'],
    constants: ['true', 'false', 'undefined', 'ok', 'error'],
    builtins: ['spawn', 'spawn_link', 'self', 'exit', 'error', 'throw', 'apply', 'is_atom', 'is_list', 'is_integer', 'is_binary', 'length', 'element', 'hd', 'tl'],
    noPascal: true,
  },
  {
    id: 'haskell', name: 'Haskell', extensions: ['.hs', '.lhs', '.hs-boot', '.hsig'],
    comments: { line: '--', block: ['{-', '-}'], nested: true },
    strings: [
      { begin: '"', end: '"', escape: true },
      { begin: R`'(?=\\?.')`, end: "'", escape: true, kind: 'char' },
    ],
    extra: [
      { name: 'meta.preprocessor.pragma.haskell', match: R`\{-#.*?#-\}` },
      { match: R`^\s*([a-z_][\w']*)\s*(::)`, captures: { 1: { name: 'entity.name.function.haskell' }, 2: { name: 'keyword.operator.double-colon.haskell' } } },
    ],
    control: ['if', 'then', 'else', 'case', 'of', 'let', 'in', 'where', 'do', 'mdo', 'rec', 'proc'],
    declare: ['module', 'import', 'qualified', 'as', 'hiding', 'data', 'newtype', 'type', 'class', 'instance', 'deriving', 'family', 'forall', 'pattern', 'default', 'via', 'stock', 'anyclass'],
    modifiers: ['infix', 'infixl', 'infixr', 'foreign', 'export', 'ccall', 'safe', 'unsafe'],
    constants: ['True', 'False', 'Nothing', 'otherwise', 'undefined'],
    types: ['Int', 'Integer', 'Double', 'Float', 'Bool', 'Char', 'String', 'Maybe', 'Either', 'IO', 'Word', 'Ordering', 'Text', 'ByteString'],
    builtins: ['map', 'filter', 'foldr', 'foldl', 'putStrLn', 'print', 'show', 'read', 'return', 'pure', 'fmap', 'mapM_', 'mapM', 'sequence', 'concat', 'zip', 'head', 'tail', 'length', 'error', 'fst', 'snd', 'id', 'const', 'flip'],
    noCalls: true,
  },
  {
    id: 'ocaml', name: 'OCaml', extensions: ['.ml', '.mli', '.mll', '.mly', '.eliom'],
    comments: { block: ['(*', '*)'], nested: true },
    strings: [
      { begin: '"', end: '"', escape: true },
      { begin: R`\{([a-z_]*)\|`, end: R`\|\1\}`, raw: true },
      { begin: R`'(?=\\?.')`, end: "'", escape: true, kind: 'char' },
    ],
    extra: [
      { match: R`\b(let|and)\s+(?:(rec)\s+)?([a-z_][\w']*)`, captures: { 1: { name: 'storage.type.ocaml' }, 2: { name: 'storage.modifier.ocaml' }, 3: { name: 'entity.name.function.ocaml' } } },
      { name: 'meta.decorator.ocaml entity.name.function.decorator.ocaml', match: R`\[@{1,3}[\w.]+` },
    ],
    control: ['if', 'then', 'else', 'match', 'with', 'function', 'fun', 'try', 'raise', 'for', 'to', 'downto', 'while', 'do', 'done', 'begin', 'end', 'when', 'assert', 'lazy'],
    declare: ['let', 'rec', 'and', 'in', 'type', 'module', 'struct', 'sig', 'functor', 'open', 'include', 'class', 'object', 'method', 'inherit', 'initializer', 'val', 'external', 'exception', 'constraint', 'nonrec', 'of'],
    modifiers: ['mutable', 'private', 'virtual'],
    wordOperators: ['mod', 'land', 'lor', 'lxor', 'lsl', 'lsr', 'asr', 'not', 'or'],
    constants: ['true', 'false', 'None', 'Some'],
    self: ['self'],
    types: ['int', 'float', 'bool', 'char', 'string', 'bytes', 'unit', 'list', 'array', 'option', 'result', 'ref', 'exn', 'int32', 'int64', 'nativeint'],
    builtins: ['print_endline', 'print_string', 'print_int', 'print_newline', 'printf', 'failwith', 'invalid_arg', 'ignore', 'fst', 'snd', 'raise', 'compare'],
    noCalls: true,
  },
  {
    id: 'elm', name: 'Elm', extensions: ['.elm'],
    comments: { line: '--', block: ['{-', '-}'], nested: true },
    strings: [
      { begin: '"""', end: '"""', escape: true },
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", escape: true, kind: 'char' },
    ],
    extra: [{ match: R`^([a-z_]\w*)\s*(:)(?!:)`, captures: { 1: { name: 'entity.name.function.elm' }, 2: { name: 'keyword.operator.elm' } } }],
    control: ['if', 'then', 'else', 'case', 'of', 'let', 'in'],
    declare: ['module', 'import', 'exposing', 'as', 'type', 'alias', 'port', 'effect', 'where'],
    constants: ['True', 'False', 'Nothing'],
    types: ['Int', 'Float', 'Bool', 'Char', 'String', 'List', 'Maybe', 'Result', 'Cmd', 'Sub', 'Html', 'Msg', 'Model'],
    noCalls: true,
  },
  {
    id: 'nim', name: 'Nim', extensions: ['.nim', '.nims', '.nimble'],
    comments: { line: '#', block: ['#[', ']#'], nested: true },
    indentByColon: true,
    strings: [
      { begin: R`[rR]?"""`, end: '"""', raw: true },
      { begin: R`[rR]"`, end: '"', raw: true },
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", escape: true, kind: 'char' },
    ],
    annotation: R`\{\..*?\.\}`,
    control: ['if', 'elif', 'else', 'when', 'case', 'of', 'for', 'while', 'block', 'break', 'continue', 'return', 'yield', 'try', 'except', 'finally', 'raise', 'defer', 'discard', 'asm', 'do'],
    declare: ['proc', 'func', 'method', 'iterator', 'template', 'macro', 'converter', 'type', 'var', 'let', 'const', 'object', 'tuple', 'enum', 'concept', 'distinct', 'import', 'include', 'from', 'export', 'using', 'static', 'bind', 'mixin', 'ref', 'ptr'],
    wordOperators: ['and', 'or', 'not', 'xor', 'shl', 'shr', 'div', 'mod', 'in', 'notin', 'is', 'isnot', 'of', 'as', 'addr', 'cast'],
    constants: ['true', 'false', 'nil'],
    self: ['result'],
    types: ['int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float', 'float32', 'float64', 'bool', 'char', 'string', 'cstring', 'pointer', 'seq', 'array', 'openArray', 'set', 'range', 'auto', 'void', 'untyped', 'typed', 'Natural', 'Positive', 'Table', 'HashSet', 'Option'],
    builtins: ['echo', 'len', 'high', 'low', 'inc', 'dec', 'add', 'del', 'newSeq', 'assert', 'doAssert', 'quit', 'ord', 'chr', 'repr', 'sizeof', 'new', 'items', 'pairs'],
    defineFunction: ['proc', 'func', 'method', 'iterator', 'template', 'macro', 'converter'],
  },
  {
    id: 'crystal', name: 'Crystal', extensions: ['.cr', '.ecr'], filenames: ['shard.yml'],
    comments: { line: '#' },
    strings: [
      { begin: '"', end: '"', escape: true, interpolate: ['#{', '}'] },
      { begin: "'", end: "'", escape: true, kind: 'char' },
    ],
    extra: [
      { name: 'constant.other.symbol.crystal', match: R`(?<![\w:]):[A-Za-z_]\w*[?!]?` },
      { name: 'variable.other.readwrite.instance.crystal', match: R`@@?[a-z_]\w*` },
      { name: 'meta.decorator.crystal entity.name.function.decorator.crystal', match: R`@\[[^\]]*\]` },
    ],
    control: ['if', 'elsif', 'else', 'unless', 'case', 'when', 'in', 'while', 'until', 'begin', 'rescue', 'ensure', 'raise', 'return', 'break', 'next', 'yield', 'do', 'end', 'then', 'select'],
    declare: ['def', 'class', 'module', 'struct', 'enum', 'lib', 'fun', 'macro', 'alias', 'annotation', 'require', 'include', 'extend', 'property', 'getter', 'setter', 'record', 'union', 'type'],
    modifiers: ['private', 'protected', 'abstract', 'forall'],
    wordOperators: ['is_a?', 'responds_to?', 'nil?', 'as', 'as?', 'typeof', 'sizeof', 'pointerof'],
    constants: ['true', 'false', 'nil'],
    self: ['self', 'super'],
    builtins: ['puts', 'print', 'p', 'pp', 'raise', 'spawn', 'sleep', 'loop'],
    defineFunction: ['def', 'macro', 'fun'],
    defineType: ['class', 'module', 'struct', 'enum', 'lib', 'alias', 'annotation'],
  },
  {
    id: 'gleam', name: 'Gleam', extensions: ['.gleam'],
    comments: { line: '//' },
    strings: [{ begin: '"', end: '"', escape: true }],
    annotation: R`@[a-z_]\w*`,
    control: ['case', 'if', 'use', 'try', 'assert', 'panic', 'todo', 'echo', 'let'],
    declare: ['fn', 'type', 'const', 'import', 'as', 'opaque', 'external'],
    modifiers: ['pub'],
    constants: ['True', 'False', 'Nil'],
    types: ['Int', 'Float', 'String', 'Bool', 'List', 'Result', 'Option', 'BitArray', 'Dict'],
    defineFunction: ['fn'],
    defineType: ['type'],
  },
  {
    id: 'odin', name: 'Odin', extensions: ['.odin'],
    comments: { ...C_COMMENTS, nested: true },
    strings: [
      { begin: '"', end: '"', escape: true },
      { begin: '`', end: '`', raw: true },
      { begin: "'", end: "'", escape: true, kind: 'char' },
    ],
    extra: [
      { match: R`\b([A-Za-z_]\w*)\s*(::)\s*(?:#\w+\s*)*(proc)\b`, captures: { 1: { name: 'entity.name.function.odin' }, 2: { name: 'keyword.operator.odin' }, 3: { name: 'storage.type.function.odin' } } },
      { match: R`\b([A-Za-z_]\w*)\s*(::)\s*(?:#\w+\s*)*(struct|enum|union|bit_set|distinct)\b`, captures: { 1: { name: 'entity.name.type.odin' }, 2: { name: 'keyword.operator.odin' }, 3: { name: 'storage.type.odin' } } },
      { name: 'meta.decorator.odin entity.name.function.decorator.odin', match: R`#[a-z_]\w*|@\(?[\w, ="]*\)?` },
    ],
    control: ['if', 'else', 'when', 'for', 'in', 'not_in', 'switch', 'case', 'break', 'continue', 'fallthrough', 'return', 'defer', 'or_return', 'or_else', 'or_break', 'or_continue', 'do', 'where'],
    declare: ['proc', 'struct', 'enum', 'union', 'bit_set', 'bit_field', 'map', 'matrix', 'dynamic', 'distinct', 'package', 'import', 'foreign', 'using', 'cast', 'transmute', 'auto_cast', 'context', 'typeid'],
    constants: ['true', 'false', 'nil'],
    types: ['int', 'uint', 'i8', 'u8', 'i16', 'u16', 'i32', 'u32', 'i64', 'u64', 'i128', 'u128', 'f16', 'f32', 'f64', 'bool', 'b8', 'b16', 'b32', 'b64', 'string', 'cstring', 'rune', 'rawptr', 'any', 'byte', 'uintptr', 'complex64', 'complex128', 'quaternion256'],
    builtins: ['len', 'cap', 'size_of', 'align_of', 'offset_of', 'type_of', 'type_info_of', 'typeid_of', 'make', 'new', 'free', 'delete', 'append', 'clear', 'min', 'max', 'abs', 'clamp', 'assert', 'panic'],
  },
  {
    id: 'solidity', name: 'Solidity', extensions: ['.sol'],
    comments: C_COMMENTS,
    strings: [
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", escape: true },
      { begin: R`hex"`, end: '"', raw: true },
      { begin: R`unicode"`, end: '"', escape: true },
    ],
    extra: [{ name: 'meta.preprocessor.pragma.solidity', match: R`\bpragma\b.*?(?=;)` }],
    control: ['if', 'else', 'for', 'while', 'do', 'break', 'continue', 'return', 'returns', 'try', 'catch', 'revert', 'require', 'assert', 'emit', 'unchecked', 'assembly', 'new', 'delete'],
    declare: ['contract', 'interface', 'library', 'abstract', 'function', 'modifier', 'event', 'error', 'struct', 'enum', 'mapping', 'constructor', 'fallback', 'receive', 'import', 'using', 'is', 'type', 'let'],
    modifiers: ['public', 'private', 'internal', 'external', 'pure', 'view', 'payable', 'virtual', 'override', 'constant', 'immutable', 'memory', 'storage', 'calldata', 'indexed', 'anonymous', 'transient'],
    constants: ['true', 'false', 'wei', 'gwei', 'ether', 'seconds', 'minutes', 'hours', 'days', 'weeks'],
    self: ['this', 'super', 'msg', 'block', 'tx', 'abi'],
    types: ['address', 'bool', 'string', 'bytes', 'byte', 'int', 'uint', 'fixed', 'ufixed'],
    typePattern: R`\b(?:u?int(?:8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)|bytes(?:[1-9]|[12]\d|3[0-2]))\b`,
    builtins: ['keccak256', 'sha256', 'ripemd160', 'ecrecover', 'addmod', 'mulmod', 'selfdestruct', 'blockhash', 'gasleft'],
    defineFunction: ['function', 'modifier', 'event', 'error'],
    defineType: ['contract', 'interface', 'library', 'struct', 'enum'],
  },
  {
    id: 'glsl', name: 'GLSL', extensions: ['.glsl', '.vert', '.frag', '.geom', '.tesc', '.tese', '.comp', '.vsh', '.fsh', '.rgen', '.rchit', '.rmiss', '.rahit', '.rint', '.rcall', '.task', '.mesh'],
    comments: C_COMMENTS,
    strings: [{ begin: '"', end: '"', escape: true }],
    preprocessor: true,
    extra: [{ name: 'support.variable.builtin.glsl', match: R`\bgl_\w+\b` }],
    control: ['if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'discard', 'demote', 'terminateInvocation'],
    declare: ['struct', 'layout', 'subroutine'],
    modifiers: ['uniform', 'buffer', 'shared', 'attribute', 'varying', 'const', 'in', 'out', 'inout', 'flat', 'smooth', 'noperspective', 'centroid', 'sample', 'patch', 'invariant', 'precise', 'lowp', 'mediump', 'highp', 'precision', 'coherent', 'volatile', 'restrict', 'readonly', 'writeonly'],
    constants: ['true', 'false'],
    types: ['void', 'bool', 'int', 'uint', 'float', 'double'],
    typePattern: R`\b(?:[biud]?vec[234]|d?mat[234](?:x[234])?|[iu]?(?:sampler|image|texture)(?:[123]D|Cube|2DRect|Buffer)(?:MS)?(?:Array)?(?:Shadow)?|sampler(?:Shadow)?|atomic_uint|accelerationStructureEXT|rayQueryEXT)\b`,
    builtins: ['radians', 'degrees', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'pow', 'exp', 'log', 'exp2', 'log2', 'sqrt', 'inversesqrt', 'abs', 'sign', 'floor', 'trunc', 'round', 'roundEven', 'ceil', 'fract', 'mod', 'modf', 'min', 'max', 'clamp', 'mix', 'step', 'smoothstep', 'fma', 'length', 'distance', 'dot', 'cross', 'normalize', 'reflect', 'refract', 'faceforward', 'transpose', 'determinant', 'inverse', 'texture', 'textureLod', 'textureGrad', 'textureSize', 'texelFetch', 'textureGather', 'imageLoad', 'imageStore', 'imageSize', 'dFdx', 'dFdy', 'fwidth', 'barrier', 'memoryBarrier', 'atomicAdd', 'atomicMin', 'atomicMax', 'traceRayEXT', 'reportIntersectionEXT', 'EmitVertex', 'EndPrimitive'],
  },
  {
    id: 'wgsl', name: 'WGSL', extensions: ['.wgsl'],
    comments: { ...C_COMMENTS, nested: true },
    strings: [],
    annotation: R`@[A-Za-z_]\w*`,
    control: ['if', 'else', 'switch', 'case', 'default', 'loop', 'for', 'while', 'break', 'continue', 'continuing', 'return', 'discard', 'break if'],
    declare: ['fn', 'var', 'let', 'const', 'override', 'struct', 'alias', 'enable', 'requires', 'diagnostic', 'const_assert'],
    modifiers: ['function', 'private', 'workgroup', 'uniform', 'storage', 'read', 'write', 'read_write'],
    constants: ['true', 'false'],
    types: ['bool', 'i32', 'u32', 'f32', 'f16', 'array', 'atomic', 'ptr', 'sampler', 'sampler_comparison'],
    typePattern: R`\b(?:vec[234][ifhu]?|mat[234]x[234][fh]?|texture_(?:\w+))\b`,
    builtins: ['abs', 'acos', 'all', 'any', 'arrayLength', 'asin', 'atan', 'atan2', 'ceil', 'clamp', 'cos', 'cross', 'degrees', 'determinant', 'distance', 'dot', 'exp', 'exp2', 'floor', 'fract', 'inverseSqrt', 'length', 'log', 'log2', 'max', 'min', 'mix', 'normalize', 'pow', 'radians', 'reflect', 'refract', 'round', 'select', 'sign', 'sin', 'smoothstep', 'sqrt', 'step', 'tan', 'transpose', 'trunc', 'textureSample', 'textureSampleLevel', 'textureLoad', 'textureStore', 'textureDimensions', 'workgroupBarrier', 'storageBarrier', 'atomicAdd', 'atomicLoad', 'atomicStore', 'bitcast', 'dpdx', 'dpdy', 'fwidth', 'pack4x8unorm', 'unpack4x8unorm'],
    defineFunction: ['fn'],
    defineType: ['struct', 'alias'],
  },
  {
    id: 'nix', name: 'Nix', extensions: ['.nix'],
    comments: { line: '#', block: ['/*', '*/'] },
    strings: [
      { begin: "''", end: R`''(?!['$\\])`, interpolate: ['${', '}'], escapeMatch: R`''['$]|''\\.` },
      { begin: '"', end: '"', escape: true, interpolate: ['${', '}'] },
    ],
    extra: [
      { name: 'string.unquoted.path.nix', match: R`(?:~|\.{1,2})?/[\w.+\-/]+|<[\w.+\-/]+>` },
      { name: 'markup.underline.link.nix', match: R`\b[a-z][a-z0-9+.-]*://[^\s;]+` },
      { match: R`([A-Za-z_][\w'-]*(?:\.[A-Za-z_][\w'-]*)*)\s*(=)(?!=)`, captures: { 1: { name: 'variable.other.property.nix' }, 2: { name: 'keyword.operator.assignment.nix' } } },
      { match: R`\b(inherit)\b`, captures: { 1: { name: 'keyword.other.inherit.nix' } } },
    ],
    control: ['if', 'then', 'else', 'assert', 'with', 'let', 'in', 'rec', 'or'],
    constants: ['true', 'false', 'null'],
    builtins: ['import', 'builtins', 'map', 'toString', 'throw', 'abort', 'derivation', 'fetchTarball', 'fetchGit', 'fetchurl', 'baseNameOf', 'dirOf', 'isNull', 'removeAttrs', 'placeholder', 'mkDerivation', 'callPackage', 'mkShell', 'pkgs', 'lib'],
    builtinsAnywhere: true,
    noCalls: true,
    noPascal: true,
  },
  {
    id: 'proto', name: 'Protocol Buffers', extensions: ['.proto'],
    comments: C_COMMENTS,
    strings: [
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", escape: true },
    ],
    extra: [
      { match: R`\b(rpc)\s+([A-Za-z_]\w*)`, captures: { 1: { name: 'storage.type.function.proto' }, 2: { name: 'entity.name.function.proto' } } },
      { match: R`([A-Za-z_]\w*)\s*(=)\s*(\d+)`, captures: { 1: { name: 'variable.other.property.proto' }, 2: { name: 'keyword.operator.assignment.proto' }, 3: { name: 'constant.numeric.proto' } } },
    ],
    control: ['returns', 'stream'],
    declare: ['syntax', 'edition', 'package', 'import', 'option', 'message', 'enum', 'service', 'rpc', 'oneof', 'map', 'extend', 'extensions', 'reserved', 'to', 'max', 'group'],
    modifiers: ['optional', 'required', 'repeated', 'public', 'weak'],
    constants: ['true', 'false', 'inf', 'nan'],
    types: ['double', 'float', 'int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'bool', 'string', 'bytes'],
    defineType: ['message', 'enum', 'service', 'extend'],
    noCalls: true,
  },
  {
    id: 'graphql', name: 'GraphQL', extensions: ['.graphql', '.gql', '.graphqls'],
    comments: { line: '#' },
    strings: [
      { begin: '"""', end: '"""', kind: 'docstring' },
      { begin: '"', end: '"', escape: true },
    ],
    extra: [
      { name: 'variable.parameter.graphql', match: R`\$[A-Za-z_]\w*` },
      { name: 'meta.decorator.graphql entity.name.function.decorator.graphql', match: R`@[A-Za-z_]\w*` },
      { match: R`\b(on)\s+([A-Za-z_]\w*)`, captures: { 1: { name: 'keyword.other.graphql' }, 2: { name: 'entity.name.type.graphql' } } },
      { match: R`\b([A-Za-z_]\w*)\s*(?=[:(])`, captures: { 1: { name: 'variable.other.property.graphql' } } },
    ],
    declare: ['query', 'mutation', 'subscription', 'fragment', 'type', 'interface', 'union', 'enum', 'input', 'scalar', 'schema', 'directive', 'extend', 'implements', 'repeatable'],
    constants: ['true', 'false', 'null'],
    types: ['Int', 'Float', 'String', 'Boolean', 'ID'],
    defineFunction: ['query', 'mutation', 'subscription', 'fragment'],
    defineType: ['type', 'interface', 'union', 'enum', 'input', 'scalar'],
    noCalls: true,
  },
  {
    id: 'terraform', name: 'Terraform', extensions: ['.tf', '.tfvars', '.tftest.hcl'], hcl: true,
  },
  {
    id: 'hcl', name: 'HCL', extensions: ['.hcl', '.nomad', '.pkr.hcl', '.tfbackend'], hcl: true,
  },
  {
    id: 'cmake', name: 'CMake', extensions: ['.cmake'], filenames: ['CMakeLists.txt', 'CMakeCache.txt'],
    comments: { line: '#', block: ['#[[', ']]'] },
    strings: [{ begin: '"', end: '"', escape: true, interpolate: ['${', '}'] }],
    extra: [
      { name: 'variable.other.cmake', match: R`\$(?:ENV|CACHE)?\{[^}]*\}` },
      { name: 'meta.embedded.generator.cmake', match: R`\$<[^>]*>` },
      { match: R`(?i)\b(if|elseif|else|endif|foreach|endforeach|while|endwhile|break|continue|return|block|endblock)\s*(?=\()`, captures: { 1: { name: 'keyword.control.cmake' } } },
      { match: R`(?i)\b(function|endfunction|macro|endmacro)\s*(\()\s*([A-Za-z_]\w*)?`, captures: { 1: { name: 'storage.type.function.cmake' }, 2: { name: 'punctuation.parenthesis.begin.cmake' }, 3: { name: 'entity.name.function.cmake' } } },
      { match: R`\b([A-Za-z_]\w*)\s*(?=\()`, captures: { 1: { name: 'support.function.cmake' } } },
      { name: 'keyword.operator.word.cmake', match: R`\b(?:AND|OR|NOT|STREQUAL|EQUAL|LESS|GREATER|MATCHES|VERSION_LESS|VERSION_GREATER|VERSION_EQUAL|DEFINED|EXISTS|IN_LIST|IS_DIRECTORY|TARGET|COMMAND|POLICY)\b` },
    ],
    constants: ['ON', 'OFF', 'TRUE', 'FALSE', 'YES', 'NO', 'Y', 'N'],
    noCalls: true,
    noPascal: true,
  },
  {
    id: 'toml', name: 'TOML', extensions: ['.toml'], filenames: ['Cargo.lock', 'Pipfile', 'poetry.lock', 'uv.lock', 'pdm.lock', '.editorconfig.toml'],
    comments: { line: '#' },
    strings: [
      { begin: '"""', end: '"""', escape: true },
      { begin: "'''", end: "'''", raw: true },
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", raw: true },
    ],
    extra: [
      { match: R`^\s*(\[\[?)\s*([^\]#]+?)\s*(\]\]?)`, captures: { 1: { name: 'punctuation.definition.table.toml' }, 2: { name: 'entity.name.tag.table.toml' }, 3: { name: 'punctuation.definition.table.toml' } } },
      { match: R`([A-Za-z0-9_\-]+|"[^"]*"|'[^']*')(?:\s*(\.)\s*([A-Za-z0-9_\-]+|"[^"]*"|'[^']*'))*\s*(?==)`, name: 'support.type.property-name.toml' },
      { name: 'constant.other.time.datetime.toml', match: R`\b\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?\b|\b\d{2}:\d{2}:\d{2}(?:\.\d+)?\b` },
      { name: 'constant.numeric.toml', match: R`[+-]?\b(?:inf|nan)\b` },
    ],
    constants: ['true', 'false'],
    noCalls: true,
    noPascal: true,
    noMembers: true,
  },
  {
    id: 'prisma', name: 'Prisma', extensions: ['.prisma'],
    comments: { line: '//' },
    strings: [{ begin: '"', end: '"', escape: true }],
    extra: [
      { name: 'meta.decorator.prisma entity.name.function.decorator.prisma', match: R`@@?[A-Za-z_][\w.]*` },
      { match: R`^\s*([A-Za-z_]\w*)\s+([A-Za-z_]\w*)(\[\])?(\?)?`, captures: { 1: { name: 'variable.other.property.prisma' }, 2: { name: 'entity.name.type.prisma' }, 3: { name: 'keyword.operator.prisma' }, 4: { name: 'keyword.operator.optional.prisma' } } },
      { match: R`^\s*([A-Za-z_]\w*)\s*(=)`, captures: { 1: { name: 'variable.other.property.prisma' }, 2: { name: 'keyword.operator.assignment.prisma' } } },
    ],
    declare: ['model', 'enum', 'datasource', 'generator', 'type', 'view'],
    constants: ['true', 'false', 'null'],
    types: ['String', 'Int', 'BigInt', 'Float', 'Decimal', 'Boolean', 'DateTime', 'Json', 'Bytes', 'Unsupported'],
    builtins: ['env', 'autoincrement', 'now', 'uuid', 'cuid', 'dbgenerated', 'sequence', 'ulid', 'nanoid'],
    defineType: ['model', 'enum', 'datasource', 'generator', 'type', 'view'],
  },
  {
    id: 'just', name: 'Just', extensions: ['.just'], filenames: ['justfile', 'Justfile', '.justfile'],
    comments: { line: '#' },
    strings: [
      { begin: '"""', end: '"""', escape: true },
      { begin: "'''", end: "'''", raw: true },
      { begin: '"', end: '"', escape: true },
      { begin: "'", end: "'", raw: true },
      { begin: '`', end: '`', raw: true, kind: 'interpolated' },
    ],
    extra: [
      { match: R`^(@)?([A-Za-z_][\w-]*)(?=[^:=\n]*:(?!=))`, captures: { 1: { name: 'keyword.operator.quiet.just' }, 2: { name: 'entity.name.function.just' } } },
      { name: 'meta.decorator.just entity.name.function.decorator.just', match: R`^\[[\w\s,:"'()-]+\]` },
      { name: 'meta.embedded.interpolation.just', match: R`\{\{[^}]*\}\}` },
    ],
    declare: ['set', 'export', 'alias', 'import', 'mod', 'if', 'else'],
    constants: ['true', 'false'],
    noPascal: true,
  },
];

// HCL and Terraform share one table.
const HCL = {
  comments: { line: '#', block: ['/*', '*/'] },
  lineComments: ['#', '//'],
  strings: [{ begin: '"', end: '"', escape: true, interpolate: ['${', '}'], directive: ['%{', '}'] }],
  extra: [
    { name: 'string.unquoted.heredoc.hcl', begin: R`<<-?\s*([A-Za-z_]\w*)\s*$`, end: R`^\s*\1\s*$` },
    { match: R`^\s*([A-Za-z_][\w-]*)((?:\s+(?:"[^"]*"|[A-Za-z_][\w-]*))*)\s*(?=\{)`, captures: { 1: { name: 'storage.type.block.hcl' }, 2: { name: 'entity.name.type.label.hcl' } } },
    { match: R`([A-Za-z_][\w-]*)\s*(=)(?!=)`, captures: { 1: { name: 'variable.other.property.hcl' }, 2: { name: 'keyword.operator.assignment.hcl' } } },
    { match: R`\b(var|local|module|data|each|count|path|terraform|self)(\.)`, captures: { 1: { name: 'variable.language.hcl' }, 2: { name: 'punctuation.accessor.hcl' } } },
  ],
  control: ['for', 'in', 'if', 'else', 'endif', 'endfor'],
  constants: ['true', 'false', 'null'],
  types: ['string', 'number', 'bool', 'list', 'map', 'set', 'object', 'tuple', 'any'],
  noPascal: true,
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A string or fence is written as a regex when it has a backslash, a group,
// a class or a lookaround, and as plain text otherwise.
const isRegex = (s) => /[\\()[\]?]/.test(s);
const pat = (s) => (isRegex(s) ? s : esc(s));

function grammar(lang) {
  const spec = lang.hcl ? { ...HCL, ...lang } : lang;
  const id = spec.id;
  const t = (name) => `${name}.${id}`;
  const repo = {};
  const top = [];
  const add = (key, rule) => {
    repo[key] = rule;
    top.push({ include: `#${key}` });
  };

  // Comments.
  const comments = [];
  if (spec.comments.block) {
    const [b, e] = spec.comments.block;
    const block = {
      name: t('comment.block'),
      begin: esc(b),
      beginCaptures: { 0: { name: t('punctuation.definition.comment.begin') } },
      end: esc(e),
      endCaptures: { 0: { name: t('punctuation.definition.comment.end') } },
      patterns: [{ include: '#todo' }],
    };
    if (spec.comments.nested) block.patterns.push({ include: '#comment-block' });
    repo['comment-block'] = block;
    comments.push({ include: '#comment-block' });
    if (b === '/*') {
      comments.unshift({
        name: t('comment.block.documentation'),
        begin: R`/\*\*(?!/)`,
        beginCaptures: { 0: { name: t('punctuation.definition.comment.begin') } },
        end: R`\*/`,
        endCaptures: { 0: { name: t('punctuation.definition.comment.end') } },
        patterns: [{ name: t('keyword.other.documentation'), match: R`@[A-Za-z]+` }, { include: '#todo' }],
      });
    }
  }
  for (const line of spec.lineComments || (spec.comments.line ? [spec.comments.line] : [])) {
    comments.push({
      name: t('comment.line'),
      begin: esc(line) + (line === '#' && spec.comments.block?.[0]?.startsWith('#') ? R`(?![\[\]])` : ''),
      beginCaptures: { 0: { name: t('punctuation.definition.comment') } },
      end: '$',
      patterns: [{ include: '#todo' }],
    });
  }
  repo.todo = { name: t('keyword.other.todo'), match: R`\b(?:TODO|FIXME|HACK|NOTE|XXX|BUG)\b` };
  add('comment', { patterns: comments });

  if (spec.preprocessor) {
    add('preprocessor', {
      name: t('meta.preprocessor'),
      begin: R`^\s*(#)\s*(\w+)`,
      beginCaptures: { 1: { name: t('punctuation.definition.directive') }, 2: { name: t('keyword.control.directive') } },
      end: R`(?<!\\)$`,
      patterns: [{ include: '#comment' }, { include: '#string' }, { include: '#number' }],
    });
  }

  for (const [i, rule] of (spec.extra || []).entries()) add(`extra-${i}`, rule);

  // Strings, with interpolation that holds code again.
  const strings = (spec.strings || []).map((s) => {
    const kind = s.kind === 'char' ? 'string.quoted.single' : s.kind === 'regexp' ? 'string.regexp' : s.kind === 'symbol' ? 'constant.other.symbol' : s.kind === 'docstring' ? 'comment.block.documentation' : s.kind === 'interpolated' ? 'string.interpolated' : s.raw ? 'string.quoted.raw' : s.end.length >= 3 ? 'string.quoted.triple' : s.end === "'" ? 'string.quoted.single' : 'string.quoted.double';
    const patterns = [];
    if (s.escapeMatch) patterns.push({ name: t('constant.character.escape'), match: s.escapeMatch });
    if (s.escape) patterns.push({ name: t('constant.character.escape'), match: R`\\(?:[0-7]{1,3}|x[0-9A-Fa-f]{2}|u\{?[0-9A-Fa-f]{1,6}\}?|U[0-9A-Fa-f]{8}|.)` });
    for (const pair of [s.interpolate, s.directive].filter(Boolean)) {
      patterns.push({
        name: t('meta.embedded.interpolation'),
        begin: esc(pair[0]),
        beginCaptures: { 0: { name: t('punctuation.definition.template-expression.begin') } },
        end: esc(pair[1]),
        endCaptures: { 0: { name: t('punctuation.definition.template-expression.end') } },
        contentName: t('source.embedded'),
        patterns: [{ include: '#braces' }, { include: '$self' }],
      });
    }
    if (s.simple) {
      patterns.push({
        match: `(\\$)(${s.simple.slice(2)})`,
        captures: { 1: { name: t('punctuation.definition.template-expression.begin') }, 2: { name: t('variable.other.interpolated') } },
      });
    }
    return {
      name: t(kind),
      begin: pat(s.begin),
      beginCaptures: { 0: { name: t('punctuation.definition.string.begin') } },
      end: pat(s.end) + (s.end.length === 1 && !s.multiline && s.kind !== 'regexp' && s.end !== '`' ? '|$' : ''),
      endCaptures: { 0: { name: t('punctuation.definition.string.end') } },
      patterns,
    };
  });
  add('string', { patterns: strings });

  if (spec.annotation) {
    add('annotation', { name: t('meta.decorator'), match: spec.annotation, captures: { 0: { name: t('entity.name.function.decorator') } } });
  }

  if (spec.defineFunction) {
    add('function-definition', {
      match: R`${words(spec.defineFunction)}\s+(?:<[^>]*>\s*)?(?:[A-Za-z_][\w.]*\.)?([A-Za-z_][\w!?']*)`.replace(R`\b(?:`, R`\b(`),
      captures: { 1: { name: t('storage.type.function') }, 2: { name: t('entity.name.function') } },
    });
  }
  if (spec.defineType) {
    add('type-definition', {
      match: R`${words(spec.defineType)}\s+([A-Za-z_][\w.]*)`.replace(R`\b(?:`, R`\b(`),
      captures: { 1: { name: t('storage.type') }, 2: { name: t('entity.name.type') } },
    });
  }

  add('number', { patterns: NUMBERS.map((n) => ({ ...n, name: t(n.name) })) });

  const kw = [];
  if (spec.control?.length) kw.push({ name: t('keyword.control'), match: words(spec.control.map(esc)) });
  if (spec.declare?.length) kw.push({ name: t('storage.type'), match: words(spec.declare.map(esc)) });
  if (spec.modifiers?.length) kw.push({ name: t('storage.modifier'), match: words(spec.modifiers.map(esc)) });
  if (spec.wordOperators?.length) kw.push({ name: t('keyword.operator.word'), match: R`(?<![\w.])(?:${spec.wordOperators.map(esc).join('|')})(?![\w?])` });
  if (spec.constants?.length) kw.push({ name: t('constant.language'), match: words(spec.constants.map(esc)) });
  if (spec.self?.length) kw.push({ name: t('variable.language'), match: words(spec.self.map(esc)) });
  add('keyword', { patterns: kw });

  const types = [];
  if (spec.types?.length) types.push({ name: t('support.type'), match: words(spec.types.map(esc)) });
  if (spec.typePattern) types.push({ name: t('support.type'), match: spec.typePattern });
  if (types.length) add('type', { patterns: types });

  if (spec.builtins?.length) {
    add('builtin', {
      match: words(spec.builtins.map(esc)).replace(R`\b(?:`, R`\b(`) + (spec.builtinsAnywhere ? '' : R`(?=\s*\()`),
      captures: { 1: { name: t('support.function.builtin') } },
    });
  }

  if (!spec.noPascal) {
    add('constant-caps', { name: t('constant.other.caps'), match: R`\b[A-Z][A-Z0-9_]*[A-Z0-9]\b(?![a-z(])` });
    add('type-name', { name: t('entity.name.type'), match: R`\b[A-Z][A-Za-z0-9_]*[a-z][A-Za-z0-9_]*\b` });
  }
  if (!spec.noCalls) {
    add('call', { match: R`\b([A-Za-z_][\w!?]*)\s*(?=\()`, captures: { 1: { name: t('entity.name.function') } } });
  }
  if (!spec.noMembers) {
    add('member', {
      match: R`(\.)\s*([A-Za-z_]\w*)`,
      captures: { 1: { name: t('punctuation.accessor') }, 2: { name: t('variable.other.property') } },
    });
  }
  add('operator', { patterns: OPERATORS.map((o) => ({ ...o, name: t(o.name) })) });
  repo.braces = {
    begin: R`\{`,
    beginCaptures: { 0: { name: t('punctuation.section.braces.begin') } },
    end: R`\}`,
    endCaptures: { 0: { name: t('punctuation.section.braces.end') } },
    patterns: [{ include: '$self' }],
  };
  add('punctuation', {
    patterns: [
      { name: t('punctuation.terminator.statement'), match: ';' },
      { name: t('punctuation.separator'), match: ',' },
      { name: t('punctuation.section.brackets'), match: R`[()\[\]{}]` },
    ],
  });

  return {
    $schema: 'https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json',
    name: spec.name,
    scopeName: `source.${id}`,
    patterns: top,
    repository: repo,
  };
}

// Comments, brackets and indentation for every language Rosa adds.
function configuration(spec) {
  const comments = {};
  if (spec.comments?.line || spec.lineComments) comments.lineComment = spec.lineComments?.[0] || spec.comments.line;
  if (spec.comments?.block) comments.blockComment = spec.comments.block;
  const quotes = [...new Set((spec.strings || []).map((s) => s.end).filter((e) => ['"', "'", '`'].includes(e)))];
  const pairs = [['{', '}'], ['[', ']'], ['(', ')']];
  const config = {
    comments,
    brackets: pairs,
    autoClosingPairs: [
      ...pairs.map(([open, close]) => ({ open, close })),
      ...quotes.map((q) => ({ open: q, close: q, notIn: ['string', 'comment'] })),
    ],
    surroundingPairs: [...pairs, ...quotes.map((q) => [q, q])],
  };
  if (spec.indentByColon) {
    config.indentationRules = { increaseIndentPattern: R`^\s*.*:\s*(#.*)?$`, decreaseIndentPattern: R`^\s*(else|elif|except|finally)\b.*:` };
    config.onEnterRules = [{ beforeText: R`:\s*(#.*)?$`, action: { indent: 'indent' } }];
  } else {
    config.indentationRules = { increaseIndentPattern: R`^.*(\{[^}]*|\([^)]*|\[[^\]]*)$`, decreaseIndentPattern: R`^\s*[}\])]` };
  }
  return config;
}

const GODOT = [
  {
    id: 'gdscript', name: 'GDScript', extensions: ['.gd'], scope: 'source.gdscript',
    comments: { line: '#' }, indentByColon: true, strings: [{ end: '"' }, { end: "'" }],
  },
  {
    id: 'gdshader', name: 'Godot Shader', extensions: ['.gdshader', '.gdshaderinc'], scope: 'source.gdshader',
    comments: C_COMMENTS, strings: [{ end: '"' }],
  },
  {
    id: 'gdresource', name: 'Godot Resource', extensions: ['.tscn', '.tres', '.godot', '.import', '.gdextension', '.escn'],
    filenames: ['export_presets.cfg', 'override.cfg'], scope: 'source.gdresource',
    comments: { line: ';' }, strings: [{ end: '"' }],
  },
];

mkdirSync(join(here, 'syntaxes'), { recursive: true });
mkdirSync(join(here, 'languages'), { recursive: true });
const all = [...GODOT, ...LANGUAGES];
for (const lang of LANGUAGES) {
  writeFileSync(join(here, 'syntaxes', `${lang.id}.tmLanguage.json`), `${JSON.stringify(grammar(lang), null, 2)}\n`);
}
for (const lang of all) {
  const spec = lang.hcl ? { ...HCL, ...lang } : lang;
  writeFileSync(join(here, 'languages', `${lang.id}.json`), `${JSON.stringify(configuration(spec), null, 2)}\n`);
}

// Code fences in Markdown: ```kotlin and friends get the language's colors.
const fences = {};
const embedded = {};
for (const lang of all) {
  const names = [lang.id, ...lang.extensions.map((e) => e.slice(1)).filter((e) => /^[\w+-]+$/.test(e))];
  if (lang.id === 'gdscript') names.push('godot');
  if (lang.id === 'terraform') names.push('tf');
  const scope = lang.scope || `source.${lang.id}`;
  const content = `meta.embedded.block.${lang.id}`;
  embedded[content] = lang.id;
  fences[`fence-${lang.id}`] = {
    begin: R`(^|\G)(\s*)(\`{3,}|~{3,})\s*(?i:(${[...new Set(names)].map(esc).join('|')})((\s+|:|,|\{|\?)[^\`]*)?$)`,
    name: 'markup.fenced_code.block.markdown',
    end: R`(^|\G)(\2|\s{0,3})(\3)\s*$`,
    beginCaptures: {
      3: { name: 'punctuation.definition.markdown' },
      4: { name: 'fenced_code.block.language.markdown' },
      5: { name: 'fenced_code.block.language.attributes.markdown' },
    },
    endCaptures: { 3: { name: 'punctuation.definition.markdown' } },
    patterns: [{ begin: R`(^|\G)(\s*)(.*)`, while: R`(^|\G)(?!\s*([\`~]{3,})\s*$)`, contentName: content, patterns: [{ include: scope }] }],
  };
}
writeFileSync(
  join(here, 'syntaxes', 'markdown-codeblocks.tmLanguage.json'),
  `${JSON.stringify({ fileTypes: [], injectionSelector: 'L:text.html.markdown', patterns: Object.keys(fences).map((k) => ({ include: `#${k}` })), repository: fences, scopeName: 'markdown.rosa.codeblock' }, null, 2)}\n`,
);

// The languages and grammars in package.json follow the tables above.
const manifestPath = join(here, 'package.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.contributes.languages = all.map((lang) => ({
  id: lang.id,
  aliases: [lang.name, lang.id],
  extensions: lang.extensions,
  ...(lang.filenames ? { filenames: lang.filenames } : {}),
  configuration: `./languages/${lang.id}.json`,
}));
manifest.contributes.grammars = [
  ...all.map((lang) => ({ language: lang.id, scopeName: lang.scope || `source.${lang.id}`, path: `./syntaxes/${lang.id}.tmLanguage.json` })),
  { scopeName: 'markdown.rosa.codeblock', path: './syntaxes/markdown-codeblocks.tmLanguage.json', injectTo: ['text.html.markdown'], embeddedLanguages: embedded },
];
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Grammars: ${LANGUAGES.length} generated, ${GODOT.length} for Godot, ${all.length} languages in package.json`);
