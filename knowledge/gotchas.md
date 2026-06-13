# Gotchas — Common Mistakes When Writing Strudel

Strudel looks like TidalCycles but is JavaScript. Most errors come from
mixing up the two, or from guessing names that don't exist.

## 1. It's JS method chaining, not Haskell

Tidal's `$`, backticks, and operator sections do not exist.

```js
// WRONG (Tidal style)
// every 4 (rev) $ sound "bd sd"
// jux rev $ s "bd sd"

// RIGHT (Strudel)
s("bd sd").every(4, x => x.rev())
s("bd sd").jux(rev)
```

Tidal's `#`/`|>` combining operators become chained controls:
`sound "bd" # gain 0.8` → `s("bd").gain(.8)`.

## 2. Mini-notation needs quotes

Bare words are JS identifiers and will throw `ReferenceError`.

```js
// WRONG: note(c3 e3 g3)
// RIGHT:
note("c3 e3 g3")
```

But **functions passed as arguments must NOT be quoted**:
`.every(4, "rev")` is wrong; use `.every(4, rev)` or
`.every(4, x => x.rev())`.

## 3. `n` vs `note`

- `note("c3")` / `note(60)` — actual pitch.
- `n(3)` — a number whose meaning depends on context:
  - with `s("hh")`: **sample index** in the folder;
  - with `.scale("C:major")`: **scale degree**;
  - with `chord(...).voicing()`: index into the voicing.

```js
n("0 2 4").scale("C:major").s("piano")   // degrees → notes
s("hh*4").n("0 1 2 3")                   // picks hh files
note("0 2 4").s("piano")                 // MIDI notes 0,2,4 — inaudibly low!
```

That last line is a classic bug: small numbers in `note()` are very low MIDI
pitches, not degrees.

## 4. Function-argument transforms need arrow functions

`every`, `sometimes`, `off`, `jux`, `when`, `superimpose`, `chunk` ... all
take functions `Pattern -> Pattern`.

```js
s("bd sd").every(4, x => x.fast(2))     // RIGHT
s("bd sd").every(4, fast(2))            // also OK (curried standalone)
s("bd sd").every(4, x.fast(2))          // WRONG: x is not defined
s("bd sd").every(4, this.fast(2))       // WRONG
```

`every` takes `(n, fn)` in that order — `every(4, ...)`, never
`every(..., 4)`.

## 5. Euclid argument order

`euclid(pulses, steps)` = `(hits, totalSlots)`. `bd(3,8)` is 3 hits across 8
slots. Swapping gives `bd(8,3)` — a wall of kicks. Rotation is the optional
third argument: `bd(3,8,2)`.

## 6. `.fast(2)` vs `*2` are different scopes

- `"hh*2"` speeds up **that step** inside the cycle.
- `.fast(2)` speeds up the **entire pattern** (everything plays twice per
  cycle).

```js
s("bd hh*2 sd hh")          // only the hats double
s("bd hh sd hh").fast(2)    // whole bar twice per cycle
```

Same distinction for `/2` vs `.slow(2)`.

## 7. Tempo: one global `setcpm`

`setcpm()` is global — call it once at the top. Don't sprinkle it per
pattern (later calls just overwrite the tempo). For one pattern at its own
rate, use `.cpm(n)` or `fast`/`slow`. Remember cpm ≈ bpm/4 for a 4-beats-
per-cycle feel; the default is a slow 30 cpm.

## 8. Sound names must exist

- `s("piano")` exists. General-MIDI-style names like `s("violin")` or
  `s("strings")` generally do **not** — soundfont instruments use the `gm_`
  prefix (e.g. `gm_acoustic_bass`) and exact names should be checked in the
  REPL sounds tab.
- Bank names are case-sensitive composites: `.bank("RolandTR808")`, not
  `.bank("rolandtr808")` or `.bank("tr808")`.
- Misspelled samples don't throw; they just don't sound (the console shows a
  warning). Silence ≠ success.

## 9. Patterns are immutable

Methods return new patterns; nothing mutates.

```js
const a = s("bd*4");
a.fast(2);          // does nothing observable — result discarded
const b = a.fast(2); // RIGHT
```

## 10. Multiple patterns need `$:`

Two bare expressions on separate lines won't both play — only the last
evaluated expression does (or you get errors). Prefix each voice with `$:`
(mute with `_$:`), or merge them with `stack()`.

## 11. Misc traps

- Arithmetic on control patterns must be **keyed**: `.add(note(12))` /
  `.add(n(2))` (apply `n`-adds *before* `.scale()`). A plain `.add(12)`
  after `note()`/`n()`/`scale()` logs "Can't do arithmetic on control
  pattern" and silently no-ops — the echo or transposition just never
  happens.
- `~` is a rest only **inside** mini-notation strings; in JS it's bitwise-not.
- `,` inside one string layers patterns; `,` between arguments separates
  arguments. `"bd, hh*8"` ≠ `s("bd", "hh*8")`.
- `.scale()` needs `n()` degrees to be useful; `n("0 2 4")` without
  `.scale()` selects samples instead.
- Continuous signals (`sine`, `rand`...) make no sound alone — they need
  `.segment(n)` or to be fed into a control (`.gain(sine)`).
- `delaytime` is in seconds, not cycles: at the default tempo `.delaytime(.25)`
  is a quarter **second**. Compute from tempo for synced echoes.
- `?` already randomizes per event; `"hh?*8"` vs `"hh*8?"` degrade different
  things (the step vs each of the 8 hits).
- Chained `.every(2, ...)` and `.every(4, ...)` both fire on cycles divisible
  by 4 — order of chaining decides which transform wraps which.
- Don't invent controls: if it's not in these docs (`lpf`, `room`, `crush`,
  ...), check before using; unknown controls may be silently ignored.
- JS numbers like `.5` are fine, but mini-notation inside strings needs valid
  tokens — `"0.5 1"` works, stray punctuation breaks the parser.

## Verify-before-you-ship checklist

1. Quotes: every mini-notation sequence is inside `"..."`; every function arg
   is unquoted.
2. Each voice starts with `$:` (or everything is inside one `stack()`/
   `arrange()`).
3. `setcpm(bpm/4)` appears once, at the top.
4. All `s()` names exist in the default map or are loaded via `samples()`
   first; bank names use exact CamelCase.
5. `n` vs `note` used intentionally; `n()` for degrees always has a
   `.scale()` nearby.
6. Euclid args are `(hits, slots, rotation?)`.
7. Higher-order functions receive `x => x...` (or a bare combinator like
   `rev`), with `(n, fn)` argument order.
8. No Tidal-isms: no `$`, no `#`, no `sound "bd"` without parens/quotes.
9. Ranges sane: gains ≤ ~1, `lpf` 20–20000, `delayfeedback` < 1, `pan` 0–1.
10. Mentally play one cycle: does each layer's event count per cycle match the
    intended rhythm?
