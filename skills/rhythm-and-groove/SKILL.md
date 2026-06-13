---
name: rhythm-and-groove
description: Rhythm craft in Strudel — the role of each drum voice (kick, snare/clap, hats, percussion), a euclidean rhythm vocabulary with the feel of (3,8), (5,8), (5,16), (7,16), swing amounts per genre with swingBy, velocity patterning and ghost notes for humanization, fills with every/lastOf, polyrhythm vs polymeter, and layering rules that avoid mud. Use when programming drums, fixing a stiff or cluttered groove, adding swing or fills, or building polyrhythmic patterns.
---

# Rhythm and groove

## Anatomy of a groove — one job per voice

| Voice | Job | Typical placement |
| --- | --- | --- |
| `bd` kick | foundation, defines the pulse | beats (1, 1+3, four-on-floor) or syncopated anchors |
| `sd`/`cp` | backbeat, the answer to the kick | beats 2 and 4 (`"~ sd ~ sd"` / `"~ cp"`) |
| `hh`/`oh` | subdivision energy, forward motion | 8ths/16ths; `oh` marks offbeats |
| `rim`/`sh`/`perc`/`cb` | syncopation, conversation between the others | the gaps the kick and snare leave |

```js
setcpm(120/4)
$: s("bd*4").gain(.95)                       // foundation
$: s("~ cp ~ cp").gain(.8)                   // backbeat
$: s("hh*8").gain("[.4 .7]*4")               // motion
$: s("rim(5,16,2)").gain(.4)                 // syncopated chatter
```

Build in that order; mute the percs and check the groove still stands.

## Euclidean vocabulary — what `(p,s)` feels like

`x(pulses, steps, rotation?)` spreads hits as evenly as possible.
**First number = hits, second = slots.**

| Pattern | Shape | Feel |
| --- | --- | --- |
| `(3,8)` | `x..x..x.` | tresillo — the universal syncopation (son, dembow, dancehall) |
| `(5,8)` | `x.xx.xx.` | cinquillo — busier, rolls forward |
| `(2,5)` | `x.x..` | lopsided, off-kilter |
| `(3,16)` | sparse | spacious perc accents |
| `(5,16)` | | broken, hip-hop-ish kick scatter |
| `(7,16)` | | rolling almost-straight 16ths with one hole |
| `(9,16)` | | dense shaker that breathes |
| `(7,12)` | | afro-leaning bell pattern territory |

```js
$: s("bd(3,8), ~ sd, hh(7,16)")        // tresillo kick under a backbeat
$: s("cb(7,12)").gain(.3)              // 12-slot bell against 4/4
$: s("bd(<3 5>,8)")                    // alternate density per cycle
```

Rotation shifts where the shape starts: `"bd(3,8,2)"`.

## Swing

`.swingBy(amount, n)` delays every 2nd of n subdivisions; `swing(n)` =
`swingBy(1/3, n)` (triplet swing). `n` = the subdivision you're swinging
(4 = 8th-notes pairs in a 4-beat cycle, 8 = 16ths).

| Genre | Swing |
| --- | --- |
| House/garage | `.swingBy(.08, 4)` – `.swingBy(.15, 4)` (subtle push) |
| Lo-fi hip-hop | `.swingBy(.2, 4)` – `.swingBy(1/3, 4)` (heavy lope) |
| Jazz-ish ride | `.swing(4)` (full triplet) |
| Techno/DnB | usually straight; swing percs only, lightly |

```js
s("hh*8").swingBy(.12, 4)              // house hats
s("bd ~ sd ~, hh*8").swingBy(.25, 4)   // boom-bap drag
```

Swing the hats/percs; keep kick and snare anchored unless you want the
whole kit to lurch.

## Humanization: velocity patterns and ghost notes

Pattern the gain so no two hits are equal — accent the grid corners:

```js
s("hh*8").gain("[.9 .5 .7 .4]*2")      // strong-weak-medium-weak
s("hh*16").gain("[.8 .4 .6 .3]*4").degradeBy(.05)
```

Ghost notes = very quiet snare hits between backbeats:

```js
$: s("~ sd ~ sd").gain(.85)
$: s("sd*16").gain(.15).degradeBy(.6)  // random quiet chatter underneath
// or placed deliberately:
$: s("~ ~ ~ sd ~ ~ sd ~ ~ ~ ~ sd ~ ~ ~ ~").gain(.2)
```

Tiny extras: `.pan(rand)` on hats, `.sometimesBy(.1, x => x.speed(1.2))`,
varying sample index `.n("<0 1 2>")`.

## Fills

`lastOf(n, fn)` fires on the last cycle of a phrase — the natural fill slot:

```js
s("bd*4, ~ cp").lastOf(4, x => x.ply(2))                 // double-time bar
s("~ sd ~ sd").lastOf(8, x => x.fast(2).gain(.7))        // snare-roll turn
s("bd*4").lastOf(4, x => x.degradeBy(.5))                // dropout fill
s("hh*8").every(4, x => x.rev())                         // flipped first bar
```

## Polyrhythm vs polymeter

- **Polyrhythm**: different pulse counts in the **same** cycle span —
  layers realign every cycle. `stack` or `,` does this:
  `s("bd*3, cp*4")` = 3-against-4.
- **Polymeter**: same step rate, different loop **lengths** — patterns
  drift and realign after several cycles. Use `{}` with `%`:

```js
s("{bd ~ sd ~, cb cb ~}%4")    // 4-step kit vs 3-step bell, stepping at 4/cycle
s("{hh oh hh, rim ~ ~ rim ~}%8")
```

Rule of thumb: polyrhythm = tension inside each bar; polymeter = slow
evolution across bars.

## Layering rules — avoiding mud

1. **One sub-heavy element at a time**: kick or bass owns the low end at
   any instant — offset their rhythms, or duck/sidechain the bass.
2. **Offset hats from the kick**: offbeat hats (`"[~ hh]*4"`) create the
   pump; hats on the kick just thicken it.
3. **High-pass everything that isn't kick/bass**: `.hpf(300)` on percs and
   `.hpf(4000+)` on hats cleans more than any EQ move.
4. **Separate by register and pan**: rim left, shaker right
   (`.pan(.3)` / `.pan(.7)`).
5. **Leave holes** — a groove is defined by its rests. If every 16th slot
   is filled, delete the weakest layer.

```js
setcpm(126/4)
$: s("bd*4").gain(.95)
$: s("[~ oh]*4").gain(.5).cut(1)             // offbeat opens, choked
$: s("hh*16").gain("[.5 .3]*8").hpf(6000).pan(.6)
$: s("rim(3,8,1)").gain(.4).hpf(800).pan(.35)
```

Deeper reference: `knowledge/mini-notation.md` (euclids, polymeter),
`knowledge/functions-reference.md` (swingBy, ply, lastOf).
