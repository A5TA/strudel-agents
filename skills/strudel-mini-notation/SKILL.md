---
name: strudel-mini-notation
description: Mastery of Strudel's mini-notation string language — sequences, rests, subdivision [], alternation <>, *, /, !, @, chords, random choice, ?, euclidean (p,s,r), polymeter {}%, ranges, and sample-index colons — plus common rhythm idioms (four-on-floor, backbeat, offbeat hats, tresillo/cinquillo euclids). Use when writing or debugging any pattern string inside note(), sound(), s(), or n(), or when choosing between mini-notation operators and method equivalents.
---

# Strudel mini-notation

Mini-notation is the terse language inside double-quoted strings passed to
pattern functions (`note("...")`, `s("...")`, `n("...")`). Outside quotes
you write JavaScript; inside quotes, mini-notation.

**The cycle is the unit of time.** A string is squeezed so the whole thing
fits exactly one cycle: more events = shorter events, same cycle length.
`"bd sd"` is two half-cycle events; `"bd sd hh cp"` is four quarter-cycle
events.

## Every construct, with examples

**Sequence (space)** — equal shares of the cycle:
```js
s("bd hh sd hh")
```

**Rest `~`** (or `-`) — takes time, plays nothing:
```js
s("bd ~ ~ sd")            // kick on 1, snare on 4
```

**Sub-sequence `[]`** — group fits one step, subdividing it; nests freely:
```js
s("bd [hh hh] sd [hh [hh hh]]")
note("e3 [g3 b3] [d4 [e4 f#4]] ~")
```

**Alternation `<>`** — one element per cycle, cycling through:
```js
s("bd*2 <sd cp rim>")     // backbeat sound changes each cycle
note("<e3 g3 b3 d4>*8")   // idiom: 8 steps/cycle walking the list
```
`<a b>*n` is the standard way to get a melody longer than one cycle.

**Speed up `*`** — multiplies a step or group (decimals allowed):
```js
s("bd*4")                 // four kicks per cycle
s("[bd sd]*2, hh*2.5")    // group doubled; hats phase against the cycle
```

**Slow down `/`** — stretches over several cycles:
```js
note("[e2 g2 a2 b2]/2")   // 2 cycles to play all four
```

**Replicate `!`** — extra steps without speeding up; bare `!` repeats the
previous step:
```js
s("bd!3 sd")              // = "bd bd bd sd"
s("hh ! ! oh")
```

**Elongate `@`** — temporal weight relative to neighbours:
```js
note("a2@3 c3")           // a2 gets 3/4 of the cycle
s("bd@2 hh sd@2 hh")
```

**Parallel `,`** — chords inside brackets, layers at top level:
```js
note("[d3,f3,a3] [g3,bb3,d4]")
s("bd*2, hh*8, ~ cp")     // a mini drum kit in one string
```

**Random choice `|`** — picks one option per cycle:
```js
s("bd*2 [sd|cp|rim]")
```

**Degrade `?`** — chance of dropping the event; bare `?` = 50%, `?0.2` = 20%:
```js
s("hh*16?0.3")            // each of 16 hats may vanish
```
Placement matters: `"hh?*8"` degrades the step before multiplying; `"hh*8?"`
degrades each of the 8 hits.

**Euclidean `(pulses, steps, rotation?)`** — spread hits evenly:
```js
s("bd(3,8)")              // tresillo: x..x..x.
s("hh(7,16), cp(<3 5>,8)")
```
Order: **first = hits, second = slots**. `(8,3)` is a wall of kicks.

**Polymeter `{}` with `%`** — sub-sequences step at the same rate instead
of stretching; `%n` sets steps per cycle (default: first list's length):
```js
s("{bd sd, hh hh oh}")    // 2-step vs 3-step parts drift
s("{bd hh sd hh}%6")      // 4-step pattern at 6 steps/cycle
```

**Range `..`** — inclusive integer run:
```js
n("0 .. 7").scale("C:minor")
```

**Sample index `:`** — pick a file in the sound's folder (wraps around):
```js
s("hh:0 hh:1 hh:2 hh:3")  // same as s("hh*4").n("0 1 2 3")
```

## Rhythm idioms (one cycle = one 4/4 bar)

```js
s("bd*4")                       // four-on-the-floor
s("bd ~ sd ~")                  // kick on 1, snare on 3 — the basic backbeat spine
s("bd*2, ~ cp")                 // kick 1+3, clap on the backbeat
s("[~ hh]*4")                   // offbeat 8th hats (house open-hat slot)
s("bd ~ [~ bd] sd")             // syncopated kick into the snare
s("bd(3,8)")                    // tresillo (3,8) — son/dembow backbone
s("cp(5,8)")                    // cinquillo (5,8) — busier Cuban cousin
s("hh(7,16)")                   // rolling, almost-straight 16th hats
s("bd(3,8,2), ~ sd ~ sd")       // rotated tresillo under a backbeat
s("{bd ~ sd ~, hh*3}%4")        // 3-against-4 hat polymeter
```

## Mini-notation vs method calls

Many symbols have function equivalents:

| Mini-notation | Method form |
| --- | --- |
| `"hh*2"` (per step) | `.fast(2)` (whole pattern) |
| `"[a b]/2"` | `.slow(2)` |
| `"<a b>"` | `cat("a", "b")` |
| `"a(3,8)"` | `.euclid(3,8)` |
| `"a, b"` | `stack(...)` |
| `"a?"` | `.degrade()` |

Choose mini-notation for terse **per-step** control inside one voice;
choose methods for **whole-pattern** transforms, anything needing a
function argument, or when the factor should itself be patterned
(`.fast("<1 2>")`).

A combined example showing free composition of constructs:

```js
s("bd*2 [~ sd] [hh hh? hh] <cp rim>(3,8,1)")
note("<[d3,f3,a3] [g2,bb2,d3]>@2 [c3 e3]".slow(2))
```

Full grammar table: `knowledge/mini-notation.md`.
