# Strudel Mini-Notation Reference

Mini-notation is the terse rhythm/melody string language used inside pattern
functions like `note("...")`, `sound("...")`, `n("...")`. It is parsed whenever
you pass a double-quoted (or backtick) string to a pattern function. Outside of
quotes you are writing plain JavaScript; inside quotes you are writing
mini-notation.

```js
note("c3 e3 g3 b3")      // mini-notation string
note(seq("c3", "e3"))    // equivalent idea using plain JS functions
```

## The cycle: the unit of time

- Everything in Strudel revolves around the **cycle**, a fixed span of time
  that repeats forever. By default 1 cycle lasts 2 seconds (`setcpm(30)`,
  i.e. 30 cycles per minute).
- A mini-notation sequence is squeezed so the **whole string fits exactly one
  cycle by default**. More events = each one gets shorter, the cycle stays the
  same length.
- `"bd sd"` plays two events per cycle, each lasting half a cycle.
  `"bd sd hh cp"` plays four events, each a quarter cycle. Tempo of the cycle
  itself never changes.

## Sequences and spaces

Events are separated by whitespace. Each event gets an equal share of the
cycle (unless weighted with `@`).

```js
sound("bd hh sd hh")        // 4 equal events per cycle
note("c3 e3 g3")            // 3 equal events (triplet feel over the cycle)
```

## Rests: `~` (or `-`)

A rest takes up time but plays nothing.

```js
sound("bd ~ sd ~")          // kick, silence, snare, silence
sound("bd ~ ~ sd")          // kick on 1, snare on 4
```

## Sub-sequences: `[]`

Square brackets group events into one slot. The group fits the duration of a
single step, subdividing it. Brackets nest arbitrarily deep.

```js
sound("bd [hh hh] sd [hh hh]")    // hats play as pairs of 8ths
sound("bd [hh [hh hh]] sd ~")     // nested subdivision
note("c3 [e3 g3] [b3 [d4 e4]] ~")
```

## Alternation: `<>`

Angle brackets play **one element per cycle**, cycling through the list.
`<a b c>` is the same as `[a b c]/3`.

```js
sound("bd <sd cp>")              // cycle 1: bd sd, cycle 2: bd cp
note("<c3 e3 g3 b3>")            // one note per cycle, walking the arpeggio
note("<c3 e3 g3 b3>*8")          // common idiom: 8 steps/cycle from the list
```

That last form (`<...>*n`) is the standard way to get an n-step melody that
evolves over more than one cycle.

## Speed up: `*`

Multiplies how often a step (or group) plays. Decimals are allowed.

```js
sound("bd*4")                    // four kicks per cycle
sound("bd hh*2 sd hh*3")         // per-step subdivision
sound("[bd sd]*2")               // whole group twice per cycle
sound("hh*2.5")                  // non-integer rates phase against the cycle
```

## Slow down: `/`

Stretches a step or group over several cycles; you hear a different part of it
each cycle.

```js
note("[c3 e3 g3 b3]/2")          // takes 2 cycles: c3 e3, then g3 b3
note("[0 2 4 6]/4".scale("D:minor"))
```

## Replication: `!`

Repeats an event as extra steps (without speeding anything up).
`"bd!3"` is identical to `"bd bd bd"`. A bare `!` repeats the previous step.

```js
sound("bd!2 sd")                 // 3 steps: bd bd sd
sound("bd ! ! sd")               // 4 steps: bd bd bd sd
```

## Elongation: `@`

Gives an event a temporal weight (default 1), making it last longer relative
to its neighbours.

```js
note("c3@3 e3")                  // c3 takes 3/4 of the cycle, e3 takes 1/4
sound("bd@2 hh sd@2 hh")         // weights 2+1+2+1 = 6 slots
```

## Parallel / chords: `,`

Comma plays sub-sequences simultaneously. Inside one pair of brackets it makes
chords; at the top level of the string it layers whole patterns.

```js
note("[c3,e3,g3] [f3,a3,c4]")    // two triads
sound("bd*2, hh*8, ~ cp")        // kick + hats + clap layered in one string
```

## Random choice: `|`

Picks one of the options at random, each cycle.

```js
sound("bd*2 [sd|cp|rim]")        // backbeat sound chosen randomly per cycle
note("[c3 e3 g3]|[a2 c3 e3]")    // randomly choose a whole sub-sequence
```

## Degrade: `?`

