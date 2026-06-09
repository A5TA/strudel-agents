# Strudel Core Functions Reference

Dense reference of pattern functions, grouped by purpose. Almost every
function is available both as a standalone (`fast(2, pat)`) and as a method
(`pat.fast(2)`); the method form is idiomatic. Numeric arguments can usually
be patterns themselves (`.fast("<1 2>")`).

## Pattern creation

| Function | Signature | What it does |
| --- | --- | --- |
| `note` | `note(pat)` | Pitch by name (`c3`, `eb4`) or MIDI number (60). |
| `n` | `n(pat)` | Numeric selector: sample index for sounds, scale degree with `.scale()`. |
| `sound` / `s` | `s(pat)` | Choose sample or synth by name. |
| `freq` | `freq(pat)` | Pitch by raw frequency in Hz. |
| `stack` | `stack(...pats)` | Play all patterns simultaneously (also alias `polyrhythm`). |
| `cat` / `slowcat` | `cat(...pats)` | One pattern per cycle, in order. |
| `seq` / `sequence` / `fastcat` | `seq(...pats)` | All patterns crammed into a single cycle. |
| `stepcat` / `timeCat` | `stepcat([w, pat], ...)` | Concatenate with proportional weights. |
| `arrange` | `arrange([nCycles, pat], ...)` | Lay out sections over given cycle counts — song structure. |
| `silence` | `silence` | The empty pattern (no events). |
| `run` | `run(n)` | Numbers `0..n-1` as one cycle. |
| `binary` / `binaryN` | `binary(num)`, `binaryN(num, bits)` | Number to binary rhythm pattern. |
| `polymeter` / `pm` | `polymeter(...pats)` | Step-aligned layering (function form of `{}`). |
| `polymeterSteps` | `polymeterSteps(n, ...pats)` | Polymeter with explicit steps per cycle. |

```js
stack(s("bd*2 ~ bd ~"), s("~ cp"), note("c2 g1").s("sawtooth"))
cat(n("0 2 4").scale("C:minor"), n("1 3 5").scale("C:minor"))
arrange([4, s("bd*4")], [4, s("bd*4, hh*8")])
note(run(8)).scale("E:minor:pentatonic")
```

## Continuous signals

Signals are continuous patterns (no discrete events) in range 0–1; the
`*2`-suffixed versions are bipolar (−1..1). Sample them with `.segment(n)` and
map them with `.range(min, max)` (`rangex` for an exponential mapping —
useful for frequencies).

`sine`, `cosine`, `saw`, `isaw`, `tri`, `square` (+ `sine2`, `saw2`, `tri2`,
`square2`, `isaw2`, `cosine2`), `rand`, `rand2`, `irand(n)` (random ints
0..n−1), `brand` (random 0/1), `brandBy(prob)`, `perlin` (smooth noise),
`time` (current cycle number), `mousex` / `mousey`.

```js
s("hh*16").gain(sine.range(.2, .9))            // continuous LFO on gain
note(saw.range(36, 60).segment(8))             // sampled ramp as melody
s("bd*4").lpf(sine.rangex(200, 8000).slow(4))  // exponential filter sweep
n(irand(8).segment(4)).scale("A:dorian")
```

## Time

