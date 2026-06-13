#!/usr/bin/env node
// Headless validation harness for strudel-agents pattern files.
//
// For each *.strudel file it:
//   1. transpiles + evaluates the code with @strudel/transpiler's `evaluate`,
//      in a scope where all @strudel/core, @strudel/mini and @strudel/tonal
//      functions are registered (via `evalScope`),
//   2. asserts the result is a Pattern (patterns registered with `$:` labels
//      are collected and stacked, mirroring the Strudel REPL),
//   3. queries events for the first 4 cycles and asserts at least one event
//      (hap) is produced without throwing.
//
// No audio is loaded or rendered: sound lookup (`s("bd")` etc.) happens at
// playback time, so patterns referencing sounds validate fine headlessly.
//
// Usage:
//   node validate.mjs                            # validates ../examples/**/*.strudel
//   node validate.mjs "path/to/*.strudel" other  # explicit globs/files/dirs
//   node validate.mjs --self-test                # fixtures must pass, known-bad must fail
//   node validate.mjs --verbose                  # also print event counts

import { register } from 'node:module';
// Must be registered before any (dynamic) import of @strudel/* — see the
// loader file for why @kabelsalat/web needs a resolution fix in Node.
register(new URL('./kabelsalat-loader.mjs', import.meta.url));

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_GLOB = path.join(__dirname, '..', 'examples', '**', '*.strudel');
const QUERY_CYCLES = 4;

// ---------------------------------------------------------------------------
// Strudel setup
// ---------------------------------------------------------------------------

/**
 * Loads strudel modules into the eval scope and installs minimal stubs for
 * REPL-only globals, so doc-realistic patterns validate headlessly.
 * Returns { evaluate, core, resetRegistered, getRegistered }.
 */
async function initStrudel() {
  const core = await import('@strudel/core');
  // Documented headless usage: register all module exports on globalThis.
  await core.evalScope(import('@strudel/core'), import('@strudel/mini'), import('@strudel/tonal'));
  const { evaluate } = await import('@strudel/transpiler');

  // --- `$:` label support -------------------------------------------------
  // The transpiler turns `$: pat` into `pat.p('$')`. In the browser REPL,
  // Pattern.prototype.p is injected by core/repl.mjs and registers the
  // pattern with the scheduler. We mirror just enough of that here: collect
  // labeled patterns so they can be stacked into the file's overall pattern.
  let registered = {};
  let anonymousIndex = 0;
  const { Pattern, silence } = core;
  Pattern.prototype.p = function (id) {
    id = String(id);
    if (id.startsWith('_') || id.endsWith('_')) return silence; // muted, e.g. `_$:`
    if (id.includes('$')) id = `${id}${anonymousIndex++}`; // anonymous `$:` labels
    registered[id] = this;
    return this;
  };
  Pattern.prototype.q = () => silence; // `q` labels = muted in the REPL
  for (let i = 1; i < 10; i++) {
    // d1..d9 / p1..p9 aliases, as injected by the REPL
    Object.defineProperty(Pattern.prototype, `d${i}`, { get() { return this.p(i); }, configurable: true });
    Object.defineProperty(Pattern.prototype, `p${i}`, { get() { return this.p(i); }, configurable: true });
    Pattern.prototype[`q${i}`] = silence;
  }

  // --- REPL-global stubs ----------------------------------------------------
  // These are provided by the REPL/webaudio layer, which we deliberately do
  // not load. Stubs are harmless no-ops: tempo and sample loading have no
  // effect on whether a pattern parses and produces events.
  const noop = () => {};
  const stubs = {
    setcpm: noop, // tempo only affects playback speed, not event structure
    setCpm: noop,
    setcps: noop,
    setCps: noop,
    samples: async () => {}, // sample maps can't (and needn't) load headlessly
    hush: noop, // stops playback in the REPL
    all: () => silence, // REPL: applies a transform to all registered patterns
    each: () => silence, // REPL: applies a transform to each registered pattern
  };
  for (const [name, fn] of Object.entries(stubs)) {
    if (globalThis[name] === undefined) globalThis[name] = fn;
  }
  // `.cpm(x)` is registered by the REPL (depends on scheduler cps, default 0.5)
  if (Pattern.prototype.cpm === undefined) {
    core.register('cpm', (cpm, pat) => pat._fast(cpm / 60 / 0.5));
  }

  return {
    core,
    evaluate,
    resetRegistered() {
      registered = {};
      anonymousIndex = 0;
    },
    getRegistered: () => Object.values(registered),
  };
}

// ---------------------------------------------------------------------------
// Per-file validation
// ---------------------------------------------------------------------------