Gives an event a chance of being dropped. Bare `?` = 50%; `?0.25` = 25%
chance of removal (range 0–1).

```js
sound("hh*16?")                  // each hat has a 50% chance to drop out
sound("hh*16?0.2")               // sparser dropouts (20% removal)
sound("bd sd? bd sd?0.8")
```

## Euclidean rhythms: `(pulses, steps, rotation?)`

`x(p,s)` spreads `p` onsets as evenly as possible across `s` steps
(Bjorklund/Euclid algorithm). Optional third argument rotates the resulting
pattern's starting point. Arguments can themselves be patterns.

```js
sound("bd(3,8)")                 // classic tresillo: x..x..x.
sound("bd(3,8,2)")               // same shape, rotated by 2 steps
sound("hh(7,16), bd(3,8)")       // layered euclids
sound("cp(<3 5>,8)")             // alternate 3 and 5 pulses per cycle
```

Order matters: **first = number of hits, second = number of steps**.

## Polymeter: `{}` with `%`

Curly braces align several sub-sequences **step by step** instead of
stretching them to the same length: each sub-sequence keeps stepping at the
same rate, so different lengths drift against each other (polymeter).
`%n` sets how many steps play per cycle (defaults to the length of the first
sub-sequence).

```js
sound("{bd sd, hh hh oh}")        // 2-step vs 3-step parts, base rate 2/cycle
sound("{bd hh sd hh}%8")          // 4-step pattern played at 8 steps per cycle
note("{c3 e3 g3, c2 g2}%4")       // 3-note loop over a 2-note bass, 4 steps/cycle
```

Note: `{}`/`%` is supported by the parser but only lightly covered in the
official docs; behaviour matches TidalCycles polymeter.

## Number ranges: `..`

Expands to a run of integers, inclusive. Most useful with `n()`.

```js
n("0 .. 7").scale("C:minor")     // scale degrees 0 1 2 3 4 5 6 7
n("0 .. 3 7 .. 4").sound("numbers")
```

## Sound/sample selection: `:`

A colon after a sound name selects the sample index within that sound's
folder (zero-based; out-of-range numbers wrap around). Equivalent to `.n()`.

```js
sound("hh:0 hh:1 hh:2 hh:3")
sound("casio:1 casio:2")
sound("bd:3*2 sd:1")
```

A colon is also used by some controls as inline "second argument" shorthand
(e.g. `vib("4:0.5")`, `adsr(".1:.1:.5:.2")`).

## Combining everything

All constructs compose freely:

```js
sound("bd*2 [~ sd] [hh hh? hh] <cp rim>(3,8,1)")
note("<[c3,eb3,g3] [f3,ab3,c4]>@2 [bb2 d3]".slow(2))
```

## Quick reference table

| Syntax        | Meaning                               | Example              |
| ------------- | ------------------------------------- | -------------------- |
| space         | sequence steps within one cycle       | `"bd sd hh"`         |
| `~` or `-`    | rest                                  | `"bd ~ sd ~"`        |
| `[ ]`         | sub-sequence inside one step          | `"bd [sd sd]"`       |
| `< >`         | alternate: one element per cycle      | `"bd <sd cp>"`       |
| `*`           | speed up step/group                   | `"hh*8"`             |
| `/`           | stretch over n cycles                 | `"[c3 e3]/2"`        |
| `!`           | replicate as extra steps              | `"bd!3 sd"`          |
| `@`           | elongate (weight)                     | `"c3@3 e3"`          |
| `,`           | parallel (chords / layers)            | `"[c3,e3,g3]"`       |
| `\|`          | random choice per cycle               | `"bd \| cp \| sd"`   |
| `?`           | chance of dropping event (default .5) | `"hh*16?0.3"`        |
| `( , , )`     | euclid (pulses, steps, rotation)      | `"bd(3,8,2)"`        |
| `{ }` + `%`   | polymeter, `%` = steps per cycle      | `"{bd sd, hh*3}%4"`  |
| `..`          | integer range                         | `"0 .. 7"`           |
| `:`           | sample index / inline 2nd arg         | `"hh:2"`             |

## Mini-notation vs method calls

Many symbols have function equivalents — `"hh*2"` ≈ `"hh".fast(2)` applied at
the step level, `"<a b>"` ≈ `cat("a","b")`, `"a(3,8)"` ≈
`"a".euclid(3,8)`, `"a,b"` ≈ `stack("a","b")`. Use mini-notation for terse
per-step control, methods for whole-pattern transforms.
