---
name: strudel-syntax
description: Core rules for writing syntactically correct Strudel code — JavaScript method chaining (not Tidal Haskell), $: voices, setcpm tempo, quoting rules for mini-notation vs function arguments, arrow-function transforms, and a verify-before-ship checklist. Use whenever writing, reviewing, or fixing any Strudel code, regardless of musical content.
---

# Strudel syntax essentials

Strudel looks like TidalCycles but **is JavaScript**. Most broken patterns
come from mixing the two languages or guessing names. Apply these rules to
every line of Strudel you write.

## 1. Method chaining, not Haskell

Tidal's `$`, `#`, backticks, and operator sections do not exist in Strudel.
Controls are chained methods; transforms take functions.

```js
// Tidal:   every 4 (rev) $ sound "bd sd" # gain 0.8
// Strudel:
s("bd sd").gain(.8).every(4, x => x.rev())
```

Chain one method per line for longer patterns (leading dot continues the
expression):

```js
$: n("0 <2 4> [6 4] 3")
  .scale("D:minor")
  .s("sawtooth")
  .lpf(800)
  .every(4, x => x.rev())
```

Patterns are **immutable** — every method returns a new pattern:

```js
const a = s("bd*4");
a.fast(2);            // result discarded, does nothing
const b = a.fast(2);  // correct
```

## 2. Quoting rules

- **Mini-notation goes in double quotes**: `note("c3 e3 g3")`, never
  `note(c3 e3 g3)` (ReferenceError).
- **Function arguments are never quoted**: `.every(4, rev)` or
  `.every(4, x => x.rev())` — **not** `.every(4, "rev")`.
- `,` inside one string layers patterns (`"bd*2, hh*8"`); `,` between
  arguments separates arguments. They are not interchangeable.
- `~` is a rest only inside strings; in bare JS it is bitwise-not.
- Numeric arguments usually accept pattern strings too: `.lpf("<400 2000>")`.

## 3. Transforms take arrow functions

`every`, `lastOf`, `sometimes`, `off`, `jux`, `when`, `superimpose`,
`chunk`, `echoWith` all take `Pattern -> Pattern` functions, with the
function **last**: `(n, fn)`.

```js
s("bd sd").every(4, x => x.fast(2))   // RIGHT
s("bd sd").jux(rev)                   // bare combinator also OK
s("bd sd").every(4, x.fast(2))        // WRONG: x is not defined
s("bd sd").every(x => x.fast(2), 4)   // WRONG: argument order
```

## 4. Tempo: one global `setcpm(bpm/4)`

`setcpm()` sets cycles per minute, **once, at the top**. Treating one cycle
as one 4/4 bar, `cpm = bpm / 4`. Default is a slow 30 cpm.

```js
setcpm(124/4)   // 124 BPM house feel; s("bd*4") = quarter-note kicks
```

For a single pattern at its own rate use `.cpm(n)` or `.fast()`/`.slow()` —
never a second `setcpm`.

## 5. Multiple voices need `$:`

Bare expressions on separate lines do not all play. Prefix each voice with
`$:`, mute with `_$:`, or merge into one `stack()`.

```js
setcpm(120/4)
$: s("bd*4, ~ cp").bank("RolandTR909")
$: note("<c2 ab1 bb1 g1>").s("sawtooth").lpf(600)
_$: s("hh*8").gain(.4)   // muted; remove underscore to bring in
```

`hush()` silences everything. Comments are plain JS (`//`, `/* */`).

## 6. `n` vs `note`

- `note("c3")` / `note(60)` — actual pitch (names or MIDI numbers).
- `n(x)` is contextual: sample index with `s("hh")`, scale degree with
  `.scale("C:major")`, voicing index after `voicing()`.

```js
n("0 2 4").scale("C:major").s("piano")  // degrees -> notes
s("hh*4").n("0 1 2 3")                  // picks hat sample files
note("0 2 4").s("piano")                // BUG: MIDI 0,2,4 — inaudibly low
```

`n()` meant as pitch must always have a `.scale()` nearby.

## 7. Names must exist

- Misspelled sounds **fail silently** (console warning, no error). Silence
  is not success.
- Bank names are exact CamelCase: `.bank("RolandTR808")`, not `"tr808"`.
- `s("piano")` exists; `s("violin")` does not — soundfonts use `gm_`
  prefixes (e.g. `gm_acoustic_bass`); check before using.
- Don't invent controls: if it isn't in the knowledge base (`lpf`, `room`,
  `crush`, ...), verify first — unknown controls are silently ignored.

## 8. Scope of `*` vs `.fast()`

`"hh*2"` doubles **that step**; `.fast(2)` doubles the **whole pattern**.
Same distinction for `/2` vs `.slow(2)`. Euclid order is
`(hits, slots, rotation?)`: `"bd(3,8)"` = 3 hits over 8 slots.

## Verify-before-ship checklist

Run through this before presenting any Strudel code:

1. Every mini-notation sequence is inside `"..."`; every function arg is
   unquoted.
2. Each voice starts with `$:` (or all are inside one `stack()`/`arrange()`).
3. `setcpm(bpm/4)` appears exactly once, at the top.
4. All `s()` names exist in the default map (or are loaded with `samples()`
   first); bank names are exact CamelCase.
5. `n` vs `note` used intentionally; degree-`n()` has `.scale()`.
6. Euclid args are `(hits, slots, rotation?)`.
7. Higher-order functions get `x => x...` (or a bare combinator), with
   `(n, fn)` order.
8. No Tidal-isms: no `$`, no `#`, no `sound "bd"` without parens/quotes.
9. Ranges sane: gain ≤ ~1, lpf 20–20000, delayfeedback < 1, pan 0–1.
10. Mentally play one cycle: does each layer's event count match the
    intended rhythm?

For the full trap list see `knowledge/gotchas.md`; for function signatures
see `knowledge/functions-reference.md`.