async function validateFile(file, strudel) {
  const code = await readFile(file, 'utf8');
  strudel.resetRegistered();
  const { pattern } = await strudel.evaluate(code);
  const labeled = strudel.getRegistered();
  // Like the REPL: if `$:`-style labels were used, the result is their stack.
  const pat = labeled.length ? strudel.core.stack(...labeled) : pattern;
  if (!(pat instanceof strudel.core.Pattern)) {
    throw new Error(`evaluation did not produce a Pattern (got ${pat === null ? 'null' : typeof pat})`);
  }
  const haps = pat.queryArc(0, QUERY_CYCLES);
  if (!Array.isArray(haps)) {
    throw new Error(`queryArc(0, ${QUERY_CYCLES}) did not return an array`);
  }
  if (haps.length < 1) {
    throw new Error(`pattern produced 0 events in cycles 0..${QUERY_CYCLES}`);
  }
  return { events: haps.length };
}

// ---------------------------------------------------------------------------
// Tiny glob support (Node 20-compatible; supports `*`, `**`, `?`)
// ---------------------------------------------------------------------------

const MAGIC = /[*?]/;

function globToRegExp(absGlob) {
  let re = '';
  for (let i = 0; i < absGlob.length; i++) {
    const c = absGlob[i];
    if (c === '*') {
      if (absGlob[i + 1] === '*') {
        if (absGlob[i + 2] === '/') {
          re += '(?:.*/)?'; // `**/` also matches zero directories
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (c === '?') {
      re += '[^/]';
    } else {
      re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${re}$`);
}

async function walk(dir, onFile) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, onFile);
    else if (entry.isFile()) onFile(full);
  }
}

/** Expands a file path, directory, or glob into a sorted list of files. */
async function expandPattern(pattern) {
  const abs = path.resolve(pattern);
  if (!MAGIC.test(abs)) {
    try {
      const st = await stat(abs);
      if (st.isFile()) return [abs];
      if (st.isDirectory()) return expandPattern(path.join(abs, '**', '*.strudel'));
    } catch {
      return [];
    }
    return [];
  }
  const segments = abs.split(path.sep);
  const firstMagic = segments.findIndex((s) => MAGIC.test(s));
  const base = segments.slice(0, firstMagic).join(path.sep) || path.sep;
  const rx = globToRegExp(abs);
  const files = [];
  await walk(base, (f) => rx.test(f) && files.push(f));
  return files.sort();
}

// ---------------------------------------------------------------------------
// Runner / CLI
// ---------------------------------------------------------------------------

function rel(file) {
  return path.relative(process.cwd(), file) || file;
}

async function runFiles(files, strudel, { verbose, expectFail = false }) {
  let failures = 0;
  for (const file of files) {
    let result = null;
    let error = null;
    try {
      result = await validateFile(file, strudel);
    } catch (err) {
      error = err;
    }
    const ok = expectFail ? error !== null : error === null;
    if (!ok) failures++;
    const status = ok ? 'PASS' : 'FAIL';
    let detail = '';
    if (error) detail = `  -- ${expectFail ? 'failed as expected: ' : ''}${error.message.split('\n')[0]}`;
    else if (expectFail) detail = '  -- expected an error but file validated cleanly';
    else if (verbose) detail = `  (${result.events} events in ${QUERY_CYCLES} cycles)`;
    console.log(`${status}  ${rel(file)}${detail}`);
  }
  return failures;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const selfTest = args.includes('--self-test');
  const patterns = args.filter((a) => !a.startsWith('-'));

  const strudel = await initStrudel();

  if (selfTest) {
    const good = await expandPattern(path.join(__dirname, 'fixtures', '*.strudel'));
    const bad = await expandPattern(path.join(__dirname, 'fixtures', 'known-bad', '*.strudel'));
    if (!good.length || !bad.length) {
      console.error('self-test: missing fixtures (need fixtures/*.strudel and fixtures/known-bad/*.strudel)');
      process.exit(1);
    }
    console.log(`self-test: ${good.length} fixture(s) must PASS, ${bad.length} known-bad fixture(s) must FAIL\n`);
    let failures = await runFiles(good, strudel, { verbose });
    failures += await runFiles(bad, strudel, { verbose, expectFail: true });
    console.log(failures === 0 ? '\nself-test OK' : `\nself-test FAILED (${failures} problem(s))`);
    process.exit(failures === 0 ? 0 : 1);
  }

  const globs = patterns.length ? patterns : [DEFAULT_GLOB];
  const files = [...new Set((await Promise.all(globs.map(expandPattern))).flat())];
  if (!files.length) {
    console.log(`No .strudel files matched: ${globs.join(', ')} — nothing to validate.`);
    process.exit(0); // tolerate empty/missing examples dir (e.g. fresh repo in CI)
  }

  const failures = await runFiles(files, strudel, { verbose });
  console.log(`\n${files.length - failures}/${files.length} file(s) passed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('validator crashed:', err);
  process.exit(1);
});
