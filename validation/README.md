# Validation harness

Headless validator for the Strudel pattern files in this repo
(`examples/<genre>/*.strudel`). It proves patterns actually parse and produce
events — in plain Node, no browser, no audio.

## Run it

```sh
cd validation
npm install        # or: npm ci (uses the committed package-lock.json)
node validate.mjs  # validates ../examples/**/*.strudel
```

Other invocations:

```sh
node validate.mjs --self-test                 # fixtures must PASS, fixtures/known-bad must FAIL
node validate.mjs --verbose                   # print event counts per file
node validate.mjs "path/to/*.strudel" a-file  # explicit files, dirs, or globs (*, **, ?)
npm test                                      # alias for --self-test
```

Output is a per-file `PASS`/`FAIL` table with error messages. Exit code is
non-zero if any file fails. A glob matching zero files exits 0 with a notice
(so CI tolerates an empty `examples/` directory).

## What it checks

For each `.strudel` file:

1. **Transpile** — the code is run through `@strudel/transpiler` (mini-notation
   strings, `$:` labels, bare `samples()` awaits, etc.). Syntax errors fail here.
2. **Evaluate** — the transpiled code is evaluated with all functions from
   `@strudel/core`, `@strudel/mini`, and `@strudel/tonal` registered via
   `evalScope`. References to unknown functions fail here.
3. **Query** — the resulting value must be a `Pattern` (patterns registered
   via `$:`-style labels are stacked, like in the Strudel REPL), and
   `pattern.queryArc(0, 4)` must return at least 1 event (hap) without
   throwing.

## What it can't check

- **Audio quality / musicality** — no sound is rendered.
- **Sample availability** — `s("bd")` validates regardless of whether a sample
  named `bd` exists; sound lookup happens at playback time in the REPL.
  `samples(...)` calls are stubbed to an async no-op (no network).
- **Tempo semantics** — `setcpm`/`setcps` are no-op stubs; they affect playback
  speed, not event structure.
- **Anything REPL/visual** — `hush`, `all`, `each`, widgets, highlighting.

## Node quirks (read before debugging)

- `@strudel/core` statically imports `SalatRepl` from `@kabelsalat/web`, whose
  `main` is a browser IIFE bundle with no ESM exports. `validate.mjs` registers
  a module resolution hook (`kabelsalat-loader.mjs`) that redirects the import
  to that package's working ESM build (`dist/index.mjs`). Requires Node >= 20.6.
- Importing `@strudel/core` prints `cannot use window: not in browser?` and a
  loaded banner — harmless noise.
- `$:` labels transpile to `pattern.p('$')`; `Pattern.prototype.p` only exists
  in the browser REPL, so the validator installs its own minimal version that
  collects labeled patterns (and mutes `_`-prefixed/suffixed labels).

## CI

`.github/workflows/validate.yml` runs on every push/PR:

1. `npm ci` in `validation/` (falls back to `npm install`),
2. `node validate.mjs --self-test` — proves the harness itself works,
3. `node validate.mjs "../examples/**/*.strudel"` — validates all examples
   (skips gracefully if none exist yet, fails on real pattern errors).
