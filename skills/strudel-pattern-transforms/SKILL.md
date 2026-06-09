---
name: strudel-pattern-transforms
description: Making Strudel patterns evolve over time — every/lastOf and the sometimes family, off() for echoes and call-and-response, jux/juxBy stereo tricks, superimpose/layer, iter/rev/palindrome, ply/chunk/echo, degrade, mask/struct, continuous signals (sine/perlin/rand) modulating controls, and segment+range. Use when a loop sounds static or repetitive and needs controlled variation, movement, or long-form interest without rewriting the core pattern.
---

# Pattern transforms: from loop to living pattern

Every transform returns a **new** pattern (immutability), so you can layer
transformed copies of one source freely. Transform functions are arrow
functions: `.every(4, x => x.rev())`.

## Periodic variation: every / lastOf / when

```js
s("bd hh sd hh").every(4, x => x.rev())        // first of every 4 cycles
s("bd*4").lastOf(8, x => x.ply(2))             // fill on the 8th cycle
note("c2 g1 bb1 c2").when("<0 0 0 1>", x => x.add(note(12))) // 4th cycle up an octave
```

`every` fires on the **first** of n cycles, `lastOf` on the **last** — use
`lastOf` for fills that lead into the next phrase.

## Probabilistic variation: the sometimes family

`sometimesBy(p, fn)` with shortcuts `rarely` (.25), `sometimes` (.5),
`often` (.75), `almostAlways` (.9); per-cycle versions `someCyclesBy`/
`someCycles`; and `degradeBy(p)`/`degrade()` to thin events out.

```js
s("hh*16").sometimesBy(.2, x => x.speed(2)).degradeBy(.1)
s("bd*4").someCyclesBy(.25, x => x.ply(2))
n("0 2 4 7*2").scale("A:minor").rarely(x => x.add(note(12)))
```

Randomness is time-deterministic: the same cycle always makes the same
choices. Pin a region you like with `.ribbon(offset, n)`.

## Layered copies: off / superimpose / layer / echo

`off(time, fn)` overlays a delayed, transformed copy — the workhorse for
call-and-response and harmonized echoes:

```js
n("0 ~ 3 ~").scale("C:minor:pentatonic")
  .off(1/4, x => x.add(note(7)).gain(.6))            // answer a 5th up, quieter
  .off(1/8, x => x.add(note(12)).pan(.8))            // octave ghost on the right
```

`superimpose` keeps the original plus copies; `layer` replaces it with only
the transformed versions; `echo(times, time, feedback)` makes decaying
repeats; `echoWith` transforms each repeat:

```js
note("e3 g3").superimpose(x => x.add(note(12)).gain(.5))
s("cp").echo(4, 1/8, .6)
note("a1*2").s("sawtooth").echoWith(3, 1/16, (p, i) => p.add(note(i * 12)))
```

## Stereo interest: jux / juxBy

Original left, transformed copy right. `juxBy(amt, fn)` narrows the width.

```js
s("bd sd [~ bd] sd").jux(rev)
s("hh*8").juxBy(.4, x => x.fast(2))
```

## Reordering time: iter / rev / palindrome / chunk

```js
note("c3 e3 g3 b3").iter(4)        // start point rotates each cycle
n("0 2 4 7").scale("D:dorian").palindrome()
s("bd*2, hh*8").chunk(4, x => x.hurry(2))   // a different quarter mutates each cycle
```

## Density and gating: ply / mask / struct

```js
s("hh*4").ply("<1 2 1 4>")                  // subdivision builds and releases
s("hh*16").mask("1 1 0 1")                  // silence where mask is 0
note("c2,eb2,g2").struct("x ~ x x ~ x ~ ~") // impose a rhythm on a chord
```

## Continuous signals as modulators

`sine`, `cosine`, `saw`, `isaw`, `tri`, `square`, `rand`, `perlin`,
`irand(n)` are continuous 0–1 patterns. Feed them into any control, scale
with `.range(min, max)` (or `.rangex` for frequencies), slow them for
long arcs; use `.segment(n)` to sample them into discrete events.

```js
s("hh*16").gain(sine.range(.2, .8).slow(2)) // breathing hats
s("bd*4").lpf(sine.rangex(300, 8000).slow(8)) // 8-cycle filter sweep
n(irand(8).segment(8)).scale("E:minor:pentatonic") // random melody, 8 notes/cycle
note("c2*8").s("sawtooth").pan(perlin.range(.2, .8)) // drifting placement
```

Signals make no sound alone — they must feed a control or be `.segment`ed.

## Worked example: boring loop → living pattern

Start with a static beat:

```js
setcpm(120/4)
$: s("bd*4, ~ cp, hh*8").bank("RolandTR909")
```

**Step 1 — humanize the hats** (accent pattern + occasional dropout):

```js
$: s("bd*4, ~ cp, hh*8").bank("RolandTR909")
  .gain("[.9 .6 .8 .5]*2")
```

Better: split voices so only the hats get the treatment.

```js
$: s("bd*4, ~ cp").bank("RolandTR909")
$: s("hh*8").bank("RolandTR909").gain("[.4 .7]*4").degradeBy(.08)
```

**Step 2 — slow modulation** so no two bars sound identical:

```js
$: s("hh*8").bank("RolandTR909")
  .gain("[.4 .7]*4").degradeBy(.08)
  .pan(sine.slow(4).range(.3, .7))
  .hpf(perlin.slow(8).rangex(3000, 9000))
```

**Step 3 — periodic events**: a fill every 8th cycle, a stereo flip
sometimes:

```js
$: s("bd*4, ~ cp").bank("RolandTR909")
  .lastOf(8, x => x.ply(2))
$: s("hh*8").bank("RolandTR909")
  .gain("[.4 .7]*4").degradeBy(.08)
  .pan(sine.slow(4).range(.3, .7))
  .someCyclesBy(.2, x => x.jux(rev))
```

**Step 4 — a melodic voice with built-in evolution** (alternation +
off-echo + rare octave jump):

```js
$: n("<0 2 4 7 4 2 0 ~>*8").scale("C:minor:pentatonic")
  .s("triangle").gain(.5)
  .off(1/8, x => x.add(note(12)).gain(.4).pan(.8))
  .rarely(x => x.add(note(12)))
  .every(4, x => x.rev())
```

The recipe: **accents → slow signals → periodic transforms → probabilistic
spice**, applied per voice. Each layer changes on a different period
(2, 4, 8 cycles), so the combined pattern repeats far less often than any
single part.

Full signatures: `knowledge/functions-reference.md`.