| Function | Signature | What it does |
| --- | --- | --- |
| `fast` / `density` | `.fast(factor)` | Speed pattern up; 2 = twice per cycle. |
| `slow` / `sparsity` | `.slow(factor)` | Stretch over `factor` cycles. |
| `hurry` | `.hurry(factor)` | `fast` + multiply sample `speed` (pitch goes up too). |
| `early` | `.early(cycles)` | Nudge earlier in time (Tidal's `<~`). |
| `late` | `.late(cycles)` | Nudge later. |
| `rev` | `.rev()` | Reverse each cycle. |
| `palindrome` | `.palindrome()` | Alternate forward/backward each cycle. |
| `iter` | `.iter(n)` | Shift starting subdivision by 1/n each cycle. |
| `iterBack` | `.iterBack(n)` | `iter` in the other direction. |
| `ply` | `.ply(n)` | Repeat each event n times in place. |
| `off` | `.off(time, fn)` | Overlay a time-shifted, transformed copy. |
| `segment` / `seg` | `.segment(n)` | Sample a (continuous) pattern n times per cycle. |
| `range` | `.range(min, max)` | Rescale 0–1 output to min–max. |
| `rangex` | `.rangex(min, max)` | Like `range` but exponential. |
| `compress` | `.compress(begin, end)` | Squeeze the cycle into a window, silence elsewhere. |
| `zoom` | `.zoom(begin, end)` | Play only that portion of the pattern, stretched to full cycle. |
| `linger` | `.linger(frac)` | Loop only the first `frac` of each cycle. |
| `fastGap` | `.fastGap(factor)` | Like `fast` but leaves silence instead of repeating. |
| `swingBy` | `.swingBy(amount, n)` | Delay every 2nd of n subdivisions by `amount` (1/3 = triplet swing). |
| `swing` | `.swing(n)` | `swingBy(1/3, n)`. |
| `inside` | `.inside(n, fn)` | Apply `fn` with time sped up n× (works "inside" slowed view). |
| `outside` | `.outside(n, fn)` | Apply `fn` with time slowed n×. |
| `ribbon` / `rib` | `.ribbon(offset, n)` | Loop an n-cycle slice starting at cycle `offset`. |
| `setcpm` | `setcpm(n)` | Global tempo in cycles per minute (use once). |
| `cpm` | `.cpm(n)` | Per-pattern cycles-per-minute rate. |

```js
s("bd sd").fast(2)
n("0 2 4 7").off(1/8, x => x.add(n(7)).pan(1)).scale("C:major")
s("hh*8").swing(4)
note("c3 e3 g3 b3").iter(4)
s("bd*4, hh*8").someCyclesBy(.3, x => x.zoom(.5, 1))
```

## Conditional / structural

| Function | Signature | What it does |
| --- | --- | --- |
| `every` / `firstOf` | `.every(n, fn)` | Apply `fn` on the first of every n cycles. |
| `lastOf` | `.lastOf(n, fn)` | Apply `fn` on the last of every n cycles. |
| `when` | `.when(boolPat, fn)` | Apply `fn` while a binary pattern is 1. |
| `chunk` | `.chunk(n, fn)` | Apply `fn` to a different 1/n slice each cycle. |
| `chunkBack` | `.chunkBack(n, fn)` | `chunk` moving backwards. |
| `struct` | `.struct(boolPat)` | Impose a rhythm of `x`/`~` (or 1/0) onto values. |
| `mask` | `.mask(boolPat)` | Silence events where mask is 0/`~`. |
| `euclid` | `.euclid(pulses, steps)` | Euclidean rhythm onsets. |
| `euclidRot` | `.euclidRot(pulses, steps, rot)` | Euclid with rotation. |
| `euclidLegato` | `.euclidLegato(pulses, steps)` | Euclid where notes sustain until the next onset. |
| `invert` / `inv` | `.invert()` | Flip 1s and 0s in a binary pattern. |
| `reset` | `.reset(triggerPat)` | Jump back to start of cycle on each trigger. |
| `restart` | `.restart(triggerPat)` | Jump back to cycle 0 on each trigger. |
| `hush` | `.hush()` | Silence the pattern. |
| `pick` | `pat.pick(list/map)` | Index pattern selects sub-patterns (also `pickmod` wrapping). |
| `pickF` | `.pickF(idxPat, [fns])` | Index pattern selects which function to apply (also `pickmodF`). |
| `inhabit` / `pickSqueeze` | `pat.inhabit(map)` | Like pick, but squeezes the picked pattern into the slot. |
| `squeeze` | `squeeze(idxPat, [pats])` | Pick and compress patterns into the index events' spans. |
| `arp` | `.arp(pat)` | Turn stacked chords into arpeggios by index pattern. |
| `arpWith` | `.arpWith(fn)` | Custom function over the chord's events. |

```js
s("bd hh sd hh").every(4, x => x.rev())
note("c3 eb3 g3 c4").when("<0 1>", x => x.add(note(12)))
note("c2,eb2,g2").struct("x ~ x x ~ x ~ ~")
s("hh*8").mask("1 1 0 1")
note("g1").euclidRot(5, 8, 2).s("sawtooth")
note("<[c3,e3,g3] [a2,c3,e3]>").arp("0 2 1 2")
s("bd [rim cp]").pickF("<0 1>", [x => x.fast(2), x => x.rev()])
```

## Probability / randomness

| Function | Signature | What it does |
| --- | --- | --- |
| `sometimesBy` | `.sometimesBy(p, fn)` | Apply `fn` to each event with probability p. |
| `sometimes` | `.sometimes(fn)` | p = 0.5. |
| `often` | `.often(fn)` | p = 0.75. |
| `rarely` | `.rarely(fn)` | p = 0.25. |
| `almostAlways` | `.almostAlways(fn)` | p = 0.9. |
| `almostNever` | `.almostNever(fn)` | p = 0.1. |
| `always` / `never` | `.always(fn)` | p = 1 / 0. |
| `someCyclesBy` | `.someCyclesBy(p, fn)` | Whole-cycle probability. |
| `someCycles` | `.someCycles(fn)` | p = 0.5 per cycle. |
| `degradeBy` | `.degradeBy(p)` | Randomly drop events with probability p. |
| `degrade` | `.degrade()` | Drop ~50%. |
| `undegradeBy` | `.undegradeBy(p)` | Keep exactly the events `degradeBy` would drop. |
| `undegrade` | `.undegrade()` | Inverse of `degrade`. |
| `choose` | `choose(...values)` | Continuous random pick from values. |
| `chooseWith` | `chooseWith(pat, [values])` | A 0–1 pattern steers the choice. |
| `wchoose` | `wchoose([val, weight], ...)` | Weighted random pick. |
| `chooseCycles` / `randcat` | `chooseCycles(...pats)` | Random pattern per cycle. |
| `wchooseCycles` / `wrandcat` | `wchooseCycles([pat, w], ...)` | Weighted per-cycle choice. |
| `shuffle` | `.shuffle(n)` | Random permutation of n slices each cycle (no repeats). |
| `scramble` | `.scramble(n)` | Random slice picks (repeats allowed). |

```js
s("hh*16").sometimesBy(.3, x => x.speed(2))
s("bd*4").someCycles(x => x.ply(2))
n("0 1 2 3 4 5 6 7").scramble(8).scale("C:minor").s("piano")
s(chooseCycles("bd*4", "bd(3,8)", "bd*2 [~ bd]"))
```

## Accumulation / layering

| Function | Signature | What it does |
| --- | --- | --- |
| `superimpose` | `.superimpose(...fns)` | Layer transformed copies on top of the original. |
| `layer` / `apply` | `.layer(...fns)` | Like superimpose but without the original. |
| `off` | `.off(time, fn)` | Superimpose a delayed, transformed copy. |
| `echo` | `.echo(times, time, feedback)` | Repeats with decaying gain. |
| `echoWith` / `stutWith` | `.echoWith(times, time, fn)` | Repeats, applying `fn(p, i)` per repeat. |
| `stut` | `.stut(times, feedback, time)` | Legacy argument order of `echo`. |
| `jux` | `.jux(fn)` | Original on the left channel, transformed copy on the right. |
| `juxBy` | `.juxBy(amount, fn)` | `jux` with stereo width 0–1. |
| `add` / `sub` / `mul` / `div` | `.add(pat)` etc. | Arithmetic on values. On control patterns (`note()`, `n()`, after `.scale()`...) the argument must be **keyed** — `.add(note(12))`, `.add(n(2))`; a plain `.add(12)` warns and silently no-ops. |

```js
note("c3 e3 g3").superimpose(x => x.add(note(12)).gain(.5))
s("cp").echo(4, 1/8, .6)
s("bd sd").jux(x => x.rev())
n("0 2 4").add(n("<0 0 5 7>")).scale("D:dorian")  // chord-progression trick (keyed add, before scale)
note("c2*4").s("sawtooth").echoWith(3, 1/16, (p, i) => p.add(note(i * 12)))
```

## Notes on usage

- Function arguments that are functions must be real JS functions:
  `x => x.rev()` or point-free `rev` where the bare name exists.
- Everything is immutable: each method returns a **new** pattern; chaining is
  how you build complexity.
- Where a signature says `number`, a pattern or mini-notation string usually
  works too and will be applied per-event: `.lpf("<400 4000>")`.
