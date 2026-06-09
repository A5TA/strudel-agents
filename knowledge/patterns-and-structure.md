# Patterns, Cycles, and Song Structure

## The mental model

- A Strudel **pattern** is a pure function of time: ask it "what events
  happen between time a and b?" and it answers with a list of events
  ("haps"), each with a start, end, and value (note, sound name, control
  map...). Nothing is a fixed array; everything is queried lazily, forever.
- **Cycles** are the time unit. Time 0–1 is cycle one, 1–2 is cycle two, etc.
  Patterns repeat each cycle unless something (like `<>`, `/`, `slow`,
  `every`) makes them evolve.
- Transformations (`fast`, `rev`, `jux`, ...) take a pattern and return a
  **new** pattern. Patterns are immutable — chains never modify in place, so
  you can reuse a base pattern in several places safely.
- Because numbers/strings are implicitly patternable, almost every argument
  can itself be a pattern: `.lpf("<400 2000>")` modulates per cycle.

## Tempo: `setcpm` and BPM

`setcpm(n)` sets the global tempo in **cycles per minute** (default 30, i.e.
one cycle every 2 seconds). Call it once per piece, not per pattern.

Mapping to BPM: if you treat one cycle as one 4/4 bar with 4 beats,
`cpm = bpm / 4`.

```js
setcpm(120/4)   // 120 BPM feel, with e.g. s("bd*4") as quarter notes
setcpm(174/4)   // drum & bass tempo, one bar per cycle
```

(`setcps` also exists for cycles per second; `.cpm(n)` retimes a single
pattern only.)

## The REPL: `$:`, `_$:`, `hush`

- Write multiple top-level patterns by prefixing each with `$:`.
- Optionally label them: `kick: s("bd*4")` style names also work as labels
  in current builds, but `$:` is the documented form.
- Mute a line by changing `$:` to `_$:` (underscore = muted).
- `hush()` silences everything.
- `Ctrl+Enter` evaluates, `Ctrl+.` stops (in the strudel.cc REPL).
- Comments are plain JS: `//` line and `/* */` block comments.
- Metadata lives in comments: `// @title Night Drive @by you
  @license CC-BY-4.0` (tags: `@title @by @license @details @url @genre
  @album @tag`).

```js
// @title Two Layers @by example
setcpm(100/4)

$: s("bd*2, ~ cp").bank("RolandTR909")

_$: s("hh*8").gain(.4)        // currently muted

$: note("<c2 ab1 bb1 g1>").s("sawtooth").lpf(600)
```

## Style conventions

Chain one method per line for longer patterns; the leading dot continues the
expression:

```js
$: n("0 <2 4> [6 4] 3")
  .scale("D:minor")
  .s("sawtooth")
  .lpf(sine.slow(8).rangex(300, 4000))
  .delay(.25)
  .room(.3)
  .every(4, x => x.rev())
```

Use `const` for shared material:

```js
const groove = s("bd*2, ~ [cp,sd:2], hh(7,16)");
$: groove.bank("RolandTR808").gain(.9)
```

## Combining patterns

- `stack(a, b, c)` — all at once (vertical: instruments of one section).
- `cat(a, b)` — one per cycle (horizontal: alternating material).
- `seq(a, b)` — both within one cycle.
- `arrange([n, pat], ...)` — each pattern lasts n cycles (horizontal:
  song sections).
- `"a, b"` inside mini-notation is a mini `stack`.

## Template 1 — live-layered track with `stack()`

```js
// @title Skeleton A
setcpm(124/4)

const drums = stack(
  s("bd*4").gain(.95),
  s("~ cp ~ cp").room(.2),
  s("hh*8").gain("[.3 .6]*4").hpf(5000),
  s("oh").struct("~ ~ ~ [~ x]").cut(1)
).bank("RolandTR909");

const bass = note("<c2 c2 eb2 f2>(5,8)")
  .s("sawtooth").lpf(500).lpq(6)
  .decay(.15).sustain(.3);

const chords = chord("<Cm7 Ab^7 Bb7 Gm7>")
  .voicing().s("sawtooth")
  .attack(.05).release(.2).gain(.45)
  .lpf(1800).room(.4).orbit(2);

const lead = n("0 ~ 4 <7 9> ~ 4 ~ 2")
  .scale("C:minor:pentatonic")
  .s("triangle").delay(".4:.1875:.5")
  .gain(.5).sometimesBy(.2, x => x.add(12));

$: drums
$: bass
$: chords
_$: lead          // bring in later by removing the underscore
```

## Template 2 — fixed arrangement with `arrange()`

```js
// @title Skeleton B
setcpm(120/4)

const drumsA  = s("bd*4, hh*8").bank("RolandTR808");
const drumsB  = s("bd*4, hh*8, ~ cp").bank("RolandTR808");
const bass    = note("<a1 a1 f1 g1>*2").s("sawtooth").lpf(700);
const melody  = n("<0 2 4 7 4 2>*8").scale("A:minor").s("piano").room(.3);

$: arrange(
  [4, stack(drumsA)],                       // intro
  [8, stack(drumsB, bass)],                 // groove
  [8, stack(drumsB, bass, melody)],         // full
  [4, stack(bass.lpf(300), melody.slow(2))] // breakdown
)
```

`arrange` loops the whole sequence once it finishes (it is itself a pattern).

## Visuals (optional but handy)

- `.color("cyan")` — tint event highlighting in the editor (CSS color names
  or patterns of them).
- `._punchcard()` / `._pianoroll()` — inline piano-roll under the code
  (the no-underscore versions draw fullscreen in the background).
- `._scope()` — inline oscilloscope; `._spectrum()` — analyzer;
  `._spiral()`, `._pitchwheel()` also exist.

```js
$: n("0 2 4 6 4 2").scale("C:minor").color("magenta")._punchcard()
```

## Determinism note

`rand`, `?`, `|`, `degrade`, `sometimes` etc. are pseudo-random but **time
deterministic**: replaying the same cycle yields the same choices, and two
machines running the same code agree. Use `.ribbon(k, n)` to pin a specific
random region you like.
